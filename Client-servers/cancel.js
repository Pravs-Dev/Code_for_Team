document.addEventListener('DOMContentLoaded', () => {
    const student = localStorage.getItem('userId');
    const cancelledSessions = document.getElementById('cancelled-list'); 

    // Fetch only completed sessions for the student
    const getCancelledSessionsByStudent = async (student) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/student/${student}/cancelled`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            displayCancelledSessions(data); 
        } catch (error) {
            console.error('Error:', error);
            cancelledSessions.innerHTML = `<p>No cancelled sessions available</p>`;
        }
    };

    // Display completed sessions with a "Review" button
    const displayCancelledSessions = (sessions) => {
        if (sessions.length === 0) {
            cancelledSessions.innerHTML = '<p>No cancelled sessions found.</p>';
            return;
        }

        sessions.forEach(session => {
            if (session.status === 'Cancelled') { // Only display completed sessions here
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session-completed');
                sessionElement.innerHTML = `
                    <h3>Session: ${session._id}</h3>
                    <p>Date: ${(session.sessionDate).slice(0, 10)}</p>
                    <p>Subject: ${session.subject}</p>
                    <p>Tutor: ${session.tutor.fname} ${session.tutor.lname}</p>
                   <p><strong>Cancellation Reason:</strong> ${session.cancellationReason}</p>
                `;
                cancelledSessions.appendChild(sessionElement);
            }
        });
    };

    

    // Call the function to fetch and display completed sessions for the student
    getCancelledSessionsByStudent(student);
});
