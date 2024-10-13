document.addEventListener('DOMContentLoaded', () => {
    const student = localStorage.getItem('userId');
    const confirmedSessions = document.getElementById('confirmed-list'); // Changed ID for confirmed list

    // Fetch only confirmed sessions for the student
    const getConfirmedSessionsByStudent = async (student) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/student/${student}/confirmed`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            displayConfirmedSessions(data); // Call the function to display confirmed sessions
        } catch (error) {
            console.error('Error:', error);
            confirmedSessions.innerHTML = `<p>No confirmed sessions available</p>`;
        }
    };

    // Display confirmed sessions
    const displayConfirmedSessions = (sessions) => {
        if (sessions.length === 0) {
            confirmedSessions.innerHTML = '<p>No confirmed sessions found.</p>';
            return;
        }

        sessions.forEach(session => {
            if (session.status === 'Confirmed') { // Only display confirmed sessions here
                const sessionElement = document.createElement('div');
                sessionElement.classList.add('session-confirmed'); // Change class name for confirmed sessions
                sessionElement.innerHTML = `
                  <h3>${session.subject}</h3>
                  <div class="session-info">
                    <p class="session-date">${(session.sessionDate).slice(0, 10)}</p>
                    <p class="session-time">${session.sessionTime}</p>
                   </div>
                   <p class="session-tutor">Tutor: ${session.tutor.fname} ${session.tutor.lname}</p>  
                    <span class="hint">Click for location</span>    
                `;
                sessionElement.addEventListener('click', () => {
                    // Show swal popup with locationMessage
                    Swal.fire({
                        title: "Meeting Location",
                        text: session.locationMessage || "Location details not available",
                        icon: "info",
                        button: "Close",
                    });
                });
                confirmedSessions.appendChild(sessionElement);      
            }
        });
    };

    // Call the function to fetch and display confirmed sessions for the student
    getConfirmedSessionsByStudent(student);
});
