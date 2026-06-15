/**
 * ==========================================================================
 * JS/APP.JS
 * Core Logic for the 5-Day Mindfulness Challenge Dashboard
 * Philosophy: Zero-friction, local-first, vanilla JS.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DATA & STATE MANAGEMENT (LOCAL STORAGE)
    // ==========================================
    
    // Default challenge database structure
    const challengeData = {
        1: { title: "Audit", audioSrc: "../assets/audio/day1.mp3", isLocked: false, isCompleted: false, journal: "" },
        2: { title: "Silence", audioSrc: "../assets/audio/day2.mp3", isLocked: true, isCompleted: false, journal: "" },
        3: { title: "Tension", audioSrc: "../assets/audio/day3.mp3", isLocked: true, isCompleted: false, journal: "" },
        4: { title: "Structure", audioSrc: "../assets/audio/day4.mp3", isLocked: true, isCompleted: false, journal: "" },
        5: { title: "Execution", audioSrc: "../assets/audio/day5.mp3", isLocked: true, isCompleted: false, journal: "" }
    };

    // Subtitles Database (Timestamp in seconds : Caption string)
    const captionsData = {
        1: {
            0: "Let's begin the audit.",
            5: "Take a moment to look at your environment.",
            15: "Chaos around you creates chaos within."
        },
        2: {
            0: "Silence is not the absence of noise.",
            8: "It is the presence of focus.",
            20: "Breathe in deeply, hold the standard."
        }
        // Add more for days 3, 4, 5...
    };

    let currentDay = 1;

    // Initialize state from LocalStorage or use defaults
    function initStorage() {
        const storedData = localStorage.getItem('mindset_challenge_state');
        if (storedData) {
            Object.assign(challengeData, JSON.parse(storedData));
            
            // Find the first non-completed day to set as current
            for (let i = 1; i <= 5; i++) {
                if (!challengeData[i].isLocked && !challengeData[i].isCompleted) {
                    currentDay = i;
                    break;
                }
                // If all completed, default to 5
                if (i === 5 && challengeData[5].isCompleted) currentDay = 5;
            }
        }
    }

    function saveState() {
        // Save current journal entry before saving state
        challengeData[currentDay].journal = DOM.journalEntry.value;
        localStorage.setItem('mindset_challenge_state', JSON.stringify(challengeData));
    }


    // ==========================================
    // 2. DOM ELEMENTS CACHE
    // ==========================================
    
    const DOM = {
        dayItems: document.querySelectorAll('.day-item'),
        uiDayLabel: document.getElementById('ui-day-label'),
        uiDayTitle: document.getElementById('ui-day-title'),
        audioElement: document.getElementById('audio-element'),
        playBtn: document.getElementById('play-btn'),
        playerContainer: document.getElementById('player-container'),
        progressContainer: document.getElementById('progress-container'),
        progressFill: document.getElementById('progress-fill'),
        timeCurrent: document.getElementById('time-current'),
        timeTotal: document.getElementById('time-total'),
        captionDisplay: document.getElementById('caption-display'),
        journalEntry: document.getElementById('journal-entry'),
        markCompleteBtn: document.getElementById('mark-complete-btn')
    };


    // ==========================================
    // 3. UI RENDERING LOGIC
    // ==========================================
    
    function renderDashboard() {
        // 1. Render Checklist Panel
        DOM.dayItems.forEach(item => {
            const dayNum = parseInt(item.dataset.day);
            const data = challengeData[dayNum];
            
            // Reset classes
            item.className = 'day-item';
            
            // Apply states
            if (data.isLocked) item.classList.add('locked');
            if (data.isCompleted) item.classList.add('completed');
            if (dayNum === currentDay) item.classList.add('active');
        });

        // 2. Render Workspace Panel
        const currentData = challengeData[currentDay];
        DOM.uiDayLabel.textContent = `Day 0${currentDay}`;
        DOM.uiDayTitle.textContent = currentData.title;
        DOM.journalEntry.value = currentData.journal;
        
        // Reset Audio & Captions
        DOM.audioElement.src = currentData.audioSrc;
        resetAudioUI();
        DOM.captionDisplay.textContent = captionsData[currentDay]?.[0] || "Press play to begin today's protocol.";
        DOM.captionDisplay.style.opacity = 1;
        
        // Update Complete Button State
        if (currentData.isCompleted) {
            DOM.markCompleteBtn.textContent = "Review Completed";
            DOM.markCompleteBtn.style.opacity = 0.5;
        } else {
            DOM.markCompleteBtn.textContent = "Mark Day Complete";
            DOM.markCompleteBtn.style.opacity = 1;
        }
    }


    // ==========================================
    // 4. AUDIO CONTROLLER & SYNC LOGIC
    // ==========================================
    
    let isPlaying = false;

    function resetAudioUI() {
        isPlaying = false;
        DOM.playerContainer.classList.remove('is-playing');
        DOM.progressFill.style.width = '0%';
        DOM.timeCurrent.textContent = '0:00';
        DOM.audioElement.pause();
        DOM.audioElement.currentTime = 0;
    }

    function togglePlay() {
        if (DOM.audioElement.readyState === 0) return; // Audio not loaded
        
        if (isPlaying) {
            DOM.audioElement.pause();
            DOM.playerContainer.classList.remove('is-playing');
        } else {
            DOM.audioElement.play().catch(e => console.log("Audio play blocked by browser."));
            DOM.playerContainer.classList.add('is-playing');
        }
        isPlaying = !isPlaying;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Audio Event Listeners
    DOM.playBtn.addEventListener('click', togglePlay);

    DOM.audioElement.addEventListener('loadedmetadata', () => {
        DOM.timeTotal.textContent = formatTime(DOM.audioElement.duration);
    });

    DOM.audioElement.addEventListener('timeupdate', () => {
        const current = DOM.audioElement.currentTime;
        const total = DOM.audioElement.duration;
        
        // Update Progress Bar
        const progressPercent = (current / total) * 100;
        DOM.progressFill.style.width = `${progressPercent}%`;
        DOM.timeCurrent.textContent = formatTime(current);

        // Sync Subtitles
        syncSubtitles(Math.floor(current));
    });

    DOM.audioElement.addEventListener('ended', () => {
        resetAudioUI();
    });

    // Click on progress bar to seek
    DOM.progressContainer.addEventListener('click', (e) => {
        const rect = DOM.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        DOM.audioElement.currentTime = pos * DOM.audioElement.duration;
    });

    // Subtitle Engine
    let currentCaptionTime = -1;
    function syncSubtitles(currentSeconds) {
        const dayCaptions = captionsData[currentDay];
        if (!dayCaptions) return;

        // Find the latest timestamp that is <= current time
        let activeKey = -1;
        for (let key in dayCaptions) {
            if (parseInt(key) <= currentSeconds) {
                activeKey = parseInt(key);
            }
        }

        if (activeKey !== -1 && activeKey !== currentCaptionTime) {
            currentCaptionTime = activeKey;
            // Fade effect
            DOM.captionDisplay.style.opacity = 0;
            setTimeout(() => {
                DOM.captionDisplay.textContent = dayCaptions[activeKey];
                DOM.captionDisplay.style.opacity = 1;
            }, 200); // match CSS transition
        }
    }


    // ==========================================
    // 5. USER INTERACTIONS
    // ==========================================
    
    // Switching Days
    DOM.dayItems.forEach(item => {
        item.addEventListener('click', () => {
            const selectedDay = parseInt(item.dataset.day);
            if (challengeData[selectedDay].isLocked) return; // Prevent access to locked days
            
            // Save current journal before switching
            saveState();
            
            currentDay = selectedDay;
            renderDashboard();
        });
    });

    // Auto-save Journal Input (Debounced)
    let timeoutId;
    DOM.journalEntry.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            saveState();
        }, 1000); // Save after 1 second of no typing
    });

    // Mark Day as Complete
    DOM.markCompleteBtn.addEventListener('click', () => {
        if (!challengeData[currentDay].isCompleted) {
            challengeData[currentDay].isCompleted = true;
            
            // Unlock next day if it exists
            const nextDay = currentDay + 1;
            if (nextDay <= 5) {
                challengeData[nextDay].isLocked = false;
            }
            
            saveState();
            renderDashboard();
        }
    });


    // ==========================================
    // 6. SYSTEM INITIALIZATION
    // ==========================================
    
    initStorage();
    renderDashboard();

});
