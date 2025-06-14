<g-data id="status-message">
    <%
        // In real app, you would:
        // 1. Delete all completed todos from database
        // 2. Return count of deleted todos
        // 3. Return success/error status

        var deletedCount = 3; // Number of completed todos deleted
        var success = true;
    %>
    
    <% if (success) { %>
        <div class="success">
            🧹 Cleared <%= deletedCount %> completed todo<%= deletedCount === 1 ? '' : 's' %>!
        </div>
    <% } else { %>
        <div class="error">
            ❌ Failed to clear completed todos.
        </div>
    <% } %>
</g-data>

<g-run>
    <% if (success) { %>
        console.log('Cleared', <%= deletedCount %>, 'completed todos');
        
        // Show success message
        var statusMsg = document.getElementById('status-message');
        statusMsg.style.display = 'block';
        
        setTimeout(function() {
            statusMsg.style.display = 'none';
        }, 3000);
        
        // Add animation effect - fade out completed items
        var completedItems = document.querySelectorAll('.todo-item.completed');
        var animationPromises = [];
        
        completedItems.forEach(function(item, index) {
            var promise = new Promise(function(resolve) {
                setTimeout(function() {
                    item.style.transition = 'all 0.3s ease';
                    item.style.transform = 'scale(0.8)';
                    item.style.opacity = '0';
                    
                    setTimeout(resolve, 300);
                }, index * 100);
            });
            animationPromises.push(promise);
        });
        
        // Wait for all animations to complete, then reload
        Promise.all(animationPromises).then(function() {
            if (typeof onTodosCleared === 'function') {
                onTodosCleared();
            }
        });
        
        // Fallback in case Promise is not supported
        setTimeout(function() {
            if (typeof onTodosCleared === 'function') {
                onTodosCleared();
            }
        }, 1000);
        
    <% } else { %>
        console.log('Failed to clear completed todos');
    <% } %>
</g-run>