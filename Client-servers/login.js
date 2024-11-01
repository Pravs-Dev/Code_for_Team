// Redirect to Google OAuth route when Google login button is clicked
const API_BASE_URL = 'https://backend2077.azurewebsites.net/api';


function handleGoogleLogin() {
    window.location.href = '/auth/google';
}

document.addEventListener('DOMContentLoaded', handleAuthRedirect);

function handleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');

    
    if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        console.log('Token and User ID stored in localStorage');
        window.location.href = '/dashboard.html'; // Redirect to the actual dashboard
    } 
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                document.getElementById("error-msg").innerHTML=`Please fill in all the required fields.`
                return;
            }

            const loginData = {
                email: email,
                password: password,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('role', data.role); 
                    localStorage.setItem('courses', data.courses);// Store role in localStorage
                    document.getElementById("error-msg").innerHTML=`Loading...`
                    document.getElementById("error-msg").style.color = 'white';  // Change text color to white
                    
                    // Redirect based on role
                    if (data.role === 'tutor') {
                        window.location.href = './views/tutor_dashboard.html'; // Redirect to tutor's dashboard
                    } else if (data.role === 'student') {
                        window.location.href = './dashboard.html'; // Redirect to student's dashboard
                    } 
                } else {
                    const errorData = await response.json();
                   document.getElementById("error-msg").innerHTML=`Error logging in`
                }
            } catch (error) {
                console.error('Error logging in:', error);
                document.getElementById("error-msg").innerHTML=`Error logging in`
            }
        });
    } 
});

document.addEventListener('DOMContentLoaded', async () => {
    const profilePictureElement = document.getElementById('profile-picture');
    const profileNameElement = document.getElementById('profile-name');

    // Retrieve user ID and token from localStorage (already stored on login)
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    console.log(token);
    console.log(userId);
    

    if (!token || !userId) {
        console.error('No token or user ID found, redirect to login');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            const { fname, lname } = user;

            // Fetch profile picture as a binary stream
            const imageResponse = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (imageResponse.ok) {
                // Create a blob from the binary data
                const blob = await imageResponse.blob();

                // Create a URL for the image blob and set it as the src for the image element
                const imageUrl = URL.createObjectURL(blob);
                profilePictureElement.src = imageUrl;
            } else {
                // If the image cannot be fetched, use the default profile image
                profilePictureElement.src = './Icons/profile2.jpg';
            }

            profileNameElement.textContent = `${fname} ${lname}`;
        } else {
            console.error('Failed to fetch user data');
            // Redirect to login if user data fetch fails
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
});

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
