/**
 * ==========================================================================
 * JS/THEME.JS (Default Light Theme Edition - Anti-Flash)
 * ==========================================================================
 */

// 1. IMMEDIATE EXECUTION (Změněno z 'dark' na 'light' pro výchozí denní vzhled)
const savedTheme = localStorage.getItem('mindset_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
console.log("🌓 ThemeEngine: Initialized immediately with theme ->", savedTheme);

// 2. SAFELY ATTACH TOGGLE LOGIC
function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    
    if (!toggleBtn) return;

    // Synchronizace textu tlačítka s aktuálním stavem
    const currentTheme = document.documentElement.getAttribute('data-theme');
    toggleBtn.textContent = currentTheme === 'light' ? '[ Night ]' : '[ Day ]';

    // Obsluha kliknutí
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}
