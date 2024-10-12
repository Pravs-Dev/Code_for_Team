document.addEventListener('DOMContentLoaded', () => {
    const tutor = localStorage.getItem('userId');

    const pendingSessions = document.getElementById('pending-list');
    const upcomingSessions = document.getElementById('confirmed-list');
    const completedSessions = document.getElementById('completed-list');
    const cancelledSessions = document.getElementById('cancelled-list');

    // Get All Sessions of a tutor
    const getAllSessionsByTutor = async (tutor) => {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/tutor/${tutor}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            console.log(data);
            displaySessions(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const displaySessions = (sessions) => {
        sessions.forEach(session => {
            const sessionsElement = document.createElement('form');
            sessionsElement.classList.add('session-highlighted');
            sessionsElement.innerHTML = `
                <h3>Session: ${session._id}</h3>
                <label for="sessionDate">Date: </label>
                <input id="sessionDate" class="date" type="date" value="${(session.sessionDate).slice(0, 10)}"></input>
                <div class="info">
                    <h4>${session.subject}</h4>
                    <label for="sessionTime">Time: </label>
                    <input id="sessionTime" type="time" value="${session.sessionTime}"></input>
                    <p>Student: ${session.student.fname + ' ' + session.student.lname}</p>
                    <input type="hidden" id="studentId" value="${session.student._id}">
                    <p>Session Type: ${session.meetingType}</p>
                </div>
            `;

            // Handling Online Confirmed Sessions First
            if (session.meetingType === "Online" && session.status === "Confirmed") {
                sessionsElement.innerHTML += `
                    <input id="virtualLink${session._id}" placeholder="Enter virtual link"></input>
                    <button class="virtual-btn" type="button" onclick="sendVirtualLink(this)">Send link</button>
                    <button class="confirm-btn" onclick="cancelBooking(this)">Cancel</button>
                    <button class="modify-btn" onclick="modifyBooking(this)">Modify</button>
                    <button class="complete-btn" onclick="completeBooking(this)">Complete</button>
                `;
                upcomingSessions.appendChild(sessionsElement);
            }
            // Handle Scheduled Sessions
            else if (session.status === "Scheduled" && pendingSessions) {
                sessionsElement.innerHTML += `
                    <input id="location${session._id}" placeholder="Enter meeting location"></input>
                    <button class="confirm-btn" onclick="confirmBooking(this)">Confirm</button>
                    <button class="modify-btn" onclick="modifyBooking(this)">Modify</button>
                `;
                pendingSessions.appendChild(sessionsElement);
            }
            // Handle General Confirmed Sessions
            else if (session.status === "Confirmed" && upcomingSessions) {
                sessionsElement.innerHTML += `
                    <input id="reason${session._id}" placeholder="Reason for cancellation"></input>
                    <button class="confirm-btn" onclick="cancelBooking(this)">Cancel</button>
                    <button class="modify-btn" onclick="modifyBooking(this)">Modify</button>
                    <button class="complete-btn" onclick="completeBooking(this)">Complete</button>
                `;
                upcomingSessions.appendChild(sessionsElement);
            }
            // Handle Completed Sessions
            else if (session.status === "Completed" && completedSessions) {
                sessionsElement.innerHTML += `<button class="delete-btn" onclick="deleteBooking(this)">Delete</button>`;
                completedSessions.appendChild(sessionsElement);
            }
            // Handle Cancelled Sessions
            else if (session.status === "Cancelled" && cancelledSessions) {
                sessionsElement.innerHTML += `
                    <p>Cancellation Reason: ${session.cancellationReason}</p>
                    <button class="delete-btn" onclick="deleteBooking(this)">Delete</button>
                `;
                cancelledSessions.appendChild(sessionsElement);
            }
        });
    }

    getAllSessionsByTutor(tutor);
});

// Function to send virtual link
function sendVirtualLink(button) {
    const sessionElement = button.closest('form');
    const sessionId = sessionElement.querySelector('h3').textContent.split(': ')[1].trim();
    const videoConferenceUrl = sessionElement.querySelector(`#virtualLink${sessionId}`).value.trim();
    const studentId = sessionElement.querySelector('#studentId').value.trim();
    const scheduledDate = sessionElement.querySelector('#sessionDate').value.trim();
    const scheduledTime = sessionElement.querySelector('#sessionTime').value.trim();
    const tutorId = localStorage.getItem('userId');
    const notes = "Looking forward to our session!";

    // Validate required fields before sending
    if (!videoConferenceUrl || !studentId || !scheduledDate || !scheduledTime || !tutorId) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Required Fields',
            text: 'Please ensure all fields are filled in before sending the link.',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Log the values to debug
    console.log({
        tutorId,
        studentId,
        scheduledDate: scheduledDate,
        scheduledTime: scheduledTime,
        videoConferenceUrl,
        notes,
    });

    // Prepare the payload
    const payload = {
        tutorId,
        studentId,
        scheduledDate: new Date(scheduledDate).toISOString(),
        scheduledTime: new Date(`${scheduledDate}T${scheduledTime}`).toISOString(),
        videoConferenceUrl,
        notes,
    };

    // Send the payload with the POST request
    fetch(`${API_BASE_URL}/virtualtutoring`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Virtual Tutoring Link Sent:', data);
        Swal.fire({
            icon: 'success',
            title: 'Virtual link sent',
            text: 'Virtual link has been sent and stored successfully.',
            confirmButtonText: 'OK',
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Failed to send virtual link',
            text: 'Failed to send the virtual link. ' + error.message,
            confirmButtonText: 'OK',
        });
    });
}


// Function to complete a booking
function completeBooking(button) {
    const id = button.parentElement.querySelector('h3').textContent.split(':')[1].trim();
    
    fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Completed' })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload(); // Optionally, reload the page to update the session list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to modify a booking
function modifyBooking(button) {
    const id = button.parentElement.querySelector('h3').textContent.split(':')[1].trim();
    const newDate = button.parentElement.querySelector('#sessionDate').value;
    const newTime = button.parentElement.querySelector('#sessionTime').value;

    fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionDate: newDate, sessionTime: newTime })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload(); // Optionally, reload the page to see the changes
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to confirm a booking
function confirmBooking(button) {
    const sessionElement = button.closest('form');
    const sessionId = sessionElement.querySelector('h3').textContent.split(': ')[1].trim();
    const locationInput = sessionElement.querySelector(`#location${sessionId}`);
    let locationMessage = locationInput ? locationInput.value.trim() : ''; // Get location if it's in-person
    const meetingType = sessionElement.querySelector('p').textContent.split(': ')[1].trim(); // Get meeting type

    // For in-person sessions, validate the location field
    if (meetingType === "In-Person" && !locationMessage) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Required Field',
            text: 'Please enter the meeting location for in-person sessions.',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Prepare the payload with location and status
    const payload = {
        status: 'Confirmed'
    };
    if (locationMessage) {
        payload.locationMessage = locationMessage; // Include location only for in-person sessions
    }

    // Update the booking with the location (if applicable) and confirmation status
    fetch(`${API_BASE_URL}/bookings/${sessionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload) // Send status and possibly location
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload(); // Optionally, reload the page to see the changes
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// Function to delete a booking
function deleteBooking(button) {
    const id = button.parentElement.querySelector('h3').textContent.split(':')[1].trim();
    
    fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload(); // Reload to refresh the list
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to cancel a booking
function cancelBooking(button) {
    const id = button.parentElement.querySelector('h3').textContent.split(':')[1].trim();
    const reason = button.parentElement.querySelector(`#reason${id}`).value;
    
    fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Cancelled', cancellationReason: reason })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload(); // Reload the page
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
