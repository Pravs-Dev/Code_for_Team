document.addEventListener('DOMContentLoaded', () => {
    const student = localStorage.getItem('userId');
    const completedSessions = document.getElementById('completed-list');
    const reviewedSessions = document.getElementById('reviewed-list'); // Element for reviewed sessions

    // Fetch only completed sessions for the student
    const getCompletedAndReviewedSessionsByStudent = async (student) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/student/${student}/completed`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            displayCompletedSessions(data); // Display completed sessions
            displayReviewedSessions(data);   // Display reviewed sessions
        } catch (error) {
            console.error('Error:', error);
            completedSessions.innerHTML = `<p>Error fetching completed sessions: ${error.message}</p>`;
        }
    };

    // Display completed sessions with a "Review" button
    const displayCompletedSessions = (sessions) => {
        if (sessions.length === 0) {
            completedSessions.innerHTML = '<p>No completed sessions found.</p>';
            return;
        }

        sessions.forEach(session => {
            if (session.status === 'Completed') { // Only display completed sessions here
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session-completed');
                sessionElement.innerHTML = `
                    <h3>Session: ${session._id}</h3>
                    <p>Date: ${(session.sessionDate).slice(0, 10)}</p>
                    <p>Subject: ${session.subject}</p>
                    <p>Tutor: ${session.tutor.fname} ${session.tutor.lname}</p>
                    <button class="review-btn" onclick="goToReview('${session._id}', '${session.tutor._id}', '${session.subject}', this)">Review</button>
                `;
                completedSessions.appendChild(sessionElement);
            }
        });
    };

    // Display reviewed sessions with the same structure as completed sessions
    const displayReviewedSessions = (sessions) => {
        if (sessions.length === 0) {
            reviewedSessions.innerHTML = '<p>No reviewed sessions found.</p>';
            return;
        }

        sessions.forEach(session => {
            if (session.status === 'Reviewed') { // Only display reviewed sessions here
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session-reviewed');
                sessionElement.innerHTML = `
                    <h3>Session: ${session._id}</h3>
                    <p>Date: ${(session.sessionDate).slice(0, 10)}</p>
                    <p>Subject: ${session.subject}</p>
                    <p>Tutor: ${session.tutor.fname} ${session.tutor.lname}</p>
                    <button class="review-btn" disabled>Reviewed</button> <!-- Disabled button for reviewed sessions -->
                `;
                sessionElement.style.backgroundColor = '#d4edda'; // Change color to indicate reviewed
                reviewedSessions.appendChild(sessionElement);
            }
        });
    };

    // Redirect to review page with session ID and store tutor ID and subject
    window.goToReview = function (sessionId, tutorId, subject, buttonElement) {
        localStorage.setItem('tutorId', tutorId); // Store the tutor ID
        localStorage.setItem('subject', subject); // Store the subject

        // Change the color of the reviewed session
        const sessionElement = buttonElement.parentElement; // Get the parent session element
        sessionElement.style.backgroundColor = '#d4edda'; // Change color to indicate reviewed
        sessionElement.setAttribute('data-reviewed', 'true'); // Update reviewed status

        window.location.href = `./review.html?sessionId=${sessionId}`;
    };

    // Call the function to fetch and display completed sessions for the student
    getCompletedAndReviewedSessionsByStudent(student);
});