document.addEventListener('DOMContentLoaded', () => {
    const tutor = localStorage.getItem('userId');
    
    const tutorList = document.getElementById('review-list');

            // Get All Feedback of a tutor
        const getAllFeedbackByTutor = async (tutor) => {
            fetch(`http://localhost:3000/api/feedback/${tutor}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    displayReviews(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        const displayReviews = (reviews) => {
            tutorList.innerHTML = '';
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.innerHTML = `
                    <h3>Session no.${review.session}</h3>
                    <p>${review.comment}</p>
                    <p>Rating: ${review.rating}</p>
                `;
                tutorList.appendChild(reviewElement);
            });
        }

        getAllFeedbackByTutor(tutor);
})