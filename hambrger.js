// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    
    if (!hamburgerBtn || !hamburgerMenu) {
        console.log('Hamburger elements not found');
        return;
    }
    
    console.log('Hamburger menu initialized');
    
    // Hamburger Menu Toggle
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        
        // Icon ändern
        const icon = hamburgerBtn.querySelector('i');
        if (hamburgerMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
        
        console.log('Hamburger menu toggled:', hamburgerMenu.classList.contains('active'));
    });
    
    // Menu schließen bei Klick außerhalb
    document.addEventListener('click', function(e) {
        if (!hamburgerMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
    
    // Menu schließen bei Klick auf Menu-Item
    document.querySelectorAll('.hamburger-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        });
    });
    
    // Menu schließen bei Window Resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
});