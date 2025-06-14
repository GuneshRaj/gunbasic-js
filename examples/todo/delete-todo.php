<g-data id="status-message">
    <%
        // In real app, you would:
        // 1. Get todo ID from $_POST['id']
        // 2. Delete from database
        // 3. Return success/error status

        var todoId = "123"; // This would come from POST data
        var success = true;
    %>
    
    <% if (success) { %>
        <div class="success">
            🗑️ Todo deleted successfully!
        </div>
    <% } else { %>
        <div class="error">
            ❌ Failed to delete todo.
        </div>
    <% } %>
</g-data>

<g-run>
    <% if (success) { %>
        console.log('Todo', '<%= todoId %>', 'deleted successfully');
        
        // Show success message
        var statusMsg = document.getElementById('status-message');
        statusMsg.style.display = 'block';
        
        setTimeout(function() {
            statusMsg.style.display = 'none';
        }, 2000);
        
        // Add delete animation to the todo item before reloading
        var todoItem = document.querySelector('[data-id="' + '<%= todoId %>' + '"]');
        if (todoItem) {
            todoItem.style.transition = 'all 0.3s ease';
            todoItem.style.transform = 'translateX(100%)';
            todoItem.style.opacity = '0';
            
            setTimeout(function() {
                if (typeof onTodoUpdated === 'function') {
                    onTodoUpdated();
                }
            }, 300);
        } else {
            // Fallback if item not found
            if (typeof onTodoUpdated === 'function') {
                onTodoUpdated();
            }
        }
    <% } else { %>
        console.log('Failed to delete todo');
    <% } %>
</g-run>