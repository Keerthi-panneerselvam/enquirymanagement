# Wedding Decor Inventory Management - Detailed Design

## 🎯 Overview

The Inventory Management system will seamlessly integrate with your existing Wedding Decor Manager to track decorative items, manage stock levels, handle reservations, and provide real-time availability for wedding bookings.

## 📋 Core Features

### 1. **Inventory Catalog Management**
- **Item Categories**: Flowers, Fabrics, Lighting, Props, Furniture, etc.
- **Item Details**: Name, description, category, photos, dimensions, weight
- **Cost Tracking**: Purchase price, rental price, replacement cost
- **Vendor Management**: Supplier information, purchase history
- **Condition Tracking**: New, Good, Fair, Needs Repair, Retired

### 2. **Stock Management**
- **Quantity Tracking**: Total stock, available, reserved, in-use, damaged
- **Location Management**: Warehouse locations, storage zones
- **Minimum Stock Alerts**: Automated notifications when items run low
- **Reorder Management**: Automatic purchase suggestions
- **Batch/Serial Tracking**: For high-value items

### 3. **Reservation & Booking System**
- **Integration with Enquiries**: Link inventory to wedding bookings
- **Availability Calendar**: Visual calendar showing item availability
- **Reservation Management**: Hold items for specific dates
- **Conflict Resolution**: Handle overlapping bookings
- **Automatic Release**: Release expired reservations

### 4. **Logistics & Operations**
- **Delivery Scheduling**: Coordinate item delivery and pickup
- **Maintenance Tracking**: Service schedules, repair history
- **Quality Control**: Inspection checklists, condition reports
- **Usage Analytics**: Track item popularity and utilization

## 🗃️ Database Schema Design

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES inventory_categories(id),
    subcategory TEXT,
    sku TEXT UNIQUE,
    barcode TEXT,
    
    -- Pricing
    purchase_price DECIMAL(10,2),
    rental_price_per_day DECIMAL(10,2),
    replacement_cost DECIMAL(10,2),
    
    -- Physical properties
    dimensions JSONB, -- {length, width, height, unit}
    weight DECIMAL(8,2),
    color TEXT,
    material TEXT,
    
    -- Stock information
    total_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    damaged_quantity INTEGER DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 1,
    
    -- Location & storage
    storage_location TEXT,
    warehouse_zone TEXT,
    
    -- Vendor & sourcing
    vendor_id INTEGER REFERENCES vendors(id),
    purchase_date DATE,
    
    -- Condition & status
    condition TEXT DEFAULT 'new', -- new, good, fair, needs_repair, retired
    status TEXT DEFAULT 'active', -- active, inactive, discontinued
    
    -- Images
    image_urls JSONB DEFAULT '[]'::jsonb,
    
    -- Maintenance
    last_inspection_date DATE,
    next_maintenance_date DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### Inventory Categories Table
