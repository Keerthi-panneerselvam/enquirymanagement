# 🔔 Wedding Decor Manager - Notification System Setup Guide

## Overview

The notification system is implemented as a **modular, feature-flagged component** that can be easily enabled or disabled. It provides comprehensive notification management with persistent storage using localStorage.

## 📁 File Structure

```
wedding-decor-manager/
├── index.html                    # Main application (with feature flags)
├── notification-system.js        # Modular notification system
└── README.md                     # This setup guide
```

## 🚀 Quick Setup

### 1. Save the Files
- Save the **index.html** with feature flag support
- Save the **notification-system.js** as a separate file in the same directory

### 2. Enable/Disable Notifications
In `index.html`, modify the feature flags:

```javascript
window.FEATURE_FLAGS = {
    NOTIFICATIONS_ENABLED: true,   // Set to false to disable
    ADVANCED_ANALYTICS: false,     // Future feature
    EMAIL_INTEGRATION: false,      // Future feature
    BULK_OPERATIONS: false         // Future feature
};
```

### 3. Run the Application
- Open `index.html` in your browser
- The notification system will automatically load if enabled

## 🔧 How It Works

### Feature Flag System
```javascript
// Feature flags control which modules load
if (window.FEATURE_FLAGS.NOTIFICATIONS_ENABLED) {
    // Dynamically load notification system
    const script = document.createElement('script');
    script.src = 'notification-system.js';
    document.head.appendChild(script);
}
```

### Notification Storage Strategy

#### 📦 What Gets Stored?
The notification system uses **localStorage** for persistence:

| Storage Key | Content | Purpose |
|-------------|---------|---------|
| `wedding_notifications` | Array of notification objects | Stores all notifications |
| `wedding_notification_settings` | User preference object | Stores notification settings |

#### 📊 Notification Data Structure
```javascript
{
    id: "1640995200000.123",           // Unique ID (timestamp + random)
    type: "overdue",                   // Type: overdue, due-today, new-enquiry, etc.
    title: "⚠️ Overdue Follow-up",     // Display title
    message: "Client follow-up is...", // Detailed message
    enquiryId: 123,                    // Related enquiry ID (optional)
    urgent: true,                      // Whether it's urgent
    read: false,                       // Read status
    created_at: "2025-05-28T10:00:00Z" // ISO timestamp
}
```

#### 🎛️ Settings Data Structure
```javascript
{
    overdue: true,           // Overdue follow-up notifications
    today: true,             // Follow-ups due today
    newEnquiry: true,        // New enquiry notifications
    statusChange: true,      // Status change notifications
    upcomingWedding: true,   // Upcoming wedding notifications
    sound: true,             // Sound alerts
    browserNotifications: false // Browser notification permission
}
```

## 🔔 Notification Types & Triggers

### Automatic Notifications
| Type | Trigger | Urgency | Storage Impact |
|------|---------|---------|----------------|
| **Overdue Follow-ups** | Follow-up date < today | 🚨 High | 1 per enquiry per day |
| **Due Today** | Follow-up date = today | ⚠️ Medium | 1 per enquiry per day |
| **Upcoming Wedding** | Wedding date = today + 7 days | 📅 Medium | 1 per enquiry per event |

### Manual Notifications
| Type | Trigger | Urgency | Storage Impact |
|------|---------|---------|----------------|
| **New Enquiry** | Form submission | 🆕 Low | 1 per new enquiry |
| **Status Change** | Status update | 🔄 Low | 1 per status change |

## 🗄️ Storage Management

### Auto-Cleanup
- **Notification Limit**: Max 100 notifications stored
- **Old notifications** automatically removed when limit exceeded
- **No expiration**: Notifications persist until manually cleared

### Storage Size Estimation
```javascript
// Approximate storage per notification: ~200-400 bytes
// 100 notifications ≈ 20-40KB
// Settings ≈ 1KB
// Total storage usage ≈ 25-45KB
```

### Manual Management
Users can:
- **Mark all as read** - Updates read status
- **Clear all notifications** - Removes all stored notifications
- **Adjust settings** - Controls which notifications to receive

## 🎯 API Reference

### Notification System Methods

```javascript
// Initialize with enquiry data
notificationSystem.init({ enquiries: enquiriesArray });

// Manually create notifications
notificationSystem.createNotification(type, title, message, enquiryId, urgent);

// Update enquiry data (triggers auto-checks)
notificationSystem.updateEnquiries(newEnquiriesArray);

// Manual notification calls
notificationSystem.notifyNewEnquiry(enquiry);
notificationSystem.notifyStatusChange(enquiry, oldStatus, newStatus);

// Management
notificationSystem.markAsRead(notificationId);
notificationSystem.markAllAsRead();
notificationSystem.clearAllNotifications();

// Browser permissions
notificationSystem.requestBrowserPermission();

// Manual checks
notificationSystem.checkForNotifications();

// Disable system
notificationSystem.disable();

// Get statistics
notificationSystem.getStats();
```

## 🔧 Customization Options

### 1. Change Notification Types
Modify the notification system to add custom notification types:

