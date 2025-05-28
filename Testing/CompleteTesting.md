# 🧪 **Wedding Decor Manager - Complete Test Plan & Test Cases**

## **📋 Test Plan Overview**

### **Scope**
- Frontend functionality testing
- Notification system testing  
- Data persistence testing
- UI/UX testing
- Browser compatibility testing
- Mobile responsiveness testing

### **Test Environment**
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Tablet, Mobile
- **Data Modes**: Demo mode (offline) & Supabase mode (online)

---

## **🎯 Test Categories**

### **1. CORE FUNCTIONALITY TESTS**

#### **TC-001: Application Initialization**
| Test Case ID | TC-001 |
|--------------|--------|
| **Objective** | Verify application loads correctly |
| **Prerequisites** | Browser with JavaScript enabled |
| **Test Steps** | 1. Open index.html in browser<br>2. Wait for page load |
| **Expected Result** | - Page loads without errors<br>- Header displays correctly<br>- Tabs are visible<br>- "All Enquiries" tab is active<br>- Demo data loads |
| **Priority** | High |

#### **TC-002: Feature Flag System**
| Test Case ID | TC-002 |
|--------------|--------|
| **Objective** | Verify feature flags work correctly |
| **Test Steps** | 1. Set `NOTIFICATIONS_ENABLED: false`<br>2. Refresh page<br>3. Set `NOTIFICATIONS_ENABLED: true`<br>4. Refresh page |
| **Expected Result** | - When false: No notification bell, feature indicator shows "Core features only"<br>- When true: Notification bell appears, feature indicator shows "notifications" |
| **Priority** | High |

---

### **2. ENQUIRY MANAGEMENT TESTS**

#### **TC-003: Add New Enquiry - Valid Data**
| Test Case ID | TC-003 |
|--------------|--------|
| **Objective** | Add enquiry with valid required fields |
| **Test Steps** | 1. Click "Add New Enquiry" tab<br>2. Fill mandatory fields: Client Name, Email, Phone, Manager<br>3. Click "Add Enquiry" |
| **Test Data** | Name: "John & Jane", Email: "test@email.com", Phone: "+91 98765 43210", Manager: "Rajesh Kumar" |
| **Expected Result** | - Success notification appears<br>- Enquiry added to list<br>- Form resets<br>- Switches to "All Enquiries" tab |
| **Priority** | High |

#### **TC-004: Add New Enquiry - Invalid Data**
| Test Case ID | TC-004 |
|--------------|--------|
| **Objective** | Validate form with invalid/missing data |
| **Test Steps** | 1. Try submitting with empty required fields<br>2. Try invalid email format<br>3. Try negative budget |
| **Expected Result** | - Browser validation prevents submission<br>- Appropriate error messages shown<br>- Form not submitted |
| **Priority** | Medium |

#### **TC-005: Add New Enquiry - All Fields**
| Test Case ID | TC-005 |
|--------------|--------|
| **Objective** | Add enquiry with all fields populated |
| **Test Steps** | Fill all available fields including optional ones |
| **Test Data** | All fields with valid data |
| **Expected Result** | - Enquiry saved with all data<br>- All fields display correctly in enquiry card |
| **Priority** | Medium |

#### **TC-006: Update Enquiry Status**
| Test Case ID | TC-006 |
|--------------|--------|
| **Objective** | Change enquiry status |
| **Test Steps** | 1. Click "Update Status" on any enquiry<br>2. Select different status<br>3. Click "Update Status" |
| **Expected Result** | - Modal opens with current status selected<br>- Status updates successfully<br>- Status badge changes color<br>- Success notification shown |
| **Priority** | High |

#### **TC-007: Delete Enquiry**
| Test Case ID | TC-007 |
|--------------|--------|
| **Objective** | Delete an enquiry |
| **Test Steps** | 1. Click "Delete" on any enquiry<br>2. Confirm deletion |
| **Expected Result** | - Confirmation dialog appears<br>- Enquiry removed from list<br>- Success notification shown |
| **Priority** | High |

#### **TC-008: Cancel Delete Enquiry**
| Test Case ID | TC-008 |
|--------------|--------|
| **Objective** | Cancel enquiry deletion |
| **Test Steps** | 1. Click "Delete" on any enquiry<br>2. Cancel deletion |
| **Expected Result** | - Confirmation dialog appears<br>- Enquiry remains in list<br>- No changes made |
| **Priority** | Medium |

