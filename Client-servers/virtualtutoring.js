// Function to get the virtual tutoring session details
function getVirtualTutoringSession() {
    const studentId = localStorage.getItem('userId'); // Retrieve the student ID from local storage
    const apiUrl = `${API_BASE_URL}/virtualtutoring/student/${studentId}`; // Set your API endpoint

    // Check if the studentId exists in local storage
    if (!studentId) {
        console.error('Student ID not found in local storage.');
        document.getElementById('session-date').textContent = 'No session found.';
        document.getElementById('session-time').textContent = '';
        document.getElementById('session-tutor').textContent = '';
        document.getElementById('session-link').style.display = 'none'; // Hide the link
        return;
    }

    // Fetch session details from the API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            console.log(data); // Log the data for debugging
            if (data && data.length > 0) {
                const session = data[0]; // Assuming you get an array and taking the first session

                // Update the session details in the HTML
                document.getElementById('session-date').textContent = session.scheduledDate;
                document.getElementById('session-time').textContent = session.scheduledTime;

                // Access tutor's first and last name and update them separately
                const tutorFirstName = session.tutorId?.fname || 'Unknown';
                const tutorLastName = session.tutorId?.lname || 'Tutor';
                document.getElementById('session-tutor').textContent = `${tutorFirstName} ${tutorLastName}`;
                
                // Set up the session link and display it
                const sessionLink = document.getElementById('session-link');
                sessionLink.href = session.videoConferenceUrl;
                sessionLink.target = '_blank'; // Open the link in a new tab
                sessionLink.style.display = 'block'; // Show the link if it was hidden

                // Store session ID for deletion on return
                sessionLink.addEventListener('click', () => {
                    localStorage.setItem('sessionIdToDelete', session._id);
                });
            } else {
                console.log('No session found for this student.');
                document.getElementById('session-date').textContent = 'No session found.';
                document.getElementById('session-time').textContent = '';
                document.getElementById('session-tutor').textContent = '';
                document.getElementById('session-link').style.display = 'none'; // Hide the link
            }
        })
        .catch(error => {
            console.error('Error fetching virtual tutoring session:', error);
            document.getElementById('session-date').textContent = 'no meeting available';
            document.getElementById('session-time').textContent = 'no meeting available';
            document.getElementById('session-tutor').textContent = 'no meeting available';
            document.getElementById('session-link').style.display = 'none'; // Hide the link
        });
}

// Function to delete the virtual tutoring session
function deleteVirtualTutoringSession(sessionId) {
    const deleteUrl = `${API_BASE_URL}/virtualtutoring/${sessionId}`; // API endpoint for deleting the session

    // Send DELETE request to remove the session
    fetch(deleteUrl, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(() => {
            console.log('Session successfully deleted.');
            localStorage.removeItem('sessionIdToDelete'); // Clean up local storage after deletion
        })
        .catch(error => {
            console.error('Error deleting the virtual tutoring session:', error);
        });
}

// Detect when the user returns to the page
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        const sessionId = localStorage.getItem('sessionIdToDelete');
        if (sessionId) {
            deleteVirtualTutoringSession(sessionId);
        }
    }
});

// Call the function to fetch session details on page load
window.onload = getVirtualTutoringSession;
