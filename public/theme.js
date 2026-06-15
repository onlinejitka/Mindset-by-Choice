/**
 * ==========================================================================
 * JS/THEME.JS (Anti-Flash Minimalist Theme Controller)
 * ==========================================================================
 */

// Execute immediately to inject data-theme attribute before HTML rendering
(function () {
    const savedTheme = localStorage.getItem('mindset_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

// Wait for DOM to attach the interactive toggle button listener
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    // Set initial text inside button based on active configuration
    const currentTheme = document.documentElement.getAttribute('data-theme');
    toggleBtn.textContent = currentTheme === 'light' ? '[ Night ]' : '[ Day ]';

    toggleBtn.addEventListener('click', () => {
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
    });
});
