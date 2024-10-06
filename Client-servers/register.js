const API_BASE_URL = 'http://localhost:3000/api';

//handle clicking the show password eye
// Get references to the password input and the toggle icon
const passwordInput = document.getElementById("password");
const passwordEye = document.getElementById("password-eye");

// Handle clicking the eye icon
passwordEye.addEventListener("click", function () {
  // Toggle password visibility
  const isPasswordVisible = passwordInput.type === "text";
  passwordInput.type = isPasswordVisible ? "password" : "text";

  // Switch between show and hide icons
  if (isPasswordVisible) {
    passwordEye.src = "./Icons/show-password.svg";
    passwordEye.alt = "Show Password";
  } else {
    passwordEye.src = "./Icons/hide-password.svg";
    passwordEye.alt = "Hide Password";
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Get the form values
            const role = document.getElementById('role').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Initialize fname and lname to empty strings
            let fname = '';
            let lname = '';

            // Check which name fields to get
            if (role === 'student') {
                fname = document.getElementById('student-fname').value;
                lname = document.getElementById('student-lname').value;
            } else if (role === 'tutor') {
                fname = document.getElementById('tutor-fname').value;
                lname = document.getElementById('tutor-lname').value;
            }

            const profilePicture = document.getElementById('profilePicture') ? document.getElementById('profilePicture').files[0] : null;


            // Validate the form fields
            if (!role || !email || !password || !fname || !lname) {
                alert('Please fill in all the required fields.');
                return;
            }

            
            

            // Prepare form data
            const formData = new FormData();
            formData.append('role', role);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('fname', fname);
            formData.append('lname', lname);

            // Add role-specific fields
            if (role === 'student') {
                const courses = document.querySelectorAll('#courses-group input[type="text"]');
                courses.forEach(course => {
                    if (course.value) {
                        formData.append('courses[]', course.value);
                    }
                });
            } else if (role === 'tutor') {
                const subjects = document.querySelectorAll('#subjects-group input[type="text"]');
                subjects.forEach(subject => {
                    if (subject.value) {
                        formData.append('subjects[]', subject.value);
                    }
                });

                const qualifications = document.querySelectorAll('#qualification-group input[type="text"]');
                qualifications.forEach(qualification => {
                    if (qualification.value) {
                        formData.append('qualifications[]', qualification.value);
                    }
                });
            }

            if (profilePicture) {
                formData.append('profilePicture', profilePicture);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                  //   window.location.href = "./login.html";
                    swal.fire({
                      title: 'Success!',
                      text: 'You have successfully registered.',
                      icon: 'success',
                      confirmButtonText: 'OK',
                      timer: 5000,
                      timerProgressBar: true
                  }).then(() => {
                          window.location.href = './login.html';
                  
                  });
                  } else {
                    const errorData = await response.json();
                    swal.fire({
                      title: 'Unsuccessful!',
                      text: 'An error occurred while registering.',
                      icon: 'error',
                      confirmButtonText: 'Retry',
                      timer: 5000,
                      timerProgressBar: true
                  });
                  }
            } catch (error) {
                console.error('Error registering:', error);
                document.getElementById("error-msg").innerHTML=`An error occurred while registering.`;
            }
        });
    }

    // Profile picture preview functionality
    const profilePictureInput = document.getElementById('profilePicture');
    const profilePicturePreview = document.getElementById('profilePicturePreview');

    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    profilePicturePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                profilePicturePreview.src = ''; // Clear the preview if no file is selected
            }
        });
    }
});

