document.addEventListener('DOMContentLoaded', () => {
    const reviewSlider = document.getElementById('review-slider');

    // Function to fetch reviews and display them
    const getTutorReviews = async () => {
        const tutorId = localStorage.getItem('tutorId'); // Get the tutor ID from local storage (if applicable)
        
        try {
            const response = await fetch(`${API_BASE_URL}/feedback?tutorId=${tutorId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            displayReviews(data);
        } catch (error) {
            console.error('Error:', error);
            reviewSlider.innerHTML = `<p>No reviews available.</p>`; // Handle case where reviews are unavailable
        }
    };

    // Function to display the reviews in the slider
    const displayReviews = (reviews) => {
        reviewSlider.innerHTML = ''; // Clear the container before displaying

        if (reviews.length === 0) {
            reviewSlider.innerHTML = '<p>No reviews found.</p>'; // Handle empty reviews
            return;
        }

        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review-card');

            // Destructure to handle missing data safely
            const { tutor } = review;
            const profilePicture = tutor?.profilePicture || './Icons/profile2'; // Fallback to default image if missing
            const firstName = tutor?.fname || 'Unknown'; // Corrected field name to match your model
            const lastName = tutor?.lname || ''; // Corrected field name to match your model
            const averageRating = review?.rating || 0;  // Fallback to 0 if no rating
            const comment = review?.comment || 'No review available'; // Fallback if no comment

            // Create the HTML for each review
            reviewElement.innerHTML = `
                <img src="${profilePicture}" alt="${firstName} ${lastName}">
                <h3>${firstName} ${lastName}</h3>
                <div class="stars">${generateStars(averageRating)}</div>
                <p class="average-rating">Average Rating: ${averageRating.toFixed(1)} / 5</p>
                <p class="review-comment">${comment}</p>
            `;

            // Append the review card to the slider container
            reviewSlider.appendChild(reviewElement);
        });
    };

    // Helper function to generate star rating
    const generateStars = (rating) => {
        let starsHtml = '';
        for (let i = 0; i < Math.floor(rating); i++) {
            starsHtml += '<span class="star">&#9733;</span>'; // Filled star
        }
        for (let i = Math.floor(rating); i < 5; i++) {
            starsHtml += '<span class="star">&#9734;</span>'; // Empty star
        }
        return starsHtml;
    };

    // Fetch tutor reviews on page load
    getTutorReviews();
});
