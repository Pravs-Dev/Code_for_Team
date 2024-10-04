document.addEventListener('DOMContentLoaded', async () => {
    const profileNameElement = document.getElementById('profile-name');
    const profileForm = document.getElementById('profile-form');
    const profilePictureUpload = document.getElementById('profile-picture-upload');
    const profilePictureElement = document.getElementById('profile-picture');

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        console.error('No token or user ID found, redirect to login');
        window.location.href = './login.html'; // Redirect if not logged in
        return;
    }

    // Fetch user data and populate profile fields
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            const { fname, lname, email, role, courses } = user;

            profileNameElement.textContent = `${fname} ${lname}`;
            document.getElementById('fname').value = fname;
            document.getElementById('lname').value = lname;
            document.getElementById('email').value = email;
            document.getElementById('role').value = role;
            document.getElementById('courses').value = courses || '';
            const currCourseUL = document.getElementById('current-courses-list');


            console.log('Profile data loaded:', { fname, lname, email, role, courses });
            // let coursesList = courses[0].split(", ")
            // console.log(coursesList)

            if (courses && courses.length > 0) {
                let coursesData = courses[0];
        
                // Handle if coursesData is an array, string, or something else
                if (Array.isArray(coursesData)) {
                    console.log("Courses data is an array", coursesData);
                    // Iterate through each course and display
                    coursesData.forEach(course => {
                        // Create an 'li' element
        const listItem = document.createElement('li');
        listItem.style.listStyleType = 'none'
        listItem.style.textAlign = 'left';

        
        // Set the content of the 'li' element
        listItem.innerHTML = course;
        
        // Append the 'li' to the current courses list (UL)
        currCourseUL.appendChild(listItem);
                    });
                } else if (typeof coursesData === 'string') {
                    console.log("Courses data is a string", coursesData);
                    let coursesList = coursesData.split(", ");
                    console.log('Courses List:', coursesList);
                } else {
                    console.log("Unexpected data type:", typeof coursesData, coursesData);
                }}

        } else {
            console.error('Failed to fetch user data');
            window.location.href = './login.html'; // Redirect if fetch fails
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    // File input and preview
    profilePictureElement.addEventListener('click', () => {
        profilePictureUpload.click();
        console.log('Profile picture upload clicked');
    });

    profilePictureUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePictureElement.src = e.target.result;
                console.log('Profile picture changed:', file.name);
            };
            reader.readAsDataURL(file);
        }
    });

    // Update profile form with FormData
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fname = document.getElementById('fname').value;
        const lname = document.getElementById('lname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value; // Optional field
        const courses = document.getElementById('courses').value;
        const profilePictureFile = profilePictureUpload.files[0];

        // Prepare form data
        const formData = new FormData();
        formData.append('fname', fname);
        formData.append('lname', lname);
        formData.append('email', email);
        formData.append('password', password); // Optional
        formData.append('courses', courses);

        if (profilePictureFile) {
            formData.append('profilePicture', profilePictureFile); // Append profile picture if uploaded
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Use formData instead of JSON
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile updated',
                    text: 'Profile updated successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000, // Auto-close after 3 seconds (optional)
                    timerProgressBar: true, // Progress bar for auto-close (optional)
                }); 
                console.log('Profile updated successfully');
            } else {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Profile update failed',
                    text: 'Error updating profile',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000, // Auto-close after 3 seconds (optional)
                    timerProgressBar: true, // Progress bar for auto-close (optional)
                });
                console.error('Error updating profile:', errorData);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile.');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure you have userId and token defined before using them
    const userId = localStorage.getItem('userId'); // Fetch user ID from local storage
    const token = localStorage.getItem('token'); // Fetch token from local storage

    // Check if userId and token are available
    if (!userId || !token) {
        console.error('User ID or token is missing. User must be logged in to delete their profile.');
        return; // Exit if user ID or token is not available
    }

    // Delete profile button event listener
    const deleteProfileButton = document.getElementById('delete-profile');
    
    // Ensure the button exists before adding an event listener
    if (deleteProfileButton) {
        deleteProfileButton.addEventListener('click', async () => {
            const confirmDelete = await Swal.fire({
                title: 'Are you sure?',
                text: "This action cannot be undone!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (confirmDelete.isConfirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json', // Ensure content type is set
                        },
                    });

                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Profile deleted',
                            text: 'Your profile has been deleted successfully!',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#007bff',
                        });
                        localStorage.removeItem('token'); // Clear token
                        localStorage.removeItem('userId'); // Clear user ID
                        window.location.href = './login.html'; // Redirect to login page
                    } else {
                        const errorData = await response.json(); // Attempt to parse error response
                        Swal.fire({
                            icon: 'error',
                            title: 'Deletion failed',
                            text: errorData.message || 'There was an error deleting your profile.',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#007bff',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting profile:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while deleting the profile.',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#007bff',
                    });
                }
            }
        });
    } else {
        console.error('Delete profile button not found.');
    }
});

