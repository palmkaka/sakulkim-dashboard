// ============================================
// SAKULKIM DASHBOARD - AUTHENTICATION
// Firebase Authentication & Role Management
// ============================================

class Auth {
    constructor() {
        this.user = null;
        this.userRole = null;
        this.userProfile = null;
        this.authStateListeners = [];
    }

    // Initialize auth state listener
    init() {
        firebase.auth().onAuthStateChanged(async (user) => {
            this.user = user;

            if (user) {
                // Load user profile and role
                await this.loadUserProfile(user.uid);
            } else {
                this.userRole = null;
                this.userProfile = null;
            }

            // Notify all listeners
            this.authStateListeners.forEach(callback => callback(user, this.userRole));
        });
    }

    // Load user profile from Firestore or local storage
    async loadUserProfile(uid) {
        try {
            // Try to get from Firestore first
            if (typeof firebase.firestore !== 'undefined') {
                const doc = await firebase.firestore().collection('users').doc(uid).get();
                if (doc.exists) {
                    this.userProfile = doc.data();
                    this.userRole = this.userProfile.role || ROLES.CUSTOMER;
                    return;
                }
            }

            // Fallback: Check local storage
            const savedProfile = localStorage.getItem(`user_${uid}`);
            if (savedProfile) {
                this.userProfile = JSON.parse(savedProfile);
                this.userRole = this.userProfile.role || ROLES.CUSTOMER;
                return;
            }

            // Default to customer role if no profile found
            this.userRole = ROLES.CUSTOMER;
            this.userProfile = {
                uid: uid,
                email: this.user.email,
                displayName: this.user.displayName || this.user.email.split('@')[0],
                role: ROLES.CUSTOMER,
                createdAt: new Date().toISOString()
            };

            // Save to local storage
            localStorage.setItem(`user_${uid}`, JSON.stringify(this.userProfile));

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.userRole = ROLES.CUSTOMER;
        }
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.code };
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await firebase.auth().signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.code };
        }
    }

    // Register with email and password
    async registerWithEmail(email, password, displayName) {
        try {
            const result = await firebase.auth().createUserWithEmailAndPassword(email, password);

            // Update display name
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }

            // Create user profile
            const profile = {
                uid: result.user.uid,
                email: email,
                displayName: displayName || email.split('@')[0],
                role: ROLES.CUSTOMER, // Default role for new users
                createdAt: new Date().toISOString()
            };

            // Save to local storage (or Firestore if available)
            localStorage.setItem(`user_${result.user.uid}`, JSON.stringify(profile));

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.code };
        }
    }

    // Sign out
    async signOut() {
        try {
            await firebase.auth().signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.code };
        }
    }

    // Send password reset email
    async sendPasswordReset(email) {
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.code };
        }
    }

    // Add auth state listener
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);

        // Call immediately if user already exists
        if (this.user !== null) {
            callback(this.user, this.userRole);
        }

        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get current user role
    getCurrentRole() {
        return this.userRole;
    }

    // Get user profile
    getUserProfile() {
        return this.userProfile;
    }

    // Check permission
    hasPermission(permission) {
        if (!this.userRole) return false;
        const permissions = PERMISSIONS[this.userRole];
        return permissions && permissions[permission] === true;
    }

    // Check if user can view dashboard
    canViewDashboard() {
        return this.hasPermission('canViewDashboard');
    }

    // Check if user can add data
    canAddData() {
        return this.hasPermission('canAddData');
    }

    // Check if user can approve
    canApprove() {
        return this.hasPermission('canApprove');
    }

    // Check if user can manage users
    canManageUsers() {
        return this.hasPermission('canManageUsers');
    }

    // Check if user can export
    canExport() {
        return this.hasPermission('canExport');
    }

    // Update user role (Admin only)
    async updateUserRole(uid, newRole) {
        if (!this.hasPermission('canManageUsers')) {
            return { success: false, error: 'unauthorized' };
        }

        try {
            // Update in local storage
            const profileKey = `user_${uid}`;
            const savedProfile = localStorage.getItem(profileKey);

            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                profile.role = newRole;
                localStorage.setItem(profileKey, JSON.stringify(profile));
            }

            // Update in Firestore if available
            if (typeof firebase.firestore !== 'undefined') {
                await firebase.firestore().collection('users').doc(uid).update({
                    role: newRole,
                    updatedAt: new Date().toISOString()
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Update role error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user initials for avatar
    getInitials() {
        if (!this.userProfile) return '?';

        const name = this.userProfile.displayName || this.userProfile.email;
        if (!name) return '?';

        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Get role display name
    getRoleDisplayName(lang = 'th') {
        const roleNames = {
            [ROLES.ADMIN]: { th: 'ผู้ดูแลระบบ', en: 'Administrator' },
            [ROLES.MANAGER]: { th: 'ผู้จัดการ', en: 'Manager' },
            [ROLES.VIEWER]: { th: 'ผู้ดู', en: 'Viewer' },
            [ROLES.CUSTOMER]: { th: 'ลูกค้า', en: 'Customer' }
        };

        return roleNames[this.userRole]?.[lang] || this.userRole;
    }
}

// Create global auth instance
const auth = new Auth();

// Protected route check
function requireAuth(requiredPermission = null) {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            unsubscribe();

            if (!user) {
                window.location.href = 'index.html';
                reject('Not authenticated');
                return;
            }

            // Load user profile
            await auth.loadUserProfile(user.uid);

            // Check permission if required
            if (requiredPermission && !auth.hasPermission(requiredPermission)) {
                // Redirect based on role
                if (auth.getCurrentRole() === ROLES.CUSTOMER) {
                    window.location.href = 'my-entries.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
                reject('Permission denied');
                return;
            }

            resolve(user);
        });
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Auth, auth, requireAuth };
}
