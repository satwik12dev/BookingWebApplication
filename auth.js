class Auth {
    static init() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const userType = localStorage.getItem('userType');
        
        if (!isAuthenticated) {
            window.location.href = 'login.html';
            return;
        }
        if (userType === 'driver' && !window.location.href.includes('driver_availability.html')) {
            window.location.href = 'driver_availability.html';
        }
    }

    static logout() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
    }

    static setupNavigation() {
        const homeBtn = document.getElementById('homeBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = 'driver_availability.html';
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });
        }
    }
}