<g-data id="todo-list">
    <%
        // Mock todo data - in real app, this would come from database
        var todos = [
            { id: 1, text: "Learn GunBasic-JS 3.0", completed: true, created: new Date('2024-12-01') },
            { id: 2, text: "Build a todo application", completed: false, created: new Date('2024-12-02') },
            { id: 3, text: "Write documentation", completed: false, created: new Date('2024-12-03') },
            { id: 4, text: "Deploy to production", completed: false, created: new Date('2024-12-04') },
            { id: 5, text: "Celebrate success", completed: false, created: new Date('2024-12-05') }
        ];

        // Get filter from request (in real app, this would come from $_GET)
        var filter = 'all'; // Can be 'all', 'active', 'completed'
        
        // Filter todos based on request
        var filteredTodos = todos;
        if (filter === 'active') {
            filteredTodos = todos.filter(function(todo) { return !todo.completed; });
        } else if (filter === 'completed') {
            filteredTodos = todos.filter(function(todo) { return todo.completed; });
        }

        // Calculate statistics
        var totalTodos = todos.length;
        var completedTodos = todos.filter(function(todo) { return todo.completed; }).length;
        var activeTodos = totalTodos - completedTodos;
        var completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

        function formatDate(date) {
            return date.toLocaleDateString();
        }
    %>

    <% if (filteredTodos.length === 0) { %>
        <div class="empty-state">
            <% if (filter === 'all') { %>
                <h3>🎉 No todos yet!</h3>
                <p>Add your first todo above to get started.</p>
            <% } else if (filter === 'active') { %>
                <h3>✅ All done!</h3>
                <p>No active todos remaining. Great job!</p>
            <% } else { %>
                <h3>📝 No completed todos</h3>
                <p>Complete some todos to see them here.</p>
            <% } %>
        </div>
    <% } else { %>
        <% for (var i = 0; i < filteredTodos.length; i++) { %>
            <% var todo = filteredTodos[i]; %>
            <div class="todo-item <%= todo.completed ? 'completed' : '' %>" data-id="<%= todo.id %>">
                <input type="checkbox" 
                       class="todo-checkbox" 
                       <%= todo.completed ? 'checked' : '' %>
                       onclick="toggleTodo(<%= todo.id %>)">
                
                <div class="todo-text">
                    <%= todo.text %>
                    <div style="font-size: 12px; color: #999; margin-top: 5px;">
                        Created: <%= formatDate(todo.created) %>
                    </div>
                </div>
                
                <div class="todo-actions">
                    <button class="delete-btn" onclick="deleteTodo(<%= todo.id %>)">
                        Delete
                    </button>
                </div>
            </div>
        <% } %>
    <% } %>
</g-data>

<g-data id="todo-stats">
    <%
        // Update statistics display
        var statsHTML = '';
        
        if (totalTodos === 0) {
            statsHTML = 'No todos yet - add one above!';
        } else {
            statsHTML = totalTodos + ' total, ' + activeTodos + ' active, ' + 
                       completedTodos + ' completed (' + completionRate + '% done)';
        }
    %>
    <%= statsHTML %>
</g-data>

<g-run>
    console.log('Todo list loaded - Filter:', '<%= filter %>', 'Count:', <%= filteredTodos.length %>);
    
    // Add smooth animations to todo items
    var todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach(function(item, index) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.3s ease';
        
        setTimeout(function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
</g-run>