---

### **3. FOLLOW-UP MANAGEMENT TESTS**

#### **TC-009: Add Follow-up Entry**
| Test Case ID | TC-009 |
|--------------|--------|
| **Objective** | Add follow-up details to enquiry |
| **Test Steps** | 1. Click "Add Follow-up" on enquiry<br>2. Fill follow-up date, details<br>3. Optionally set next follow-up date<br>4. Click "Add Follow-up" |
| **Test Data** | Date: today, Details: "Discussed venue requirements", Next: tomorrow |
| **Expected Result** | - Modal opens<br>- Follow-up saved<br>- Follow-up count increases<br>- Next follow-up date updated |
| **Priority** | High |

#### **TC-010: View Follow-up History**
| Test Case ID | TC-010 |
|--------------|--------|
| **Objective** | View all follow-ups for an enquiry |
| **Test Steps** | 1. Click "View Follow-ups" on enquiry with existing follow-ups |
| **Expected Result** | - Modal shows all follow-ups<br>- Sorted by date (newest first)<br>- Shows follow-up details and timestamps |
| **Priority** | Medium |

#### **TC-011: Add Follow-up - Missing Data**
| Test Case ID | TC-011 |
|--------------|--------|
| **Objective** | Validate follow-up form |
| **Test Steps** | 1. Try submitting follow-up with empty details<br>2. Try with empty date |
| **Expected Result** | - Error notification shown<br>- Form not submitted<br>- Validation message displayed |
| **Priority** | Medium |

---

### **4. NAVIGATION & TABS TESTS**

#### **TC-012: Tab Navigation**
| Test Case ID | TC-012 |
|--------------|--------|
| **Objective** | Test all tab navigation |
| **Test Steps** | 1. Click each tab: All Enquiries, Add New Enquiry, Follow-ups Due, By Manager, Notifications |
| **Expected Result** | - Active tab highlights<br>- Correct content displays<br>- Previous tab content hides |
| **Priority** | High |

#### **TC-013: Follow-ups Due Tab**
| Test Case ID | TC-013 |
|--------------|--------|
| **Objective** | View overdue and today's follow-ups |
| **Prerequisites** | Enquiries with follow-up dates |
| **Test Steps** | 1. Click "Follow-ups Due" tab |
| **Expected Result** | - Shows enquiries with follow-ups <= today<br>- Overdue items marked as "OVERDUE"<br>- If none due, shows celebration message |
| **Priority** | High |

#### **TC-014: By Manager Tab**
| Test Case ID | TC-014 |
|--------------|--------|
| **Objective** | View enquiries grouped by manager |
| **Test Steps** | 1. Click "By Manager" tab |
| **Expected Result** | - Enquiries grouped by assigned manager<br>- Shows status counts for each manager<br>- Unassigned enquiries grouped separately |
| **Priority** | Medium |

---

### **5. NOTIFICATION SYSTEM TESTS**

#### **TC-015: Notification System Initialization**
| Test Case ID | TC-015 |
|--------------|--------|
| **Objective** | Verify notification system loads |
| **Prerequisites** | `NOTIFICATIONS_ENABLED: true` |
| **Test Steps** | 1. Load application<br>2. Check console<br>3. Look for notification bell |
| **Expected Result** | - Console shows loading messages<br>- Notification bell appears<br>- Notifications tab added |
| **Priority** | High |

#### **TC-016: Overdue Follow-up Notifications**
| Test Case ID | TC-016 |
|--------------|--------|
| **Objective** | Test automatic overdue notifications |
| **Test Steps** | 1. Add enquiry with follow-up date = yesterday<br>2. Wait for automatic check |
| **Expected Result** | - Overdue notification created<br>- Red badge appears on bell<br>- Console shows generation message |
| **Priority** | High |

#### **TC-017: Due Today Notifications**
| Test Case ID | TC-017 |
|--------------|--------|
| **Objective** | Test today's follow-up notifications |
| **Test Steps** | 1. Add enquiry with follow-up date = today<br>2. Wait for check |
| **Expected Result** | - Due today notification created<br>- Badge count increases |
| **Priority** | High |

#### **TC-018: Upcoming Wedding Notifications**
| Test Case ID | TC-018 |
|--------------|--------|
| **Objective** | Test 7-day wedding notifications |
| **Test Steps** | 1. Add enquiry with wedding date = 7 days from today<br>2. Wait for check |
| **Expected Result** | - Wedding reminder notification created<br>- Badge updates |
| **Priority** | Medium |

