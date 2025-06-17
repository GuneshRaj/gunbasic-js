# GunBasic-JS 3.6

A lightweight, modern AJAX framework with clean HTML attributes and client-side ASP-style templating.

(From https://code.google.com/p/gunbasic-js Around 2008)

v1 - See README-v1.md

v2 - New features with backward compatibility - not included

v3 - with new features and no template backward compatibility.



## Features

- ✅ **Clean HTML Attributes** - Semantic, separate attributes instead of comma-separated values
- ✅ **XML Response Format** - Clean `<g-data>` and `<g-run>` tags instead of HTML comments  
- ✅ **ASP-Style Templating** - Full JavaScript templating power on the client side
- ✅ **Internal Templates** - Load and process templates from DOM elements with JSON data
- ✅ **SwiftUI-Style UI Components** - Declarative UI building with component chaining
- ✅ **Zero Dependencies** - No external libraries required
- ✅ **Lightweight** - Only ~5KB minified
- ✅ **Modern JavaScript** - ES5+ compatible, works in all modern browsers
- ✅ **Multi Element Updates** - Updates Multiple Element ID rather than only 1
- ✅ **Eval JavaScript** - Server Side JS Injection upon Update

## Quick Start

### 1. Include the Library

```html
<script src="gunbasic-v3.js"></script>
```

### 2. Add Attributes to HTML Elements

```html
<!-- GET Request -->
<button g-get="api/users.php" 
        g-complete="onDataLoaded">
    Load Users
</button>

<!-- POST Request with Data -->
<button g-post="api/login.php" 
        g-args="username=john&password=secret"
        g-start="showLoading" 
        g-complete="hideLoading">
    Login
</button>
```

### 3. Create Server Responses

```html
<!-- Simple response -->
<g-data id="user-list">
    <h3>Users Loaded!</h3>
    <p>Data updated successfully.</p>
</g-data>

<!-- With JavaScript execution -->
<g-data id="result">
    <h3>Operation Complete</h3>
</g-data>

<g-run>
    console.log('Data processed');
    document.title = 'Updated!';
</g-run>
```

That's it! GunBasic handles the rest automatically.

## HTML Attributes Reference

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `g-get="url"` | URL for GET request | `g-get="api/data.php"` |
| `g-post="url"` | URL for POST request | `g-post="api/submit.php"` |
| `g-args="params"` | URL parameters or POST data | `g-args="id=123&format=json"` |
| `g-data="params"` | Alternative to g-args | `g-data="name=John&email=john@example.com"` |
| `g-start="function"` | Function to call when request starts | `g-start="showLoading"` |
| `g-complete="function"` | Function to call when request completes | `g-complete="hideLoading"` |

## Server Response Format

### Basic XML Tags

```html
<!-- Update element content -->
<g-data id="element-id">
    HTML content to insert into element
</g-data>

<!-- Execute JavaScript after DOM updates -->
<g-run>
    JavaScript code to execute
</g-run>
```

### Multiple Updates

```html
<g-data id="header">
    <h1>Welcome John!</h1>
</g-data>

<g-data id="content">
    <p>Your dashboard has been updated.</p>
</g-data>

<g-data id="sidebar">
    <ul>
        <li>5 new messages</li>
        <li>3 pending tasks</li>
    </ul>
</g-data>

<g-run>
    // Execute after all updates
    document.getElementById('header').style.color = 'green';
    console.log('All sections updated');
</g-run>
```

## ASP-Style Templating

### Basic Syntax

| Tag | Purpose | Example |
|-----|---------|---------|
| `<% code %>` | Execute JavaScript (no output) | `<% var name = "John"; %>` |
| `<%= expression %>` | Output expression result | `<%= name %>` |

### Variables and Functions

```html
<g-data id="user-profile">
    <%
        var user = "Alice Smith";
        var age = 28;
        var email = "alice@example.com";
        
        function formatAge(age) {
            return age + " years old";
        }
    %>
    
    <h2>Welcome <%= user %>!</h2>
    <p>Age: <%= formatAge(age) %></p>
    <p>Email: <%= email %></p>
</g-data>
```

### Loops

```html
<g-data id="product-list">
    <%
        var products = ["Laptop", "Mouse", "Keyboard"];
        var prices = [999.99, 25.50, 75.00];
        
        function formatPrice(price) {
            return "$" + price.toFixed(2);
        }
    %>
    
    <h3>Products</h3>
    <table>
        <tr><th>Product</th><th>Price</th></tr>
        <% for (var i = 0; i < products.length; i++) { %>
            <tr>
                <td><%= products[i] %></td>
                <td><%= formatPrice(prices[i]) %></td>
            </tr>
        <% } %>
    </table>
</g-data>
```

### Conditionals

```html
<g-data id="user-status">
    <%
        var userAge = 25;
        var isLoggedIn = true;
        var username = "John";
    %>
    
    <% if (isLoggedIn) { %>
        <h3>Welcome back, <%= username %>!</h3>
        
        <% if (userAge >= 18) { %>
            <p>You have full access to all features.</p>
        <% } else { %>
            <p>Some features require parental consent.</p>
        <% } %>
        
    <% } else { %>
        <h3>Please log in to continue</h3>
    <% } %>
</g-data>
```

### Complex Example

```html
<g-data id="shopping-cart">
    <%
        var cart = [
            { name: "Laptop", price: 999.99, qty: 1 },
            { name: "Mouse", price: 25.50, qty: 2 },
            { name: "Keyboard", price: 75.00, qty: 1 }
        ];
        
        var total = 0;
        
        function formatCurrency(amount) {
            return "$" + amount.toFixed(2);
        }
        
        function calculateItemTotal(item) {
            return item.price * item.qty;
        }
        
        // Calculate total
        for (var i = 0; i < cart.length; i++) {
            total += calculateItemTotal(cart[i]);
        }
        
        var shippingThreshold = 100;
        var freeShipping = total >= shippingThreshold;
    %>
    
    <h3>Shopping Cart</h3>
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Subtotal</th>
        </tr>
        <% for (var i = 0; i < cart.length; i++) { %>
            <% var item = cart[i]; %>
            <tr>
                <td><%= item.name %></td>
                <td><%= formatCurrency(item.price) %></td>
                <td><%= item.qty %></td>
                <td><%= formatCurrency(calculateItemTotal(item)) %></td>
            </tr>
        <% } %>
        <tr style="font-weight: bold;">
            <td colspan="3">Total</td>
            <td><%= formatCurrency(total) %></td>
        </tr>
    </table>
    
    <% if (freeShipping) { %>
        <p style="color: green;">✅ Free shipping included!</p>
    <% } else { %>
        <p>Add <%= formatCurrency(shippingThreshold - total) %> more for free shipping.</p>
    <% } %>
    
    <p>Cart contains <%= cart.length %> different items.</p>
</g-data>
```

## Internal Templating System

GunBasic-JS 3.0 introduces a powerful internal templating system that allows you to define templates within your HTML and populate them with JSON data from API calls.

### Basic Template Loading

**HTML:**
```html
<!-- Define a template anywhere in your DOM -->
<template g-data="user-template" style="display: none;">
    <div class="user-card">
        <h3><%= name %></h3>
        <p>Email: <%= email %></p>
        <p>Department: <%= department %></p>
        <p>Joined: <%= formatDate(joinDate) %></p>
        
        <% if (isActive) { %>
            <span class="badge active">Active</span>
        <% } else { %>
            <span class="badge inactive">Inactive</span>
        <% } %>
    </div>
</template>

<!-- Target element where template will be rendered -->
<div id="user-display"></div>

<!-- Button to load template with API data -->
<button onclick="loadUserTemplate()">Load User Data</button>

<script>
function loadUserTemplate() {
    // Load template with data from API
    loadTemplate('api/user.php', 'user-template', 'user-display', function(data, html) {
        console.log('Template loaded successfully');
        console.log('Data received:', data);
    });
}

// Helper function available in templates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}
</script>
```

**API Response (api/user.php):**
```json
{
    "name": "Sarah Johnson",
    "email": "sarah.johnson@company.com",
    "department": "Engineering",
    "joinDate": "2023-05-15",
    "isActive": true
}
```

### Multiple Templates

```html
<!-- User List Template -->
<div g-data="users-list-template" style="display: none;">
    <h2>Team Members (<%= users.length %>)</h2>
    <div class="user-grid">
        <% for (var i = 0; i < users.length; i++) { %>
            <% var user = users[i]; %>
            <div class="user-card">
                <h4><%= user.name %></h4>
                <p><%= user.role %></p>
                <% if (user.avatar) { %>
                    <img src="<%= user.avatar %>" alt="Avatar" class="avatar">
                <% } %>
            </div>
        <% } %>
    </div>
</div>

<!-- Statistics Template -->
<script type="text/template" id="stats-template">
    <div class="stats-dashboard">
        <div class="stat-card">
            <h3><%= totalUsers %></h3>
            <p>Total Users</p>
        </div>
        <div class="stat-card">
            <h3><%= activeUsers %></h3>
            <p>Active Users</p>
        </div>
        <div class="stat-card">
            <h3><%= Math.round((activeUsers/totalUsers)*100) %>%</h3>
            <p>Activity Rate</p>
        </div>
    </div>
</script>

<div id="users-container"></div>
<div id="stats-container"></div>

<script>
function loadDashboard() {
    // Load multiple templates
    loadTemplate('api/users.php', 'users-list-template', 'users-container');
    loadTemplate('api/stats.php', 'stats-template', 'stats-container');
}
</script>
```

### Template Functions Reference

| Function | Purpose | Parameters |
|----------|---------|------------|
| `loadTemplate(apiUrl, templateId, targetId, onComplete)` | Load template with API data | API URL, template element ID/selector, target element ID, completion callback |
| `loadTemplateUI(apiUrl, uiCode, targetId, onComplete)` | Load SwiftUI-style component with API data | API URL, UI component code, target element ID, completion callback |
| `processUI(uiCode, jsonData)` | Process UI components with data | UI component code, JSON data object |

## SwiftUI-Style UI Components

GunBasic-JS 3.0 introduces a declarative UI system inspired by SwiftUI, allowing you to build interfaces using composable components with method chaining.

### Basic Components

#### Text Components
```javascript
// Simple text
Text("Hello World")

// Styled text
Text("Welcome!")
    .font("title")
    .color("muted")
    .padding("all", 3)

// Dynamic text with data
Text("User: " + userName)
    .font("headline")
```

#### Layout Components
```javascript
// Vertical stack
VStack([
    Text("Header").font("title"),
    Text("Content goes here"),
    Text("Footer").color("muted")
])

// Horizontal stack with alignment
HStack([
    Text("Left"),
    Spacer(),
    Text("Right")
]).justify("between")

// Nested layouts
VStack([
    Text("Dashboard").font("title"),
    HStack([
        Text("Users: 150"),
        Text("Active: 89")
    ]).justify("between")
])
```

### Form Components

#### Text Input
```javascript
// Basic text field
TextField("Username", "username")
    .placeholder("Enter your username")
    .required(true)

// Email input
TextField("Email Address", "email")
    .type("email")
    .placeholder("user@example.com")
    .required(true)

// Text area
TextArea("Description", "description")
    .placeholder("Enter description...")
    .rows(4)
    .required(false)
```

#### Buttons and Actions
```javascript
// Primary button
Button("Save Changes", "saveData")
    .style("primary")
    .size("lg")

// Icon button
Button("Add Item", "addItem")
    .style("success")
    .icon("plus")

// Outline button
Button("Cancel", "cancelAction")
    .style("outline")
```

#### Selection Components
```javascript
// Radio group
RadioGroup("Gender", "gender", ["Male", "Female", "Other"])
    .inline(true)
    .value("Male")

// Select dropdown
Select("Country", "country", [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" }
])
    .placeholder("Choose a country")
    .required(true)

// Checkbox
Checkbox("Subscribe to newsletter", "newsletter", "yes")
    .checked(true)

// Toggle switch
Toggle("Enable notifications", "notifications")
    .checked(false)
```

### Advanced Components

#### Cards and Containers
```javascript
// Basic card
Card("Welcome to our platform!")
    .header("Getting Started")
    .footer("Last updated: Today")

// Card with components
Card()
    .header("User Profile")
    .children([
        Text("John Doe").font("title"),
        Text("Software Engineer"),
        HStack([
            Button("Edit", "editProfile").style("primary"),
            Button("Delete", "deleteProfile").style("danger")
        ])
    ])
```

#### Lists and Data Display
```javascript
// Dynamic list
List(users, "id", function(user) {
    return HStack([
        Text(user.name).font("headline"),
        Spacer(),
        Badge(user.role).style("info")
    ]);
})

// Pagination
Pagination(currentPage, totalPages, "changePage")
    .size("sm")
    .maxVisible(5)
```

#### Interactive Components
```javascript
// Dropdown menu
DropdownMenu("Actions", [
    { label: "Edit", action: "editItem" },
    { label: "Copy", action: "copyItem" },
    { divider: true },
    { label: "Delete", action: "deleteItem" }
])
    .style("primary")

// Alert
Alert("Your changes have been saved successfully!")
    .style("success")
    .dismissible(true)

// Modal
Modal("confirm-modal", "Confirm Action", "Are you sure you want to delete this item?")
    .size("sm")
    .actions([
        Button("Cancel", "closeModal").style("secondary"),
        Button("Delete", "confirmDelete").style("danger")
    ])
```

### Complete UI Example

```javascript
// Define UI component
function createUserDashboard() {
    return VStack([
        // Header
        HStack([
            Text("User Dashboard").font("title"),
            Spacer(),
            Button("Add User", "showAddUserModal")
                .style("success")
                .icon("plus")
        ]).justify("between"),
        
        // Stats cards
        HStack([
            Card()
                .children([
                    Text(totalUsers.toString()).font("title"),
                    Text("Total Users").color("muted")
                ])
                .textAlign("center"),
            Card()
                .children([
                    Text(activeUsers.toString()).font("title"),
                    Text("Active Users").color("muted")
                ])
                .textAlign("center"),
            Card()
                .children([
                    Text(Math.round((activeUsers/totalUsers)*100) + "%").font("title"),
                    Text("Activity Rate").color("muted")
                ])
                .textAlign("center")
        ]),
        
        // User list
        Card()
            .header("Recent Users")
            .children([
                List(users, "id", function(user) {
                    return HStack([
                        VStack([
                            Text(user.name).font("headline"),
                            Text(user.email).color("muted")
                        ]),
                        Spacer(),
                        VStack([
                            Badge(user.role).style("info"),
                            HStack([
                                Button("Edit", function() { editUser(user.id); }).style("outline").size("sm"),
                                Button("Delete", function() { deleteUser(user.id); }).style("danger").size("sm")
                            ])
                        ])
                    ]);
                })
            ])
    ]);
}

// Load with API data
loadTemplateUI('api/dashboard.php', `
    return createUserDashboard();
`, 'dashboard-container');
```

### UI Component API Reference

#### Layout Components
- `VStack(children)` - Vertical stack layout
- `HStack(children)` - Horizontal stack layout with `.justify()` modifier
- `Spacer()` - Flexible spacer element

#### Text Components
- `Text(content)` - Text display with `.font()`, `.color()`, `.padding()` modifiers

#### Form Components
- `TextField(label, binding)` - Text input with `.placeholder()`, `.type()`, `.required()`, `.value()` modifiers
- `TextArea(label, binding)` - Multi-line text input with `.rows()`, `.placeholder()` modifiers
- `Button(label, action)` - Button with `.style()`, `.size()`, `.icon()` modifiers
- `Select(label, binding, options)` - Dropdown select with `.placeholder()`, `.multiple()`, `.required()` modifiers
- `RadioGroup(label, binding, options)` - Radio button group with `.inline()`, `.value()` modifiers
- `Checkbox(label, binding, value)` - Checkbox with `.checked()`, `.disabled()` modifiers
- `Toggle(label, binding)` - Toggle switch with `.checked()`, `.disabled()` modifiers

#### Display Components
- `Card(content)` - Card container with `.header()`, `.footer()`, `.children()` modifiers
- `Badge(content)` - Badge/tag with `.style()`, `.pill()` modifiers
- `Alert(content)` - Alert message with `.style()`, `.dismissible()` modifiers
- `List(data, keyPath, itemBuilder)` - Dynamic list rendering

#### Interactive Components
- `Modal(id, title, content)` - Modal dialog with `.size()`, `.actions()`, `.children()` modifiers
- `DropdownMenu(label, items)` - Dropdown menu with `.style()`, `.size()` modifiers
- `Pagination(currentPage, totalPages, onPageChange)` - Pagination with `.size()`, `.maxVisible()` modifiers

## JavaScript API

### Core Functions

```javascript
// Manual AJAX call
autoajaxcall(null, 'GET', 'api/data.php', '', onStart, onComplete);

// Toggle element visibility
toggleElement('elementId');

// Template functions
loadTemplate(apiUrl, templateId, targetId, onComplete);
loadTemplateUI(apiUrl, uiCode, targetId, onComplete);
processUI(uiCode, jsonData);

// Access GunBasic object directly
GunBasic.parseASPTags(content);  // Process ASP tags
GunBasic.glog(message);          // Debug logging
```

### Callback Functions

```javascript
function showLoading() {
    document.getElementById('spinner').style.display = 'block';
}

function hideLoading() {
    document.getElementById('spinner').style.display = 'none';
}

function onDataLoaded() {
    console.log('Data loaded successfully');
    hideLoading();
    // Add animations, notifications, etc.
}
```

## Examples

### User Authentication

**HTML:**
```html
<form>
    <input type="text" id="username" placeholder="Username">
    <input type="password" id="password" placeholder="Password">
    <button type="button" 
            g-post="auth/login.php" 
            g-args="" 
            g-start="showLoading" 
            g-complete="onLoginComplete">
        Login
    </button>
</form>

<div id="login-result"></div>

<script>
function gatherLoginData() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    return 'username=' + encodeURIComponent(username) + 
           '&password=' + encodeURIComponent(password);
}

// Update g-args with form data before sending
document.querySelector('[g-post]').addEventListener('click', function() {
    this.setAttribute('g-args', gatherLoginData());
});
</script>
```

**Server Response:**
```html
<g-data id="login-result">
    <% 
        var loginSuccess = true; // This would come from server logic
        var username = "john_doe";
        var lastLogin = new Date();
    %>
    
    <% if (loginSuccess) { %>
        <div style="color: green; padding: 10px; border: 1px solid green;">
            <h3>✅ Login Successful!</h3>
            <p>Welcome back, <%= username %>!</p>
            <p>Last login: <%= lastLogin.toLocaleString() %></p>
        </div>
    <% } else { %>
        <div style="color: red; padding: 10px; border: 1px solid red;">
            <h3>❌ Login Failed</h3>
            <p>Invalid username or password.</p>
        </div>
    <% } %>
</g-data>

<g-run>
    <% if (loginSuccess) { %>
        // Redirect to dashboard after successful login
        setTimeout(function() {
            window.location.href = '/dashboard';
        }, 2000);
    <% } %>
</g-run>
```

### Dynamic Data Loading

**HTML:**
```html
<button g-get="api/sales-report.php" 
        g-args="year=2024&format=detailed"
        g-start="showLoading" 
        g-complete="hideLoading">
    Load Sales Report
</button>

<div id="sales-dashboard"></div>
```

**Server Response:**
```html
<g-data id="sales-dashboard">
    <%
        var salesData = [
            { month: "Jan", sales: 15420, target: 15000 },
            { month: "Feb", sales: 18750, target: 16000 },
            { month: "Mar", sales: 22100, target: 18000 },
            { month: "Apr", sales: 19800, target: 17000 }
        ];
        
        var totalSales = 0;
        var totalTarget = 0;
        
        for (var i = 0; i < salesData.length; i++) {
            totalSales += salesData[i].sales;
            totalTarget += salesData[i].target;
        }
        
        var overallPerformance = ((totalSales / totalTarget) * 100).toFixed(1);
        
        function formatCurrency(amount) {
            return "$" + amount.toLocaleString();
        }
        
        function getPerformanceColor(sales, target) {
            var percentage = (sales / target) * 100;
            if (percentage >= 110) return "green";
            if (percentage >= 90) return "orange";
            return "red";
        }
    %>
    
    <h2>📊 Sales Dashboard - 2024</h2>
    
    <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Overall Performance: <%= overallPerformance %>%</h3>
        <p>Total Sales: <%= formatCurrency(totalSales) %></p>
        <p>Total Target: <%= formatCurrency(totalTarget) %></p>
    </div>
    
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr style="background: #f0f0f0;">
            <th style="padding: 10px;">Month</th>
            <th style="padding: 10px;">Sales</th>
            <th style="padding: 10px;">Target</th>
            <th style="padding: 10px;">Performance</th>
        </tr>
        <% for (var i = 0; i < salesData.length; i++) { %>
            <% 
                var month = salesData[i];
                var performance = ((month.sales / month.target) * 100).toFixed(1);
                var color = getPerformanceColor(month.sales, month.target);
            %>
            <tr>
                <td style="padding: 10px;"><%= month.month %></td>
                <td style="padding: 10px;"><%= formatCurrency(month.sales) %></td>
                <td style="padding: 10px;"><%= formatCurrency(month.target) %></td>
                <td style="padding: 10px; color: <%= color %>; font-weight: bold;">
                    <%= performance %>%
                    <% if (month.sales >= month.target) { %>
                        ✅
                    <% } else { %>
                        ❌
                    <% } %>
                </td>
            </tr>
        <% } %>
    </table>
</g-data>

<g-run>
    console.log('Sales dashboard loaded');
    
    // Add some interactive effects
    var table = document.querySelector('#sales-dashboard table');
    if (table) {
        var rows = table.querySelectorAll('tr');
        for (var i = 1; i < rows.length; i++) { // Skip header
            rows[i].addEventListener('mouseover', function() {
                this.style.backgroundColor = '#f0f8ff';
            });
            rows[i].addEventListener('mouseout', function() {
                this.style.backgroundColor = '';
            });
        }
    }
</g-run>
```

## Framework Comparison: GunBasic-JS vs HTMX, What to consider before choosing the frameworks.

Both frameworks aim to enhance HTML with dynamic capabilities, but they take different approaches:

### Philosophy and Architecture

**GunBasic-JS:**
- Emphasizes ASP-style server-side templating with client-side processing
- Provides SwiftUI-inspired declarative UI components
- Uses JSON API responses processed through internal templates
- XML-based response format (`<g-data>`, `<g-run>`)
- More opinionated about UI structure and data binding

**HTMX:**
- Focuses on extending HTML with hypermedia attributes
- Server returns complete HTML fragments
- Emphasizes REST/hypermedia principles
- Uses standard HTTP responses
- Framework-agnostic approach

### Syntax Comparison

**HTMX Approach:**
```html
<button hx-post="/clicked" 
        hx-target="#result" 
        hx-swap="innerHTML">
    Click Me
</button>
```

**GunBasic-JS Approach:**
```html
<button g-post="api/clicked.php" 
        g-complete="onComplete">
    Click Me
</button>
```

### Data Handling

**HTMX:**
- Server returns HTML directly
- Minimal client-side data processing
- Form serialization handled automatically
- Uses HTML form data or JSON

**GunBasic-JS:**
- Server returns JSON data
- Rich client-side templating with ASP syntax
- Manual data binding and processing
- Internal template system for reusable components

### UI Development

**HTMX:**
- Relies on server-generated HTML
- CSS frameworks for styling
- Limited client-side UI abstraction

**GunBasic-JS:**
- SwiftUI-style component system
- Declarative UI building with method chaining
- Built-in Bootstrap integration
- Client-side component composition

### Use Cases

**Choose HTMX when:**
- Building traditional server-rendered applications
- Working with existing backend frameworks
- Preferring hypermedia-driven architecture
- Wanting minimal JavaScript complexity
- Building content-heavy applications

**Choose GunBasic-JS when:**
- Building data-driven dashboards
- Needing rich client-side templating
- Preferring component-based UI development
- Working with JSON APIs
- Building single-page-like experiences
- Wanting SwiftUI-style declarative syntax

### Learning Curve

**HTMX:**
- Lower learning curve for HTML/CSS developers
- Familiar REST concepts
- Minimal JavaScript knowledge required

**GunBasic-JS:**
- Moderate learning curve
- Requires JavaScript and templating knowledge
- More concepts to master (ASP syntax, UI components)

### Performance

**HTMX:**
- Minimal JavaScript overhead
- Server does heavy lifting
- Network transfers HTML content

**GunBasic-JS:**
- Slightly larger client-side footprint
- Client-side template processing
- Network transfers JSON data (typically smaller)

### Community and Ecosystem

**HTMX:**
- Larger, more active community
- Extensive documentation and examples
- Strong momentum in web development

**GunBasic-JS:**
- Smaller community
- Legacy framework with modern updates
- Focused on specific use cases

Both frameworks are valuable tools depending on your project requirements, team expertise, and architectural preferences.

## Browser Support

- ✅ Chrome 30+
- ✅ Firefox 25+ 
- ✅ Safari 8+
- ✅ Edge 12+
- ✅ Internet Explorer 9+ (with polyfills)

## Migration from GunBasic-JS 2.0

### Old Format (No longer supported)
```html
<!-- OLD: Comma-separated attributes -->
<button g-get="url,params,onStart,onComplete">Load</button>

<!-- OLD: HTML comment responses -->
<!-- [SGUN:] -->elementId|<!-- [EGUN:] -->
<!-- [SGUN:elementId] -->content<!-- [EGUN:elementId] -->
```