//swal for viewing courses
document.getElementById('show-courses-btn').addEventListener('click', async function () {
    // Fetch current user courses before showing the Swal modal
    const currentCourses = await getCurrentCourses();

    Swal.fire({
        title: 'Select Courses',
        html: `
            <div class="custom-modal-container">
                
                <div class="select-container">
                    <label for="faculty">Select Faculty:</label>
                    <select id="faculty" class="swal2-select custom-swal-select">
                        <option value="" disabled selected>-- Select Faculty --</option>
                    </select>
                </div>
                <div class="select-container" id="course-container" style="display:none;">
                    <label for="course">Select Course:</label>
                    <select id="course" class="swal2-select custom-swal-select">
                        <option value="" disabled selected>-- Select Course --</option>
                    </select>
                </div>
                <div class="select-container" id="year-container" style="display:none;">
                    <label for="year">Select Year of Study:</label>
                    <select id="year" class="swal2-select custom-swal-select">
                        <option value="" disabled selected>-- Select Year --</option>
                    </select>
                </div>
                <div class="course-list" id="course-list" style="display:none;">
                    <h2>Modules Available for Selected Year</h2>
                    <form id="module-form">
                        <div id="course-list-ul"></div>
                    </form>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Update Courses',
        customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm',
            cancelButton: 'custom-swal-cancel',
            select: 'custom-swal-select',
        },
        preConfirm: () => {
            const selectedModules = [];
            document.querySelectorAll('#module-form input[type="checkbox"]:checked').forEach(checkbox => {
                selectedModules.push(checkbox.value);
            });
    
            if (selectedModules.length > 0) {
                return selectedModules;
            } else {
                Swal.showValidationMessage('Please select at least one module');
                return false;
            }
        }
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            // Update the courses input with the selected modules
            const coursesInput = document.getElementById('courses');
            coursesInput.value = result.value.join(', ');

            // Save the updated courses to the user's profile
            await saveUpdatedCourses(result.value);
        }
    });

    // Fetch and load faculties and courses inside the Swal popup, and show current courses
    fetchFacultiesForSwal(currentCourses);
});


if (Array.isArray(coursesData)) {
    coursesData.forEach(course => {
        // Create an 'li' element
        const listItem = document.createElement('li');
        
        // Set the content of the 'li' element
        listItem.innerHTML = course;
        
        // Append the 'li' to the current courses list (UL)
        currCourseUL.appendChild(listItem);
    });
}


// Fetch faculties and courses from the API and populate the Swal modal, mark current courses
async function fetchFacultiesForSwal(currentCourses) {
    const API_BASE_URL = 'https://finalbackend2099.azurewebsites.net/api';

    let facultiesData = [];

    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        facultiesData = await response.json();

        const facultySelect = document.getElementById('faculty');
        facultiesData.forEach(faculty => {
            const option = document.createElement('option');
            option.value = faculty._id;
            option.textContent = faculty.faculty_name;
            facultySelect.appendChild(option);
        });

        facultySelect.addEventListener('change', function () {
            const selectedFacultyId = this.value;
            const selectedFaculty = facultiesData.find(faculty => faculty._id === selectedFacultyId);
            const courseSelect = document.getElementById('course');
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';

            if (selectedFaculty) {
                selectedFaculty.courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course._id;
                    option.textContent = course.course_name;
                    courseSelect.appendChild(option);
                });
                document.getElementById('course-container').style.display = 'block';
            }

            courseSelect.addEventListener('change', function () {
                const selectedCourseId = this.value;
                const selectedCourse = selectedFaculty.courses.find(course => course._id === selectedCourseId);
                const yearSelect = document.getElementById('year');
                yearSelect.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';

                if (selectedCourse) {
                    selectedCourse.years_of_study.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year.year;
                        option.textContent = `Year ${year.year}`;
                        yearSelect.appendChild(option);
                    });
                    document.getElementById('year-container').style.display = 'block';
                }

                yearSelect.addEventListener('change', function () {
                    const selectedYearValue = this.value;
                    const selectedYear = selectedCourse.years_of_study.find(year => year.year === parseInt(selectedYearValue));
                    const courseListUl = document.getElementById('course-list-ul');
                    courseListUl.innerHTML = '';

                    if (selectedYear) {
                        // Populate checkboxes for modules and pre-check current courses
                        selectedYear.modules.forEach(module => {
                            const isChecked = currentCourses.includes(module.module) ? 'checked' : ''; // Check if the current course matches
                            const div = document.createElement('div');
                            div.innerHTML = `
                                <label>
                                    <input type="checkbox" value="${module.module}" ${isChecked}> ${module.module}
                                </label>
                            `;
                            courseListUl.appendChild(div);
                        });
                        document.getElementById('course-list').style.display = 'block';
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error fetching faculties:', error);
    }
}

// Fetch the user's current courses
async function getCurrentCourses() {
    const API_BASE_URL = 'http://localhost:3000/api';  // Replace with your API endpoint
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            return user.courses ? user.courses.split(', ') : [];
        } else {
            console.error('Failed to fetch current courses');
            return [];
        }
    } catch (error) {
        console.error('Error fetching current courses:', error);
        return [];
    }
}

// Save updated courses to the user's profile
async function saveUpdatedCourses(courses) {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('courses', courses.join(', '));

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Courses updated',
                text: 'Your courses have been updated successfully!',
                confirmButtonText: 'OK',
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: errorData.message || 'Error updating courses.',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        console.error('Error updating courses:', error);
    }
}
