# GunBasic-JS 3.0

A lightweight, modern AJAX framework with clean HTML attributes and client-side ASP-style templating.

(From https://code.google.com/p/gunbasic-js Around 2008)

v1 - See README-v1.md

v2 - New features with backward compatibility - not included

v3 - with new features and no template backward compatibility.


## Features

- ✅ **Clean HTML Attributes** - Semantic, separate attributes instead of comma-separated values
- ✅ **XML Response Format** - Clean `<g-data>` and `<g-run>` tags instead of HTML comments  
- ✅ **ASP-Style Templating** - Full JavaScript templating power on the client side
- ✅ **Zero Dependencies** - No external libraries required
- ✅ **Lightweight** - Only ~5KB minified
- ✅ **Modern JavaScript** - ES5+ compatible, works in all modern browsers
- ✅ **Multi Element Updates** - Updates Multiple Element ID rather than only 1
- ✅ **Eval JavaScript** - Server Side JS Injection upon Update
- 
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

## JavaScript API

### Core Functions

```javascript
// Manual AJAX call
autoajaxcall(null, 'GET', 'api/data.php', '', onStart, onComplete);

// Toggle element visibility
toggleElement('elementId');

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

### New Format (GunBasic-JS 3.0)
```html
<!-- NEW: Clean separate attributes -->
<button g-get="url" 
        g-args="params"
        g-start="onStart" 
        g-complete="onComplete">Load</button>

<!-- NEW: XML response format -->
<g-data id="elementId">content</g-data>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

GNU General Public License v2

## Author

**Gunesh Raj** - Original creator  
**Updated for 3.0** - Modern features and ASP-style templating

---

**GunBasic-JS 3.0** - Simple, powerful, and elegant AJAX for the modern web.