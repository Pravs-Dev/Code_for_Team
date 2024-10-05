const stars = document.querySelectorAll('.star');
let selectedRating = 0;

// Highlight stars when clicked
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = star.getAttribute('data-value');
        highlightStars(selectedRating);
    });
});

// Add filled class to stars up to the selected rating
function highlightStars(rating) {
    stars.forEach(star => {
        if (star.getAttribute('data-value') <= rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Extract session ID and tutor ID (ensure these values are correct)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId'); // Assuming the session ID is passed in the URL
const tutorId = localStorage.getItem('tutorId'); // Get the tutor's ID from local storage
const subject = localStorage.getItem('subject'); // Get the subject from local storage

// Ensure all required information is available before proceeding
if (!sessionId || !tutorId || !subject) {
    console.error('Missing session or tutor information.');
    alert('Session information is incomplete. Please try again.');
}

// Handle feedback submission
document.getElementById('submit-feedback').addEventListener('click', () => {
    const comments = document.getElementById('comments').value;

    // Ensure the rating is selected before submitting
    if (selectedRating === 0) {
        alert('Please select a star rating before submitting.');
        return;
    }

    const feedbackData = {
        rating: selectedRating,
        comment: comments,
        subject: subject,
        uploader: localStorage.getItem('userId'),
        tutor: tutorId,
        session: sessionId
    };

    // Handle form submission to the backend
    fetch(`${API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Submitted feedback:', data);
        
        // Mark session as reviewed in the backend
        return fetch(`${API_BASE_URL}/bookings/${sessionId}/reviewed`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to mark session as reviewed');
        }
        return response.json();
    })
    .then(data => {
        console.log('Session marked as reviewed:', data);

        // Show SweetAlert notification
        Swal.fire({
            icon: 'success',
            title: 'Feedback submitted',
            text: 'Your feedback has been submitted successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#007bff',
            timer: 5000,
            timerProgressBar: true,
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                window.location.href = './csessions.html';
            }
        });

        // Remove subject and tutorId from localStorage after successful review
        localStorage.removeItem('subject');
        localStorage.removeItem('tutorId');
        document.getElementById('comments').value = '';
        highlightStars(0);
    })
    .catch(error => {
        console.error('Error submitting feedback:', error);
    });
});