```javascript
// In notification-system.js, add new type
const typeIcons = {
    'overdue': '⚠️',
    'due-today': '📅',
    'new-enquiry': '🆕',
    'status-change': '🔄',
    'upcoming-wedding': '💒',
    'payment-reminder': '💳',    // Add custom type
    'custom-alert': '🚨'         // Add another custom type
};

const typeClasses = {
    'overdue': 'overdue',
    'due-today': 'warning',
    'new-enquiry': 'success',
    'status-change': 'info',
    'upcoming-wedding': 'warning',
    'payment-reminder': 'warning',  // Style for custom type
    'custom-alert': 'overdue'       // Style for custom type
};
```

### 2. Modify Check Intervals
Change how frequently the system checks for notifications:

```javascript
// In startPeriodicChecks() method, modify intervals
startPeriodicChecks() {
    // Check immediately
    setTimeout(() => this.checkForNotifications(), 2000);
    
    // Change from 5 minutes to custom interval
    this.checkInterval = setInterval(() => {
        this.checkForNotifications();
    }, 10 * 60 * 1000); // Now checks every 10 minutes
}
```

### 3. Add Custom Settings
Extend the settings object with new preferences:

```javascript
// In constructor, add new settings
this.settings = {
    overdue: true,
    today: true,
    newEnquiry: true,
    statusChange: true,
    upcomingWedding: true,
    sound: true,
    browserNotifications: false,
    paymentReminders: true,        // New setting
    weeklyDigest: false,           // New setting
    emailNotifications: false      // New setting
};
```

### 4. Custom Sound Alerts
Replace the default notification sound:

```javascript
// Replace playNotificationSound() method
playNotificationSound() {
    // Option 1: Use audio file
    const audio = new Audio('path/to/custom-sound.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound play failed:', e));
    
    // Option 2: Custom tone sequence
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Custom frequency pattern
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
}
```

## 🎨 UI Customization

### 1. Custom Notification Colors
Modify the CSS in `addNotificationStyles()`:

```css
.notification-item.overdue {
    border-left-color: #dc3545; /* Red for overdue */
    background: #fff5f5;
}

.notification-item.warning {
    border-left-color: #ffc107; /* Yellow for warnings */
    background: #fffbf0;
}

.notification-item.success {
    border-left-color: #28a745; /* Green for success */
    background: #f0fff4;
}

.notification-item.info {
    border-left-color: #17a2b8; /* Blue for info */
    background: #f0f8ff;
}

/* Add custom styles */
.notification-item.urgent {
    border-left-color: #ff6b6b;
    background: #ffe0e0;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}
```

### 2. Custom Notification Layout
Modify the HTML structure in `renderNotifications()`:

```javascript
// Custom notification item template
return `
    <div class="notification-item ${notification.read ? '' : 'unread'} ${typeClasses[notification.type] || ''}" 
         onclick="notificationSystem.markAsRead('${notification.id}'); ${notification.enquiryId ? `notificationSystem.showEnquiryDetails(${notification.enquiryId})` : ''}">
        <div class="notification-content">
            <div class="notification-icon">
                ${typeIcons[notification.type] || '🔔'}
            </div>
            <div class="notification-body">
                <div class="notification-header">
                    <div class="notification-title">
                        ${notification.title}
                        ${!notification.read ? ' <span class="unread-dot">●</span>' : ''}
                        ${notification.urgent ? ' <span class="urgent-badge">URGENT</span>' : ''}
                    </div>
                    <div class="notification-time">${this.formatRelativeTime(notification.created_at)}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
                ${notification.enquiryId ? '<div class="notification-action">Click to view enquiry →</div>' : ''}
            </div>
        </div>
    </div>
`;
```

## 🔍 Advanced Features

### 1. Notification Filtering
Add filtering capabilities to the notification panel:

```javascript
// Add filter methods
filterNotifications(filterType) {
    let filtered = this.notifications;
    
    switch(filterType) {
        case 'unread':
            filtered = this.notifications.filter(n => !n.read);
            break;
        case 'urgent':
            filtered = this.notifications.filter(n => n.urgent);
            break;
        case 'today':
            const today = new Date().toDateString();
            filtered = this.notifications.filter(n => 
                new Date(n.created_at).toDateString() === today
            );
            break;
        case 'overdue':
            filtered = this.notifications.filter(n => n.type === 'overdue');
            break;
    }
    
    this.renderFilteredNotifications(filtered);
}
```

### 2. Bulk Operations
Add bulk notification management:

```javascript
// Bulk operations
bulkMarkAsRead(notificationIds) {
    notificationIds.forEach(id => {
        const notification = this.notifications.find(n => n.id == id);
        if (notification) notification.read = true;
    });
    this.saveNotifications();
    this.updateBadges();
    this.renderNotifications();
}

bulkDelete(notificationIds) {
    this.notifications = this.notifications.filter(n => 
        !notificationIds.includes(n.id)
    );
    this.saveNotifications();
    this.updateBadges();
    this.renderNotifications();
}
```

### 3. Export/Import Notifications
Add data portability:

```javascript
// Export notifications
exportNotifications() {
    const data = {
        notifications: this.notifications,
        settings: this.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-notifications-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import notifications
importNotifications(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.notifications && Array.isArray(data.notifications)) {
                this.notifications = [...this.notifications, ...data.notifications];
                this.saveNotifications();
                this.renderNotifications();
                this.showToast('Notifications imported successfully!', 'success');
            }
            
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
                this.saveSettings();
                this.updateSettingsUI();
            }
        } catch (error) {
            this.showToast('Failed to import notifications', 'error');
        }
    };
    reader.readAsText(file);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check if `NOTIFICATIONS_ENABLED` is set to `true`
   - Verify notification settings are enabled
   - Check browser console for errors

2. **Browser notifications not working**
   - Ensure permission is granted
   - Check browser notification settings
   - Some browsers block notifications on HTTP (use HTTPS)

3. **Sounds not playing**
   - Modern browsers require user interaction before playing audio
   - Check browser audio settings
   - Verify sound setting is enabled

4. **Storage issues**
   - Check localStorage availability
   - Verify storage quota hasn't been exceeded
   - Clear browser cache if needed

### Debug Methods

```javascript
// Debug notification system
console.log('Notification Stats:', notificationSystem.getStats());
console.log('Current Settings:', notificationSystem.settings);
console.log('All Notifications:', notificationSystem.notifications);

// Test notification creation
notificationSystem.createNotification(
    'test', 
    'Test Notification', 
    'This is a test message', 
    null, 
    true
);

// Check storage
console.log('Stored Notifications:', 
    JSON.parse(localStorage.getItem('wedding_notifications') || '[]'));
console.log('Stored Settings:', 
    JSON.parse(localStorage.getItem('wedding_notification_settings') || '{}'));
```

## 📱 Mobile Optimization

### Responsive Design
The notification system includes mobile-friendly CSS:

```css
/* Mobile-specific styles */
@media (max-width: 768px) {
    .notification-bell {
        top: 15px;
        right: 15px;
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
    
    .notification-item {
        padding: 12px;
        margin-bottom: 8px;
    }
    
    .notification-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
    
    .notification-settings {
        padding: 15px;
    }
    
    .setting-item {
        padding: 8px 0;
    }
}
```

### Touch-Friendly Interactions
- Larger touch targets for mobile devices
- Swipe gestures for marking notifications as read
- Optimized tap areas for better usability

## 🚀 Performance Optimization

### Best Practices
1. **Lazy Loading**: Notifications load only when needed
2. **Efficient Storage**: Auto-cleanup prevents storage bloat
3. **Minimal DOM Updates**: Batched updates for better performance
4. **Debounced Checks**: Prevents excessive notification checking

### Memory Management
```javascript
// Clean up when disabling
disable() {
    this.isEnabled = false;
    this.removeNotificationUI();
    
    // Clear intervals
    if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
    }
    
    // Clear event listeners
    this.removeEventListeners();
    
    console.log('🔕 Notification system disabled and cleaned up');
}
```

## 🔒 Security Considerations

1. **Data Sanitization**: All user input is properly escaped
2. **XSS Prevention**: HTML is safely inserted using textContent where possible
3. **Storage Limits**: Automatic cleanup prevents storage overflow
4. **Permission Handling**: Graceful fallback when permissions denied

## 📊 Analytics & Monitoring

### Usage Statistics
The system provides built-in analytics:

```javascript
// Get comprehensive stats
const stats = notificationSystem.getStats();
console.log('Notification Analytics:', {
    totalNotifications: stats.total,
    unreadCount: stats.unread,
    notificationsByType: stats.byType,
    systemEnabled: stats.isEnabled,
    userSettings: stats.settings
});
```

### Performance Monitoring
```javascript
// Monitor notification creation performance
const startTime = performance.now();
notificationSystem.createNotification(/* parameters */);
const endTime = performance.now();
console.log(`Notification created in ${endTime - startTime} milliseconds`);
```

## 🔄 Future Enhancements

### Planned Features
- **Email Integration**: Send notification summaries via email
- **Slack/Teams Integration**: Push notifications to team channels
- **Advanced Filtering**: More granular notification filters
- **Notification Templates**: Customizable notification formats
- **Scheduling**: Delayed or recurring notifications
- **A/B Testing**: Test different notification strategies

### Extension Points
The modular design allows for easy extensions:

```javascript
// Example extension for email notifications
class EmailNotificationExtension {
    constructor(notificationSystem) {
        this.ns = notificationSystem;
    }
    
    sendEmailDigest() {
        const unread = this.ns.notifications.filter(n => !n.read);
        // Send email with unread notifications
    }
}

// Register extension
if (window.FEATURE_FLAGS.EMAIL_INTEGRATION) {
    const emailExt = new EmailNotificationExtension(notificationSystem);
}
```

---

## 📝 Changelog

### Version 1.0.0
- Initial notification system implementation
- Basic notification types (overdue, due-today, new-enquiry, status-change, upcoming-wedding)
- localStorage persistence
- Browser notification support
- Sound alerts
- Modular architecture with feature flags

---

*For technical support or feature requests, please refer to the main application documentation or contact the development team.*