document.getElementById('courses').addEventListener('click', function () {
    // Show a Swal modal with course selection
    Swal.fire({
        title: 'Select Courses',
        html: `
            <div class="main-content">
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
        confirmButtonText: 'Select',
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
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            // Get the original input field
            const originalInput = document.getElementById('courses');
    
            // If the original input is empty, populate it with the first module
            if (!originalInput.value) {
                originalInput.value = result.value[0]; // Set the first selected module
                result.value.shift(); // Remove the first module from the array
            }
    
            // Add each remaining selected module as a new input field dynamically
            const coursesGroup = document.getElementById('courses-group');
            result.value.forEach(module => {
                const newCourse = document.createElement('div');
                newCourse.classList.add('input-group');
                newCourse.innerHTML = `
                    <input type="text" name="courses[]" value="${module}" readonly>
                    <span class="remove" onclick="removeField(this)">- Remove</span>
                `;
                coursesGroup.appendChild(newCourse);
            });
        }
    });
    

    // Fetch and load faculties and courses inside the Swal popup
    fetchFacultiesForSwal();
});

// Fetch faculties and courses from the API and populate the Swal modal
async function fetchFacultiesForSwal() {  
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
            const yearSelect = document.getElementById('year');
            const courseListUl = document.getElementById('course-list-ul');
        
            // Reset course, year, and module inputs
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';
            yearSelect.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';
            courseListUl.innerHTML = ''; // Clear any existing modules
        
            document.getElementById('course-container').style.display = 'none';
            document.getElementById('year-container').style.display = 'none';
            document.getElementById('course-list').style.display = 'none'; // Hide module container
        
            if (selectedFaculty) {
                selectedFaculty.courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course._id;
                    option.textContent = course.course_name;
                    courseSelect.appendChild(option);
                });
                document.getElementById('course-container').style.display = 'block';
        
                // Add event listener for course selection
                courseSelect.addEventListener('change', function () {
                    const selectedCourseId = this.value;
                    const selectedCourse = selectedFaculty.courses.find(course => course._id === selectedCourseId);
                    
                    // Reset year and module inputs
                    yearSelect.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';
                    courseListUl.innerHTML = ''; // Clear any existing modules
                    
                    document.getElementById('year-container').style.display = 'none'; // Hide year container
                    document.getElementById('course-list').style.display = 'none'; // Hide module container
        
                    if (selectedCourse) {
                        selectedCourse.years_of_study.forEach(year => {
                            const option = document.createElement('option');
                            option.value = year.year;
                            option.textContent = `Year ${year.year}`;
                            yearSelect.appendChild(option);
                        });
                        document.getElementById('year-container').style.display = 'block';
        
                        // Add event listener for year selection
                        yearSelect.addEventListener('change', function () {
                            const selectedYearValue = this.value;
                            const selectedYear = selectedCourse.years_of_study.find(year => year.year === parseInt(selectedYearValue));
                            
                            courseListUl.innerHTML = ''; // Clear any existing modules
        
                            if (selectedYear) {
                                // Populate checkboxes for modules
                                selectedYear.modules.forEach(module => {
                                    const div = document.createElement('div');
                                    div.innerHTML = `
                                        <label>
                                            <input type="checkbox" value="${module.module}"> ${module.module}
                                        </label>
                                    `;
                                    courseListUl.appendChild(div);
                                });
                                document.getElementById('course-list').style.display = 'block';
                            }
                        });
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Error fetching faculties:', error);
    }
}

// Remove a field dynamically
function removeField(element) {
    const inputGroup = element.parentElement;
    inputGroup.parentElement.removeChild(inputGroup);
}


//swal fo rtutor
document.getElementById('subjects').addEventListener('click', function () {
    // Show a Swal modal with course selection
    Swal.fire({
        title: 'Select Courses',
        html: `
            <div class="main-content">
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
        confirmButtonText: 'Select',
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
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            // Get the original input field
            const originalInput = document.getElementById('subjects');
    
            // If the original input is empty, populate it with the first module
            if (!originalInput.value) {
                originalInput.value = result.value[0]; // Set the first selected module
                result.value.shift(); // Remove the first module from the array
            }
    
            // Add each remaining selected module as a new input field dynamically
            const coursesGroup = document.getElementById('subjects-group');
            result.value.forEach(module => {
                const newCourse = document.createElement('div');
                newCourse.classList.add('input-group');
                newCourse.innerHTML = `
                    <input type="text" name="courses[]" value="${module}" readonly>
                    <span class="remove" onclick="removeField(this)">- Remove</span>
                `;
                coursesGroup.appendChild(newCourse);
            });
        }
    });
    

    // Fetch and load faculties and courses inside the Swal popup
    fetchFacultiesForSwal();
});

