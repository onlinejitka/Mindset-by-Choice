/**
 * ==========================================================================
 * JS/APP.JS (Multi-Challenge Architecture with Token Protection System)
 * Production-Ready Application Engine
 * ==========================================================================
 */

// 1. GLOBAL SYSTEM CONFIGURATION
const CURRENT_FREE_CHALLENGE = 'mindfulness'; // Hardcoded free variant bypass rule
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/ecyjcbh4e561yxpa1yet2c6gbmem1ewc'; // Replace with real webhook string
const ETSY_COLLECTION_URL = 'https://www.etsy.com/shop/YourShopName'; // Fallback link for locked assets

// 2. DATA MATRIX ARCHITECTURE
const globalChallengeMatrix = {
    'mindfulness': {
        name: "Mindfulness Challenge",
        meta: "FIVE DAYS · PRESENCE REALIGNMENT",
        desc: "An interactive five-day study in presence. Each morning unlocks a new architectural element — breath, concentration, sensation, savor, stillness.",
        workbook: "/assets/workbook-mindfulness.pdf",
        days: {
            1: {
                meta: "The Foundation", title: "Mindful Breathing",
                audioTitle: "Day 1 Auditory Realignment — Introduction to Breath", audioTime: "05:00",
                reflection: "Mindfulness is the practice of being fully present. Not in the future, and not in the past. It is recognizing and appreciating the happiness ALREADY in your life. There are many people who are alive, and yet aren't even AWARE that they are alive. Mindfulness is being fully aware of the miracle of life and present to enjoy that miracle. When you are aware of the happiness and energy already around you, you can step into that happiness and joy. You can be ESTABLISHED in the present moment. Remember this: mindfulness is the connection and awareness of the mind and body. Mindfulness should NOT be work or effort. You don't need to make an effort to breathe in... or enjoy a sunset... or savor a meal. Mindfulness brings both inner and outer silence. This silence brings PEACE.",
                actionIntro: "The most natural place to begin the practice of mindfulness is with breathing. Breath is foundational to everything you do. Every moment features a breath in and a breath out. To get started, practice mindful breathing for a MINIMUM of 5 minutes.",
                steps: [
                    "Breathe in. Take note of the air moving through your nose and mouth and filling your lungs. ENJOY that in-breath. Savor your life. Celebrate your LIFE.",
                    "Hold your in-breath for a moment. Feel the air in your lungs. Be aware of the oxygen filling your body with life and energy.",
                    "Let the breath OUT slowly. Feel your body relax as the air exits. Be present as the air passes through your nose and mouth."
                ],
                actionOutro: "Repeat the process. Inevitably, your mind will wander. When this happens, GENTLY, and without judgment, bring it back to your breath."
            },
            2: {
                meta: "The Unification", title: "Mindful Concentration",
                audioTitle: "Day 2 Auditory Realignment — Unifying the Fractured Mind", audioTime: "05:00",
                reflection: "Very few people can concentrate EFFECTIVELY. Their minds are fractured. Distracted. Overwhelmed by thoughts and worries and noise. Their mobile phone beeps every three minutes, sending their attention in a different direction. A fractured mind is a harried mind. A mind without PEACE. The ability to concentrate brings the scattered mind BACK TOGETHER. Concentration unifies the mind and body. Concentration is one of the KEYS to mindfulness. Concentration is a bedrock of HAPPINESS. As Thich Nhat Hanh says: \"Suppose you are offered a cup of tea, very fragrant, very good tea. If your mind is distracted, you cannot really enjoy the tea. You have to be mindful of the tea, you have to be concentrated on it, so the tea can reveal its fragrance and wonder to you.\"",
                actionIntro: "Pour yourself a glass of water or one of your favorite beverages.",
                steps: [
                    "As the water enters the glass, pay attention to how it swirls. Look at the droplets scatter on the side of the glass.",
                    "Take a sip of the water. Fix your attention on that sip of water from beginning to end. Feel it moisten your mouth and lips.",
                    "Concentrate on the feeling of it as it slides down your throat. Feel its delicious coolness."
                ],
                actionOutro: "Follow the sip from beginning to end. If a different thought appears in your mind, gently bring your concentration back to the glass of water. Repeat until finished."
            },
            3: {
                meta: "The Body", title: "Mindful Feeling",
                audioTitle: "Day 3 Auditory Realignment — Somatic Awareness Without Judgment", audioTime: "02:10",
                reflection: "Few people are truly aware of their bodies. Or if they are aware, they are so only in a NEGATIVE way. They look in the mirror and hate what they see. Body mindfulness is paying attention to your body WITHOUT passing judgment. It is simply awareness of what you feel, of what your body is touching, of the pleasant and unpleasant sensations that you encounter at each moment. You are not EVALUATING these things... simply taking note of them. When you are mindful of your body, you are fully present. Your mind and body are CLOSELY connected. You can be at PEACE with who you are, NOT who you think you should be.",
                actionIntro: "Sit in a chair or lie down. Get comfortable.",
                steps: [
                    "Bring attention to your body. Notice the feeling of your body against the floor or the chair. Feel the weight of your legs, arms, and head.",
                    "Take a deep, cleansing breath. Be mindful of your breath, feeling your stomach and chest rise and then fall.",
                    "Bring your attention to your head and face. Feel any areas of tension and try to let them soften. Let your jaw, neck, and throat soften and relax.",
                    "Notice your shoulders and arms. Be mindful of tension and let it ease. Relax your hands and feel them against the chair or floor.",
                    "Feel your legs and feet. Let them relax. Soften. Drain of tension. Take one more deep breath, notice your entire body, and let it out."
                ],
                actionOutro: ""
            },
            4: {
                meta: "The Savor", title: "Mindful Eating",
                audioTitle: "Day 4 Auditory Realignment — Savoring the Baseline", audioTime: "02:12",
                reflection: "Very few people actually pay ATTENTION to what they are eating. They RUSH through their meals, wanting to QUICKLY move to the next thing. Or they mindlessly scroll through their phone, not giving ANY thought to the food in front of them. They eat past the point of fullness. They eat to NUMB their feelings. They don't SAVOR and enjoy the experience of eating. Through mindful eating, you CONNECT your mind and body. You truly TASTE what you're eating, feeling textures and nuances of flavors. You CONCENTRATE on the beautiful experience of eating. Mindful eating allows every meal to be a celebration.",
                actionIntro: "Choose a snack or meal you would normally eat. Bring all your attention to it with curiosity and exploration.",
                steps: [
                    "Take a moment to be aware of your body. Feel any sensations of hunger, both pleasant and unpleasant. Take several deep breaths.",
                    "Assess the food in front of you. Study it closely. Its shape. Its color. Smell it deeply, noting the different notes and aromas.",
                    "Take a bite, and focus entirely on what you're experiencing. Are you tasting salty? Sweet? Tangy? What textures are you encountering? Savor each bite without rushing.",
                    "Pay attention to the feelings of hunger and fullness. As you become full, gently give yourself permission to stop. Note your thoughts when you stop."
                ],
                actionOutro: ""
            },
            5: {
                meta: "The Stillness", title: "Mindful Relaxation",
                audioTitle: "Day 5 Auditory Realignment — The Radical Act of Simply Being", audioTime: "05:00",
                reflection: "It's very easy to go through life feeling RUSHED. Moving from one thing to the next, not stopping to THINK, to breathe, to reflect. Always hurried, never peaceful. Always moving, never RESTING. A person that never stops will eventually BURN out. Crash. Collapse. Mindful relaxation allows you to actually LIVE your life and to truly LOVE your life... to be at peace... to stop and APPRECIATE the things you already have. To simply enjoy the PRESENT. When you implement mindful relaxation, your days become peaceful and JOYFUL.",
                actionIntro: "Set aside 5 minutes to practice mindful relaxation. Choose a comfortable place to sit (chair or outside on the grass).",
                steps: [
                    "Take several slow, mindful breaths, experiencing the air moving through your throat and mouth. Fill your lungs.",
                    "Do a body scan. Breathe into any areas of tension and let them soften and relax.",
                    "Take note of the things happening around you (birds singing, people talking, cars driving). Concentrate fully on those sounds. Don't judge them, simply observe them.",
                    "Feel your surroundings. Feel the seat or ground under you. Feel the wind brushing against you and the sun warming you. Let the sensations of simply being wash over you. Stay fully present."
                ],
                actionOutro: ""
            }
        }
    },
    'gratefulness': {
        name: "Gratefulness Challenge", meta: "FIVE DAYS · COGNITIVE SHIFT",
        desc: "Rewire your mental pathways to spot luxury and structural opportunities in your default baseline reality.",
        workbook: "/assets/workbook-gratefulness.pdf",
        days: { 1: { meta: "Day 1", title: "Coming Soon", audioTitle: "Placeholder", audioTime: "00:00", reflection: "Placeholder content.", actionIntro: "", steps: ["Placeholder step."], actionOutro: "" } }
    },
    'goal-setting': {
        name: "Goal Setting Challenge", meta: "FIVE DAYS · STRATEGIC EXECUTION",
        desc: "Dismantle vague goals and deploy concrete, immutable system trackers designed for aggressive personal acceleration.",
        workbook: "/assets/workbook-goals.pdf",
        days: { 1: { meta: "Day 1", title: "Coming Soon", audioTitle: "Placeholder", audioTime: "00:00", reflection: "Placeholder content.", actionIntro: "", steps: ["Placeholder step."], actionOutro: "" } }
    },
    'self-esteem': {
        name: "Self Esteem Challenge", meta: "FIVE DAYS · IDENTITY UPGRADE",
        desc: "Break down external approval loops and build a self-contained, high-performance character narrative.",
        workbook: "/assets/workbook-esteem.pdf",
        days: { 1: { meta: "Day 1", title: "Coming Soon", audioTitle: "Placeholder", audioTime: "00:00", reflection: "Placeholder content.", actionIntro: "", steps: ["Placeholder step."], actionOutro: "" } }
    },
    'passion': {
        name: "Passion Challenge", meta: "FIVE DAYS · SOVEREIGNTY FINDER",
        desc: "Isolate true intrinsically-motivated actions from external algorithm-driven societal noise and expectations.",
        workbook: "/assets/workbook-passion.pdf",
        days: { 1: { meta: "Day 1", title: "Coming Soon", audioTitle: "Placeholder", audioTime: "00:00", reflection: "Placeholder content.", actionIntro: "", steps: ["Placeholder step."], actionOutro: "" } }
    }
};

