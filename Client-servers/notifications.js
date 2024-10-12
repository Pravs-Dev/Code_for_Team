document.addEventListener("DOMContentLoaded", async () => {
    const userId = getUserId(); // Retrieve the current logged-in user's ID from localStorage
    const notificationsContainer = document.querySelector('.notifications-container');
    const notificationDot = document.querySelector('.notification-dot'); // The red dot element

    // Fetch notifications for the logged-in user
    async function fetchNotifications() {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications?user=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            const notifications = await response.json();

            // If there are no notifications, update the UI accordingly
            if (notifications.length === 0) {
                notificationsContainer.innerHTML = '<p>No new notifications.</p>';
                // Clear notifications from localStorage
                localStorage.removeItem('hasUnreadNotifications');
                notificationDot.style.display = 'none'; // Hide red dot
            } else {
                displayNotifications(notifications);
                console.log(userId);
    
                // Check if there are unread notifications
                const hasUnread = notifications.some(notification => !notification.read);
    
                if (hasUnread) {
                    // Store in localStorage that there are unread notifications
                    localStorage.setItem('hasUnreadNotifications', 'true');
                    notificationDot.style.display = 'block'; // Show the red dot
                } else {
                    // Remove the unread notifications flag from localStorage
                    localStorage.removeItem('hasUnreadNotifications');
                    notificationDot.style.display = 'none'; // Hide the red dot
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    // Display notifications dynamically
    function displayNotifications(notifications) {
        notificationsContainer.innerHTML = ''; // Clear existing notifications
        notifications.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            notificationsContainer.appendChild(notificationElement);
        });
    }

    // Create notification HTML structure
    function createNotificationElement(notification) {
        const notificationDiv = document.createElement('div');
        notificationDiv.classList.add('notification');
        if (notification.read) {
            notificationDiv.classList.add('read');
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('notification-message');
        messageDiv.textContent = notification.message;

        const markReadButton = document.createElement('button');
        markReadButton.classList.add('mark-read-btn');
        markReadButton.textContent = 'Mark as Read';
        markReadButton.setAttribute('data-notification-id', notification._id);
        if (notification.read) {
            markReadButton.disabled = true;
            markReadButton.style.backgroundColor = '#ccc'; // Initial style for already read notifications
        }
        markReadButton.addEventListener('click', () => markAsRead(notification._id));

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.textContent = 'Remove Notification';
        deleteButton.addEventListener('click', () => deleteNotification(notification._id));

        notificationDiv.appendChild(messageDiv);
        notificationDiv.appendChild(markReadButton);
        notificationDiv.appendChild(deleteButton);

        return notificationDiv;
    }

    // Mark a notification as read
    async function markAsRead(notificationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/read/${notificationId}`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
            
            // Update localStorage notifications data
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            const updatedNotifications = notifications.map(notification =>
                notification._id === notificationId ? { ...notification, read: true } : notification
            );
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

            fetchNotifications(); // Refresh notifications after marking as read
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Delete a notification
    async function deleteNotification(notificationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }
            
            // Update localStorage notifications data
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            const updatedNotifications = notifications.filter(notification => notification._id !== notificationId);
            localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

            fetchNotifications(); // Refresh the notifications list
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    // Helper function to get the logged-in user ID
    function getUserId() {
        return localStorage.getItem('userId'); 
    }

    // Fetch notifications on page load
    fetchNotifications();
});
