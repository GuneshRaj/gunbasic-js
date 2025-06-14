<g-data id="status-message">
    <%
        // In real app, you would:
        // 1. Get todo text from $_POST['todo']
        // 2. Validate and sanitize input
        // 3. Insert into database
        // 4. Return success/error status

        var todoText = "Sample Todo"; // This would come from POST data
        var success = true; // This would be the result of database operation
        var newTodoId = Math.floor(Math.random() * 1000) + 100; // Mock ID
    %>
    
    <% if (success) { %>
        <div class="success">
            ✅ Todo "<%= todoText %>" added successfully! (ID: <%= newTodoId %>)
        </div>
    <% } else { %>
        <div class="error">
            ❌ Failed to add todo. Please try again.
        </div>
    <% } %>
</g-data>

<g-run>
    <% if (success) { %>
        console.log('Todo added successfully:', '<%= todoText %>');
        
        // Show success message temporarily
        var statusMsg = document.getElementById('status-message');
        statusMsg.style.display = 'block';
        
        setTimeout(function() {
            statusMsg.style.display = 'none';
        }, 3000);
        
        // Trigger onTodoAdded callback
        if (typeof onTodoAdded === 'function') {
            onTodoAdded();
        }
    <% } else { %>
        console.log('Failed to add todo');
        
        if (typeof onTodoAddError === 'function') {
            onTodoAddError();
        }
    <% } %>
</g-run>