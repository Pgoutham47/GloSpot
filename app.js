// GloSpot PWA - Main Application Logic
class GloSpotApp {
    constructor() {
        this.currentPage = 'onboarding';
        this.isOnline = navigator.onLine;
        this.recording = false;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.offlineData = JSON.parse(localStorage.getItem('offlineData') || '[]');
        
        this.init();
        
    }

    init() {
        this.setupEventListeners();
        this.setupOfflineDetection();
        this.setupVerticalJumpEventListeners();
        this.setupSquatEventListeners();
        this.setupHeightEventListeners();
        this.setupPushupEventListeners();
        // Clear any existing user data for fresh demo
        this.clearUserData();
        this.checkAuthStatus();
    }

    clearUserData() {
        // Clear user data for fresh demo experience
        localStorage.removeItem('user');
        this.currentUser = null;
    }

    setupEventListeners() {
        // Bottom navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const page = e.target.closest('.nav-item').dataset.page;
                this.navigateToPage(page);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.target.id === 'signin-form') {
                this.handleSignIn(e.target);
            } else if (e.target.id === 'signup-form') {
                this.handleSignUp(e.target);
            } else if (e.target.id === 'edit-profile-form') {
                this.handleEditProfile(e.target);
            }
        });

        // Button clicks
        document.addEventListener('click', (e) => {
            if (e.target.id === 'get-started-btn') {
                this.loadPage('signup');
            } else if (e.target.id === 'signin-link') {
                this.loadPage('signin');
            } else if (e.target.id === 'signup-link') {
                this.loadPage('signup');
            } else if (e.target.id === 'back-to-signin') {
                this.loadPage('signin');
            } else if (e.target.id === 'back-to-signup') {
                this.loadPage('signup');
            }
        });

    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
        });
    }

    checkAuthStatus() {
        const user = localStorage.getItem('user');
        if (user) {
            this.currentUser = JSON.parse(user);
            // If user exists, go to home
            this.loadPage('home');
        } else {
            // No user, show welcome page
            this.loadPage('welcome');
        }
    }

    loadPage(pageName) {
        // Hide all pages with smooth transition
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
            // Remove page after transition
            setTimeout(() => {
                if (!page.classList.contains('active')) {
                    page.remove();
                }
            }, 300);
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
        } else {
            this.createPage(pageName);
        }

        // Show/hide bottom navigation
        const bottomNav = document.getElementById('bottom-nav');
        if (['home', 'all-tests', 'profile'].includes(pageName)) {
            bottomNav.style.display = 'flex';
        } else {
            bottomNav.style.display = 'none';
        }

        // Update navigation active state
        this.updateNavigationState(pageName);
    }

    createPage(pageName) {
        const mainContent = document.getElementById('main-content');
        let pageHTML = '';

        switch (pageName) {
            case 'welcome':
                pageHTML = this.createWelcomePage();
                break;
            case 'signin':
                pageHTML = this.createSignInPage();
                break;
            case 'signup':
                pageHTML = this.createSignUpPage();
                break;
            case 'home':
                pageHTML = this.createHomePage();
                break;
            case 'tests':
                pageHTML = this.createFitnessTestsPage();
                break;
            case 'profile':
                pageHTML = this.createProfilePage();
                break;
            case 'edit-profile':
                pageHTML = this.createEditProfilePage();
                break;
            case 'fitness-tests':
                pageHTML = this.createFitnessTestsPage();
                break;
            case 'all-tests':
                pageHTML = this.createAllTestsPage();
                break;
            case 'height-test':
                pageHTML = this.createHeightTestPage();
                break;
            case 'leaderboard':
                pageHTML = this.createLeaderboardPage();
                setTimeout(() => this.loadOverallLeaderboard(), 100);
                break;
            case 'vertical-jump-test':
                pageHTML = this.createVerticalJumpTestPage();
                break;
            case 'vertical-jump-leaderboard':
                pageHTML = this.createVerticalJumpLeaderboardPage();
                // Load leaderboard data after page is created
                setTimeout(() => this.loadVerticalJumpLeaderboard(), 100);
                break;
            case 'squat-test':
                pageHTML = this.createSquatTestPage();
                break;
            case 'height-test':
                pageHTML = this.createHeightTestPage();
                break;
            case 'pushup-test':
                pageHTML = this.createPushupTestPage();
                break;
            case 'squat-leaderboard':
                pageHTML = this.createSquatLeaderboardPage();
                // Load leaderboard data after page is created
                setTimeout(() => this.loadSquatLeaderboard(), 100);
                break;
            case 'height-leaderboard':
                pageHTML = this.createHeightLeaderboardPage();
                // Load leaderboard data after page is created
                setTimeout(() => this.loadHeightLeaderboard(), 100);
                break;
            case 'pushup-leaderboard':
                pageHTML = this.createPushupLeaderboardPage();
                // Load leaderboard data after page is created
                setTimeout(() => this.loadPushupLeaderboard(), 100);
                break;
        }

        const pageElement = document.createElement('div');
        pageElement.id = `${pageName}-page`;
        pageElement.className = `page ${pageName}`;
        pageElement.innerHTML = `<div class="page-content">${pageHTML}</div>`;
        mainContent.appendChild(pageElement);
        
        // Add slight delay for smooth transition
        setTimeout(() => {
            pageElement.classList.add('active');
        }, 10);
    }

    createWelcomePage() {
        return `
            <div class="welcome-page">
                <div class="welcome-content">
                    <div class="logo">
                        <div class="logo-icon">G</div>
                        <h1>GloSpot</h1>
                    </div>
                    <div class="welcome-text">
                        <h2>AI-Powered Sports Talent Assessment</h2>
                        <p>Discover your athletic potential with our advanced AI analysis platform. Record, analyze, and track your performance with cutting-edge technology.</p>
                    </div>
                    <div class="features">
                        <div class="feature-item">
                            <div class="feature-icon">🤖</div>
                            <h3>AI Analysis</h3>
                            <p>Real-time pose estimation and movement analysis</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">📊</div>
                            <h3>Performance Tracking</h3>
                            <p>Comprehensive analytics and progress monitoring</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🏆</div>
                            <h3>Talent Identification</h3>
                            <p>Connect with coaches and sports authorities</p>
                        </div>
                    </div>
                    <div class="welcome-actions">
                        <button id="get-started-btn" class="btn-primary">Get Started</button>
                        <p class="login-text">Already have an account? <a href="#" id="signin-link">Sign In</a></p>
                    </div>
                </div>
            </div>
        `;
    }


    createSignInPage() {
        return `
            <div class="auth-page">
                <div class="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your sports journey</p>
                </div>
                <form id="signin-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn-primary">Sign In</button>
                </form>
                <button id="signup-link" class="btn-link">Don't have an account? Sign Up</button>
            </div>
        `;
    }

    createSignUpPage() {
        return `
            <div class="onboarding">
                <div class="onboarding-content">
                    <h1>Join GloSpot</h1>
                    <p>Create your account and set up your athlete profile to get started.</p>
                    
                    <form id="signup-form" class="onboarding-form">
                        <div class="form-section">
                            <h3>Account Information</h3>
                            
                            <div class="form-group">
                                <label for="fullName">Full Name *</label>
                                <input type="text" id="fullName" name="fullName" required placeholder="Enter your full name">
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" name="email" required placeholder="your.email@example.com">
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="password">Password *</label>
                                    <input type="password" id="password" name="password" required placeholder="Create password">
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Confirm Password *</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm password">
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Basic Information</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="age">Age *</label>
                                    <input type="number" id="age" name="age" min="10" max="50" required placeholder="18">
                                </div>
                                <div class="form-group">
                                    <label for="weight">Weight (kg) *</label>
                                    <input type="number" id="weight" name="weight" min="30" max="150" required placeholder="70">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="gender">Gender *</label>
                                <select id="gender" name="gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="location">Location (State/District) *</label>
                                <input type="text" id="location" name="location" required placeholder="e.g., Mumbai, Maharashtra">
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Sports Background</h3>
                            
                            <div class="form-group">
                                <label for="level">Current Level *</label>
                                <select id="level" name="level" required>
                                    <option value="">Select Your Level</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="School">School</option>
                                    <option value="District">District</option>
                                    <option value="State">State</option>
                                    <option value="National">National</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="sports">Preferred Sports *</label>
                                <input type="text" id="sports" name="sports" required placeholder="e.g., Cricket, Football, Basketball">
                                <small>Separate multiple sports with commas</small>
                            </div>

                            <div class="form-group">
                                <label for="trainingFrequency">Training Frequency *</label>
                                <select id="trainingFrequency" name="trainingFrequency" required>
                                    <option value="">Select Training Frequency</option>
                                    <option value="Daily">Daily</option>
                                    <option value="5-6 times/week">5-6 times/week</option>
                                    <option value="3-4 times/week">3-4 times/week</option>
                                    <option value="1-2 times/week">1-2 times/week</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="injuries">Past Injuries/Medical Conditions (Optional)</label>
                                <textarea id="injuries" name="injuries" rows="2" placeholder="Describe any past injuries or medical conditions..."></textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Privacy & Data Sharing</h3>
                            
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="dataConsent" name="dataConsent" required>
                                    <span class="checkmark"></span>
                                    I consent to data collection for performance analysis and improvement *
                                </label>
                            </div>

                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="saiSharing" name="saiSharing">
                                    <span class="checkmark"></span>
                                    Allow performance data sharing with SAI/Government for talent identification
                                </label>
                            </div>

                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="leaderboard" name="leaderboard">
                                    <span class="checkmark"></span>
                                    Show my performance on public leaderboards
                                </label>
                            </div>

                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="newsletter" name="newsletter">
                                    <span class="checkmark"></span>
                                    Subscribe to training tips and updates
                                </label>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Create Account & Continue</button>
                            <button type="button" id="signin-link" class="btn-secondary">Already have an account? Sign In</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    createHomePage() {
        const user = this.currentUser || { name: 'Athlete', email: 'athlete@glospot.com' };
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <div class="home-header">
                <div class="header-left">
                    <h1>Hello, ${user.name.split(' ')[0]}</h1>
                    <p class="welcome-subtitle">Ready for your next fitness test?</p>
                </div>
                <div class="header-right">
                    <div class="profile-icon">${initials}</div>
                </div>
            </div>
            

            <div class="section-header">
                <h2>FITNESS TESTS</h2>
                <a href="#" onclick="app.loadPage('all-tests')" class="see-all">View All</a>
            </div>
            <div class="test-grid">
                <div class="test-card" onclick="app.loadPage('all-tests')">
                    <div class="icon">📏</div>
                    <h3>Height Measurement</h3>
                    <p>Body proportions assessment</p>
                </div>
                <div class="test-card" onclick="app.loadPage('all-tests')">
                    <div class="icon">⚖️</div>
                    <h3>Weight & BMI</h3>
                    <p>Body type analysis</p>
                </div>
            </div>
            
            <div class="section-header">
                <h2>🏆 LEADERBOARDS</h2>
                <a href="#" onclick="app.loadPage('vertical-jump-leaderboard')" class="see-all">View All</a>
            </div>
            <div class="test-grid">
                <div class="test-card" onclick="app.loadPage('vertical-jump-leaderboard')">
                    <div class="icon">🦘</div>
                    <h3>Vertical Jump</h3>
                    <p>Top performers in vertical jump</p>
                </div>
                <div class="test-card" onclick="app.loadPage('squat-leaderboard')">
                    <div class="icon">🏋️</div>
                    <h3>Sit-ups Analysis</h3>
                    <p>Best sit-ups form and technique</p>
                </div>
                <div class="test-card" onclick="app.loadPage('height-leaderboard')">
                    <div class="icon">📏</div>
                    <h3>Height Measurement</h3>
                    <p>Tallest performers</p>
                </div>
                <div class="test-card" onclick="app.loadPage('pushup-leaderboard')">
                    <div class="icon">💪</div>
                    <h3>Pushup Counter</h3>
                    <p>Most pushups</p>
                </div>
                <div class="test-card" onclick="app.loadPage('leaderboard')">
                    <div class="icon">🏆</div>
                    <h3>General Leaderboard</h3>
                    <p>Overall performance rankings</p>
                </div>
            </div>
        `;
    }



    createProfilePage() {
        const user = this.currentUser || { 
            name: 'Athlete', 
            email: 'athlete@glospot.com',
            profile: {
                age: 18,
                gender: 'Male',
                location: 'Mumbai, Maharashtra',
                weight: '70 kg',
                level: 'School',
                sports: ['Cricket', 'Football'],
                trainingFrequency: 'Daily',
                injuries: 'None',
                testsCompleted: 24,
                totalScore: 8600,
                averageScore: 85
            }
        };
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-name">${user.name}</div>
                <div class="profile-email">${user.email}</div>
                <div class="profile-level">${user.profile?.level || 'School'} Level Athlete</div>
            </div>
            
            <div class="profile-info-section">
                <h3>Basic Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Age</span>
                        <span class="value">${user.profile?.age || '18'} years</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Gender</span>
                        <span class="value">${user.profile?.gender || 'Male'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Weight</span>
                        <span class="value">${user.profile?.weight || '70 kg'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Location</span>
                        <span class="value">${user.profile?.location || 'Mumbai, Maharashtra'}</span>
                    </div>
                </div>
            </div>

            <div class="profile-info-section">
                <h3>Sports Background</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">Current Level</span>
                        <span class="value">${user.profile?.level || 'School'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Preferred Sports</span>
                        <span class="value">${(user.profile?.sports || ['Cricket']).join(', ')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Training Frequency</span>
                        <span class="value">${user.profile?.trainingFrequency || 'Daily'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Past Injuries</span>
                        <span class="value">${user.profile?.injuries || 'None'}</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="value">${user.profile?.testsCompleted || 24}</div>
                    <div class="label">Tests Completed</div>
                </div>
                <div class="stat-item">
                    <div class="value">${user.profile?.totalScore || 8600}</div>
                    <div class="label">Total Score</div>
                </div>
                <div class="stat-item">
                    <div class="value">${user.profile?.averageScore || 85}%</div>
                    <div class="label">Average Score</div>
                </div>
            </div>

            <div class="privacy-section">
                <h3>Privacy & Data Sharing</h3>
                <div class="privacy-item">
                    <div class="privacy-info">
                        <h4>Data Collection Consent</h4>
                        <p>I consent to data collection for performance analysis</p>
                    </div>
                    <div class="privacy-toggle">
                        <input type="checkbox" id="data-consent" checked>
                        <label for="data-consent"></label>
                    </div>
                </div>
                <div class="privacy-item">
                    <div class="privacy-info">
                        <h4>Share with SAI/Government</h4>
                        <p>Allow performance data sharing for talent identification</p>
                    </div>
                    <div class="privacy-toggle">
                        <input type="checkbox" id="sai-sharing" checked>
                        <label for="sai-sharing"></label>
                    </div>
                </div>
                <div class="privacy-item">
                    <div class="privacy-info">
                        <h4>Public Leaderboard</h4>
                        <p>Show my performance on public leaderboards</p>
                    </div>
                    <div class="privacy-toggle">
                        <input type="checkbox" id="leaderboard" checked>
                        <label for="leaderboard"></label>
                    </div>
                </div>
            </div>
            
            <div class="menu-section">
                <div class="menu-item" onclick="app.editProfile()">
                    <div class="icon">✏️</div>
                    <div class="content">
                        <h4>Edit Profile</h4>
                        <p>Update your personal information</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
                <div class="menu-item">
                    <div class="icon">📊</div>
                    <div class="content">
                        <h4>Performance Analytics</h4>
                        <p>View detailed progress reports</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
                <div class="menu-item">
                    <div class="icon">🏆</div>
                    <div class="content">
                        <h4>Achievements</h4>
                        <p>View your badges and milestones</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
            </div>
            
            <div class="menu-section">
                <div class="menu-item">
                    <div class="icon">🔒</div>
                    <div class="content">
                        <h4>Privacy Settings</h4>
                        <p>Manage your data sharing preferences</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
                <div class="menu-item">
                    <div class="icon">📱</div>
                    <div class="content">
                        <h4>Help & Support</h4>
                        <p>Get help and contact support</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
                <div class="menu-item" onclick="app.signOut()">
                    <div class="icon">🚪</div>
                    <div class="content">
                        <h4>Sign Out</h4>
                        <p>Sign out of your account</p>
                    </div>
                    <div class="arrow">›</div>
                </div>
            </div>
        `;
    }






    handleSignIn(form) {
        const formData = new FormData(form);
        const user = {
            name: 'Test User',
            email: formData.get('email')
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
        this.loadPage('home');
    }

    handleSignUp(form) {
        const formData = new FormData(form);
        const sports = formData.get('sports').split(',').map(s => s.trim()).filter(s => s);
        
        const user = {
            name: formData.get('fullName'),
            email: formData.get('email'),
            profile: {
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                location: formData.get('location'),
                weight: formData.get('weight') + ' kg',
                level: formData.get('level'),
                sports: sports,
                trainingFrequency: formData.get('trainingFrequency'),
                injuries: formData.get('injuries') || 'None',
                dataConsent: formData.get('dataConsent') === 'on',
                saiSharing: formData.get('saiSharing') === 'on',
                leaderboard: formData.get('leaderboard') === 'on',
                newsletter: formData.get('newsletter') === 'on',
                testsCompleted: 0,
                totalScore: 0,
                averageScore: 0
            }
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser = user;
        this.loadPage('home');
    }

    handleEditProfile(form) {
        const formData = new FormData(form);
        const sports = formData.get('sports').split(',').map(s => s.trim()).filter(s => s);
        
        const updatedUser = {
            ...this.currentUser,
            name: formData.get('fullName'),
            profile: {
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                location: formData.get('location'),
                weight: formData.get('weight') + ' kg',
                level: formData.get('level'),
                sports: sports,
                trainingFrequency: formData.get('trainingFrequency'),
                injuries: formData.get('injuries') || 'None',
                dataConsent: formData.get('dataConsent') === 'on',
                saiSharing: formData.get('saiSharing') === 'on',
                leaderboard: formData.get('leaderboard') === 'on',
                newsletter: formData.get('newsletter') === 'on',
                testsCompleted: this.currentUser.profile?.testsCompleted || 0,
                totalScore: this.currentUser.profile?.totalScore || 0,
                averageScore: this.currentUser.profile?.averageScore || 0
            }
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
        this.loadPage('profile');
    }

    signOut() {
        localStorage.removeItem('user');
        this.currentUser = null;
        this.loadPage('welcome');
    }

    editProfile() {
        this.loadPage('edit-profile');
    }

    createEditProfilePage() {
        const user = this.currentUser || { 
            name: 'Athlete', 
            email: 'athlete@glospot.com',
            profile: {
                age: 18,
                gender: 'Male',
                location: 'Mumbai, Maharashtra',
                weight: '70 kg',
                level: 'School',
                sports: ['Cricket', 'Football'],
                trainingFrequency: 'Daily',
                injuries: 'None'
            }
        };

        return `
            <div class="edit-profile-header">
                <button class="back-btn" onclick="app.loadPage('profile')">← Back</button>
                <h1>Edit Profile</h1>
            </div>

            <form id="edit-profile-form" class="edit-profile-form">
                <div class="form-section">
                    <h3>Basic Information</h3>
                    
                    <div class="form-group">
                        <label for="fullName">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value="${user.name}" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="age">Age</label>
                            <input type="number" id="age" name="age" value="${user.profile?.age || 18}" min="10" max="50" required>
                        </div>
                        <div class="form-group">
                            <label for="weight">Weight (kg)</label>
                            <input type="number" id="weight" name="weight" value="${user.profile?.weight?.replace(' kg', '') || 70}" min="30" max="150" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" name="gender" required>
                            <option value="Male" ${user.profile?.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${user.profile?.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${user.profile?.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="location">Location (State/District)</label>
                        <input type="text" id="location" name="location" value="${user.profile?.location || 'Mumbai, Maharashtra'}" required>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Sports Background</h3>
                    
                    <div class="form-group">
                        <label for="level">Current Level</label>
                        <select id="level" name="level" required>
                            <option value="Beginner" ${user.profile?.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="School" ${user.profile?.level === 'School' ? 'selected' : ''}>School</option>
                            <option value="District" ${user.profile?.level === 'District' ? 'selected' : ''}>District</option>
                            <option value="State" ${user.profile?.level === 'State' ? 'selected' : ''}>State</option>
                            <option value="National" ${user.profile?.level === 'National' ? 'selected' : ''}>National</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="sports">Preferred Sports (comma-separated)</label>
                        <input type="text" id="sports" name="sports" value="${(user.profile?.sports || ['Cricket']).join(', ')}" placeholder="e.g., Cricket, Football, Basketball">
                    </div>

                    <div class="form-group">
                        <label for="trainingFrequency">Training Frequency</label>
                        <select id="trainingFrequency" name="trainingFrequency" required>
                            <option value="Daily" ${user.profile?.trainingFrequency === 'Daily' ? 'selected' : ''}>Daily</option>
                            <option value="5-6 times/week" ${user.profile?.trainingFrequency === '5-6 times/week' ? 'selected' : ''}>5-6 times/week</option>
                            <option value="3-4 times/week" ${user.profile?.trainingFrequency === '3-4 times/week' ? 'selected' : ''}>3-4 times/week</option>
                            <option value="1-2 times/week" ${user.profile?.trainingFrequency === '1-2 times/week' ? 'selected' : ''}>1-2 times/week</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="injuries">Past Injuries/Medical Conditions (Optional)</label>
                        <textarea id="injuries" name="injuries" rows="3" placeholder="Describe any past injuries or medical conditions...">${user.profile?.injuries || ''}</textarea>
                    </div>
                </div>

                <div class="form-section">
                    <h3>Privacy & Data Sharing</h3>
                    
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="dataConsent" name="dataConsent" checked>
                            <span class="checkmark"></span>
                            I consent to data collection for performance analysis and improvement
                        </label>
                    </div>

                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="saiSharing" name="saiSharing" checked>
                            <span class="checkmark"></span>
                            Allow performance data sharing with SAI/Government for talent identification
                        </label>
                    </div>

                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="leaderboard" name="leaderboard" checked>
                            <span class="checkmark"></span>
                            Show my performance on public leaderboards
                        </label>
                    </div>

                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="newsletter" name="newsletter">
                            <span class="checkmark"></span>
                            Subscribe to training tips and updates
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="app.loadPage('profile')">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        `;
    }

    createFitnessTestsPage() {
        return `
            <div class="fitness-tests-header">
                <h1>Fitness Tests</h1>
                <p>Comprehensive assessment for sports talent identification</p>
            </div>
            
            <div class="tests-grid">
                <div class="test-card">
                    <div class="test-icon">📏</div>
                    <h3>Height Measurement</h3>
                    <p>Body proportions assessment</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">⚖️</div>
                    <h3>Weight & BMI</h3>
                    <p>Body type analysis</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">🤲</div>
                    <h3>Arm Span</h3>
                    <p>Reach advantage measurement</p>
                </div>
                
                <div class="test-card" onclick="app.loadPage('vertical-jump-test')">
                    <div class="test-icon">🦘</div>
                    <h3>Vertical Jump</h3>
                    <p>Explosive leg power assessment</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">🏃</div>
                    <h3>Shuttle Run</h3>
                    <p>Speed and agility test</p>
                </div>
                
                
                <div class="test-card">
                    <div class="test-icon">🏃‍♂️</div>
                    <h3>Endurance Run</h3>
                    <p>Cardio-respiratory endurance</p>
                </div>
            </div>
        `;
    }

    createAllTestsPage() {
        return `
            <div class="fitness-tests-header">
                <h1>All Fitness Tests</h1>
                <p>Complete assessment for sports talent identification</p>
            </div>
            
            <div class="tests-grid">
                <div class="test-card" onclick="app.loadPage('height-test')">
                    <div class="test-icon">📏</div>
                    <h3>Height Measurement</h3>
                    <p>Body proportions assessment</p>
                </div>
                <div class="test-card" onclick="app.loadPage('pushup-test')">
                    <div class="test-icon">💪</div>
                    <h3>Pushup Counter</h3>
                    <p>Count your pushups with AI-powered detection</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">⚖️</div>
                    <h3>Weight & BMI</h3>
                    <p>Body type analysis</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">🤲</div>
                    <h3>Arm Span</h3>
                    <p>Reach advantage measurement</p>
                </div>
                
                <div class="test-card" onclick="app.loadPage('vertical-jump-test')">
                    <div class="test-icon">🦘</div>
                    <h3>Vertical Jump</h3>
                    <p>Explosive leg power assessment</p>
                </div>
                
                <div class="test-card" onclick="app.loadPage('squat-test')">
                    <div class="test-icon">🏋️</div>
                    <h3>Sit-ups Analysis</h3>
                    <p>Form and technique assessment</p>
                </div>
                <div class="test-card" onclick="app.loadPage('height-test')">
                    <div class="test-icon">📏</div>
                    <h3>Height Measurement</h3>
                    <p>AI-powered height detection</p>
                </div>
                
                <div class="test-card">
                    <div class="test-icon">🏃</div>
                    <h3>Shuttle Run</h3>
                    <p>Speed and agility test</p>
                </div>
                
                
                <div class="test-card">
                    <div class="test-icon">🏃‍♂️</div>
                    <h3>Endurance Run</h3>
                    <p>Cardio-respiratory endurance</p>
                </div>
            </div>
            
        <div class="leaderboard-section">
            <h2>🏆 Leaderboards</h2>
            <div class="leaderboard-buttons">
                <button class="btn-primary" onclick="app.loadPage('leaderboard')">General Leaderboard</button>
                <button class="btn-secondary" onclick="app.loadPage('vertical-jump-leaderboard')">Vertical Jump Leaderboard</button>
                <button class="btn-secondary" onclick="app.loadPage('squat-leaderboard')">Sit-ups Analysis Leaderboard</button>
                <button class="btn-secondary" onclick="app.loadPage('height-leaderboard')">Height Measurement Leaderboard</button>
                <button class="btn-secondary" onclick="app.loadPage('pushup-leaderboard')">Pushup Counter Leaderboard</button>
            </div>
        </div>
        `;
    }



    createHeightTestPage() {
        return `
            <div class="test-page">
                <div class="test-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>📏 Height Measurement</h1>
                    <p>Body proportions assessment</p>
                </div>
                
                <div class="test-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Stand straight against a wall</li>
                        <li>Remove shoes and stand barefoot</li>
                        <li>Keep heels, back, and head against the wall</li>
                        <li>Look straight ahead</li>
                        <li>Enter your height measurement below</li>
                    </ul>
                </div>
                
                <div class="height-input-area">
                    <div class="height-input-group">
                        <label for="height-input">Height (cm):</label>
                        <input type="number" id="height-input" placeholder="Enter height in cm" min="100" max="250">
                    </div>
                    
                    <div class="height-display">
                        <div class="height-value" id="height-display">0 cm</div>
                        <div class="height-category" id="height-category">Enter your height</div>
                    </div>
                    
                    <button class="btn-primary" onclick="app.saveHeightMeasurement()">Save Height</button>
                </div>
            </div>
        `;
    }

    createLeaderboardPage() {
        return `
            <div class="leaderboard-page">
                <div class="leaderboard-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>🏆 General Leaderboard</h1>
                    <p>Overall performance across all tests</p>
                </div>
                
                <div class="leaderboard-tabs">
                    <button class="tab-btn active" onclick="app.showLeaderboardTab('overall')">Overall</button>
                    <button class="tab-btn" onclick="app.showLeaderboardTab('vertical-jump')">Vertical Jump</button>
                    <button class="tab-btn" onclick="app.showLeaderboardTab('sit-ups')">Sit-ups</button>
                    <button class="tab-btn" onclick="app.showLeaderboardTab('height')">Height</button>
                    <button class="tab-btn" onclick="app.showLeaderboardTab('pushup')">Pushups</button>
                </div>
                
                <div class="leaderboard-content">
                    <div id="overall-leaderboard" class="leaderboard-list">
                        <h3>🏆 Overall Performance</h3>
                        <div class="loading" id="overall-loading">Loading overall results...</div>
                        <div id="overall-results" style="display: none;"></div>
                    </div>
                    
                    <div id="vertical-jump-leaderboard" class="leaderboard-list" style="display: none;">
                        <h3>🦘 Vertical Jump</h3>
                        <div class="loading" id="vj-loading">Loading vertical jump results...</div>
                        <div id="vj-results" style="display: none;"></div>
                    </div>
                    
                    <div id="sit-ups-leaderboard" class="leaderboard-list" style="display: none;">
                        <h3>🏋️ Sit-ups Analysis</h3>
                        <div class="loading" id="squat-loading">Loading sit-ups results...</div>
                        <div id="squat-results" style="display: none;"></div>
                    </div>
                    
                    <div id="height-leaderboard" class="leaderboard-list" style="display: none;">
                        <h3>📏 Height Measurement</h3>
                        <div class="loading" id="height-loading">Loading height results...</div>
                        <div id="height-results" style="display: none;"></div>
                    </div>
                    
                    <div id="pushup-leaderboard" class="leaderboard-list" style="display: none;">
                        <h3>💪 Pushup Counter</h3>
                        <div class="loading" id="pushup-loading">Loading pushup results...</div>
                        <div id="pushup-results" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createVerticalJumpTestPage() {
        return `
            <div class="vertical-jump-test-page">
                <div class="test-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>🦘 Vertical Jump Test</h1>
                    <p>AI-powered vertical jump height measurement</p>
                </div>
                
                <div class="test-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Record a video of yourself performing a vertical jump</li>
                        <li>Stand with your side to the camera</li>
                        <li>Perform a standing vertical jump (no running start)</li>
                        <li>Make sure your entire body is visible in the frame</li>
                        <li>Upload the video and enter your height for accurate measurement</li>
                    </ul>
                </div>
                
                <div class="video-upload-section">
                    <div class="upload-area" id="upload-area">
                        <div class="upload-icon">📹</div>
                        <h3>Upload Jump Video</h3>
                        <p>Drag and drop your video here or click to browse</p>
                        <input type="file" id="video-input" accept="video/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('video-input').click()">Choose Video</button>
                    </div>
                    
                    <div class="video-preview" id="video-preview" style="display: none;">
                        <video id="preview-video" controls style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                        <button class="btn-secondary" onclick="app.removeVideo()">Remove Video</button>
                    </div>
                </div>
                
                <div class="test-configuration">
                    <h3>Test Configuration</h3>
                    
                    <div class="form-group">
                        <label for="jumper-name">Your Name:</label>
                        <input type="text" id="jumper-name" placeholder="Enter your name" value="${this.currentUser?.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="jumper-height">Your Height (inches):</label>
                        <input type="number" id="jumper-height" placeholder="Enter your height in inches" min="48" max="96">
                    </div>
                    
                    <div class="form-group">
                        <label for="reference-point">Reference Point:</label>
                        <select id="reference-point">
                            <option value="0">Ground Reference</option>
                            <option value="1">Rim Reference</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="video-format">Video Format:</label>
                        <select id="video-format">
                            <option value="0">Vertical (Portrait)</option>
                            <option value="1">Landscape</option>
                        </select>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="process-video-btn" onclick="app.processVerticalJumpVideo()" disabled>
                        Process Video
                    </button>
                </div>
                
                <div class="results-section" id="results-section" style="display: none;">
                    <h3>Results</h3>
                    <div class="result-card">
                        <div class="result-value" id="jump-height-result">0.00 inches</div>
                        <div class="result-label">Vertical Jump Height</div>
                    </div>
                    
                    <div class="result-details" id="result-details">
                        <!-- Additional details will be populated here -->
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn-primary" onclick="app.saveVerticalJumpResult()">Save Results</button>
                        <button class="btn-secondary" onclick="app.loadPage('vertical-jump-leaderboard')">View Leaderboard</button>
                    </div>
                </div>
                
                <div class="loading-section" id="loading-section" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Processing your video... This may take a few minutes.</p>
                </div>
            </div>
        `;
    }

    createSquatTestPage() {
        return `
            <div class="squat-test-page">
                <div class="test-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>🏋️ Sit-ups Analysis Test</h1>
                    <p>AI-powered sit-ups form and technique analysis</p>
                </div>
                
                <div class="test-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Record a video of yourself performing sit-ups</li>
                        <li>Stand with your side to the camera</li>
                        <li>Perform multiple sit-ups in the video</li>
                        <li>Make sure your entire body is visible in the frame</li>
                        <li>Upload the video and select your difficulty mode</li>
                    </ul>
                </div>
                
                <div class="video-upload-section">
                    <div class="upload-area" id="squat-upload-area">
                        <div class="upload-icon">📹</div>
                        <h3>Upload Sit-ups Video</h3>
                        <p>Drag and drop your video here or click to browse</p>
                        <input type="file" id="squat-video-input" accept="video/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('squat-video-input').click()">Choose Video</button>
                    </div>
                    
                    <div class="video-preview" id="squat-video-preview" style="display: none;">
                        <video id="squat-preview-video" controls style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                        <button class="btn-secondary" onclick="app.removeSquatVideo()">Remove Video</button>
                    </div>
                </div>
                
                <div class="test-configuration">
                    <h3>Test Configuration</h3>
                    
                    <div class="form-group">
                        <label for="squat-person-name">Your Name:</label>
                        <input type="text" id="squat-person-name" placeholder="Enter your name" value="${this.currentUser?.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="squat-mode">Difficulty Mode:</label>
                        <select id="squat-mode">
                            <option value="beginner">Beginner</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="process-squat-video-btn" onclick="app.processSquatVideo()" disabled>
                        Process Video
                    </button>
                </div>
                
                <div class="results-section" id="squat-results-section" style="display: none;">
                    <h3>Results</h3>
                    <div class="result-card">
                        <div class="result-value" id="squat-count-result">0</div>
                        <div class="result-label">Total Sit-ups</div>
                    </div>
                    
                    <div class="result-details" id="squat-result-details">
                        <!-- Additional details will be populated here -->
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn-primary" onclick="app.saveSquatResult()">Save Results</button>
                        <button class="btn-secondary" onclick="app.loadPage('squat-leaderboard')">View Leaderboard</button>
                    </div>
                </div>
                
                <div class="loading-section" id="squat-loading-section" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Processing your video... This may take a few minutes.</p>
                </div>
            </div>
        `;
    }

    createHeightTestPage() {
        return `
            <div class="height-test-page">
                <div class="test-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>📏 Height Measurement Test</h1>
                    <p>AI-powered height measurement using computer vision</p>
                </div>
                
                <div class="test-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Record a video of yourself standing straight</li>
                        <li>Stand at least 3 meters away from the camera</li>
                        <li>Make sure your entire body is visible in the frame</li>
                        <li>Stand with your side to the camera for best results</li>
                        <li>Wear contrasting clothing for better detection</li>
                    </ul>
                </div>
                
                <div class="video-upload-section">
                    <div class="upload-area" id="height-upload-area">
                        <div class="upload-icon">📹</div>
                        <h3>Upload Height Video</h3>
                        <p>Drag and drop your video here or click to browse</p>
                        <input type="file" id="height-video-input" accept="video/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('height-video-input').click()">Choose Video</button>
                    </div>
                    
                    <div class="video-preview" id="height-video-preview" style="display: none;">
                        <video id="height-preview-video" controls style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                        <button class="btn-secondary" onclick="app.removeHeightVideo()">Remove Video</button>
                    </div>
                </div>
                
                <div class="test-configuration">
                    <h3>Test Configuration</h3>
                    
                    <div class="form-group">
                        <label for="height-person-name">Your Name:</label>
                        <input type="text" id="height-person-name" placeholder="Enter your name" value="${this.currentUser?.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="height-mode">Measurement Mode:</label>
                        <select id="height-mode">
                            <option value="standard">Standard</option>
                            <option value="precise">Precise</option>
                        </select>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="process-height-video-btn" onclick="app.processHeightVideo()" disabled>
                        Measure Height
                    </button>
                </div>
                
                <div class="results-section" id="height-results-section" style="display: none;">
                    <h3>Height Measurement Results</h3>
                    <div class="result-card">
                        <div class="result-value" id="height-result">0 cm</div>
                        <div class="result-label">Your Height</div>
                    </div>
                    
                    <div class="result-details" id="height-result-details">
                        <!-- Additional details will be populated here -->
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn-primary" onclick="app.saveHeightResult()">Save Results</button>
                        <button class="btn-secondary" onclick="app.loadPage('height-leaderboard')">View Leaderboard</button>
                    </div>
                </div>
                
                <div class="loading-section" id="height-loading-section" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Processing your video... This may take a few minutes.</p>
                </div>
            </div>
        `;
    }

    createPushupTestPage() {
        return `
            <div class="pushup-test-page">
                <div class="test-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>💪 Pushup Counter</h1>
                    <p>AI-powered pushup counting with form analysis</p>
                </div>
                
                <div class="test-instructions">
                    <h3>Instructions:</h3>
                    <ul>
                        <li>Record a video of yourself doing pushups</li>
                        <li>Make sure your entire body is visible in the frame</li>
                        <li>Perform pushups with proper form (full range of motion)</li>
                        <li>Keep your body straight and aligned</li>
                        <li>Go down until your chest nearly touches the ground</li>
                        <li>Push back up to the starting position</li>
                    </ul>
                </div>
                
                <div class="video-upload-section">
                    <div class="upload-area" id="pushup-upload-area">
                        <div class="upload-icon">📹</div>
                        <h3>Upload Pushup Video</h3>
                        <p>Drag and drop your video here or click to browse</p>
                        <input type="file" id="pushup-video-input" accept="video/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('pushup-video-input').click()">Choose Video</button>
                    </div>
                    
                    <div class="video-preview" id="pushup-video-preview" style="display: none;">
                        <video id="pushup-preview-video" controls style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                        <button class="btn-secondary" onclick="app.removePushupVideo()">Remove Video</button>
                    </div>
                </div>
                
                <div class="test-configuration">
                    <h3>Test Configuration</h3>
                    
                    <div class="form-group">
                        <label for="pushup-person-name">Your Name:</label>
                        <input type="text" id="pushup-person-name" placeholder="Enter your name" value="${this.currentUser?.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="pushup-mode">Detection Mode:</label>
                        <select id="pushup-mode">
                            <option value="standard">Standard</option>
                        </select>
                    </div>
                </div>
                
                <div class="test-actions">
                    <button class="btn-primary" id="pushup-process-btn" onclick="app.processPushupVideo()" disabled>
                        Process Video
                    </button>
                    <button class="btn-secondary" onclick="app.resetPushupTest()">Reset Test</button>
                </div>
                
                <div class="results-section" id="pushup-results-section" style="display: none;">
                    <h3>Pushup Analysis Results</h3>
                    
                    <div class="result-summary">
                        <div class="result-item">
                            <div class="result-value" id="pushup-counter">0</div>
                            <div class="result-label">Pushups Completed</div>
                        </div>
                    </div>
                    
                    <div class="result-details" id="pushup-result-details">
                        <!-- Additional details will be populated here -->
                    </div>
                    
                    <div class="result-actions">
                        <button class="btn-primary" onclick="app.savePushupResult()">Save Results</button>
                        <button class="btn-secondary" onclick="app.loadPage('pushup-leaderboard')">View Leaderboard</button>
                    </div>
                </div>
                
                <div class="loading-section" id="pushup-loading-section" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>Processing your video... This may take a few minutes.</p>
                </div>
            </div>
        `;
    }

    createSquatLeaderboardPage() {
        return `
            <div class="squat-leaderboard-page">
                <div class="leaderboard-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>🏋️ Sit-ups Analysis Leaderboard</h1>
                    <p>Top performers in sit-ups form and technique</p>
                </div>
                
                <div class="leaderboard-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total-squat-tests">0</div>
                        <div class="stat-label">Total Tests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-squat-accuracy">0%</div>
                        <div class="stat-label">Average Accuracy</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="total-squats-performed">0</div>
                        <div class="stat-label">Total Sit-ups</div>
                    </div>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-filters">
                        <div class="filter-group">
                            <label for="squat-mode-filter">Mode:</label>
                            <select id="squat-mode-filter" onchange="app.filterSquatLeaderboard()">
                                <option value="all">All Modes</option>
                                <option value="beginner">Beginner</option>
                                <option value="pro">Pro</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="squat-sort-by">Sort By:</label>
                            <select id="squat-sort-by" onchange="app.filterSquatLeaderboard()">
                                <option value="total_squats">Total Sit-ups</option>
                                <option value="accuracy">Accuracy</option>
                                <option value="correct_squats">Correct Sit-ups</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <button class="refresh-btn" onclick="app.refreshSquatLeaderboard()">Refresh</button>
                    </div>
                    
                    <div class="leaderboard-list" id="squat-leaderboard-list">
                        <div class="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        `;
    }

    createHeightLeaderboardPage() {
        return `
            <div class="height-leaderboard-page">
                <div class="leaderboard-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>📏 Height Measurement Leaderboard</h1>
                    <p>Tallest performers in height measurement</p>
                </div>
                
                <div class="leaderboard-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total-height-tests">0</div>
                        <div class="stat-label">Total Tests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-height-cm">0 cm</div>
                        <div class="stat-label">Average Height</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="max-height-cm">0 cm</div>
                        <div class="stat-label">Tallest</div>
                    </div>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-filters">
                        <div class="filter-group">
                            <label for="height-mode-filter">Mode:</label>
                            <select id="height-mode-filter" onchange="app.filterHeightLeaderboard()">
                                <option value="all">All Modes</option>
                                <option value="standard">Standard</option>
                                <option value="precise">Precise</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="height-sort-by">Sort By:</label>
                            <select id="height-sort-by" onchange="app.filterHeightLeaderboard()">
                                <option value="height_cm">Height (cm)</option>
                                <option value="height_ft">Height (ft)</option>
                                <option value="confidence">Confidence</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <button class="refresh-btn" onclick="app.refreshHeightLeaderboard()">Refresh</button>
                    </div>
                    
                    <div class="leaderboard-list" id="height-leaderboard-list">
                        <div class="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        `;
    }

    createPushupLeaderboardPage() {
        return `
            <div class="pushup-leaderboard-page">
                <div class="leaderboard-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>💪 Pushup Counter Leaderboard</h1>
                    <p>Top performers in pushup endurance</p>
                </div>
                
                <div class="leaderboard-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total-pushup-tests">0</div>
                        <div class="stat-label">Total Tests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-pushups">0</div>
                        <div class="stat-label">Average Pushups</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="max-pushups">0</div>
                        <div class="stat-label">Most Pushups</div>
                    </div>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-filters">
                        <div class="filter-group">
                            <label for="pushup-mode-filter">Mode:</label>
                            <select id="pushup-mode-filter" onchange="app.filterPushupLeaderboard()">
                                <option value="all">All Modes</option>
                                <option value="standard">Standard</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="pushup-sort-by">Sort By:</label>
                            <select id="pushup-sort-by" onchange="app.filterPushupLeaderboard()">
                                <option value="counter">Pushups Count</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <button class="refresh-btn" onclick="app.refreshPushupLeaderboard()">Refresh</button>
                    </div>
                    
                    <div class="leaderboard-list" id="pushup-leaderboard-list">
                        <div class="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        `;
    }

    navigateToPage(pageName) {
        this.loadPage(pageName);
    }

    updateNavigationState(pageName) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }










    // Height Test Functionality
    saveHeightMeasurement() {
        const heightInput = document.getElementById('height-input');
        const height = parseInt(heightInput.value);
        
        if (!height || height < 100 || height > 250) {
            alert('Please enter a valid height between 100-250 cm');
            return;
        }
        
        // Calculate height category and score
        const category = this.getHeightCategory(height);
        const score = this.calculateHeightScore(height);
        
        // Store result
        this.currentTestResult = {
            type: 'height',
            height: height,
            category: category,
            score: score,
            timestamp: new Date().toISOString()
        };
        
        // Update display
        document.getElementById('height-display').textContent = `${height} cm`;
        document.getElementById('height-category').textContent = category;
        
        // Save to leaderboard
        this.saveTestResult();
        
        alert(`Height measurement saved! Score: ${score}`);
    }

    getHeightCategory(height) {
        if (height < 150) return 'Below Average';
        if (height < 160) return 'Average';
        if (height < 175) return 'Good';
        if (height < 185) return 'Very Good';
        return 'Excellent';
    }

    calculateHeightScore(height) {
        // Simple scoring based on height ranges
        if (height < 150) return Math.floor(height * 0.5);
        if (height < 160) return Math.floor(height * 0.7);
        if (height < 175) return Math.floor(height * 0.9);
        if (height < 185) return Math.floor(height * 1.0);
        return Math.floor(height * 1.1);
    }

    // Leaderboard Functionality
    getLeaderboard() {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
            
        const height = results
            .filter(r => r.type === 'height')
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
            
        const overall = results
            .reduce((acc, result) => {
                const existing = acc.find(r => r.userId === result.userId);
                if (existing) {
                    existing.totalScore += result.score;
                    existing.testsCompleted++;
                } else {
                    acc.push({
                        userId: result.userId || 'Anonymous',
                        totalScore: result.score,
                        testsCompleted: 1
                    });
                }
                return acc;
            }, [])
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);
            
        return { height, overall };
    }

    renderLeaderboardList(items) {
        if (items.length === 0) {
            return '<p>No results yet. Be the first to take a test!</p>';
        }
        
        return items.map((item, index) => `
            <div class="leaderboard-item">
                <div class="rank">#${index + 1}</div>
                <div class="user-info">
                    <div class="name">${item.userId || 'Anonymous'}</div>
                    <div class="details">${this.getLeaderboardDetails(item)}</div>
                </div>
                <div class="score">${item.score || item.totalScore}</div>
            </div>
        `).join('');
    }

    getLeaderboardDetails(item) {
        if (item.type === 'height') {
            return `${item.height} cm • ${item.category}`;
        } else {
            return `${item.testsCompleted} tests completed`;
        }
    }

    showLeaderboardTab(tab) {
        // Hide all tabs
        document.querySelectorAll('.leaderboard-list').forEach(list => {
            list.style.display = 'none';
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tab}-leaderboard`).style.display = 'block';
        event.target.classList.add('active');
        
        // Load data for the selected tab
        this.loadLeaderboardData(tab);
    }
    
    async loadLeaderboardData(tab) {
        switch(tab) {
            case 'overall':
                await this.loadOverallLeaderboard();
                break;
            case 'vertical-jump':
                await this.loadVerticalJumpLeaderboardData();
                break;
            case 'sit-ups':
                await this.loadSquatLeaderboardData();
                break;
            case 'height':
                await this.loadHeightLeaderboardData();
                break;
            case 'pushup':
                await this.loadPushupLeaderboardData();
                break;
        }
    }
    
    async loadOverallLeaderboard() {
        const loading = document.getElementById('overall-loading');
        const results = document.getElementById('overall-results');
        
        try {
            // Fetch data from all backends
            const [vjData, squatData, heightData, pushupData] = await Promise.all([
                fetch('http://localhost:5001/api/vertical-jump-leaderboard').then(r => r.json()).catch(() => ({data: []})),
                fetch('http://localhost:5002/api/squat-leaderboard').then(r => r.json()).catch(() => ({data: []})),
                fetch('http://localhost:5003/api/height-leaderboard').then(r => r.json()).catch(() => ({data: []})),
                fetch('http://localhost:5004/api/pushup-leaderboard').then(r => r.json()).catch(() => ({data: []}))
            ]);
            
            console.log('Fetched data:', { vjData, squatData, heightData, pushupData });
            
            // Combine all results
            const allResults = [];
            
            // Add vertical jump results
            if (vjData.data) {
                vjData.data.forEach(item => {
                    allResults.push({
                        user_name: item.jumper_name || item.user_name,
                        test_type: 'Vertical Jump',
                        score: item.height || item.jump_height_cm || 0,
                        details: `${item.height || item.jump_height_cm || 0} cm`,
                        timestamp: item.timestamp
                    });
                });
            }
            
            // Add sit-ups results
            if (squatData.data) {
                squatData.data.forEach(item => {
                    allResults.push({
                        user_name: item.user_name,
                        test_type: 'Sit-ups',
                        score: item.total_squats || 0,
                        details: `${item.correct_squats || 0}/${item.total_squats || 0} correct`,
                        timestamp: item.timestamp
                    });
                });
            }
            
            // Add height results
            if (heightData.data) {
                heightData.data.forEach(item => {
                    allResults.push({
                        user_name: item.user_name,
                        test_type: 'Height',
                        score: item.height_cm || 0,
                        details: `${item.height_cm || 0} cm`,
                        timestamp: item.timestamp
                    });
                });
            }
            
            // Add pushup results
            if (pushupData.data) {
                pushupData.data.forEach(item => {
                    allResults.push({
                        user_name: item.user_name,
                        test_type: 'Pushups',
                        score: item.counter || 0,
                        details: `${item.counter || 0} pushups`,
                        timestamp: item.timestamp
                    });
                });
            }
            
            // Group by user and calculate overall score
            const userScores = {};
            allResults.forEach(result => {
                if (!userScores[result.user_name]) {
                    userScores[result.user_name] = {
                        user_name: result.user_name,
                        total_score: 0,
                        tests_completed: 0,
                        test_details: []
                    };
                }
                userScores[result.user_name].total_score += result.score;
                userScores[result.user_name].tests_completed++;
                userScores[result.user_name].test_details.push(result);
            });
            
            // Convert to array and sort by total score
            const overallResults = Object.values(userScores)
                .sort((a, b) => b.total_score - a.total_score)
                .slice(0, 20);
            
            console.log('Overall results:', overallResults);
            
            loading.style.display = 'none';
            results.style.display = 'block';
            
            if (overallResults.length === 0) {
                results.innerHTML = '<p>No results yet. Be the first to take a test!</p>';
            } else {
                results.innerHTML = overallResults.map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <div class="name">${item.user_name}</div>
                            <div class="details">${item.tests_completed} tests • Total Score: ${item.total_score.toFixed(1)}</div>
                        </div>
                        <div class="score">${item.total_score.toFixed(1)}</div>
                    </div>
                `).join('');
            }
            
        } catch (error) {
            console.error('Error loading overall leaderboard:', error);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.innerHTML = '<p>Error loading overall results. Please try again.</p>';
        }
    }
    
    async loadVerticalJumpLeaderboardData() {
        const loading = document.getElementById('vj-loading');
        const results = document.getElementById('vj-results');
        
        try {
            const response = await fetch('http://localhost:5001/api/vertical-jump-leaderboard');
            const data = await response.json();
            
            loading.style.display = 'none';
            results.style.display = 'block';
            
            if (data.data && data.data.length > 0) {
                results.innerHTML = data.data.slice(0, 10).map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <div class="name">${item.jumper_name || item.user_name}</div>
                            <div class="details">${item.height || item.jump_height_cm || 0} cm • ${item.mode || 'standard'}</div>
                        </div>
                        <div class="score">${item.height || item.jump_height_cm || 0} cm</div>
                    </div>
                `).join('');
            } else {
                results.innerHTML = '<p>No vertical jump results yet.</p>';
            }
        } catch (error) {
            console.error('Error loading vertical jump leaderboard:', error);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.innerHTML = '<p>Error loading vertical jump results.</p>';
        }
    }
    
    async loadSquatLeaderboardData() {
        const loading = document.getElementById('squat-loading');
        const results = document.getElementById('squat-results');
        
        try {
            const response = await fetch('http://localhost:5002/api/squat-leaderboard');
            const data = await response.json();
            
            loading.style.display = 'none';
            results.style.display = 'block';
            
            if (data.data && data.data.length > 0) {
                results.innerHTML = data.data.slice(0, 10).map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <div class="name">${item.user_name}</div>
                            <div class="details">${item.correct_squats || 0}/${item.total_squats || 0} correct • ${item.accuracy_percentage || 0}%</div>
                        </div>
                        <div class="score">${item.total_squats || 0}</div>
                    </div>
                `).join('');
            } else {
                results.innerHTML = '<p>No sit-ups results yet.</p>';
            }
        } catch (error) {
            console.error('Error loading sit-ups leaderboard:', error);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.innerHTML = '<p>Error loading sit-ups results.</p>';
        }
    }
    
    async loadHeightLeaderboardData() {
        const loading = document.getElementById('height-loading');
        const results = document.getElementById('height-results');
        
        try {
            const response = await fetch('http://localhost:5003/api/height-leaderboard');
            const data = await response.json();
            
            loading.style.display = 'none';
            results.style.display = 'block';
            
            if (data.data && data.data.length > 0) {
                results.innerHTML = data.data.slice(0, 10).map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <div class="name">${item.user_name}</div>
                            <div class="details">${item.height_cm || 0} cm • ${item.confidence || 0}% confidence</div>
                        </div>
                        <div class="score">${item.height_cm || 0} cm</div>
                    </div>
                `).join('');
            } else {
                results.innerHTML = '<p>No height results yet.</p>';
            }
        } catch (error) {
            console.error('Error loading height leaderboard:', error);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.innerHTML = '<p>Error loading height results.</p>';
        }
    }
    
    async loadPushupLeaderboardData() {
        const loading = document.getElementById('pushup-loading');
        const results = document.getElementById('pushup-results');
        
        try {
            const response = await fetch('http://localhost:5004/api/pushup-leaderboard');
            const data = await response.json();
            
            loading.style.display = 'none';
            results.style.display = 'block';
            
            if (data.data && data.data.length > 0) {
                results.innerHTML = data.data.slice(0, 10).map((item, index) => `
                    <div class="leaderboard-item">
                        <div class="rank">#${index + 1}</div>
                        <div class="user-info">
                            <div class="name">${item.user_name}</div>
                            <div class="details">${item.counter || 0} pushups • ${item.position || 'Unknown'}</div>
                        </div>
                        <div class="score">${item.counter || 0}</div>
                    </div>
                `).join('');
            } else {
                results.innerHTML = '<p>No pushup results yet.</p>';
            }
        } catch (error) {
            console.error('Error loading pushup leaderboard:', error);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.innerHTML = '<p>Error loading pushup results.</p>';
        }
    }

    saveTestResult() {
        if (!this.currentTestResult) return;
        
        // Add user info
        this.currentTestResult.userId = this.currentUser?.name || 'Anonymous';
        this.currentTestResult.userEmail = this.currentUser?.email || 'anonymous@example.com';
        
        // Get existing results
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        results.push(this.currentTestResult);
        
        // Save back to localStorage
        localStorage.setItem('testResults', JSON.stringify(results));
        
        // Update user's test count
        if (this.currentUser) {
            this.currentUser.profile.testsCompleted = (this.currentUser.profile.testsCompleted || 0) + 1;
            this.currentUser.profile.totalScore = (this.currentUser.profile.totalScore || 0) + this.currentTestResult.score;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
        }
        
        alert('Test result saved successfully!');
        this.currentTestResult = null;
    }

    // Vertical Jump Test Functionality
    setupVerticalJumpEventListeners() {
        // Video input change event
        document.addEventListener('change', (e) => {
            if (e.target.id === 'video-input') {
                this.handleVideoUpload(e.target.files[0]);
            }
        });

        // Drag and drop functionality
        document.addEventListener('dragover', (e) => {
            if (e.target.id === 'upload-area') {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.id === 'upload-area') {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.id === 'upload-area') {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleVideoUpload(files[0]);
                }
            }
        });
    }

    setupSquatEventListeners() {
        // Squat video input change event
        document.addEventListener('change', (e) => {
            if (e.target.id === 'squat-video-input') {
                this.handleSquatVideoUpload(e.target.files[0]);
            }
        });

        // Drag and drop functionality for squat
        document.addEventListener('dragover', (e) => {
            if (e.target.id === 'squat-upload-area') {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.id === 'squat-upload-area') {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.id === 'squat-upload-area') {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleSquatVideoUpload(files[0]);
                }
            }
        });
    }

    setupHeightEventListeners() {
        // Height video input change event
        document.addEventListener('change', (e) => {
            if (e.target.id === 'height-video-input') {
                this.handleHeightVideoUpload(e.target.files[0]);
            }
        });

        // Drag and drop functionality for height
        document.addEventListener('dragover', (e) => {
            if (e.target.id === 'height-upload-area') {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.id === 'height-upload-area') {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.id === 'height-upload-area') {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleHeightVideoUpload(files[0]);
                }
            }
        });
    }

    setupPushupEventListeners() {
        // Pushup video input change event
        document.addEventListener('change', (e) => {
            if (e.target.id === 'pushup-video-input') {
                this.handlePushupVideoUpload(e.target.files[0]);
            }
        });

        // Drag and drop functionality for pushup
        document.addEventListener('dragover', (e) => {
            if (e.target.id === 'pushup-upload-area') {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.id === 'pushup-upload-area') {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.id === 'pushup-upload-area') {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handlePushupVideoUpload(files[0]);
                }
            }
        });
    }

    handleVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        this.selectedVideo = file;
        
        // Show video preview
        const videoPreview = document.getElementById('video-preview');
        const uploadArea = document.getElementById('upload-area');
        const previewVideo = document.getElementById('preview-video');
        const processBtn = document.getElementById('process-video-btn');

        if (videoPreview && uploadArea && previewVideo && processBtn) {
            uploadArea.style.display = 'none';
            videoPreview.style.display = 'block';
            
            const videoURL = URL.createObjectURL(file);
            previewVideo.src = videoURL;
            
            processBtn.disabled = false;
        }
    }

    removeVideo() {
        this.selectedVideo = null;
        
        const videoPreview = document.getElementById('video-preview');
        const uploadArea = document.getElementById('upload-area');
        const processBtn = document.getElementById('process-video-btn');

        if (videoPreview && uploadArea && processBtn) {
            videoPreview.style.display = 'none';
            uploadArea.style.display = 'block';
            processBtn.disabled = true;
        }
    }

    handleSquatVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        this.selectedSquatVideo = file;
        
        // Show video preview
        const videoPreview = document.getElementById('squat-video-preview');
        const uploadArea = document.getElementById('squat-upload-area');
        const previewVideo = document.getElementById('squat-preview-video');
        const processBtn = document.getElementById('process-squat-video-btn');

        if (videoPreview && uploadArea && previewVideo && processBtn) {
            uploadArea.style.display = 'none';
            videoPreview.style.display = 'block';
            previewVideo.src = URL.createObjectURL(file);
            processBtn.disabled = false;
        }
    }

    removeSquatVideo() {
        this.selectedSquatVideo = null;
        
        const videoPreview = document.getElementById('squat-video-preview');
        const uploadArea = document.getElementById('squat-upload-area');
        const processBtn = document.getElementById('process-squat-video-btn');

        if (videoPreview && uploadArea && processBtn) {
            videoPreview.style.display = 'none';
            uploadArea.style.display = 'block';
            processBtn.disabled = true;
        }
    }

    async processSquatVideo() {
        if (!this.selectedSquatVideo) {
            alert('Please select a video first.');
            return;
        }

        const personName = document.getElementById('squat-person-name').value;
        const mode = document.getElementById('squat-mode').value;

        if (!personName.trim()) {
            alert('Please enter your name.');
            return;
        }

        // Show loading
        const loadingSection = document.getElementById('squat-loading-section');
        const resultsSection = document.getElementById('squat-results-section');
        
        if (loadingSection) loadingSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('video', this.selectedSquatVideo);
            formData.append('user_name', personName);
            formData.append('mode', mode);

            const response = await fetch('http://localhost:5002/api/upload-squat-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            
            if (responseData.success) {
                const result = responseData.results;
                
                // Store result for saving
                this.currentSquatResult = result;
                
                // Display results
                this.displaySquatResults(result);
            } else {
                throw new Error(responseData.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error processing squat video:', error);
            alert('Error processing video. Please try again.');
        } finally {
            if (loadingSection) loadingSection.style.display = 'none';
        }
    }

    displaySquatResults(result) {
        const resultsSection = document.getElementById('squat-results-section');
        const countResult = document.getElementById('squat-count-result');
        const detailsDiv = document.getElementById('squat-result-details');

        if (resultsSection) resultsSection.style.display = 'block';
        
        if (countResult) {
            countResult.textContent = result.total_squats || 0;
        }

        if (detailsDiv) {
            detailsDiv.innerHTML = `
                <div class="result-detail">
                    <span class="detail-label">Correct Sit-ups:</span>
                    <span class="detail-value">${result.correct_squats || 0}</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Incorrect Sit-ups:</span>
                    <span class="detail-value">${result.incorrect_squats || 0}</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Accuracy:</span>
                    <span class="detail-value">${result.accuracy_percentage || 0}%</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Mode:</span>
                    <span class="detail-value">${result.mode || 'Unknown'}</span>
                </div>
            `;
        }
    }

    async saveSquatResult() {
        if (!this.currentSquatResult) {
            alert('No results to save.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5002/api/save-squat-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentSquatResult)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert('Results saved successfully!');
            
        } catch (error) {
            console.error('Error saving squat result:', error);
            alert('Error saving results. Please try again.');
        }
    }

    resetSquatTest() {
        this.selectedSquatVideo = null;
        this.currentSquatResult = null;
        
        const videoPreview = document.getElementById('squat-video-preview');
        const uploadArea = document.getElementById('squat-upload-area');
        const processBtn = document.getElementById('process-squat-video-btn');
        const resultsSection = document.getElementById('squat-results-section');
        const loadingSection = document.getElementById('squat-loading-section');

        if (videoPreview) videoPreview.style.display = 'none';
        if (uploadArea) uploadArea.style.display = 'block';
        if (processBtn) processBtn.disabled = true;
        if (resultsSection) resultsSection.style.display = 'none';
        if (loadingSection) loadingSection.style.display = 'none';
    }

    async loadSquatLeaderboard() {
        try {
            const response = await fetch('http://localhost:5002/api/squat-leaderboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displaySquatLeaderboard(data);
        } catch (error) {
            console.error('Error loading squat leaderboard:', error);
            this.displaySquatLeaderboardError();
        }
    }

    displaySquatLeaderboard(data) {
        const leaderboardList = document.getElementById('squat-leaderboard-list');
        const totalTests = document.getElementById('total-squat-tests');
        const avgAccuracy = document.getElementById('avg-squat-accuracy');
        const totalSquats = document.getElementById('total-squats-performed');

        if (!leaderboardList) return;

        // Update stats
        if (totalTests) totalTests.textContent = data.stats?.total_tests || 0;
        if (avgAccuracy) avgAccuracy.textContent = `${Math.round(data.stats?.average_accuracy || 0)}%`;
        if (totalSquats) totalSquats.textContent = data.stats?.max_squats || 0;

        // Display leaderboard
        if (data.data && data.data.length > 0) {
            leaderboardList.innerHTML = data.data.map((entry, index) => `
                <div class="leaderboard-item">
                    <div class="rank ${index < 3 ? `rank-${index + 1}` : 'rank-other'}">
                        ${index + 1}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${entry.user_name || 'Anonymous'}</div>
                        <div class="user-details">
                            ${entry.mode || 'Unknown'} Mode • ${new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="performance-metrics">
                        <div class="metric">
                            <div class="metric-value">${entry.total_squats || 0}</div>
                            <div class="metric-label">Total</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${entry.correct_squats || 0}</div>
                            <div class="metric-label">Correct</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${Math.round(entry.accuracy_percentage || 0)}%</div>
                            <div class="metric-label">Accuracy</div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            leaderboardList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🏋️</div>
                    <h3>No Results Yet</h3>
                    <p>Be the first to complete a sit-ups analysis test!</p>
                </div>
            `;
        }
    }

    displaySquatLeaderboardError() {
        const leaderboardList = document.getElementById('squat-leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <h3>Error Loading Leaderboard</h3>
                    <p>Please check your connection and try again.</p>
                </div>
            `;
        }
    }

    async refreshSquatLeaderboard() {
        await this.loadSquatLeaderboard();
    }

    filterSquatLeaderboard() {
        // This would implement filtering logic
        // For now, just refresh the leaderboard
        this.refreshSquatLeaderboard();
    }

    // Height Detection Functions
    handleHeightVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        this.selectedHeightVideo = file;
        
        // Show video preview
        const videoPreview = document.getElementById('height-video-preview');
        const uploadArea = document.getElementById('height-upload-area');
        const previewVideo = document.getElementById('height-preview-video');
        const processBtn = document.getElementById('process-height-video-btn');

        if (videoPreview && uploadArea && previewVideo && processBtn) {
            uploadArea.style.display = 'none';
            videoPreview.style.display = 'block';
            previewVideo.src = URL.createObjectURL(file);
            processBtn.disabled = false;
        }
    }

    removeHeightVideo() {
        this.selectedHeightVideo = null;
        
        const videoPreview = document.getElementById('height-video-preview');
        const uploadArea = document.getElementById('height-upload-area');
        const processBtn = document.getElementById('process-height-video-btn');

        if (videoPreview && uploadArea && processBtn) {
            videoPreview.style.display = 'none';
            uploadArea.style.display = 'block';
            processBtn.disabled = true;
        }
    }

    async processHeightVideo() {
        if (!this.selectedHeightVideo) {
            alert('Please select a video first.');
            return;
        }

        const personName = document.getElementById('height-person-name').value;
        const mode = document.getElementById('height-mode').value;

        if (!personName.trim()) {
            alert('Please enter your name.');
            return;
        }

        // Show loading
        const loadingSection = document.getElementById('height-loading-section');
        const resultsSection = document.getElementById('height-results-section');
        if (loadingSection) loadingSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('video', this.selectedHeightVideo);
            formData.append('user_name', personName);
            formData.append('mode', mode);

            const response = await fetch('http://localhost:5003/api/upload-height-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            
            if (responseData.success) {
                const result = responseData.results;
                this.currentHeightResult = result;
                this.displayHeightResults(result);
            } else {
                throw new Error(responseData.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('Error processing height video:', error);
            alert('Error processing height video: ' + error.message);
        } finally {
            if (loadingSection) loadingSection.style.display = 'none';
        }
    }

    displayHeightResults(result) {
        const resultsSection = document.getElementById('height-results-section');
        const heightResult = document.getElementById('height-result');
        const resultDetails = document.getElementById('height-result-details');

        if (resultsSection) resultsSection.style.display = 'block';
        if (heightResult) heightResult.textContent = `${result.height_cm} cm (${result.height_ft} ft)`;
        
        if (resultDetails) {
            resultDetails.innerHTML = `
                <div class="result-detail">
                    <strong>Height:</strong> ${result.height_cm} cm (${result.height_ft} ft)
                </div>
                <div class="result-detail">
                    <strong>Distance:</strong> ${result.distance_cm || 'N/A'} cm
                </div>
                <div class="result-detail">
                    <strong>Confidence:</strong> ${result.confidence || 0}%
                </div>
                <div class="result-detail">
                    <strong>Measurements:</strong> ${result.measurements_count || 1} frames analyzed
                </div>
                ${result.average_height_cm ? `
                <div class="result-detail">
                    <strong>Average Height:</strong> ${result.average_height_cm} cm
                </div>
                ` : ''}
                ${result.median_height_cm ? `
                <div class="result-detail">
                    <strong>Median Height:</strong> ${result.median_height_cm} cm
                </div>
                ` : ''}
                ${result.all_measurements && result.all_measurements.length > 1 ? `
                <div class="result-detail">
                    <strong>All Measurements:</strong> ${result.all_measurements.join(', ')} cm
                </div>
                ` : ''}
            `;
        }
    }

    async saveHeightResult() {
        if (!this.currentHeightResult) {
            alert('No height result to save.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5003/api/save-height-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentHeightResult)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                alert('Height result saved successfully!');
            } else {
                throw new Error(result.error || 'Failed to save result');
            }

        } catch (error) {
            console.error('Error saving height result:', error);
            alert('Error saving height result: ' + error.message);
        }
    }

    resetHeightTest() {
        this.selectedHeightVideo = null;
        this.currentHeightResult = null;
        
        const videoPreview = document.getElementById('height-video-preview');
        const uploadArea = document.getElementById('height-upload-area');
        const processBtn = document.getElementById('process-height-video-btn');
        const resultsSection = document.getElementById('height-results-section');
        const loadingSection = document.getElementById('height-loading-section');

        if (videoPreview) videoPreview.style.display = 'none';
        if (uploadArea) uploadArea.style.display = 'block';
        if (processBtn) processBtn.disabled = true;
        if (resultsSection) resultsSection.style.display = 'none';
        if (loadingSection) loadingSection.style.display = 'none';
    }

    // Pushup Video Handling Functions
    handlePushupVideoUpload(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        this.selectedPushupVideo = file;
        
        // Show video preview
        const videoPreview = document.getElementById('pushup-video-preview');
        const uploadArea = document.getElementById('pushup-upload-area');
        const previewVideo = document.getElementById('pushup-preview-video');
        const processBtn = document.getElementById('pushup-process-btn');

        if (videoPreview && uploadArea && previewVideo && processBtn) {
            uploadArea.style.display = 'none';
            videoPreview.style.display = 'block';
            previewVideo.src = URL.createObjectURL(file);
            processBtn.disabled = false;
        }
    }

    removePushupVideo() {
        this.selectedPushupVideo = null;
        
        const videoPreview = document.getElementById('pushup-video-preview');
        const uploadArea = document.getElementById('pushup-upload-area');
        const processBtn = document.getElementById('pushup-process-btn');

        if (videoPreview && uploadArea && processBtn) {
            videoPreview.style.display = 'none';
            uploadArea.style.display = 'block';
            processBtn.disabled = true;
        }
    }

    async processPushupVideo() {
        if (!this.selectedPushupVideo) {
            alert('Please select a video first.');
            return;
        }

        const personName = document.getElementById('pushup-person-name')?.value || 'Anonymous';
        const mode = document.getElementById('pushup-mode')?.value || 'standard';

        // Show loading
        const loadingSection = document.getElementById('pushup-loading-section');
        const resultsSection = document.getElementById('pushup-results-section');
        
        if (loadingSection) loadingSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('video', this.selectedPushupVideo);
            formData.append('user_name', personName);
            formData.append('mode', mode);

            const response = await fetch('http://localhost:5004/api/upload-pushup-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            
            if (loadingSection) loadingSection.style.display = 'none';
            
            if (responseData.success) {
                this.currentPushupResult = responseData.results;
                this.displayPushupResults(responseData.results);
            } else {
                alert(`Error: ${responseData.error}`);
            }

        } catch (error) {
            console.error('Error processing pushup video:', error);
            alert('Error processing pushup video: ' + error.message);
            
            if (loadingSection) loadingSection.style.display = 'none';
        }
    }

    displayPushupResults(result) {
        const resultsSection = document.getElementById('pushup-results-section');
        const counterElement = document.getElementById('pushup-counter');
        const detailsDiv = document.getElementById('pushup-result-details');

        if (resultsSection) resultsSection.style.display = 'block';

        if (counterElement) {
            counterElement.textContent = result.counter || 0;
        }

        if (detailsDiv) {
            detailsDiv.innerHTML = `
                <div class="result-detail">
                    <span class="detail-label">Pushups Completed:</span>
                    <span class="detail-value">${result.counter || 0}</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Final Position:</span>
                    <span class="detail-value">${result.position || 'Unknown'}</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Total Frames:</span>
                    <span class="detail-value">${result.total_frames || 0}</span>
                </div>
                <div class="result-detail">
                    <span class="detail-label">Mode:</span>
                    <span class="detail-value">${result.mode || 'Standard'}</span>
                </div>
            `;
        }
    }

    async savePushupResult() {
        if (!this.currentPushupResult) {
            alert('No results to save.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5004/api/save-pushup-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentPushupResult)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            alert('Results saved successfully!');
            
        } catch (error) {
            console.error('Error saving pushup result:', error);
            alert('Error saving results: ' + error.message);
        }
    }

    resetPushupTest() {
        this.selectedPushupVideo = null;
        this.currentPushupResult = null;
        
        const videoPreview = document.getElementById('pushup-video-preview');
        const uploadArea = document.getElementById('pushup-upload-area');
        const processBtn = document.getElementById('pushup-process-btn');
        const resultsSection = document.getElementById('pushup-results-section');
        const loadingSection = document.getElementById('pushup-loading-section');

        if (videoPreview) videoPreview.style.display = 'none';
        if (uploadArea) uploadArea.style.display = 'block';
        if (processBtn) processBtn.disabled = true;
        if (resultsSection) resultsSection.style.display = 'none';
        if (loadingSection) loadingSection.style.display = 'none';
    }

    // Height Leaderboard Functions
    async loadHeightLeaderboard() {
        try {
            const response = await fetch('http://localhost:5003/api/height-leaderboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.displayHeightLeaderboard(data);
        } catch (error) {
            console.error('Error loading height leaderboard:', error);
            this.displayHeightLeaderboardError();
        }
    }

    displayHeightLeaderboard(data) {
        const leaderboardList = document.getElementById('height-leaderboard-list');
        const totalTests = document.getElementById('total-height-tests');
        const avgHeight = document.getElementById('avg-height-cm');
        const maxHeight = document.getElementById('max-height-cm');

        if (!leaderboardList) return;

        // Update stats
        if (totalTests) totalTests.textContent = data.stats?.total_tests || 0;
        if (avgHeight) avgHeight.textContent = `${data.stats?.average_height_cm || 0} cm`;
        if (maxHeight) maxHeight.textContent = `${data.stats?.max_height_cm || 0} cm`;

        // Display leaderboard
        if (data.data && data.data.length > 0) {
            leaderboardList.innerHTML = data.data.map((entry, index) => `
                <div class="leaderboard-item">
                    <div class="rank ${index < 3 ? `rank-${index + 1}` : 'rank-other'}">
                        ${index + 1}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${entry.user_name || 'Anonymous'}</div>
                        <div class="user-details">
                            ${entry.mode || 'Standard'} Mode • ${new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="performance-metrics">
                        <div class="metric">
                            <div class="metric-value">${entry.height_cm || 0} cm</div>
                            <div class="metric-label">Height</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${entry.height_ft || 0} ft</div>
                            <div class="metric-label">Height (ft)</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${entry.confidence || 0}%</div>
                            <div class="metric-label">Confidence</div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            leaderboardList.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">📏</div>
                    <h3>No Height Measurements Yet</h3>
                    <p>Be the first to measure your height!</p>
                </div>
            `;
        }
    }

    displayHeightLeaderboardError() {
        const leaderboardList = document.getElementById('height-leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>Error Loading Leaderboard</h3>
                    <p>Please try again later.</p>
                    <button class="btn-primary" onclick="app.refreshHeightLeaderboard()">Retry</button>
                </div>
            `;
        }
    }

    async refreshHeightLeaderboard() {
        await this.loadHeightLeaderboard();
    }

    filterHeightLeaderboard() {
        // This would implement filtering logic
        // For now, just refresh the leaderboard
        this.refreshHeightLeaderboard();
    }

    // Pushup Leaderboard Functions
    async loadPushupLeaderboard() {
        try {
            const response = await fetch('http://localhost:5004/api/pushup-leaderboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success) {
                this.displayPushupLeaderboard(data);
            } else {
                this.displayPushupLeaderboardError(data.error);
            }
        } catch (error) {
            console.error('Error loading pushup leaderboard:', error);
            this.displayPushupLeaderboardError(error.message);
        }
    }

    displayPushupLeaderboard(data) {
        const leaderboardList = document.getElementById('pushup-leaderboard-list');
        const totalTests = document.getElementById('total-pushup-tests');
        const avgPushups = document.getElementById('avg-pushups');
        const maxPushups = document.getElementById('max-pushups');

        if (!leaderboardList) return;

        // Update stats
        if (totalTests && data.stats) {
            totalTests.textContent = data.stats.total_tests || 0;
        }
        if (avgPushups && data.stats) {
            avgPushups.textContent = Math.round(data.stats.average_pushups || 0);
        }
        if (maxPushups && data.stats) {
            maxPushups.textContent = data.stats.max_pushups || 0;
        }

        // Display leaderboard entries
        if (data.data && data.data.length > 0) {
            leaderboardList.innerHTML = data.data.map((entry, index) => `
                <div class="leaderboard-entry">
                    <div class="rank">#${index + 1}</div>
                    <div class="user-info">
                        <div class="user-name">${entry.user_name || 'Anonymous'}</div>
                        <div class="test-date">${new Date(entry.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div class="score">
                        <div class="score-value">${entry.counter || 0}</div>
                        <div class="score-label">pushups</div>
                    </div>
                    <div class="additional-info">
                        <div class="mode">${entry.mode || 'Standard'}</div>
                        <div class="position">${entry.position || 'Unknown'}</div>
                    </div>
                </div>
            `).join('');
        } else {
            leaderboardList.innerHTML = `
                <div class="no-data">
                    <p>No pushup results found. Be the first to complete a pushup test!</p>
                </div>
            `;
        }
    }

    displayPushupLeaderboardError(error) {
        const leaderboardList = document.getElementById('pushup-leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = `
                <div class="error-message">
                    <p>Error loading leaderboard: ${error}</p>
                    <button onclick="app.loadPushupLeaderboard()">Retry</button>
                </div>
            `;
        }
    }

    refreshPushupLeaderboard() {
        this.loadPushupLeaderboard();
    }

    filterPushupLeaderboard() {
        // This would implement filtering logic
        // For now, just refresh the leaderboard
        this.refreshPushupLeaderboard();
    }

    async processVerticalJumpVideo() {
        if (!this.selectedVideo) {
            alert('Please select a video first.');
            return;
        }

        const jumperName = document.getElementById('jumper-name').value;
        const jumperHeight = document.getElementById('jumper-height').value;
        const referencePoint = document.getElementById('reference-point').value;
        const videoFormat = document.getElementById('video-format').value;

        if (!jumperName || !jumperHeight) {
            alert('Please enter your name and height.');
            return;
        }

        // Show loading
        const loadingSection = document.getElementById('loading-section');
        const resultsSection = document.getElementById('results-section');
        
        if (loadingSection) loadingSection.style.display = 'block';
        if (resultsSection) resultsSection.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('video', this.selectedVideo);
            formData.append('jumper_name', jumperName);
            formData.append('jumper_height', jumperHeight);
            formData.append('jump_style', referencePoint);
            formData.append('vid_format', videoFormat);

            const response = await fetch('http://localhost:5001/api/upload-video', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayVerticalJumpResults(result);
            } else {
                alert('Error processing video: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing video. Please make sure the backend server is running.');
        } finally {
            if (loadingSection) loadingSection.style.display = 'none';
        }
    }

    displayVerticalJumpResults(result) {
        const resultsSection = document.getElementById('results-section');
        const jumpHeightResult = document.getElementById('jump-height-result');
        const resultDetails = document.getElementById('result-details');

        if (resultsSection) resultsSection.style.display = 'block';
        
        if (jumpHeightResult) {
            jumpHeightResult.textContent = `${result.results.vertical_jump_inches.toFixed(2)} inches`;
        }

        // Display full results from the backend response
        if (resultDetails) {
            resultDetails.innerHTML = `
                <div class="detail-item">
                    <span class="label">Jumper:</span>
                    <span class="value">${result.results.jumper_name}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Maximum Vertical Jump:</span>
                    <span class="value">${result.results.vertical_jump_inches} inches</span>
                </div>
                <div class="detail-item">
                    <span class="label">Descent Speed:</span>
                    <span class="value">${result.results.descent_speed_ips} inches/s</span>
                </div>
                <div class="detail-item">
                    <span class="label">Descent Level:</span>
                    <span class="value">${result.results.descent_level_inches} inches</span>
                </div>
                <div class="detail-item">
                    <span class="label">Ground Time:</span>
                    <span class="value">${result.results.ground_time_s} seconds</span>
                </div>
                <div class="detail-item">
                    <span class="label">Test Date:</span>
                    <span class="value">${new Date().toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Test Time:</span>
                    <span class="value">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
        }

        // Store the result for saving
        this.currentVerticalJumpResult = {
            type: 'vertical_jump',
            height: parseFloat(result.results.vertical_jump_inches),
            jumper_name: result.results.jumper_name,
            jumper_height: document.getElementById('jumper-height').value,
            descent_speed: parseFloat(result.results.descent_speed_ips),
            descent_level: parseFloat(result.results.descent_level_inches),
            ground_time: parseFloat(result.results.ground_time_s),
            timestamp: new Date().toISOString()
        };
    }

    createVerticalJumpLeaderboardPage() {
        return `
            <div class="vertical-jump-leaderboard-page">
                <div class="page-header">
                    <button class="back-btn" onclick="app.loadPage('all-tests')">← Back</button>
                    <h1>Vertical Jump Leaderboard</h1>
                    <p>Top performers in vertical jump testing</p>
                </div>
                
                <div class="leaderboard-container">
                    <div class="leaderboard-filters">
                        <select id="time-filter" onchange="app.filterLeaderboard()">
                            <option value="all">All Time</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <button class="btn-secondary" onclick="app.refreshLeaderboard()">Refresh</button>
                    </div>
                    
                    <div class="leaderboard-list" id="leaderboard-list">
                        <div class="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async saveVerticalJumpResult() {
        if (!this.currentVerticalJumpResult) {
            alert('No results to save.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/save-vertical-jump-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentVerticalJumpResult)
            });

            const result = await response.json();

            if (result.success) {
                alert('Results saved successfully! You can view the leaderboard to see your ranking.');
                // Optionally redirect to leaderboard
                // this.loadPage('vertical-jump-leaderboard');
            } else {
                alert('Error saving results: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Error saving results. Please try again.');
        }
    }

    async loadVerticalJumpLeaderboard() {
        try {
            const response = await fetch('http://localhost:5001/api/vertical-jump-leaderboard');
            const result = await response.json();
            
            if (result.success) {
                this.displayVerticalJumpLeaderboard(result.data);
            } else {
                document.getElementById('leaderboard-list').innerHTML = '<p>Error loading leaderboard: ' + result.error + '</p>';
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('leaderboard-list').innerHTML = '<p>Error loading leaderboard. Please try again.</p>';
        }
    }

    displayVerticalJumpLeaderboard(data) {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (!data || data.length === 0) {
            leaderboardList.innerHTML = '<p>No results found. Be the first to test your vertical jump!</p>';
            return;
        }

        let html = '<div class="leaderboard-items">';
        
        data.forEach((entry, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            const date = new Date(entry.timestamp).toLocaleDateString();
            
            html += `
                <div class="leaderboard-item ${rank <= 3 ? 'top-three' : ''}">
                    <div class="rank">${medal} #${rank}</div>
                    <div class="user-info">
                        <div class="name">${entry.jumper_name}</div>
                        <div class="date">${date}</div>
                    </div>
                    <div class="score">
                        <div class="height">${entry.height.toFixed(2)}"</div>
                        <div class="details">
                            <span>Speed: ${entry.descent_speed.toFixed(1)} in/s</span>
                            <span>Time: ${entry.ground_time.toFixed(2)}s</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        leaderboardList.innerHTML = html;
    }

    async refreshLeaderboard() {
        await this.loadVerticalJumpLeaderboard();
    }

    filterLeaderboard() {
        // This would filter by time period - for now just refresh
        this.refreshLeaderboard();
    }

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GloSpotApp();
});

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
