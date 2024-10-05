// Handle cancellation reason visibility based on status
document.getElementById('status').addEventListener('change', function() {
    const status = this.value;
    const cancellationReasonContainer = document.getElementById('cancellationReasonContainer');
    if (status === 'Cancelled') {
        cancellationReasonContainer.style.display = 'block';
        document.getElementById('cancellationReason').setAttribute('required', 'true');
    } else {
        cancellationReasonContainer.style.display = 'none';
        document.getElementById('cancellationReason').removeAttribute('required');
    }
});

// Function to fetch tutors from the database
const fetchTutors = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        return [];
    }
};

// Render available tutors into the select dropdown
const renderAvailableTutors = (tutors) => {
    const tutorsSelect = document.getElementById('tutor');
    tutorsSelect.innerHTML = ''; // Clear previous options

    const placeholderOption = document.createElement('option');
    placeholderOption.textContent = 'Select a Tutor';
    placeholderOption.value = '';
    tutorsSelect.appendChild(placeholderOption);

    tutors.forEach(tutor => {
        const tutorOption = document.createElement('option');
        tutorOption.textContent = tutor.fname;
        tutorOption.value = tutor._id; 
        tutorsSelect.appendChild(tutorOption);
    });
};

// Load tutors and set the selected tutor from localStorage
function displayAvailability(availabilityData) {
    const availabilityContainer = document.createElement('div');
    availabilityContainer.id = 'tutor-availability';

    const header = document.createElement('h2');
    header.innerText = 'Availability';
    availabilityContainer.appendChild(header);

    const availabilityTable = document.createElement('table');
    availabilityTable.classList.add('availability-table');

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

    const tableBody = document.createElement('tbody');

    // Get stored selected time from localStorage
    const storedSelectedTime = localStorage.getItem('selectedTime');

    if (availabilityData && availabilityData.availability) {
        availabilityData.availability.forEach(day => {
            const dayRow = document.createElement('tr');
            const dayCell = document.createElement('td');
            dayCell.innerText = day.date;

            const slotsCell = document.createElement('td');
            if (Array.isArray(day.slots) && day.slots.length > 0) {
                day.slots.forEach(slot => {
                    if (slot.start && slot.end) {
                        const timeSlot = document.createElement('div');
                        const slotTime = `${slot.start} - ${slot.end}`;
                        timeSlot.innerText = slotTime;
                        timeSlot.classList.add('time-slot'); // Add class for styling

                        // Add click event to store selected date and time
                        timeSlot.addEventListener('click', () => {
                            // Store the selected date and time in localStorage
                            localStorage.setItem('selectedDate', day.date);
                            localStorage.setItem('selectedTime', slotTime);
                            // Remove highlight from other slots
                            document.querySelectorAll('.time-slot').forEach(el => el.style.backgroundColor = '');
                            // Highlight the selected time
                            timeSlot.style.backgroundColor = '#007bff'; // Highlight selected time
                        });

                        // Check if this slot matches the stored selected time and highlight it
                        if (storedSelectedTime === slotTime) {
                            timeSlot.style.backgroundColor = '#007bff'; // Highlight stored selected time
                        }

                        slotsCell.appendChild(timeSlot);
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

    const profileBody = document.querySelector('.profile-body');
    if (profileBody) {
        profileBody.appendChild(availabilityContainer);
    } else {
        console.error('Profile body not found. Ensure that the selector is correct.');
    }
}



// Render calendar inside a SweetAlert
function showCalendar() {
    const calendarContainer = document.createElement('div');
    calendarContainer.classList.add('calendar-container');

    // Get the stored day name from local storage
    const storedDayName = localStorage.getItem('selectedDay'); 

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Create a header row for the days of the week
    const headerRow = document.createElement('div');
    headerRow.classList.add('calendar-header');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('calendar-header-day');
        dayHeader.innerText = day; // Set the day name
        headerRow.appendChild(dayHeader);
    });
    calendarContainer.appendChild(headerRow);

    // Create a container for the dates
    const datesContainer = document.createElement('div');
    datesContainer.classList.add('dates-container');
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'disabled');
        datesContainer.appendChild(emptyCell);
    }

    // Create day cells for the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.innerText = day;

        // Create a new Date object for the clicked date
        const date = new Date(currentYear, currentMonth, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if the day matches the stored day name and highlight it
        if (dayName === storedDayName) {
            dayCell.classList.add('highlighted');
            dayCell.addEventListener('click', () => {
                // Instead of creating a date object, use the selected day directly
                const selectedDateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                // Store the selected date correctly
                localStorage.setItem('selectedDate', selectedDateString);
                document.getElementById('sessionDate').value = selectedDateString; // Update input with selected date
                Swal.close(); // Close the SweetAlert popup
            });
        }

        // Check if the selected date exists in local storage
        const storedDateString = localStorage.getItem('selectedDate');
        if (storedDateString) {
            const storedDate = new Date(storedDateString);
            if (date.toDateString() === storedDate.toDateString()) {
                dayCell.classList.add('selected'); // Highlight the selected date
            }
        }

        datesContainer.appendChild(dayCell); // Append to dates container
    }

    calendarContainer.appendChild(datesContainer); // Add the dates container to the main calendar container

    // Use SweetAlert to show the calendar
    Swal.fire({
        title: 'Select a Date',
        html: calendarContainer,
        showCloseButton: true,
        confirmButtonText: 'Close',
    });
}

// Add event listener to calendar icon
document.getElementById('calendarIcon').addEventListener('click', showCalendar);



// Load tutors and set the selected tutor and the first subject from localStorage
const loadTutors = async () => {
    const availableTutors = await fetchTutors(`${API_BASE_URL}/users`);
    const tutorsOnly = availableTutors.filter(user => user.role === 'tutor');
    renderAvailableTutors(tutorsOnly);

    // Get the selected tutor from localStorage
    const selectedTutor = JSON.parse(localStorage.getItem('selectedTutor'));

    if (selectedTutor) {
        const tutorSelect = document.getElementById('tutor');
        for (let option of tutorSelect.options) {
            if (option.value === selectedTutor._id) {
                option.selected = true; // Set the correct option as selected
                break;
            }
        }

        // Populate the subject dropdown with the selected tutor's subjects
        const subjectSelect = document.getElementById('subject');
        subjectSelect.innerHTML = ''; // Clear previous options

        const placeholderOption = document.createElement('option');
        placeholderOption.textContent = 'Select a Subject ';
        placeholderOption.value = '';
        subjectSelect.appendChild(placeholderOption);

        selectedTutor.subjects.forEach((subject, index) => {
            const subjectOption = document.createElement('option');
            subjectOption.textContent = subject; // Assuming the subjects are strings
            subjectOption.value = subject; 
            subjectSelect.appendChild(subjectOption);

            // Preselect the first subject
            if (index === 0) {
                subjectOption.selected = true; // Set the first subject as selected
            }
        });
    }
};




document.getElementById('tutor').addEventListener('change', async function () {
    const selectedTutorId = this.value;
    const availableTutors = await fetchTutors(`${API_BASE_URL}/users`);
    const selectedTutor = availableTutors.find(user => user._id === selectedTutorId);

    const subjectSelect = document.getElementById('subject');
    subjectSelect.innerHTML = ''; // Clear previous options

    const placeholderOption = document.createElement('option');
    placeholderOption.textContent = 'Select a Subject ';
    placeholderOption.value = '';
    subjectSelect.appendChild(placeholderOption);

    if (selectedTutor) {
        selectedTutor.subjects.forEach(subject => {
            const subjectOption = document.createElement('option');
            subjectOption.textContent = subject; // Assuming the subjects are strings
            subjectOption.value = subject;
            subjectSelect.appendChild(subjectOption);
        });
    }
});

function askToCheckBusSchedule() {
    Swal.fire({
        title: 'Want to Check the Bus Schedule?',
        text: 'Would you like to see the bus schedule for your area?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#007bff',
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect to the bus schedule page
            window.location.href = './bus-schedule.html';
        }
        else{
            window.location.href = './dashboard.html';
        }
    });
}

// Handle form submission for booking
document.addEventListener('DOMContentLoaded', async () => {
    // Load tutors on page load
    await loadTutors();

    // Retrieve selected date and time from localStorage
    const selectedDate = localStorage.getItem('selectedDate');
    const selectedTimeString = localStorage.getItem('selectedTime'); // Check stored time

    // Fill the date input field
    if (selectedDate) {
        document.getElementById('sessionDate').value = new Date(selectedDate).toISOString().split('T')[0]; // Set stored date in input
    }

    // Populate session times dynamically based on selected date
    const sessionTimeInput = document.getElementById('sessionTime');
    sessionTimeInput.innerHTML = ''; // Clear previous options

    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select a Time';
    defaultOption.value = '';
    sessionTimeInput.appendChild(defaultOption);

    // If selectedTime is in the format "08:44 - 07:47", split and use only one time
    if (selectedTimeString) {
        const times = selectedTimeString.split(' - '); // Split the string to get individual times
        const startTime = times[0]; // Use the first time (start time)

        const timeOption = document.createElement('option');
        timeOption.textContent = startTime;  // Use the first time from localStorage
        timeOption.value = startTime;
        sessionTimeInput.appendChild(timeOption);
        sessionTimeInput.value = startTime;  // Set the selected time
    }

    const bookingForm = document.getElementById('bookingForm');

    bookingForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission

        // Gather form data
        const student = localStorage.getItem('userId'); 
        const tutor = document.getElementById('tutor').value;
        const subject = document.getElementById('subject').value;
        const sessionDate = document.getElementById('sessionDate').value;
        const sessionTime = document.getElementById('sessionTime').value;
        const duration = document.getElementById('duration').value;
        const status = document.getElementById('status').value;
        const meetingType = document.getElementById('meetingtype').value;

        // Prepare booking data to match the format expected by the database
        const bookingData = {
            student: student,
            tutor: tutor,
            subject: subject,
            sessionDate: sessionDate,
            sessionTime: sessionTime, // Ensure this is captured properly
            duration: parseInt(duration) * 60, // Convert duration to seconds
            status: status,
            meetingType: meetingType
        };

        try {
            // Send POST request to the booking API
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                const responseData = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Booking Created',
                    text: 'Your booking was created successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000,
                    timerProgressBar: true,
                }).then((result) => {
                    if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
                        askToCheckBusSchedule();
                    }
                });          
                console.log('Booking data:', responseData);
                bookingForm.reset();
                localStorage.removeItem('bookingTutor');
                localStorage.removeItem('selectedSubject');
                localStorage.removeItem('selectedTutor');
                localStorage.removeItem('selectedDate'); 
                localStorage.removeItem('selectedTime'); 
            } else {
                const errorData = await response.json();
                alert('Error creating booking: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            alert('An error occurred while creating the booking.');
        }
    });
});