// Fetch faculties and courses from the API and populate the Swal modal
async function fetchFacultiesForSwal() {  
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
            const yearSelect = document.getElementById('year');
            const courseListUl = document.getElementById('course-list-ul');
        
            // Reset course, year, and module inputs
            courseSelect.innerHTML = '<option value="" disabled selected>-- Select Course --</option>';
            yearSelect.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';
            courseListUl.innerHTML = ''; // Clear any existing modules
        
            document.getElementById('course-container').style.display = 'none';
            document.getElementById('year-container').style.display = 'none';
            document.getElementById('course-list').style.display = 'none'; // Hide module container
        
            if (selectedFaculty) {
                selectedFaculty.courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course._id;
                    option.textContent = course.course_name;
                    courseSelect.appendChild(option);
                });
                document.getElementById('course-container').style.display = 'block';
        
                // Add event listener for course selection
                courseSelect.addEventListener('change', function () {
                    const selectedCourseId = this.value;
                    const selectedCourse = selectedFaculty.courses.find(course => course._id === selectedCourseId);
                    
                    // Reset year and module inputs
                    yearSelect.innerHTML = '<option value="" disabled selected>-- Select Year --</option>';
                    courseListUl.innerHTML = ''; // Clear any existing modules
                    
                    document.getElementById('year-container').style.display = 'none'; // Hide year container
                    document.getElementById('course-list').style.display = 'none'; // Hide module container
        
                    if (selectedCourse) {
                        selectedCourse.years_of_study.forEach(year => {
                            const option = document.createElement('option');
                            option.value = year.year;
                            option.textContent = `Year ${year.year}`;
                            yearSelect.appendChild(option);
                        });
                        document.getElementById('year-container').style.display = 'block';
        
                        // Add event listener for year selection
                        yearSelect.addEventListener('change', function () {
                            const selectedYearValue = this.value;
                            const selectedYear = selectedCourse.years_of_study.find(year => year.year === parseInt(selectedYearValue));
                            
                            courseListUl.innerHTML = ''; // Clear any existing modules
        
                            if (selectedYear) {
                                // Populate checkboxes for modules
                                selectedYear.modules.forEach(module => {
                                    const div = document.createElement('div');
                                    div.innerHTML = `
                                        <label>
                                            <input type="checkbox" value="${module.module}"> ${module.module}
                                        </label>
                                    `;
                                    courseListUl.appendChild(div);
                                });
                                document.getElementById('course-list').style.display = 'block';
                            }
                        });
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Error fetching faculties:', error);
    }
}

// Remove a field dynamically
function removeField(element) {
    const inputGroup = element.parentElement;
    inputGroup.parentElement.removeChild(inputGroup);
}


const passwordErrorsContainer = document.getElementById('passwordErrors');

passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const errorMessages = [];

    // Check each password requirement
    if (password.length < 8) {
        errorMessages.push('Password must be at least 8 characters long.');
    }
    if (!/[a-z]/.test(password)) {
        errorMessages.push('Password must contain at least one lowercase letter.');
    }
    if (!/[A-Z]/.test(password)) {
        errorMessages.push('Password must contain at least one uppercase letter.');
    }
    if (!/[0-9]/.test(password)) {
        errorMessages.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errorMessages.push('Password must contain at least one special character.');
    }

    // Update the tooltip with remaining error messages
    passwordErrorsContainer.innerHTML = '';
    if (errorMessages.length > 0) {
        errorMessages.forEach(msg => {
            const li = document.createElement('li');
            li.textContent = msg;
            passwordErrorsContainer.appendChild(li);
        });
    }
});

// Toggle tooltip display on hover
passwordInput.addEventListener('mouseover', () => {
    const tooltip = document.getElementById('passwordTooltip');
    tooltip.style.color='white';
});

passwordInput.addEventListener('mouseout', () => {
    const tooltip = document.getElementById('passwordTooltip');
    tooltip.style.color ='rgb(80, 181, 220)';
});
