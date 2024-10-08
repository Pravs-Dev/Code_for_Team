document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = './login.html';
    } else {
        fetchTutors();

        // Attach event listener to the search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', filterTSections);

        // Attach event listener to the toggle button
        const toggleTutorsBtn = document.getElementById('toggleTutorsBtn');
        let showingFilteredTutors = true; // Initially showing filtered tutors

        toggleTutorsBtn.addEventListener('click', () => {
            showingFilteredTutors = !showingFilteredTutors;
            fetchTutors(showingFilteredTutors);
            
            // Update button text
            toggleTutorsBtn.textContent = showingFilteredTutors ? 'Show All Tutors' : 'Show Tutors by Subject';
        });
    }
});

async function fetchTutors(showingFilteredTutors = true) {
    const token = localStorage.getItem('token');
    const storedCourses = localStorage.getItem('courses'); // Retrieve courses from local storage

    try {
        const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            let tutors;
            if (showingFilteredTutors) {
                // Filter tutors based on role and subjects that match stored courses
                tutors = data.filter(user => 
                    user.role === 'tutor' && 
                    user.subjects.some(subject => storedCourses.includes(subject))
                );
            } else {
                // Show all tutors
                tutors = data.filter(user => user.role === 'tutor');
            }

            // Display the filtered or all tutors
            displayTutors(tutors, token);
        } else {
            console.error('Failed to fetch tutors');
        }
    } catch (error) {
        console.error('Error fetching tutors:', error);
    }
}

async function displayTutors(tutors, token) {
    const tutorList = document.getElementById('tutor-list');
    tutorList.innerHTML = ''; // Clear the list before displaying new tutors

    const defaultProfilePicture = './Icons/profile2.jpg'; // Path to the default profile picture

    for (const tutor of tutors) {
        const tutorElement = document.createElement('div');
        tutorElement.className = 'tutor-card';

        let profilePicture = defaultProfilePicture;

        // Attempt to fetch the tutor's profile picture
        try {
            const imageResponse = await fetch(`${API_BASE_URL}/users/${tutor._id}/profile-picture`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                profilePicture = URL.createObjectURL(blob); // Create a URL from the blob
            }
        } catch (error) {
            console.error(`Error fetching profile picture for ${tutor.fname} ${tutor.lname}:`, error);
        }

        // Render tutor details
        tutorElement.innerHTML = `
            <img src="${profilePicture}" alt="${tutor.fname} ${tutor.lname}" class="tutor-image">
            <div class="tutor-details">
                <h3>${tutor.fname} ${tutor.lname}</h3>
                <p>${tutor.email}</p>
                <p><strong>Subjects:</strong> ${tutor.subjects.join(', ')}</p>
                <p><strong>Qualifications:</strong> ${tutor.qualifications.join(', ')}</p>
            </div>
        `;

        // Add click event listener to open the tutor profile page
        tutorElement.addEventListener('click', () => {
            // Save selected tutor data to localStorage
            localStorage.setItem('selectedTutor', JSON.stringify(tutor));

            // Navigate to the tutor profile page
            window.location.href = './TutorDetails.html';
        });

        tutorList.appendChild(tutorElement);
    }
}

function filterTSections() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const tutorCards = document.getElementsByClassName('tutor-card'); // Update to target tutor cards

    for (let i = 0; i < tutorCards.length; i++) {
        const tutorName = tutorCards[i].querySelector('h3').innerText.toLowerCase();
        const tutorEmail = tutorCards[i].querySelector('p').innerText.toLowerCase(); // Adjust index if necessary
        const tutorSubjects = tutorCards[i].querySelectorAll('p')[1].innerText.toLowerCase(); // Adjust index if necessary
        const tutorQualifications = tutorCards[i].querySelectorAll('p')[2].innerText.toLowerCase(); // Adjust index if necessary

        // Check if any of the tutor details match the input
        tutorCards[i].style.display = (
            tutorName.includes(input) ||
            tutorEmail.includes(input) ||
            tutorSubjects.includes(input) ||
            tutorQualifications.includes(input)
        ) ? '' : 'none'; // Show/hide the card
    }
}


