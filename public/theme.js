/**
 * ==========================================================================
 * JS/THEME.JS (Bulletproof Anti-Flash Theme Engine with Console Telemetry)
 * ==========================================================================
 */

// 1. IMMEDIATE EXECUTION (Runs in head to prevent white/black flash)
const savedTheme = localStorage.getItem('mindset_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
console.log("🌓 ThemeEngine: Initialized immediately with theme ->", savedTheme);

// 2. SAFELY ATTACH TOGGLE LOGIC (Runs as soon as DOM is ready or already loaded)
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    
    if (!toggleBtn) {
        console.log("🌓 ThemeEngine: Button '#theme-toggle' not found on this page. Skipping listener.");
        return;
    }

    // Sync button text with current state
    const currentTheme = document.documentElement.getAttribute('data-theme');
    toggleBtn.textContent = currentTheme === 'light' ? '[ Night ]' : '[ Day ]';
    console.log("🌓 ThemeEngine: Button found and synchronized text layout.");

    // Direct click execution mapping
    toggleBtn.onclick = function () {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = 'dark';
        
        if (activeTheme === 'dark') {
            newTheme = 'light';
            toggleBtn.textContent = '[ Night ]';
        } else {
            toggleBtn.textContent = '[ Day ]';
        }

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('mindset_theme', newTheme);
        console.log("🌓 ThemeEngine: Theme manually toggled to ->", newTheme);
    };
}

// Guardrail against fast browser caching (DOMContentLoaded might have already fired)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}