#### **TC-019: New Enquiry Notifications**
| Test Case ID | TC-019 |
|--------------|--------|
| **Objective** | Test manual new enquiry notifications |
| **Test Steps** | 1. Add new enquiry through form |
| **Expected Result** | - New enquiry notification created<br>- Badge updates immediately |
| **Priority** | Medium |

#### **TC-020: Status Change Notifications**
| Test Case ID | TC-020 |
|--------------|--------|
| **Objective** | Test status change notifications |
| **Test Steps** | 1. Update enquiry status |
| **Expected Result** | - Status change notification created<br>- Shows old and new status |
| **Priority** | Medium |

#### **TC-021: Notification Bell Interaction**
| Test Case ID | TC-021 |
|--------------|--------|
| **Objective** | Test notification bell click |
| **Test Steps** | 1. Click notification bell |
| **Expected Result** | - Switches to Notifications tab<br>- Shows notification panel |
| **Priority** | High |

#### **TC-022: Mark Notification as Read**
| Test Case ID | TC-022 |
|--------------|--------|
| **Objective** | Mark individual notification as read |
| **Test Steps** | 1. Click unread notification |
| **Expected Result** | - Notification marked as read<br>- Red dot disappears<br>- Badge count decreases |
| **Priority** | High |

#### **TC-023: Mark All Notifications as Read**
| Test Case ID | TC-023 |
|--------------|--------|
| **Objective** | Mark all notifications as read |
| **Test Steps** | 1. Click "Mark All as Read" |
| **Expected Result** | - All notifications marked as read<br>- Badge disappears<br>- Success toast shown |
| **Priority** | Medium |

#### **TC-024: Clear All Notifications**
| Test Case ID | TC-024 |
|--------------|--------|
| **Objective** | Clear all notifications |
| **Test Steps** | 1. Click "Clear All"<br>2. Confirm action |
| **Expected Result** | - Confirmation dialog<br>- All notifications removed<br>- Badge disappears |
| **Priority** | Medium |

#### **TC-025: Notification Settings Toggle**
| Test Case ID | TC-025 |
|--------------|--------|
| **Objective** | Test notification settings |
| **Test Steps** | 1. Toggle different notification types off<br>2. Trigger relevant actions |
| **Expected Result** | - Settings save automatically<br>- Disabled notifications don't generate |
| **Priority** | Medium |

#### **TC-026: Browser Notifications**
| Test Case ID | TC-026 |
|--------------|--------|
| **Objective** | Test browser notification permission |
| **Test Steps** | 1. Click "Enable Browser Notifications"<br>2. Allow permission<br>3. Trigger notification |
| **Expected Result** | - Permission dialog appears<br>- Desktop notification shows<br>- Setting saved |
| **Priority** | Low |

#### **TC-027: Notification Click Navigation**
| Test Case ID | TC-027 |
|--------------|--------|
| **Objective** | Test clicking notifications with enquiry links |
| **Test Steps** | 1. Click notification linked to enquiry |
| **Expected Result** | - Switches to All Enquiries tab<br>- Highlights relevant enquiry<br>- Enquiry scrolls into view |
| **Priority** | Medium |

---

### **6. DATA PERSISTENCE TESTS**

#### **TC-028: Demo Mode Data Persistence**
| Test Case ID | TC-028 |
|--------------|--------|
| **Objective** | Test data persistence without Supabase |
| **Test Steps** | 1. Add enquiries<br>2. Refresh page |
| **Expected Result** | - Demo data reloads<br>- New enquiries lost (expected behavior) |
| **Priority** | Medium |

#### **TC-029: Notification Storage Persistence**
| Test Case ID | TC-029 |
|--------------|--------|
| **Objective** | Test notification localStorage |
| **Test Steps** | 1. Generate notifications<br>2. Refresh page |
| **Expected Result** | - Notifications persist<br>- Badge counts correct<br>- Settings preserved |
| **Priority** | High |

#### **TC-030: Settings Persistence**
| Test Case ID | TC-030 |
|--------------|--------|
| **Objective** | Test notification settings storage |
| **Test Steps** | 1. Change notification settings<br>2. Refresh page |
| **Expected Result** | - Settings preserved<br>- Toggles in correct state |
| **Priority** | Medium |

---

