/**
 * Wedding Decor Manager - Authentication System Module
 * Complete authentication system with Phone OTP, Email, and Social providers
 */

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.isEnabled = false;
        this.authProviders = {
            email: true,
            phone: true,      // Primary method
            google: false,    // Can be enabled later
            github: false     // Can be enabled later
        };
        
        // User roles and permissions
        this.roles = {
            ADMIN: {
                name: 'Admin',
                permissions: ['all'],
                description: 'Full system access'
            },
            MANAGER: {
                name: 'Manager', 
                permissions: ['view_all', 'edit_all', 'create_enquiry', 'view_reports', 'manage_staff'],
                description: 'Can manage all enquiries and view reports'
            },
            SENIOR_STAFF: {
                name: 'Senior Staff',
                permissions: ['view_all', 'edit_assigned', 'create_enquiry', 'view_basic_reports'],
                description: 'Can view all enquiries, edit assigned ones'
            },
            STAFF: {
                name: 'Staff',
                permissions: ['view_assigned', 'edit_assigned', 'create_enquiry'],
                description: 'Can only access assigned enquiries'
            },
            VIEWER: {
                name: 'Viewer',
                permissions: ['view_assigned'],
                description: 'Read-only access to assigned enquiries'
            }
        };
        
        // Demo users for testing
        this.demoUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@weddingdecor.com',
                phone: '+91 98765 43210',
                role: 'ADMIN',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                name: 'Rajesh Kumar',
                email: 'rajesh@weddingdecor.com', 
                phone: '+91 87654 32109',
                role: 'MANAGER',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 3,
                name: 'Priya Sharma',
                email: 'priya@weddingdecor.com',
                phone: '+91 76543 21098',
                role: 'SENIOR_STAFF',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            }
        ];
        
        this.storageKey = 'wedding_auth_user';
        this.settingsKey = 'wedding_auth_settings';
        this.otpStorage = 'wedding_otp_data';
        
        this.loadAuthSettings();
        this.loadStoredUser();
    }

    /**
     * Initialize the authentication system
     */
    init(options = {}) {
        this.isEnabled = true;
        this.supabaseClient = options.supabaseClient || null;
        
        console.log('🔐 Authentication system initializing...');
        
        // Add authentication UI
        this.addAuthUI();
        this.setupEventListeners();
        
        // Check authentication state
        if (this.currentUser && this.validateStoredUser()) {
            this.showAuthenticatedView();
        } else {
            this.showLoginForm();
        }
        
        console.log('🔐 Authentication system initialized');
        return true;
    }

    /**
     * Add authentication UI elements
     */
    addAuthUI() {
        // Create login overlay
        this.createLoginOverlay();
        
        // Add user menu to header
        this.addUserMenu();
        
        // Add profile tab
        this.addProfileTab();
        
        // Add authentication styles
        this.addAuthStyles();
    }

    /**
     * Create login overlay
     */
    createLoginOverlay() {
        if (document.getElementById('auth-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2>🔐 Wedding Decor Manager</h2>
                        <p>Please sign in to continue</p>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" onclick="authSystem.showAuthTab('phone')">Phone OTP</button>
                        <button class="auth-tab" onclick="authSystem.showAuthTab('email')">Email</button>
                        <button class="auth-tab" onclick="authSystem.showAuthTab('register')">Register</button>
                    </div>
                    
                    <!-- Phone OTP Form -->
                    <div id="phone-form" class="auth-form active">
                        <div id="phone-step-1" class="auth-step active">
                            <form onsubmit="authSystem.handlePhoneLogin(event)">
                                <div class="form-group">
                                    <label for="phone-number">Phone Number</label>
                                    <input type="tel" id="phone-number" placeholder="+91 98765 43210" required>
                                    <small>Enter your registered phone number</small>
                                </div>
                                <button type="submit" class="btn btn-primary auth-btn">
                                    <span>Send OTP</span>
                                    <div class="loading-spinner" style="display: none;"></div>
                                </button>
                            </form>
                        </div>
                        
                        <div id="phone-step-2" class="auth-step">
                            <form onsubmit="authSystem.handleOTPVerification(event)">
                                <div class="form-group">
                                    <label for="otp-code">Enter OTP</label>
                                    <input type="text" id="otp-code" placeholder="123456" maxlength="6" required>
                                    <small>OTP sent to <span id="otp-phone-display"></span></small>
                                </div>
                                <div class="otp-timer">
                                    <span id="otp-countdown">Resend OTP in <strong>60</strong>s</span>
                                    <button type="button" id="resend-otp-btn" class="link-btn" onclick="authSystem.resendOTP()" style="display: none;">
                                        Resend OTP
                                    </button>
                                </div>
                                <div class="auth-actions">
                                    <button type="button" class="btn btn-secondary" onclick="authSystem.showAuthStep('phone', 1)">
                                        Back
                                    </button>
                                    <button type="submit" class="btn btn-primary">
                                        <span>Verify OTP</span>
                                        <div class="loading-spinner" style="display: none;"></div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Email Login Form -->
                    <div id="email-form" class="auth-form">
                        <form onsubmit="authSystem.handleEmailLogin(event)">
                            <div class="form-group">
                                <label for="login-email">Email Address</label>
                                <input type="email" id="login-email" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Password</label>
                                <input type="password" id="login-password" required>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="remember-me">
                                    <span>Remember me</span>
                                </label>
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <span>Sign In</span>
                                <div class="loading-spinner" style="display: none;"></div>
                            </button>
                        </form>
                        <p class="auth-link">
                            <a href="#" onclick="authSystem.showForgotPassword()">Forgot Password?</a>
                        </p>
                    </div>
                    
                    <!-- Registration Form -->
                    <div id="register-form" class="auth-form">
                        <form onsubmit="authSystem.handleRegistration(event)">
                            <div class="form-group">
                                <label for="register-name">Full Name</label>
                                <input type="text" id="register-name" required>
                            </div>
                            <div class="form-group">
                                <label for="register-email">Email Address</label>
                                <input type="email" id="register-email" required>
                            </div>
                            <div class="form-group">
                                <label for="register-phone">Phone Number</label>
                                <input type="tel" id="register-phone" placeholder="+91 98765 43210" required>
                            </div>
                            <div class="form-group">
                                <label for="register-role">Role</label>
                                <select id="register-role" required>
                                    <option value="">Select Role</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="SENIOR_STAFF">Senior Staff</option>
                                    <option value="MANAGER">Manager</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="register-password">Password</label>
                                <input type="password" id="register-password" required>
                            </div>
                            <div class="form-group">
                                <label for="register-confirm-password">Confirm Password</label>
                                <input type="password" id="register-confirm-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary auth-btn">
                                <span>Create Account</span>
                                <div class="loading-spinner" style="display: none;"></div>
                            </button>
                        </form>
                    </div>
                    
                    <div class="auth-demo-notice">
                        <h4>Demo Credentials</h4>
                        <p><strong>Phone:</strong> +91 98765 43210 (Admin)</p>
                        <p><strong>Phone:</strong> +91 87654 32109 (Manager)</p>
                        <p><strong>Email:</strong> admin@weddingdecor.com / password123</p>
                        <small>Use any OTP: 123456 for demo</small>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    /**
     * Add user menu to header
     */
    addUserMenu() {
        const header = document.querySelector('.header');
        if (!header || document.getElementById('user-menu')) return;

        const userMenu = document.createElement('div');
        userMenu.id = 'user-menu';
        userMenu.className = 'user-menu';
        userMenu.innerHTML = `
            <div class="user-avatar" onclick="authSystem.toggleUserDropdown()">
                <span id="user-avatar-text">U</span>
            </div>
            <div id="user-dropdown" class="user-dropdown">
                <div class="user-info">
                    <div class="user-name" id="user-name-display">User</div>
                    <div class="user-role" id="user-role-display">Role</div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" onclick="authSystem.showProfile()">👤 Profile</a>
                <a href="#" onclick="authSystem.showSettings()">⚙️ Settings</a>
                <div class="dropdown-divider"></div>
                <a href="#" onclick="authSystem.logout()">🚪 Logout</a>
            </div>
        `;
        
        // Position user menu
        userMenu.style.cssText = `
            position: absolute;
            top: 20px;
            right: 80px;
            z-index: 20;
        `;
        
        header.appendChild(userMenu);
    }

    /**
     * Add profile tab
     */
    addProfileTab() {
        const tabs = document.querySelector('.tabs');
        const mainContent = document.querySelector('.main-content');
        
        if (!tabs || !mainContent || document.getElementById('profile')) return;

        // Add profile tab button
        const profileTab = document.createElement('button');
        profileTab.className = 'tab';
        profileTab.setAttribute('onclick', "showTab('profile')");
        profileTab.textContent = 'Profile';
        tabs.appendChild(profileTab);

        // Add profile tab content
        const profileContent = document.createElement('div');
        profileContent.id = 'profile';
        profileContent.className = 'tab-content';
        profileContent.innerHTML = `
            <div class="profile-container">
                <h2>👤 User Profile</h2>
                
                <div class="profile-section">
                    <h3>Personal Information</h3>
                    <div class="profile-grid">
                        <div class="profile-field">
                            <label>Full Name</label>
                            <span id="profile-name">-</span>
                        </div>
                        <div class="profile-field">
                            <label>Email</label>
                            <span id="profile-email">-</span>
                        </div>
                        <div class="profile-field">
                            <label>Phone</label>
                            <span id="profile-phone">-</span>
                        </div>
                        <div class="profile-field">
                            <label>Role</label>
                            <span id="profile-role" class="role-badge">-</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Account Settings</h3>
                    <div class="profile-actions">
                        <button class="btn btn-secondary" onclick="authSystem.editProfile()">
                            Edit Profile
                        </button>
                        <button class="btn btn-secondary" onclick="authSystem.changePassword()">
                            Change Password
                        </button>
                        <button class="btn btn-danger" onclick="authSystem.deleteAccount()">
                            Delete Account
                        </button>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>Permissions</h3>
                    <div id="profile-permissions" class="permissions-list">
                        <!-- Permissions will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        mainContent.appendChild(profileContent);
    }

    /**
     * Add authentication styles
     */
    addAuthStyles() {
        if (document.getElementById('auth-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'auth-styles';
        styles.textContent = `
            #auth-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .auth-container {
                width: 100%;
                max-width: 450px;
                max-height: 90vh;
                overflow-y: auto;
                margin: 20px;
            }

            .auth-card {
                background: white;
                border-radius: 15px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .auth-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .auth-header h2 {
                color: #333;
                margin-bottom: 8px;
                font-size: 1.8rem;
            }

            .auth-header p {
                color: #666;
                margin: 0;
            }

            .auth-tabs {
                display: flex;
                margin-bottom: 30px;
                border-bottom: 2px solid #f0f0f0;
                gap: 5px;
            }

            .auth-tab {
                flex: 1;
                padding: 12px 16px;
                border: none;
                background: none;
                color: #666;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }

            .auth-tab.active {
                color: #667eea;
                border-bottom-color: #667eea;
            }

            .auth-form {
                display: none;
            }

            .auth-form.active {
                display: block;
            }

            .auth-step {
                display: none;
            }

            .auth-step.active {
                display: block;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }

            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #667eea;
            }

            .form-group small {
                color: #666;
                font-size: 0.85rem;
                margin-top: 4px;
                display: block;
            }

            .checkbox-group {
                flex-direction: row;
                align-items: center;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                font-weight: normal;
                cursor: pointer;
            }

            .checkbox-label input {
                width: auto;
                margin-right: 8px;
                margin-bottom: 0;
            }

            .auth-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .auth-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }

            .auth-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .loading-spinner {
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .auth-actions {
                display: flex;
                gap: 10px;
            }

            .auth-actions .btn {
                flex: 1;
            }

            .otp-timer {
                text-align: center;
                margin-bottom: 20px;
            }

            .otp-timer span {
                color: #666;
                font-size: 0.9rem;
            }

            .link-btn {
                background: none;
                border: none;
                color: #667eea;
                text-decoration: underline;
                cursor: pointer;
                font-size: 0.9rem;
            }

            .auth-link {
                text-align: center;
                margin-top: 20px;
            }

            .auth-link a {
                color: #667eea;
                text-decoration: none;
            }

            .auth-link a:hover {
                text-decoration: underline;
            }

            .auth-demo-notice {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                border-left: 4px solid #667eea;
            }

            .auth-demo-notice h4 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 0.9rem;
            }

            .auth-demo-notice p {
                margin: 5px 0;
                font-size: 0.8rem;
                color: #666;
            }

            .auth-demo-notice small {
                color: #999;
                font-style: italic;
            }

            /* User Menu Styles */
            .user-menu {
                position: relative;
            }

            .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                color: white;
            }

            .user-avatar:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }

            .user-dropdown {
                position: absolute;
                top: 50px;
                right: 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                min-width: 200px;
                display: none;
                z-index: 1000;
            }

            .user-dropdown.show {
                display: block;
                animation: dropDown 0.2s ease;
            }

            @keyframes dropDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .user-info {
                padding: 15px;
                border-bottom: 1px solid #f0f0f0;
            }

            .user-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .user-role {
                font-size: 0.8rem;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .user-dropdown a {
                display: block;
                padding: 12px 15px;
                text-decoration: none;
                color: #333;
                transition: background-color 0.2s ease;
            }

            .user-dropdown a:hover {
                background: #f8f9fa;
            }

            .dropdown-divider {
                height: 1px;
                background: #f0f0f0;
                margin: 5px 0;
            }

            /* Profile Styles */
            .profile-container {
                max-width: 800px;
            }

            .profile-container h2 {
                color: #333;
                margin-bottom: 30px;
            }

            .profile-section {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .profile-section h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 1.1rem;
            }

            .profile-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }

            .profile-field {
                display: flex;
                flex-direction: column;
            }

            .profile-field label {
                font-size: 0.8rem;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            .profile-field span {
                font-weight: 600;
                color: #333;
            }

            .role-badge {
                display: inline-block;
                padding: 4px 12px;
                background: #667eea;
                color: white;
                border-radius: 20px;
                font-size: 0.8rem;
                width: fit-content;
            }

            .profile-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .permissions-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }

            .permission-tag {
                background: #e3f2fd;
                color: #1976d2;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            @media (max-width: 768px) {
                .auth-card {
                    padding: 30px 20px;
                }
                
                .auth-tabs {
                    flex-direction: column;
                    gap: 0;
                }
                
                .auth-tab {
                    border-bottom: 1px solid #f0f0f0;
                    border-radius: 0;
                }
                
                .user-menu {
                    right: 20px;
                }
                
                .profile-actions {
                    flex-direction: column;
                }
                
                .auth-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close user dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            const avatar = document.querySelector('.user-avatar');
            
            if (dropdown && !avatar?.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Auto-format phone numbers
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhoneNumber.bind(this));
        });
    }

    /**
     * Show authentication tab
     */
    showAuthTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[onclick*="${tabName}"]`).classList.add('active');

        // Update form content
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
    }

    /**
     * Show authentication step for multi-step forms
     */
    showAuthStep(formName, stepNumber) {
        const form = document.getElementById(`${formName}-form`);
        const steps = form.querySelectorAll('.auth-step');
        
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepNumber - 1);
        });
    }

    /**
     * Handle phone login
     */
    async handlePhoneLogin(event) {
        event.preventDefault();
        
        const phoneInput = document.getElementById('phone-number');
        const button = event.target.querySelector('button');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');
        
        const phoneNumber = phoneInput.value.trim();
        
        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showAuthError('Please enter a valid phone number');
            return;
        }
        
        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Verifying...';
        
        try {
            const user = await this.verifyOTP(phoneNumber, otpCode);
            
            if (user) {
                // Store user data
                this.currentUser = user;
                this.saveUserData(user);
                
                // Clear temporary data
                sessionStorage.removeItem('auth_phone');
                
                // Show authenticated view
                this.showAuthenticatedView();
                this.showAuthSuccess(`Welcome back, ${user.name}!`);
                
            } else {
                this.showAuthError('Invalid OTP. Please try again.');
            }
            
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showAuthError('Failed to verify OTP. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Verify OTP';
        }
    }

    /**
     * Handle email login
     */
    async handleEmailLogin(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const rememberCheckbox = document.getElementById('remember-me');
        const button = event.target.querySelector('button');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;
        
        if (!email || !password) {
            this.showAuthError('Please fill in all fields');
            return;
        }
        
        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Signing in...';
        
        try {
            const user = await this.authenticateWithEmail(email, password);
            
            if (user) {
                // Store user data
                this.currentUser = user;
                this.saveUserData(user, remember);
                
                // Show authenticated view
                this.showAuthenticatedView();
                this.showAuthSuccess(`Welcome back, ${user.name}!`);
                
            } else {
                this.showAuthError('Invalid email or password');
            }
            
        } catch (error) {
            console.error('Email login error:', error);
            this.showAuthError('Login failed. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Sign In';
        }
    }

    /**
     * Handle user registration
     */
    async handleRegistration(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            name: document.getElementById('register-name').value.trim(),
            email: document.getElementById('register-email').value.trim(),
            phone: document.getElementById('register-phone').value.trim(),
            role: document.getElementById('register-role').value,
            password: document.getElementById('register-password').value,
            confirmPassword: document.getElementById('register-confirm-password').value
        };
        
        const button = event.target.querySelector('button');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');
        
        // Validation
        if (!userData.name || !userData.email || !userData.phone || !userData.role) {
            this.showAuthError('Please fill in all required fields');
            return;
        }
        
        if (!this.validateEmail(userData.email)) {
            this.showAuthError('Please enter a valid email address');
            return;
        }
        
        if (!this.validatePhoneNumber(userData.phone)) {
            this.showAuthError('Please enter a valid phone number');
            return;
        }
        
        if (userData.password.length < 6) {
            this.showAuthError('Password must be at least 6 characters long');
            return;
        }
        
        if (userData.password !== userData.confirmPassword) {
            this.showAuthError('Passwords do not match');
            return;
        }
        
        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Creating account...';
        
        try {
            const user = await this.registerUser(userData);
            
            if (user) {
                this.showAuthSuccess('Account created successfully! Please sign in.');
                this.showAuthTab('email');
                event.target.reset();
            } else {
                this.showAuthError('Registration failed. Email or phone may already be in use.');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showAuthError('Registration failed. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Create Account';
        }
    }

    /**
     * Send OTP to phone number
     */
    async sendOTP(phoneNumber) {
        // In production, integrate with SMS service like Twilio, AWS SNS, etc.
        // For demo, we'll simulate the OTP sending
        
        const otpCode = '123456'; // Demo OTP
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
        
        // Store OTP data temporarily
        const otpData = {
            phone: phoneNumber,
            code: otpCode,
            expiresAt: expiresAt,
            attempts: 0
        };
        
        sessionStorage.setItem(this.otpStorage, JSON.stringify(otpData));
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`📱 OTP sent to ${phoneNumber}: ${otpCode}`);
        return true;
    }

    /**
     * Verify OTP code
     */
    async verifyOTP(phoneNumber, otpCode) {
        const storedData = sessionStorage.getItem(this.otpStorage);
        
        if (!storedData) {
            throw new Error('No OTP data found');
        }
        
        const otpData = JSON.parse(storedData);
        
        // Check if OTP is expired
        if (Date.now() > otpData.expiresAt) {
            sessionStorage.removeItem(this.otpStorage);
            throw new Error('OTP has expired');
        }
        
        // Check if OTP matches
        if (otpData.code !== otpCode || otpData.phone !== phoneNumber) {
            otpData.attempts += 1;
            
            if (otpData.attempts >= 3) {
                sessionStorage.removeItem(this.otpStorage);
                throw new Error('Too many failed attempts');
            }
            
            sessionStorage.setItem(this.otpStorage, JSON.stringify(otpData));
            return null;
        }
        
        // OTP is valid, clear it
        sessionStorage.removeItem(this.otpStorage);
        
        // Find user by phone number
        const user = this.findUserByPhone(phoneNumber);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return user;
    }

    /**
     * Authenticate with email and password
     */
    async authenticateWithEmail(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo, check against demo users
        const user = this.demoUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.isActive
        );
        
        if (user && password === 'password123') { // Demo password
            return user;
        }
        
        // In production, use Supabase auth
        if (this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                // Get user profile from database
                const { data: profile } = await this.supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();
                
                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: profile?.name || 'User',
                    phone: profile?.phone || '',
                    role: profile?.role || 'STAFF',
                    isActive: true
                };
                
            } catch (error) {
                console.error('Supabase auth error:', error);
                return null;
            }
        }
        
        return null;
    }

    /**
     * Register new user
     */
    async registerUser(userData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if user already exists
        const existingUser = this.demoUsers.find(u => 
            u.email.toLowerCase() === userData.email.toLowerCase() ||
            u.phone === userData.phone
        );
        
        if (existingUser) {
            return null; // User already exists
        }
        
        // In production, use Supabase auth
        if (this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.auth.signUp({
                    email: userData.email,
                    password: userData.password,
                    options: {
                        data: {
                            name: userData.name,
                            phone: userData.phone,
                            role: userData.role
                        }
                    }
                });
                
                if (error) throw error;
                
                // Create profile in database
                const { error: profileError } = await this.supabaseClient
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        role: userData.role,
                        is_active: false // Require admin approval
                    });
                
                if (profileError) throw profileError;
                
                return {
                    id: data.user.id,
                    email: userData.email,
                    name: userData.name,
                    phone: userData.phone,
                    role: userData.role,
                    isActive: false
                };
                
            } catch (error) {
                console.error('Supabase registration error:', error);
                return null;
            }
        }
        
        // For demo, add to demo users
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        this.demoUsers.push(newUser);
        return newUser;
    }

    /**
     * Start OTP countdown timer
     */
    startOTPTimer() {
        let timeLeft = 60;
        const countdownElement = document.getElementById('otp-countdown');
        const resendButton = document.getElementById('resend-otp-btn');
        
        const timer = setInterval(() => {
            timeLeft--;
            
            if (timeLeft > 0) {
                countdownElement.innerHTML = `Resend OTP in <strong>${timeLeft}</strong>s`;
            } else {
                clearInterval(timer);
                countdownElement.style.display = 'none';
                resendButton.style.display = 'inline-block';
            }
        }, 1000);
    }

    /**
     * Resend OTP
     */
    async resendOTP() {
        const phoneNumber = sessionStorage.getItem('auth_phone');
        
        if (!phoneNumber) {
            this.showAuthError('Phone number not found. Please start over.');
            return;
        }
        
        try {
            await this.sendOTP(phoneNumber);
            
            // Reset timer
            document.getElementById('otp-countdown').style.display = 'block';
            document.getElementById('resend-otp-btn').style.display = 'none';
            document.getElementById('otp-code').value = '';
            
            this.startOTPTimer();
            this.showAuthSuccess('New OTP sent successfully!');
            
        } catch (error) {
            console.error('Resend OTP error:', error);
            this.showAuthError('Failed to resend OTP. Please try again.');
        }
    }

    /**
     * Show authenticated view
     */
    showAuthenticatedView() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Update user menu
        this.updateUserMenu();
        
        // Update profile tab
        this.updateProfileTab();
        
        // Show success message
        setTimeout(() => {
            this.showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
        }, 500);
    }

    /**
     * Show login form
     */
    showLoginForm() {
        const overlay = document.getElementById('auth-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        // Hide main content until authenticated
        const container = document.querySelector('.container .main-content');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Update user menu with current user info
     */
    updateUserMenu() {
        if (!this.currentUser) return;
        
        const avatarText = document.getElementById('user-avatar-text');
        const userName = document.getElementById('user-name-display');
        const userRole = document.getElementById('user-role-display');
        
        if (avatarText) {
            avatarText.textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
        
        if (userName) {
            userName.textContent = this.currentUser.name;
        }
        
        if (userRole) {
            userRole.textContent = this.roles[this.currentUser.role]?.name || this.currentUser.role;
        }
    }

    /**
     * Update profile tab with user information
     */
    updateProfileTab() {
        if (!this.currentUser) return;
        
        const elements = {
            'profile-name': this.currentUser.name,
            'profile-email': this.currentUser.email,
            'profile-phone': this.currentUser.phone,
            'profile-role': this.roles[this.currentUser.role]?.name || this.currentUser.role
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || '-';
            }
        });
        
        // Update permissions
        const permissionsContainer = document.getElementById('profile-permissions');
        if (permissionsContainer && this.roles[this.currentUser.role]) {
            const permissions = this.roles[this.currentUser.role].permissions;
            permissionsContainer.innerHTML = permissions.map(permission => 
                `<span class="permission-tag">${permission.replace('_', ' ')}</span>`
            ).join('');
        }
    }

    /**
     * Toggle user dropdown
     */
    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    /**
     * Show user profile
     */
    showProfile() {
        this.toggleUserDropdown(); // Close dropdown
        if (typeof showTab === 'function') {
            showTab('profile');
        }
    }

    /**
     * Show settings (placeholder)
     */
    showSettings() {
        this.toggleUserDropdown();
        this.showToast('Settings feature coming soon!', 'info');
    }

    /**
     * Edit profile (placeholder)
     */
    editProfile() {
        this.showToast('Edit profile feature coming soon!', 'info');
    }

    /**
     * Change password (placeholder)
     */
    changePassword() {
        this.showToast('Change password feature coming soon!', 'info');
    }

    /**
     * Delete account (placeholder)
     */
    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            this.showToast('Delete account feature coming soon!', 'warning');
        }
    }

    /**
     * Logout user
     */
    async logout() {
        this.toggleUserDropdown();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                // Clear Supabase session
                if (this.supabaseClient) {
                    await this.supabaseClient.auth.signOut();
                }
                
                // Clear local data
                this.currentUser = null;
                localStorage.removeItem(this.storageKey);
                sessionStorage.clear();
                
                // Show login form
                this.showLoginForm();
                
                // Hide main content
                const container = document.querySelector('.container .main-content');
                if (container) {
                    container.style.display = 'none';
                }
                
                this.showToast('Logged out successfully', 'success');
                
            } catch (error) {
                console.error('Logout error:', error);
                this.showToast('Logout failed', 'error');
            }
        }
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.roles[this.currentUser.role]) {
            return false;
        }
        
        const userPermissions = this.roles[this.currentUser.role].permissions;
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    /**
     * Check if user can access enquiry
     */
    canAccessEnquiry(enquiry) {
        if (!this.currentUser) return false;
        
        const userRole = this.currentUser.role;
        const userPermissions = this.roles[userRole]?.permissions || [];
        
        // Admin and Manager can access all
        if (userPermissions.includes('all') || userPermissions.includes('view_all')) {
            return true;
        }
        
        // Staff can only access their assigned enquiries
        if (userPermissions.includes('view_assigned')) {
            return enquiry.manager === this.currentUser.name;
        }
        
        return false;
    }

    /**
     * Utility functions
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhoneNumber(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, '');
        
        if (value.startsWith('91')) {
            value = '+91 ' + value.substring(2);
        } else if (!value.startsWith('+')) {
            value = '+91 ' + value;
        }
        
        event.target.value = value;
    }

    findUserByPhone(phone) {
        return this.demoUsers.find(user => 
            user.phone === phone && user.isActive
        );
    }

    validateStoredUser() {
        // Check if stored user is still valid
        return this.currentUser && 
               this.currentUser.isActive && 
               this.demoUsers.find(u => u.id === this.currentUser.id);
    }

    saveUserData(user, remember = false) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(this.storageKey, JSON.stringify(user));
    }

    loadStoredUser() {
        const stored = localStorage.getItem(this.storageKey) || 
                     sessionStorage.getItem(this.storageKey);
        
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
            } catch (error) {
                console.error('Error loading stored user:', error);
                this.currentUser = null;
            }
        }
    }

    loadAuthSettings() {
        const stored = localStorage.getItem(this.settingsKey);
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                this.authProviders = { ...this.authProviders, ...settings };
            } catch (error) {
                console.error('Error loading auth settings:', error);
            }
        }
    }

    showAuthSuccess(message) {
        this.showToast(message, 'success');
    }

    showAuthError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Use existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null && this.validateStoredUser();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationSystem;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.AuthenticationSystem = AuthenticationSystem;
    
    // Create global instance
    window.authSystem = new AuthenticationSystem();
    
    console.log('🔐 Authentication system module loaded');
}
        buttonText.textContent = 'Sending...';
        
        try {
            await this.sendOTP(phoneNumber);
            
            // Store phone number for verification
            sessionStorage.setItem('auth_phone', phoneNumber);
            
            // Show OTP step
            document.getElementById('otp-phone-display').textContent = phoneNumber;
            this.showAuthStep('phone', 2);
            this.startOTPTimer();
            
            this.showAuthSuccess('OTP sent successfully!');
            
        } catch (error) {
            console.error('Phone login error:', error);
            this.showAuthError('Failed to send OTP. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Send OTP';
        }
    }

    /**
     * Handle OTP verification
     */
    async handleOTPVerification(event) {
        event.preventDefault();
        
        const otpInput = document.getElementById('otp-code');
        const button = event.target.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');
        
        const otpCode = otpInput.value.trim();
        const phoneNumber = sessionStorage.getItem('auth_phone');
        
        if (!otpCode || otpCode.length !== 6) {
            this.showAuthError('Please enter a valid 6-digit OTP');
            return;
        }
        
        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Verifying...';

        try {
            const user = await this.verifyOTP(phoneNumber, otpCode);

            if (user) {
                // Store user data
                this.currentUser = user;
                this.saveUserData(user);

                // Clear temporary data
                sessionStorage.removeItem('auth_phone');

                // Show authenticated view
                this.showAuthenticatedView();
                this.showAuthSuccess(`Welcome back, ${user.name}!`);
            } else {
                this.showAuthError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showAuthError(error.message || 'Failed to verify OTP. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Verify OTP';
        }
    }

    // ...existing code...
    /**
     * Handle phone login
     */
    async handlePhoneLogin(event) {
        event.preventDefault();

        const phoneInput = document.getElementById('phone-number');
        const button = event.target.querySelector('button');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');

        const phoneNumber = phoneInput.value.trim();

        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showAuthError('Please enter a valid phone number');
            return;
        }

        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Sending...';

        try {
            await this.sendOTP(phoneNumber);

            // Store phone number for verification
            sessionStorage.setItem('auth_phone', phoneNumber);

            // Show OTP step
            document.getElementById('otp-phone-display').textContent = phoneNumber;
            this.showAuthStep('phone', 2);
            this.startOTPTimer();

            this.showAuthSuccess('OTP sent successfully!');

        } catch (error) {
            console.error('Phone login error:', error);
            this.showAuthError('Failed to send OTP. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Send OTP';
        }
    }

    /**
     * Handle OTP verification
     */
    async handleOTPVerification(event) {
        event.preventDefault();

        const otpInput = document.getElementById('otp-code');
        const button = event.target.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.loading-spinner');
        const buttonText = button.querySelector('span');

        const otpCode = otpInput.value.trim();
        const phoneNumber = sessionStorage.getItem('auth_phone');

        if (!otpCode || otpCode.length !== 6) {
            this.showAuthError('Please enter a valid 6-digit OTP');
            return;
        }

        // Show loading state
        button.disabled = true;
        spinner.style.display = 'block';
        buttonText.textContent = 'Verifying...';

        try {
            const user = await this.verifyOTP(phoneNumber, otpCode);

            if (user) {
                // Store user data
                this.currentUser = user;
                this.saveUserData(user);

                // Clear temporary data
                sessionStorage.removeItem('auth_phone');

                // Show authenticated view
                this.showAuthenticatedView();
                this.showAuthSuccess(`Welcome back, ${user.name}!`);
            } else {
                this.showAuthError('Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            this.showAuthError(error.message || 'Failed to verify OTP. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            spinner.style.display = 'none';
            buttonText.textContent = 'Verify OTP';
        }
    }
// ...existing code...
// ...existing code...