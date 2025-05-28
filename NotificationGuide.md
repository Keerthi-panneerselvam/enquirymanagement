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
    'new