// TutorDetails.js
document.addEventListener('DOMContentLoaded', async function () {
    const token = localStorage.getItem('token');
    const selectedTutor = JSON.parse(localStorage.getItem('selectedTutor'));

    // Populate tutor details on the profile page
    document.getElementById('profile-name').textContent = `${selectedTutor.fname} ${selectedTutor.lname}`;
    document.getElementById('profile-email').innerHTML = `${selectedTutor.email}`;
    document.getElementById('profile-subjects').innerHTML = `<strong>Subjects:</strong> ${selectedTutor.subjects.join(', ')}`;
    document.getElementById('profile-qualifications').innerHTML = `<strong>Qualifications:</strong> ${selectedTutor.qualifications.join(', ')}`;

    // Fetch and display tutor's profile picture
    const profilePictureElement = document.getElementById('profile-picture');
    const defaultProfilePicture = './Icons/profile2.jpg';

    try {
        const imageResponse = await fetch(`${API_BASE_URL}/users/${selectedTutor._id}/profile-picture`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            profilePictureElement.src = URL.createObjectURL(blob);
        } else {
            profilePictureElement.src = defaultProfilePicture;
        }
    } catch (error) {
        console.error('Error fetching tutor profile picture:', error);
        profilePictureElement.src = defaultProfilePicture;
    }

    // Fetch and display tutor availability
    await fetchAndDisplayAvailability(selectedTutor._id);

    // Add event listener to the "Book a Session" button
    document.getElementById('book-session').addEventListener('click', () => {
        const selectedDay = localStorage.getItem('selectedDay');
        const selectedTime = localStorage.getItem('selectedTime');

        if (selectedDay && selectedTime) {
            localStorage.setItem('selectedTutor', JSON.stringify(selectedTutor));
            localStorage.setItem('selectedSubject', selectedTutor.subjects[0]);
            window.location.href = './bookings.html';
        } else {
            swal.fire({
                title: 'Please select a day and time before booking.',
                showCloseButton: true,
                confirmButtonText: 'Close',
            });
        }
    });
});

// Function to fetch and display tutor availability
async function fetchAndDisplayAvailability(tutorId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/availability/${tutorId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const availabilityData = await response.json();
            console.log('Availability Data:', availabilityData); // Log the data structure
            // Check if there's at least one tutor's availability in the array
            if (availabilityData.length > 0) {
                displayAvailability(availabilityData[0]); // Pass the first tutor's availability
            } else {
                console.error('No availability data found for this tutor.');
            }
        } else {
            console.error('Failed to fetch availability', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching availability:', error);
    }
}

function displayAvailability(availabilityData) {
    const availabilityContainer = document.createElement('div');
    availabilityContainer.id = 'tutor-availability';

    // Header for availability
    const header = document.createElement('h2');
    header.innerText = 'Availability';
    availabilityContainer.appendChild(header);

    // Create a table for displaying availability
    const availabilityTable = document.createElement('table');
    availabilityTable.classList.add('availability-table');

    // Create table header
    const tableHeader = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const dayHeader = document.createElement('th');
    dayHeader.innerText = 'Day';
    const slotsHeader = document.createElement('th');
    slotsHeader.innerText = 'Time Slots';
    
    headerRow.appendChild(dayHeader);
    headerRow.appendChild(slotsHeader);
    tableHeader.appendChild(headerRow);
    availabilityTable.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');

    // Check if the data structure is correct
    if (availabilityData && availabilityData.availability) {
        availabilityData.availability.forEach(day => {
            const dayRow = document.createElement('tr');
            const dayCell = document.createElement('td');
            dayCell.innerText = day.date;

            const slotsCell = document.createElement('td');
            if (Array.isArray(day.slots) && day.slots.length > 0) {
                day.slots.forEach(slot => {
                    if (slot.start && slot.end) {
                        const slotElement = document.createElement('div');
                        slotElement.innerText = `${slot.start} - ${slot.end}`;
                        slotElement.classList.add('slot');

                        // Add click event to the slot
                        slotElement.addEventListener('click', () => {
                            // Deselect previously selected slots
                            const selectedSlots = document.querySelectorAll('.slot.selected');
                            selectedSlots.forEach(slot => slot.classList.remove('selected'));
                            
                            // Select the clicked slot
                            slotElement.classList.add('selected');
                            // Store the selected day and time in local storage
                            localStorage.setItem('selectedDay', day.date);
                            localStorage.setItem('selectedTime', `${slot.start} - ${slot.end}`);
                        });

                        slotsCell.appendChild(slotElement);
                    }
                });
                if (slotsCell.innerHTML === '') {
                    slotsCell.innerText = 'No slots available.';
                }
            } else {
                slotsCell.innerText = 'Slots data is not available.';
            }

            dayRow.appendChild(dayCell);
            dayRow.appendChild(slotsCell);
            tableBody.appendChild(dayRow);
        });
    } else {
        availabilityContainer.innerText = 'No availability data found.';
    }

    availabilityTable.appendChild(tableBody);
    availabilityContainer.appendChild(availabilityTable);

    // Append availability details to the profile body
    const profileBody = document.querySelector('.profile-body');
    if (profileBody) {
        profileBody.appendChild(availabilityContainer);
    } else {
        console.error('Profile body not found. Ensure that the selector is correct.');
    }
}