### **7. UI/UX TESTS**

#### **TC-031: Form Validation**
| Test Case ID | TC-031 |
|--------------|--------|
| **Objective** | Test all form validations |
| **Test Steps** | 1. Test required field validation<br>2. Test email format<br>3. Test date minimums |
| **Expected Result** | - Appropriate validation messages<br>- Form prevents invalid submission |
| **Priority** | Medium |

#### **TC-032: Modal Interactions**
| Test Case ID | TC-032 |
|--------------|--------|
| **Objective** | Test all modal dialogs |
| **Test Steps** | 1. Test status update modal<br>2. Test follow-up modal<br>3. Test follow-up history modal |
| **Expected Result** | - Modals open/close correctly<br>- Click outside closes modal<br>- Escape key closes modal |
| **Priority** | Medium |

#### **TC-033: Visual Feedback**
| Test Case ID | TC-033 |
|--------------|--------|
| **Objective** | Test visual indicators |
| **Test Steps** | 1. Check status badge colors<br>2. Check overdue highlighting<br>3. Check hover effects |
| **Expected Result** | - Status badges show correct colors<br>- Overdue items highlighted in red<br>- Smooth animations work |
| **Priority** | Low |

#### **TC-034: Toast Notifications**
| Test Case ID | TC-034 |
|--------------|--------|
| **Objective** | Test success/error messages |
| **Test Steps** | 1. Perform various actions<br>2. Check for appropriate toasts |
| **Expected Result** | - Success/error toasts appear<br>- Auto-disappear after 3 seconds<br>- Correct styling |
| **Priority** | Medium |

---

### **8. RESPONSIVE DESIGN TESTS**

#### **TC-035: Mobile Responsiveness**
| Test Case ID | TC-035 |
|--------------|--------|
| **Objective** | Test mobile layout |
| **Test Steps** | 1. Open on mobile device/emulator<br>2. Test all functionality |
| **Expected Result** | - Layout adapts correctly<br>- Touch targets appropriate<br>- All features accessible |
| **Priority** | High |

#### **TC-036: Tablet Responsiveness**
| Test Case ID | TC-036 |
|--------------|--------|
| **Objective** | Test tablet layout |
| **Test Steps** | 1. Test on tablet screen size |
| **Expected Result** | - Layout scales appropriately<br>- Grid adjusts correctly |
| **Priority** | Medium |

#### **TC-037: Desktop Various Sizes**
| Test Case ID | TC-037 |
|--------------|--------|
| **Objective** | Test different desktop resolutions |
| **Test Steps** | 1. Test on various screen sizes |
| **Expected Result** | - Content scales well<br>- No horizontal scrolling<br>- Readable at all sizes |
| **Priority** | Medium |

---

### **9. BROWSER COMPATIBILITY TESTS**

#### **TC-038: Chrome Compatibility**
| Test Case ID | TC-038 |
|--------------|--------|
| **Objective** | Test in Google Chrome |
| **Test Steps** | 1. Run all core functionality tests |
| **Expected Result** | - All features work correctly |
| **Priority** | High |

#### **TC-039: Firefox Compatibility**
| Test Case ID | TC-039 |
|--------------|--------|
| **Objective** | Test in Mozilla Firefox |
| **Test Steps** | 1. Run all core functionality tests |
| **Expected Result** | - All features work correctly |
| **Priority** | High |

#### **TC-040: Safari Compatibility**
| Test Case ID | TC-040 |
|--------------|--------|
| **Objective** | Test in Safari |
| **Test Steps** | 1. Run all core functionality tests |
| **Expected Result** | - All features work correctly |
| **Priority** | Medium |

#### **TC-041: Edge Compatibility**
| Test Case ID | TC-041 |
|--------------|--------|
| **Objective** | Test in Microsoft Edge |
| **Test Steps** | 1. Run all core functionality tests |
| **Expected Result** | - All features work correctly |
| **Priority** | Medium |

---

### **10. PERFORMANCE TESTS**

#### **TC-042: Page Load Performance**
| Test Case ID | TC-042 |
|--------------|--------|
| **Objective** | Test initial page load speed |
| **Test Steps** | 1. Measure page load time<br>2. Check for render blocking |
| **Expected Result** | - Page loads under 3 seconds<br>- No console errors |
| **Priority** | Medium |

