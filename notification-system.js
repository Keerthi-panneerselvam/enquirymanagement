/**
 * Wedding Decor Manager - Notification System Module
 * A modular notification system that can be enabled/disabled via feature flags
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.settings = {
            overdue: true,
            today: true,
            newEnquiry: true,
            statusChange: true,
            upcomingWedding: true,
            sound: true,
            browserNotifications: false
        };
        this.isEnabled = false;
        this.storageKey = 'wedding_notifications';
        this.settingsKey = 'wedding_notification_settings';
        
        this.loadSettings();
        this.loadNotifications();
    }

    /**
     * Initialize the notification system
     * @param {Object} options - Configuration options
     */
    init(options = {}) {
        this.isEnabled = true;
        this.enquiries = options.enquiries || [];
        
        // Add notification UI elements
        this.addNotificationUI();
        this.setupEventListeners();
        
        // Request browser notification permission if enabled
        if (this.settings.browserNotifications) {
            this.requestBrowserPermission();
        }
        
        // Start periodic checks
        this.startPeriodicChecks();
        
        console.log('🔔 Notification system initialized');
    }

    /**
     * Disable the notification system
     */
    disable() {
        this.isEnabled = false;
        this.removeNotificationUI();
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        console.log('🔕 Notification system disabled');
    }

    /**
     * Add notification UI elements to the page
     */
    addNotificationUI() {
        // Add notification bell to header
        const header = document.querySelector('.header');
        if (header && !document.getElementById('notification-bell')) {
            const bellHtml = `
                <div id="notification-bell" class="notification-bell" onclick="notificationSystem.showNotificationPanel()">
                    🔔
                    <div id="notification-badge" class="notification-badge" style="display: none;">0</div>
                </div>
            `;
            header.insertAdjacentHTML('beforeend', bellHtml);
        }

        // Add notification tab
        const tabs = document.querySelector('.tabs');
        if (tabs && !document.querySelector('[onclick*="notifications"]')) {
            const tabHtml = `
                <button class="tab" onclick="showTab('notifications')">
                    Notifications
                    <span id="notification-tab-badge" class="tab-badge" style="display: none;">0</span>
                </button>
            `;
            tabs.insertAdjacentHTML('beforeend', tabHtml);
        }

        // Add notification tab content
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.getElementById('notifications')) {
            const notificationTabHtml = `
                <div id="notifications" class="tab-content">
                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
                            <h2 style="color: #333; margin: 0;">🔔 Notifications</h2>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button class="btn btn-secondary" onclick="notificationSystem.requestBrowserPermission()">Enable Browser Notifications</button>
                                <button class="btn btn-secondary" onclick="notificationSystem.markAllAsRead()">Mark All as Read</button>
                                <button class="btn btn-secondary" onclick="notificationSystem.checkForNotifications()">Check Now</button>
                                <button class="btn btn-secondary" onclick="notificationSystem.clearAllNotifications()">Clear All</button>
                            </div>
                        </div>
                        
                        <div class="notification-settings">
                            <h3 style="margin-bottom: 15px; color: #333;">🔧 Notification Settings</h3>
                            <div class="setting-item">
                                <span>Overdue follow-ups</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-overdue" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Follow-ups due today</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-today" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>New enquiries</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-new-enquiry" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Status changes</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-status-change" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Upcoming weddings (7 days)</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-upcoming-wedding" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="setting-item">
                                <span>Sound alerts</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notify-sound" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #333; margin: 0;">📋 Notification History</h3>
                            <span id="notification-count" style="color: #666; font-size: 0.9rem;">0 notifications</span>
                        </div>
                        <div id="notifications-list">
                            <p style="text-align: center; color: #666; padding: 40px;">No notifications yet. They will appear here when you have follow-ups due or other important updates.</p>
                        </div>
                    </div>
                </div>
            `;
            mainContent.insertAdjacentHTML('beforeend', notificationTabHtml);
        }

        // Add notification styles
        this.addNotificationStyles();
    }

    /**
     * Remove notification UI elements
     */
    removeNotificationUI() {
        const elements = [
            '#notification-bell',
            '#notifications',
            '[onclick*="notifications"]'
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.remove();
        });
    }

    /**
     * Add notification-specific CSS styles
     */
    addNotificationStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = `
            <style id="notification-styles">
                .notification-bell {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1.2rem;
                    z-index: 10;
                }

                .notification-bell:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .tab-badge {
                    background: #dc3545;
                    color: white;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 0.7rem;
                    margin-left: 5px;
                    position: absolute;
                    top: 8px;
                    right: 8px;
                }

                .notification-item {
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    border-left: 4px solid #667eea;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .notification-item:hover {
                    transform: translateX(5px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }

                .notification-item.unread {
                    background: #f8f9ff;
                    border-left-color: #dc3545;
                }

                .notification-item.overdue {
                    border-left-color: #dc3545;
                }

                .notification-item.warning {
                    border-left-color: #ffc107;
                }

                .notification-item.success {
                    border-left-color: #28a745;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .notification-title {
                    font-weight: 600;
                    color: #333;
                }

                .notification-time {
                    font-size: 0.8rem;
                    color: #666;
                }

                .notification-message {
                    color: #666;
                    line-height: 1.4;
                }

                .notification-settings {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .setting-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #e1e5e9;
                }

                .setting-item:last-child {
                    border-bottom: none;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 24px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #667eea;
                }

                input:checked + .slider:before {
                    transform: translateX(26px);
                }

                .notification.warning {
                    background: #ffc107;
                    color: #333;
                }

                .notification.info {
                    background: #17a2b8;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Setup event listeners for notification settings
     */
    setupEventListeners() {
        const checkboxes = ['notify-overdue', 'notify-today', 'notify-new-enquiry', 'notify-status-change', 'notify-upcoming-wedding', 'notify-sound'];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.saveSettings());
            }
        });

        // Update checkboxes with current settings
        this.updateSettingsUI();
    }

    /**
     * Update settings UI with current values
     */
    updateSettingsUI() {
        const settingMap = {
            'notify-overdue': 'overdue',
            'notify-today': 'today',
            'notify-new-enquiry': 'newEnquiry',
            'notify-status-change': 'statusChange',
            'notify-upcoming-wedding': 'upcomingWedding',
            'notify-sound': 'sound'
        };

        Object.entries(settingMap).forEach(([id, setting]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = this.settings[setting];
            }
        });
    }

    /**
     * Load notification settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem(this.settingsKey);
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    /**
     * Save notification settings to localStorage
     */
    saveSettings() {
        const settingMap = {
            'notify-overdue': 'overdue',
            'notify-today': 'today',
            'notify-new-enquiry': 'newEnquiry',
            'notify-status-change': 'statusChange',
            'notify-upcoming-wedding': 'upcomingWedding',
            'notify-sound': 'sound'
        };

        Object.entries(settingMap).forEach(([id, setting]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                this.settings[setting] = checkbox.checked;
            }
        });

        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
        console.log('💾 Notification settings saved');
    }

    /**
     * Load notifications from localStorage
     */
    loadNotifications() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    /**
     * Save notifications to localStorage
     */
    saveNotifications() {
        // Keep only last 100 notifications to prevent storage bloat
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(0, 100);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    }

    /**
     * Create a new notification
     */
    createNotification(type, title, message, enquiryId = null, urgent = false) {
        if (!this.isEnabled) return null;

        const notification = {
            id: Date.now() + Math.random(),
            type: type,
            title: title,
            message: message,
            enquiryId: enquiryId,
            urgent: urgent,
            read: false,
            created_at: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        this.saveNotifications();
        
        // Show browser notification if enabled
        if (this.settings[type] || this.settings[type.replace('-', '')]) {
            this.showBrowserNotification(title, message, urgent);
        }

        // Play sound if enabled
        if (this.settings.sound && urgent) {
            this.playNotificationSound();
        }

        this.updateBadges();
        this.renderNotifications();
        
        return notification;
    }

    /**
     * Show browser notification
     */
    showBrowserNotification(title, message, urgent = false) {
        if (!this.settings.browserNotifications || Notification.permission !== 'granted') return;

        const options = {
            body: message,
            icon: '💐',
            badge: '🔔',
            tag: 'wedding-decor-notification',
            renotify: true,
            requireInteraction: urgent
        };

        const notification = new Notification(title, options);
        
        if (!urgent) {
            setTimeout(() => notification.close(), 5000);
        }

        notification.onclick = () => {
            window.focus();
            this.showNotificationPanel();
            notification.close();
        };
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    /**
     * Request browser notification permission
     */
    requestBrowserPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.settings.browserNotifications = permission === 'granted';
                this.saveSettings();
                
                if (permission === 'granted') {
                    this.showToast('Browser notifications enabled!', 'success');
                    this.showBrowserNotification('Wedding Decor Manager', 'Notifications are now enabled!');
                } else {
                    this.showToast('Browser notifications denied. Please enable them in browser settings.', 'warning');
                }
            });
        } else {
            this.showToast('Browser notifications not supported.', 'error');
        }
    }

    /**
     * Check for new notifications based on enquiries
     */
    checkForNotifications() {
        if (!this.isEnabled || !this.enquiries) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newNotifications = 0;

        this.enquiries.forEach(enquiry => {
            // Check for overdue follow-ups
            if (enquiry.followup_date && this.settings.overdue) {
                const followupDate = new Date(enquiry.followup_date);
                followupDate.setHours(0, 0, 0, 0);
                
                if (followupDate < today) {
                    const existingNotification = this.notifications.find(n => 
                        n.type === 'overdue' && 
                        n.enquiryId === enquiry.id && 
                        new Date(n.created_at).toDateString() === today.toDateString()
                    );
                    
                    if (!existingNotification) {
                        const daysPast = Math.floor((today - followupDate) / (1000 * 60 * 60 * 24));
                        this.createNotification(
                            'overdue',
                            '⚠️ Overdue Follow-up',
                            `${enquiry.client_name} follow-up is ${daysPast} day(s) overdue (Manager: ${enquiry.manager || 'Unassigned'})`,
                            enquiry.id,
                            true
                        );
                        newNotifications++;
                    }
                }
            }

            // Check for follow-ups due today
            if (enquiry.followup_date && this.settings.today) {
                const followupDate = new Date(enquiry.followup_date);
                followupDate.setHours(0, 0, 0, 0);
                
                if (followupDate.getTime() === today.getTime()) {
                    const existingNotification = this.notifications.find(n => 
                        n.type === 'due-today' && 
                        n.enquiryId === enquiry.id && 
                        new Date(n.created_at).toDateString() === today.toDateString()
                    );
                    
                    if (!existingNotification) {
                        this.createNotification(
                            'due-today',
                            '📅 Follow-up Due Today',
                            `${enquiry.client_name} needs follow-up today (Manager: ${enquiry.manager || 'Unassigned'})`,
                            enquiry.id,
                            false
                        );
                        newNotifications++;
                    }
                }
            }

            // Check for upcoming weddings (7 days)
            if (enquiry.wedding_date && this.settings.upcomingWedding) {
                const weddingDate = new Date(enquiry.wedding_date);
                weddingDate.setHours(0, 0, 0, 0);
                const sevenDaysFromNow = new Date(today);
                sevenDaysFromNow.setDate(today.getDate() + 7);
                
                if (weddingDate.getTime() === sevenDaysFromNow.getTime()) {
                    const existingNotification = this.notifications.find(n => 
                        n.type === 'upcoming-wedding' && 
                        n.enquiryId === enquiry.id && 
                        new Date(n.created_at).toDateString() === today.toDateString()
                    );
                    
                    if (!existingNotification) {
                        this.createNotification(
                            'upcoming-wedding',
                            '💒 Wedding in 7 Days',
                            `${enquiry.client_name}'s wedding is in 7 days at ${enquiry.venue || 'venue TBD'}`,
                            enquiry.id,
                            false
                        );
                        newNotifications++;
                    }
                }
            }
        });

        if (newNotifications > 0) {
            console.log(`🔔 Generated ${newNotifications} new notifications`);
        }
    }

    /**
     * Update enquiries data for notification checking
     */
    updateEnquiries(enquiries) {
        this.enquiries = enquiries;
    }

    /**
     * Notify about new enquiry
     */
    notifyNewEnquiry(enquiry) {
        if (!this.isEnabled || !this.settings.newEnquiry) return;

        this.createNotification(
            'new-enquiry',
            '🆕 New Enquiry Added',
            `New enquiry from ${enquiry.client_name} assigned to ${enquiry.manager}`,
            enquiry.id,
            false
        );
    }

    /**
     * Notify about status change
     */
    notifyStatusChange(enquiry, oldStatus, newStatus) {
        if (!this.isEnabled || !this.settings.statusChange) return;

        this.createNotification(
            'status-change',
            '🔄 Status Updated',
            `${enquiry.client_name} status changed from ${oldStatus} to ${newStatus}`,
            enquiry.id,
            false
        );
    }

    /**
     * Update notification badges
     */
    updateBadges() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update header bell badge
        const headerBadge = document.getElementById('notification-badge');
        if (headerBadge) {
            if (unreadCount > 0) {
                headerBadge.textContent = unreadCount;
                headerBadge.style.display = 'flex';
            } else {
                headerBadge.style.display = 'none';
            }
        }

        // Update notifications tab badge
        const tabBadge = document.getElementById('notification-tab-badge');
        if (tabBadge) {
            if (unreadCount > 0) {
                tabBadge.textContent = unreadCount;
                tabBadge.style.display = 'block';
            } else {
                tabBadge.style.display = 'none';
            }
        }
    }

    /**
     * Render notifications in the UI
     */
    renderNotifications() {
        const container = document.getElementById('notifications-list');
        const countElement = document.getElementById('notification-count');
        
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No notifications yet. They will appear here when you have follow-ups due or other important updates.</p>';
            if (countElement) countElement.textContent = '0 notifications';
            return;
        }

        if (countElement) {
            countElement.textContent = `${this.notifications.length} notification${this.notifications.length !== 1 ? 's' : ''} (${this.notifications.filter(n => !n.read).length} unread)`;
        }

        container.innerHTML = this.notifications.map(notification => {
            const typeIcons = {
                'overdue': '⚠️',
                'due-today': '📅',
                'new-enquiry': '🆕',
                'status-change': '🔄',
                'upcoming-wedding': '💒'
            };

            const typeClasses = {
                'overdue': 'overdue',
                'due-today': 'warning',
                'new-enquiry': 'success',
                'status-change': 'info',
                'upcoming-wedding': 'warning'
            };

            return `
                <div class="notification-item ${notification.read ? '' : 'unread'} ${typeClasses[notification.type] || ''}" 
                     onclick="notificationSystem.markAsRead('${notification.id}'); ${notification.enquiryId ? `notificationSystem.showEnquiryDetails(${notification.enquiryId})` : ''}">
                    <div class="notification-header">
                        <div class="notification-title">
                            ${typeIcons[notification.type] || '🔔'} ${notification.title}
                            ${!notification.read ? ' 🔴' : ''}
                        </div>
                        <div class="notification-time">${this.formatRelativeTime(notification.created_at)}</div>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Format relative time for notifications
     */
    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id == notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadges();
            this.renderNotifications();
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadges();
        this.renderNotifications();
        this.showToast('All notifications marked as read', 'success');
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateBadges();
            this.renderNotifications();
            this.showToast('All notifications cleared', 'success');
        }
    }

    /**
     * Show notification panel
     */
    showNotificationPanel() {
        if (typeof showTab === 'function') {
            showTab('notifications');
        }
    }

    /**
     * Show enquiry details
     */
    showEnquiryDetails(enquiryId) {
        if (typeof showTab === 'function') {
            showTab('enquiries');
            
            // Highlight specific enquiry if function exists
            if (typeof window.highlightEnquiry === 'function') {
                window.highlightEnquiry(enquiryId);
            }
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    }

    /**
     * Start periodic notification checks
     */
    startPeriodicChecks() {
        // Check immediately
        setTimeout(() => this.checkForNotifications(), 2000);
        
        // Then check every 5 minutes
        this.checkInterval = setInterval(() => {
            this.checkForNotifications();
        }, 5 * 60 * 1000);
    }

    /**
     * Get notification statistics
     */
    getStats() {
        return {
            total: this.notifications.length,
            unread: this.notifications.filter(n => !n.read).length,
            byType: this.notifications.reduce((acc, n) => {
                acc[n.type] = (acc[n.type] || 0) + 1;
                return acc;
            }, {}),
            isEnabled: this.isEnabled,
            settings: this.settings
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.NotificationSystem = NotificationSystem;
    
    // Create global instance
    window.notificationSystem = new NotificationSystem();
    
    console.log('🔔 Notification system module loaded');
}