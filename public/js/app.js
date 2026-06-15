/**
 * ==========================================================================
 * JS/APP.JS (Dual Media Engine: Audio + YouTube Video)
 * Philosophy: Performance, no sub-sync pooling loops, clean context switching.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Core Database Structure (Ready for your explicit input strings)
    const challengeData = {
        1: { title: "Audit", audioSrc: "../assets/audio/day1.mp3", ytId: "dQw4w9WgXcQ", isLocked: false, isCompleted: false, journal: "" },
        2: { title: "Silence", audioSrc: "../assets/audio/day2.mp3", ytId: "dQw4w9WgXcQ", isLocked: true, isCompleted: false, journal: "" },
        3: { title: "Tension", audioSrc: "../assets/audio/day3.mp3", ytId: "dQw4w9WgXcQ", isLocked: true, isCompleted: false, journal: "" },
        4: { title: "Structure", audioSrc: "../assets/audio/day4.mp3", ytId: "dQw4w9WgXcQ", isLocked: true, isCompleted: false, journal: "" },
        5: { title: "Execution", audioSrc: "../assets/audio/day5.mp3", ytId: "dQw4w9WgXcQ", isLocked: true, isCompleted: false, journal: "" }
    };

    let currentDay = 1;
    let currentMode = 'audio'; // 'audio' or 'video'
    let ytPlayer = null;

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
        journalEntry: document.getElementById('journal-entry'),
        markCompleteBtn: document.getElementById('mark-complete-btn'),
        audioView: document.getElementById('audio-view'),
        videoView: document.getElementById('video-view'),
        modeAudioBtn: document.getElementById('mode-audio-btn'),
        modeVideoBtn: document.getElementById('mode-video-btn')
    };

    // Initialize LocalStorage State
    function initStorage() {
        const stored = localStorage.getItem('mindset_challenge_state');
        if (stored) {
            Object.assign(challengeData, JSON.parse(stored));
            for (let i = 1; i <= 5; i++) {
                if (!challengeData[i].isLocked && !challengeData[i].isCompleted) { currentDay = i; break; }
                if (i === 5 && challengeData[5].isCompleted) currentDay = 5;
            }
        }
    }

    function saveState() {
        challengeData[currentDay].journal = DOM.journalEntry.value;
        localStorage.setItem('mindset_challenge_state', JSON.stringify(challengeData));
    }

    function renderDashboard() {
        DOM.dayItems.forEach(item => {
            const d = parseInt(item.dataset.day);
            item.className = 'day-item';
            if (challengeData[d].isLocked) item.classList.add('locked');
            if (challengeData[d].isCompleted) item.classList.add('completed');
            if (d === currentDay) item.classList.add('active');
        });

        const data = challengeData[currentDay];
        DOM.uiDayLabel.textContent = `Day 0${currentDay}`;
        DOM.uiDayTitle.textContent = data.title;
        DOM.journalEntry.value = data.journal;
        
        stopAllMedia();
        DOM.audioElement.src = data.audioSrc;
        
        if (ytPlayer && ytPlayer.loadVideoById) {
            ytPlayer.loadVideoById(data.ytId);
            ytPlayer.pauseVideo();
        }
        
        DOM.markCompleteBtn.textContent = data.isCompleted ? "Review Completed" : "Mark Day Complete";
        DOM.markCompleteBtn.style.opacity = data.isCompleted ? "0.5" : "1";
    }

    function stopAllMedia() {
        DOM.audioElement.pause();
        DOM.audioElement.currentTime = 0;
        DOM.playerContainer.classList.remove('is-playing');
        if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    }

    // Context Mode Switching
    DOM.modeAudioBtn.addEventListener('click', () => {
        if (currentMode === 'audio') return;
        currentMode = 'audio';
        DOM.modeAudioBtn.classList.add('active');
        DOM.modeVideoBtn.classList.remove('active');
        DOM.audioView.style.display = 'flex';
        DOM.videoView.style.display = 'none';
        stopAllMedia();
    });

    DOM.modeVideoBtn.addEventListener('click', () => {
        if (currentMode === 'video') return;
        currentMode = 'video';
        DOM.modeVideoBtn.classList.add('active');
        DOM.modeAudioBtn.classList.remove('active');
        DOM.audioView.style.display = 'none';
        DOM.videoView.style.display = 'block';
        stopAllMedia();
    });

    // Native Audio Engine Controls
    DOM.playBtn.addEventListener('click', () => {
        if (DOM.audioElement.paused) {
            DOM.audioElement.play();
            DOM.playerContainer.classList.add('is-playing');
        } else {
            DOM.audioElement.pause();
            DOM.playerContainer.classList.remove('is-playing');
        }
    });

    DOM.audioElement.addEventListener('timeupdate', () => {
        if (currentMode !== 'audio') return;
        const cur = DOM.audioElement.currentTime;
        const tot = DOM.audioElement.duration || 0;
        DOM.progressFill.style.width = `${(cur / tot) * 100}%`;
        DOM.timeCurrent.textContent = formatTime(cur);
        DOM.timeTotal.textContent = formatTime(tot);
    });

    function formatTime(secs) {
        const m = Math.floor(secs / 60); const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // YouTube Core Player API Async Initializer
    window.onYouTubeIframeAPIReady = function() {
        ytPlayer = new YT.Player('yt-player', {
            height: '100%',
            width: '100%',
            videoId: challengeData[currentDay].ytId,
            playerVars: { 'modestbranding': 1, 'rel': 0, 'controls': 1 }
        });
    };

    // Navigation and Workflow Actions
    DOM.dayItems.forEach(item => {
        item.addEventListener('click', () => {
            const d = parseInt(item.dataset.day);
            if (challengeData[d].isLocked) return;
            saveState();
            currentDay = d;
            renderDashboard();
        });
    });

    // Auto-save Journal Input (Debounced)
    let timeoutId;
    DOM.journalEntry.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { saveState(); }, 1000);
    });

    DOM.markCompleteBtn.addEventListener('click', () => {
        if (!challengeData[currentDay].isCompleted) {
            challengeData[currentDay].isCompleted = true;
            if (currentDay + 1 <= 5) challengeData[currentDay + 1].isLocked = false;
            saveState(); renderDashboard();
        }
    });

    initStorage();
    renderDashboard();
});
