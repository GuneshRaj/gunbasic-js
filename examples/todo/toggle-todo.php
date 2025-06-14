<g-data id="status-message">
    <%
        // In real app, you would:
        // 1. Get todo ID from $_POST['id']
        // 2. Find todo in database
        // 3. Toggle completed status
        // 4. Update database
        // 5. Return success/error status

        var todoId = "123"; // This would come from POST data
        var success = true;
        var newStatus = "completed"; // or "active"
    %>
    
    <% if (success) { %>
        <div class="success">
            ✅ Todo marked as <%= newStatus %>!
        </div>
    <% } else { %>
        <div class="error">
            ❌ Failed to update todo status.
        </div>
    <% } %>
</g-data>

<g-run>
    <% if (success) { %>
        console.log('Todo', '<%= todoId %>', 'toggled to', '<%= newStatus %>');
        
        // Show success message
        var statusMsg = document.getElementById('status-message');
        statusMsg.style.display = 'block';
        
        setTimeout(function() {
            statusMsg.style.display = 'none';
        }, 2000);
        
        // Trigger callback to reload todos
        if (typeof onTodoUpdated === 'function') {
            onTodoUpdated();
        }
    <% } else { %>
        console.log('Failed to toggle todo');
    <% } %>
</g-run>