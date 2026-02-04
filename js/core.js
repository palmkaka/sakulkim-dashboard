// ============================================
// SAKULKIM DASHBOARD - CORE APP
// Auth, Navigation, & Router
// ============================================

const App = {
    user: null,
    currentView: 'executive',

    async init() {
        console.log('App Initializing...');

        // Auth Listener
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                this.user = user;
                console.log('User logged in:', user.email);

                // Initialize Data
                await DataStore.init();

                // Show App, Hide Login
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('app-screen').style.display = 'flex';

                // Update User UI
                document.getElementById('user-name').textContent = user.displayName || user.email;

                // Load Default View
                this.navigate('executive');
            } else {
                console.log('No user');
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('app-screen').style.display = 'none';
            }
        });

        // Event Listeners
        this.setupNavigation();
        this.setupLogout();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                this.navigate(view);
            });
        });
    },

    navigate(viewName) {
        console.log('Navigating to:', viewName);
        this.currentView = viewName;

        // Update Nav Class
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.style.display = 'none';
        });

        // Show target view
        const target = document.getElementById(`view-${viewName}`);
        if (target) {
            target.style.display = 'block';
            // Trigger View Render
            if (typeof ViewRenderer !== 'undefined') {
                ViewRenderer.render(viewName);
            }
        }
    },

    setupLogout() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', () => firebase.auth().signOut());
        }
    }
};

// Global Error Handler
window.onerror = function (msg, url, line) {
    console.error(`Error: ${msg} at ${line}`);
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());