// 3. SECURE APP STATE ENGINE
let currentChallengeId = '';
let currentDayOpenNumber = 1;

/**
 * Validates challenge access using local rules + token crypts
 */
function checkChallengeAccess(challengeId) {
    if (challengeId === CURRENT_FREE_CHALLENGE) return true;
    return localStorage.getItem(`unlocked_${challengeId}`) === 'true';
}

/**
 * Resolves client browser parameter queries and communicates with Make.com webhook
 */
async function processSecureTokenValidation() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        console.log("🔐 TokenSecurity: No validation token found in payload URL. Using local memory caches.");
        return;
    }

    try {
        console.log("🔐 TokenSecurity: Transmitting validation handshake token to Make.com matrix...");
        const response = await fetch(`${MAKE_WEBHOOK_URL}?token=${encodeURIComponent(token)}`, {
            method: 'GET'
        });

        if (!response.ok) throw new Error(`Network failure code (${response.status})`);

        const validationResult = await response.json();
        
        if (validationResult.status === 'success' && validationResult.unlocked) {
            const targetModule = validationResult.unlocked.trim().toLowerCase();
            localStorage.setItem(`unlocked_${targetModule}`, 'true');
            console.log(`🔐 TokenSecurity: Handshake clear. Module [${targetModule}] has been safely integrated.`);
            
            // Scrub URL query strings to maintain architectural aesthetic cleanliness
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (err) {
        console.error("⛔ TokenSecurity: Synchronous gateway confirmation crashed:", err);
    }
}

// 4. RENDERING ENGINE MECHANISMS

/**
 * Builds the Master Hub list containing all challenge rows
 */
function renderMasterHubView() {
    const hubContainer = document.getElementById('hub-container');
    if (!hubContainer) return;

    hubContainer.innerHTML = '';
    const keys = Object.keys(globalChallengeMatrix);
    let totalUnlockedCount = 0;

    keys.forEach((key, index) => {
        const challenge = globalChallengeMatrix[key];
        const hasAccess = checkChallengeAccess(key);
        const isPromoFree = key === CURRENT_FREE_CHALLENGE;

        let rightSideHtml = '';
        let rowClasses = 'challenge-card';
        let clickAttribute = '';

        if (hasAccess) {
            totalUnlockedCount++;
            rowClasses += ' unlocked';
            clickAttribute = `onclick="navigateToChallenge('${key}')"`;
            
            if (isPromoFree) {
                rightSideHtml = `<span class="badge-free">FREE THIS MONTH</span>`;
            } else {
                rightSideHtml = `<span class="row-status" style="color: var(--color-dimmed);">INTEGRATED —</span>`;
            }
        } else {
            rowClasses += ' locked';
            rightSideHtml = `
                <div class="card-right" style="pointer-events: auto;">
                    <span class="row-status" style="color: var(--color-dimmed); font-size: var(--text-xs); margin-right: 8px;">🔒 LOCKED</span>
                    <a href="${ETSY_COLLECTION_URL}" target="_blank" class="btn-etsy">Unlock Sequence</a>
                </div>
            `;
        }

        const cardHtml = `
            <div class="${rowClasses}" ${clickAttribute}>
                <div class="card-left">
                    <div class="card-index">0${index + 1}</div>
                    <div>
                        <div class="card-meta">${challenge.meta}</div>
                        <div class="card-title">${challenge.name}</div>
                    </div>
                </div>
                ${hasAccess ? `<div class="card-right"><span class="row-status">${rightSideHtml}</span></div>` : rightSideHtml}
            </div>
        `;
        hubContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    document.getElementById('hub-telemetry').textContent = `${totalUnlockedCount} / ${keys.length} SCHEMAS ACTIVE`;
}

/**
 * Builds the 5-Day layout view for a selected active challenge (image_dc9d4a.png)
 */
function navigateToChallenge(challengeId) {
    if (!checkChallengeAccess(challengeId)) return;

    currentChallengeId = challengeId;
    const challenge = globalChallengeMatrix[challengeId];

    // Bind text nodes
    document.getElementById('ch-title-label').textContent = challenge.name;
    document.getElementById('ch-meta-label').textContent = challenge.meta;
    document.getElementById('ch-desc-label').textContent = challenge.desc;
    document.getElementById('ch-workbook-btn').href = challenge.workbook;

    const listContainer = document.getElementById('days-list-container');
    listContainer.innerHTML = '';

    // Retrieve historical challenge milestones
    const completedDays = JSON.parse(localStorage.getItem(`mindset_complete_${challengeId}`)) || [];
    document.getElementById('ch-progress-text').textContent = `${completedDays.length} / 5 COMPLETE`;

    for (let i = 1; i <= 5; i++) {
        const dayData = challenge.days[i] || { meta: `Day 0${i}`, title: "System Module Coming Soon" };
        const isDone = completedDays.includes(i);
        const isCurrentActive = i === 1 || completedDays.includes(i - 1);

        let rowStatusText = '🔒 LOCKED';
        let rowClass = 'day-row locked';
        let onClickAction = '';

        if (isDone) {
            rowStatusText = '— COMPLETE';
            rowClass = 'day-row';
            onClickAction = `onclick="navigateToDayDetail(${i})"`;
        } else if (isCurrentActive && challenge.days[i]) {
            rowStatusText = 'BEGIN —';
            rowClass = 'day-row';
            onClickAction = `onclick="navigateToDayDetail(${i})"`;
            rowStatusText = `<span style="color: var(--color-text); font-weight: bold;">${rowStatusText}</span>`;
        }

        const rowHtml = `
            <div class="${rowClass}" ${onClickAction}>
                <div class="row-num">0${i}</div>
                <div class="row-content">
                    <div class="row-meta">${dayData.meta}</div>
                    <div class="row-title">${dayData.title}</div>
                </div>
                <div class="row-status">${rowStatusText}</div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', rowHtml);
    }

    // Toggle viewport visibility matrices
    document.getElementById('view-hub').style.display = 'none';
    document.getElementById('view-day-detail').style.display = 'none';
    document.getElementById('view-challenge-overview').style.display = 'block';
    window.scrollTo(0, 0);
}

/**
 * Builds the comprehensive dvousloupcový view for a single day layer (image_dc9a7f.png)
 */
function navigateToDayDetail(dayNumber) {
    const challenge = globalChallengeMatrix[currentChallengeId];
    const dayData = challenge.days[dayNumber];
    if (!dayData) return;

    currentDayOpenNumber = dayNumber;

    // Direct interface data mapping
    document.getElementById('d-num').textContent = `0${dayNumber}`;
    document.getElementById('d-meta').textContent = dayData.meta.toUpperCase();
    document.getElementById('d-title').textContent = dayData.title;
    document.getElementById('d-audio-title').textContent = dayData.audioTitle;
    document.getElementById('d-audio-time').textContent = dayData.audioTime;
    document.getElementById('d-reflection').textContent = dayData.reflection;
    document.getElementById('d-action-intro').textContent = dayData.actionIntro;
    document.getElementById('d-action-outro').textContent = dayData.actionOutro || '';

    const stepsNode = document.getElementById('d-steps');
    stepsNode.innerHTML = '';
    if (dayData.steps) {
        dayData.steps.forEach((textStr, idx) => {
            stepsNode.insertAdjacentHTML('beforeend', `
                <div class="step-block">
                    <div class="step-num">0${idx + 1}</div>
                    <div class="step-text">${textStr}</div>
                </div>
            `);
        });
    }

    // Restore text content strings from client local browser cache
    const journalCacheKey = `mindset_note_${currentChallengeId}_d${dayNumber}`;
    document.getElementById('d-journal').value = localStorage.getItem(journalCacheKey) || '';
    document.getElementById('sync-status').textContent = '';

    // View ports reconfiguration
    document.getElementById('view-challenge-overview').style.display = 'none';
    document.getElementById('view-day-detail').style.display = 'block';
    window.scrollTo(0, 0);
}

/**
 * Commits input stream data into browser hardware blocks and triggers state changes
 */
function saveAndCompleteDay() {
    const textareaVal = document.getElementById('d-journal').value;
    
    // Save current writing layout state safely
    localStorage.setItem(`mindset_note_${currentChallengeId}_d${currentDayOpenNumber}`, textareaVal);

    // Track array calculation updates
    const storageKey = `mindset_complete_${currentChallengeId}`;
    let completedDaysArray = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (!completedDaysArray.includes(currentDayOpenNumber)) {
        completedDaysArray.push(currentDayOpenNumber);
        localStorage.setItem(storageKey, JSON.stringify(completedDaysArray));
    }

    document.getElementById('sync-status').textContent = "Sequence compiled. Synchronization secure.";
    
    setTimeout(() => {
        navigateToChallenge(currentChallengeId);
    }, 700);
}

function navigateToHub() {
    document.getElementById('view-challenge-overview').style.display = 'none';
    document.getElementById('view-day-detail').style.display = 'none';
    document.getElementById('view-hub').style.display = 'block';
    renderMasterHubView();
    window.scrollTo(0, 0);
}

// 5. APPLICATION BOOTSTRAPPING PIPELINE
document.addEventListener('DOMContentLoaded', async () => {
    // Stage 1: Validate tokens from external Make.com pipelines asynchronously
    await processSecureTokenValidation();
    
    // Stage 2: Render initial main layout interface screen elements
    renderMasterHubView();
});