#### **TC-043: Large Dataset Performance**
| Test Case ID | TC-043 |
|--------------|--------|
| **Objective** | Test with many enquiries |
| **Test Steps** | 1. Add 50+ enquiries<br>2. Test navigation<br>3. Test notifications |
| **Expected Result** | - No performance degradation<br>- Smooth scrolling<br>- Quick response times |
| **Priority** | Low |

---

### **11. ERROR HANDLING TESTS**

#### **TC-044: Missing notification-system.js**
| Test Case ID | TC-044 |
|--------------|--------|
| **Objective** | Test graceful degradation |
| **Test Steps** | 1. Remove notification-system.js<br>2. Reload page |
| **Expected Result** | - Warning in console<br>- App works without notifications<br>- No JavaScript errors |
| **Priority** | Medium |

#### **TC-045: localStorage Disabled**
| Test Case ID | TC-045 |
|--------------|--------|
| **Objective** | Test without localStorage |
| **Test Steps** | 1. Disable localStorage<br>2. Test notification system |
| **Expected Result** | - Graceful fallback<br>- No crashes<br>- Basic functionality works |
| **Priority** | Low |

#### **TC-046: JavaScript Disabled**
| Test Case ID | TC-046 |
|--------------|--------|
| **Objective** | Test without JavaScript |
| **Test Steps** | 1. Disable JavaScript<br>2. Load page |
| **Expected Result** | - Basic HTML displays<br>- Graceful degradation message |
| **Priority** | Low |

---

## **🎯 Test Execution Priority**

### **Critical (Must Pass)**
- TC-001, TC-003, TC-006, TC-007, TC-012, TC-015, TC-021, TC-035

### **High Priority**  
- TC-002, TC-009, TC-013, TC-016, TC-017, TC-022, TC-029, TC-038, TC-039

### **Medium Priority**
- TC-004, TC-005, TC-008, TC-010, TC-011, TC-014, TC-018-TC-020, TC-023-TC-027, TC-028, TC-030-TC-034, TC-036, TC-037, TC-040, TC-041, TC-044

### **Low Priority**
- TC-026, TC-033, TC-042, TC-043, TC-045, TC-046

---

## **📊 Test Execution Tracking Template**

| Test Case ID | Status | Pass/Fail | Comments | Tester | Date |
|--------------|--------|-----------|----------|---------|------|
| TC-001 | ⏳ Pending | - | - | - | - |
| TC-002 | ⏳ Pending | - | - | - | - |
| ... | ... | ... | ... | ... | ... |

**Status Options**: ⏳ Pending, 🔄 In Progress, ✅ Completed, ❌ Failed, 🚫 Blocked

---

## **🔧 Test Data Setup Script**

```javascript
// Quick test data setup - paste in browser console
const createTestData = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const testEnquiries = [
        {
            id: 9001,
            client_name: 'TEST - Overdue Follow-up',
            client_email: 'overdue@test.com',
            client_phone: '+91 99999 00001',
            manager: 'Test Manager',
            status: 'contacted',
            followup_date: yesterday.toISOString().split('T')[0],
            created_at: new Date().toISOString()
        },
        {
            id: 9002,
            client_name: 'TEST - Due Today',
            client_email: 'today@test.com', 
            client_phone: '+91 99999 00002',
            manager: 'Test Manager',
            status: 'quoted',
            followup_date: today.toISOString().split('T')[0],
            created_at: new Date().toISOString()
        },
        {
            id: 9003,
            client_name: 'TEST - Wedding in 7 Days',
            client_email: 'wedding@test.com',
            client_phone: '+91 99999 00003', 
            manager: 'Test Manager',
            status: 'confirmed',
            wedding_date: sevenDaysFromNow.toISOString().split('T')[0],
            venue: 'Test Venue',
            created_at: new Date().toISOString()
        }
    ];

    // Add to existing data
    testEnquiries.forEach(enquiry => {
        enquiries.unshift(enquiry);
        demoEnquiries.unshift(enquiry);
    });

    // Update displays
    renderEnquiries();
    renderFollowups();
    renderManagers();

    // Update notifications
    if (window.notificationSystem) {
        window.notificationSystem.updateEnquiries(enquiries);
        window.notificationSystem.checkForNotifications();
    }

    console.log('✅ Test data created successfully!');
};

// Run the function
createTestData();
```

This comprehensive test plan covers all aspects of the Wedding Decor Manager application. Would you like me to elaborate on any specific test category or help you set up automated testing for any of these scenarios?