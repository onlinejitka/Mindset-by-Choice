(function () {
    const savedTheme = localStorage.getItem('mindset_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

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