```sql
CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id INTEGER REFERENCES inventory_categories(id),
    color_code TEXT DEFAULT '#667eea',
    icon TEXT DEFAULT '📦',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Inventory Reservations Table
```sql
CREATE TABLE inventory_reservations (
    id BIGSERIAL PRIMARY KEY,
    enquiry_id INTEGER REFERENCES enquiries(id),
    item_id INTEGER REFERENCES inventory_items(id),
    
    -- Reservation details
    quantity INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, confirmed, in_use, returned, cancelled
    
    -- Delivery information
    delivery_address TEXT,
    delivery_date DATE,
    pickup_date DATE,
    delivery_instructions TEXT,
    
    -- Pricing
    daily_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Notes
    notes TEXT,
    special_instructions TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### Inventory Transactions Table
```sql
CREATE TABLE inventory_transactions (
    id BIGSERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id),
    transaction_type TEXT NOT NULL, -- purchase, sale, rental, damage, repair, disposal
    
    -- Quantity changes
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    
    -- Financial information
    unit_cost DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    
    -- Related records
    enquiry_id INTEGER REFERENCES enquiries(id),
    reservation_id INTEGER REFERENCES inventory_reservations(id),
    vendor_id INTEGER REFERENCES vendors(id),
    
    -- Transaction details
    transaction_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_number TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);
```

### Vendors Table
```sql
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    
    -- Business details
    vendor_type TEXT, -- supplier, rental_partner, service_provider
    payment_terms TEXT,
    credit_limit DECIMAL(10,2),
    
    -- Performance tracking
    reliability_score INTEGER DEFAULT 5, -- 1-5 scale
    last_order_date DATE,
    total_orders INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 User Interface Design

### 1. **Main Inventory Dashboard**
```
📦 Inventory Overview
├── 📊 Quick Stats Cards
│   ├── Total Items (1,247)
│   ├── Low Stock Alerts (12)
│   ├── Reserved Items (45)
│   └── Available Value (₹8,45,000)
├── 📈 Inventory Charts
│   ├── Stock Levels by Category
│   ├── Item Utilization Trends
│   └── Revenue by Item Type
└── 🔔 Recent Alerts
    ├── Low Stock Notifications
    ├── Maintenance Due Items
    └── Reservation Conflicts
```

### 2. **Inventory Catalog View**
```
🗂️ Inventory Catalog
├── 🔍 Search & Filters
│   ├── Category Filter
│   ├── Availability Filter
│   ├── Price Range
│   ├── Condition Filter
│   └── Location Filter
├── 📋 Items Grid/List View
│   ├── Item Cards with Images
│   ├── Quick Info (Stock, Price, Status)
│   ├── Quick Actions (Reserve, Edit, View)
│   └── Bulk Actions
└── ➕ Add New Item Button
```

### 3. **Item Detail View**
```
📦 Item Details
├── 🖼️ Image Gallery
├── 📝 Basic Information
│   ├── Name, Description, SKU
│   ├── Category, Subcategory
│   ├── Dimensions, Weight
│   └── Condition, Status
├── 💰 Pricing Information
│   ├── Purchase Price
│   ├── Daily Rental Rate
│   └── Replacement Cost
├── 📊 Stock Information
│   ├── Current Stock Levels
│   ├── Availability Calendar
│   └── Reservation History
├── 🏪 Vendor & Sourcing
├── 🔧 Maintenance History
└── 📈 Usage Analytics
```

### 4. **Reservation Management**
```
📅 Reservations
├── 📅 Calendar View
│   ├── Monthly/Weekly/Daily Views
│   ├── Color-coded by Status
│   ├── Drag & Drop Functionality
│   └── Conflict Indicators
├── 📋 Reservation List
│   ├── Filterable by Status
│   ├── Sortable by Date/Client
│   ├── Bulk Actions
│   └── Quick Status Updates
└── 🆕 New Reservation Form
```

### 5. **Integration with Enquiries**
```
💐 Enquiry Details (Enhanced)
├── 📝 Client Information
├── 💰 Pricing & Budget
├── 📦 Inventory Requirements (NEW)
│   ├── Required Items List
│   ├── Quantity Needed
│   ├── Preferred Dates
│   ├── Availability Check
│   ├── Reserve Items Button
│   └── Alternative Suggestions
├── 📅 Timeline & Follow-ups
└── 💬 Notes & Communications
```

## 🔧 Feature Implementation Plan

### Phase 1: Core Inventory Management (Week 1-2)
- [ ] Database schema implementation
- [ ] Basic CRUD operations for inventory items
- [ ] Category management system
- [ ] Stock level tracking
- [ ] Basic inventory dashboard

### Phase 2: Reservation System (Week 3-4)
- [ ] Reservation booking system
- [ ] Availability calendar
- [ ] Integration with enquiries
- [ ] Conflict detection and resolution
- [ ] Automated notifications

### Phase 3: Advanced Features (Week 5-6)
- [ ] Vendor management
- [ ] Maintenance tracking
- [ ] Reporting and analytics
- [ ] Barcode/QR code integration
- [ ] Mobile-optimized interface

### Phase 4: Optimization & Enhancements (Week 7-8)
- [ ] Performance optimization
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Data export/import
- [ ] User training materials

## 🚀 Technical Implementation Strategy

### 1. **Feature Flag Integration**
```javascript
window.FEATURE_FLAGS = {
    NOTIFICATIONS_ENABLED: true,
    INVENTORY_MANAGEMENT: true,  // NEW
    BARCODE_SCANNING: false,     // Future feature
    MOBILE_APP: false,           // Future feature
    ADVANCED_ANALYTICS: false,
    EMAIL_INTEGRATION: false,
    BULK_OPERATIONS: false
};
```

### 2. **New Tab Structure**
```javascript
// Add to existing tabs
const tabs = [
    'enquiries',
    'add-enquiry', 
    'followups',
    'managers',
    'inventory',      // NEW
    'reservations',   // NEW
    'reports'         // NEW
];
```

### 3. **API Integration Points**
```javascript
// New API endpoints needed
const API_ENDPOINTS = {
    // Existing endpoints
    enquiries: '/enquiries',
    
    // New inventory endpoints
    inventory: {
        items: '/inventory/items',
        categories: '/inventory/categories',
        reservations: '/inventory/reservations',
        transactions: '/inventory/transactions',
        vendors: '/vendors',
        availability: '/inventory/availability'
    }
};
```

## 📊 Key Performance Indicators (KPIs)

### Operational KPIs
- **Inventory Turnover**: Times per year each item is used
- **Stock Utilization**: Percentage of inventory actively used
- **Reservation Efficiency**: Successfully fulfilled vs. total reservations
- **Maintenance Costs**: Annual maintenance as % of inventory value

### Financial KPIs
- **Revenue per Item**: Average revenue generated per inventory item
- **Cost of Inventory**: Total carrying cost of inventory
- **Profitability**: Rental income vs. inventory investment
- **Loss Prevention**: Reduction in damaged/lost items

### Customer KPIs
- **Availability Rate**: Percentage of requested items available
- **Booking Fulfillment**: Successfully delivered reservations
- **Customer Satisfaction**: Ratings for inventory quality
- **Repeat Bookings**: Percentage of returning customers

## 🔐 Security & Access Control

### Role-Based Permissions
```javascript
const INVENTORY_PERMISSIONS = {
    ADMIN: ['create', 'read', 'update', 'delete', 'manage_vendors'],
    MANAGER: ['create', 'read', 'update', 'reserve', 'maintain'],
    STAFF: ['read', 'reserve', 'update_status'],
    VIEWER: ['read']
};
```

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Audit Trail**: Complete logging of all inventory changes
- **Backup Strategy**: Daily automated backups
- **Access Logs**: Track all user access and modifications

## 🎛️ Admin Configuration Options

### Inventory Settings
- **Stock Alert Thresholds**: Customizable low stock levels
- **Reservation Rules**: Lead time requirements, cancellation policies
- **Pricing Rules**: Seasonal pricing, bulk discounts
- **Maintenance Schedules**: Automatic maintenance reminders

### Integration Settings
- **Enquiry Workflow**: Automatic inventory checks on new enquiries
- **Notification Preferences**: Which events trigger notifications
- **Report Frequency**: Automated report generation schedule
- **Data Retention**: How long to keep historical data

## 📱 Mobile Considerations

### Responsive Design Features
- **Touch-Friendly Interface**: Large buttons, swipe gestures
- **Offline Capability**: Basic functionality without internet
- **Barcode Scanning**: Use device camera for quick item lookup
- **Photo Capture**: Take photos of items for condition reports

### Mobile-Specific Features
- **Quick Reserve**: Fast reservation booking
- **Inventory Lookup**: Search items while on-site
- **Condition Updates**: Update item condition in the field
- **Delivery Confirmation**: Confirm deliveries and pickups

## 🔄 Data Migration Strategy

### Existing Data Integration
- **Enquiry Mapping**: Link existing enquiries to inventory needs
- **Historical Analysis**: Analyze past enquiries for inventory patterns
- **Client Preferences**: Identify frequently requested items
- **Seasonal Trends**: Understand peak demand periods

### Initial Setup Process
1. **Import Categories**: Set up item categories and subcategories
2. **Bulk Item Entry**: Import existing inventory items
3. **Stock Counts**: Conduct initial physical inventory
4. **Vendor Setup**: Add existing supplier information
5. **Test Reservations**: Create sample bookings for testing

This comprehensive design provides a solid foundation for implementing inventory management that seamlessly integrates with your existing Wedding Decor Manager system.