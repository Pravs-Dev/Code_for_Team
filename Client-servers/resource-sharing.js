document.addEventListener("DOMContentLoaded", function () {
    // Attach event listener to the form submit button
    document.querySelector('.upload-url-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Get the form values
        const urlName = document.getElementById('urlName').value;
        const urlDescription = document.getElementById('urlDescription').value;
        const url = document.getElementById('url').value;
        const userId = localStorage.getItem('userId');

        // Validate the form fields
        if (!urlName || !url || !urlDescription) {
            alert('Please fill in all the required fields.');
            return;
        }

        // Prepare the resource data
        const newResource = {
            title: urlName,
            description: urlDescription,
            fileUrl: url,
            uploadedBy: userId,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/resources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newResource),
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'URL submitted successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000,
                    timerProgressBar: true,
                }).then(() => {
                    location.reload(); // Reload after OK is clicked
                });
                console.log('New resource created:', data);
            } else {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error submitting URL',
                    text: errorData.message || 'An error occurred while submitting the URL.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                });
            }
        } catch (error) {
            console.error('Error submitting URL:', error);
        }
    });

    // Display whatever is in the db
    document.getElementById('upload').addEventListener('change', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const fileInput = document.getElementById('upload');
        const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

        // Validate if a file is selected
        if (fileInput.files.length === 0) {
            alert('Please select a file.');
            return;
        }

        // Create a new FormData object to handle the file upload
        const formData = new FormData();
        formData.append('file', fileInput.files[0]); // Add the file to FormData
        formData.append('uploadedBy', userId); // Use the actual user ID

        try {
            const response = await fetch(`${API_BASE_URL}/resourcesfile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formData, // Use FormData instead of JSON.stringify
            });

            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'File submitted successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000,
                    timerProgressBar: true,
                }).then(() => {
                    location.reload(); // Reload after OK is clicked
                });
                console.log('New resource created:', data);
            } else {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Error submitting File',
                    text: errorData.message || 'An error occurred while submitting the file.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                });
            }
        } catch (error) {
            console.error('Error submitting DOC:', error);
        }
    });

    // Function to fetch resources from the backend
    const fetchResources = async (url) => {
        document.getElementById('loading-spinner').style.display = 'block';
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
        } finally {
            // Hide the loading spinner
            document.getElementById('loading-spinner').style.display = 'none';
        }
    };

    // Function to delete a resource or file
    const deleteResource = async (id, type) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            const url = type === 'resource' ? `${API_BASE_URL}/resources/${id}` : `${API_BASE_URL}/resourcesfile/${id}`;
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete the resource');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Resource deleted successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000,
                    timerProgressBar: true,
                });

                // Refresh the list after deletion
                const resources = await fetchResources(`${API_BASE_URL}/resources`);
                const files = await fetchResources(`${API_BASE_URL}/resourcesfile`);
                renderResources(resources, files);
            } catch (error) {
                console.error('Error deleting resource:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'An error occurred while deleting the resource.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#007bff',
                    timer: 5000,
                    timerProgressBar: true,
                });
            }
        }
    };

    const fetchSharedResources = async () => {
        const studentId = localStorage.getItem('userId');
        const resourcesUrl = `${API_BASE_URL}/resources/shared-with/${studentId}`;
        const filesUrl = `${API_BASE_URL}/resourcesfile/shared-with/${studentId}`;
        document.getElementById('loading-spinner').style.display = 'block';
        try {
            const [resourcesResponse, filesResponse] = await Promise.all([
                fetch(resourcesUrl, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }),
                fetch(filesUrl, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } })
            ]);
    
            if (resourcesResponse.ok && filesResponse.ok) {
                const resourcesData = await resourcesResponse.json();
                const filesData = await filesResponse.json();
                renderSharedResources(resourcesData, filesData); // Render both resources and files
            } else {
                console.error('Error fetching shared resources or files:', {
                    resourcesError: await resourcesResponse.json(),
                    filesError: await filesResponse.json()
                });
            }
        } catch (error) {
            console.error('Error fetching shared resources and files:', error);
        }finally {
            document.getElementById('loading-spinner').style.display = 'none';
        }
    };

    // Function to render resources into the DOM
    const renderResources = (resources, files) => {
        const resourceList = document.querySelector('.resource-list ul');
        resourceList.innerHTML = ''; // Clear the list first

        const userRole = localStorage.getItem('role'); // Assuming you store user role in localStorage

        // Render string-based resources
        resources.forEach(resource => {
            if (resource.uploadedBy === localStorage.getItem('userId')) {
                const resourceItem = document.createElement('li');
                const resourceLink = document.createElement('a');
                resourceLink.href = resource.fileUrl;
                resourceLink.textContent = `${resource.title} - ${resource.description || 'No description'}`;

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'x';
                deleteButton.classList.add('delete-btn');
                deleteButton.onclick = () => deleteResource(resource._id, 'resource');

                resourceItem.appendChild(resourceLink);
                resourceItem.appendChild(deleteButton);
                resourceList.appendChild(resourceItem);
                // Create share button only if the user is a tutor
                if (userRole === 'tutor') {
                    const shareButton = document.createElement('button');
                    shareButton.textContent = 'Share';
                    shareButton.classList.add('share-btn');
                    shareButton.onclick = () => shareResource(resource._id);
                    resourceItem.appendChild(shareButton); // Append share button
                }

            }
        });

        // Render file-based resources
        files.forEach(file => {
            if (file.uploadedBy === localStorage.getItem('userId')) {
                const fileItem = document.createElement('li');
                const fileLink = document.createElement('a');
                fileLink.href = `${API_BASE_URL}/resourcesfile/${file._id}`; // Adjust URL as needed for file access
                fileLink.textContent = `${file.file.originalName}`;

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'x';
                deleteButton.classList.add('delete-btn');
                deleteButton.onclick = () => deleteResource(file._id, 'file');

                fileItem.appendChild(fileLink);
                fileItem.appendChild(deleteButton);
                resourceList.appendChild(fileItem);
                 // Create share button only if the user is a tutor
                if (userRole === 'tutor') {
                    const shareButton = document.createElement('button');
                    shareButton.textContent = 'Share';
                    shareButton.classList.add('share-btn');
                    shareButton.onclick = () => shareResource(file._id);
                    fileItem.appendChild(shareButton); // Append share button
                }
            }
        });
    };

    const shareResource = async (resourceId) => {
        const { value: formValues } = await Swal.fire({
            title: 'Share Resource',
            html: `
                <input id="firstName" class="swal2-input" placeholder="Student's First Name" required>
                <input id="lastName" class="swal2-input" placeholder="Student's Last Name" required>
            `,
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('firstName').value,
                    document.getElementById('lastName').value,
                ];
            }
        });
    
        if (formValues) {
            // Create the studentName object
            const studentName = {
                fname: formValues[0], // First name
                lname: formValues[1]  // Last name
            };
    
            // Assuming tutorId is available from your context
            const tutorId = localStorage.getItem('userId'); // Example: replace with how you store tutorId
    
            // Define the URLs for sharing resources and files
            const resourcesSharedUrl = `${API_BASE_URL}/resources/${resourceId}/share`;
            const filesSharedUrl = `${API_BASE_URL}/resourcesfile/${resourceId}/share`;
    
            try {
                // Make both API calls concurrently using Promise.all
                const [resourceResponse, fileResponse] = await Promise.all([
                    fetch(resourcesSharedUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            studentName, // Send studentName as an object
                            tutorId      // Include the tutorId
                        }),
                    }),
                    fetch(filesSharedUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            studentName, // Send studentName as an object
                            tutorId      // Include the tutorId
                        }),
                    })
                ]);
    
                // Check the responses for success
                const resourceSuccess = resourceResponse.ok;
                const fileSuccess = fileResponse.ok;
    
                // Handle success and error responses
                if (resourceSuccess && fileSuccess) {
                    Swal.fire('Shared!', 'Resource has been shared successfully.', 'success');
                } else {
                    const resourceErrorData = await resourceResponse.json();
                    const fileErrorData = await fileResponse.json();
                    Swal.fire('Error!', resourceErrorData.message || 'Failed to share resource or file.', 'error');
                }
            } catch (error) {
                console.error('Error sharing resources or files:', error);
                Swal.fire('Error!', 'An unexpected error occurred while sharing.', 'error');
            }
        }
    };
    
    

    
   // Function to render shared resources into the DOM
const renderSharedResources = (resources, files) => {
    const sharedResourceList = document.querySelector('.shared-resource-list ul');
    sharedResourceList.innerHTML = ''; // Clear the list first

    // Render string-based shared resources
    resources.forEach(resource => {
        const resourceItem = document.createElement('li');
        const resourceLink = document.createElement('a');
        resourceLink.href = resource.fileUrl;
        resourceLink.textContent = `${resource.title} - ${resource.description || 'No description'}`;
        resourceItem.appendChild(resourceLink);
        
        // Add a delete button if the resource was shared with the user
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deleteResource(resource._id, 'resource');
        
        resourceItem.appendChild(deleteButton);
        sharedResourceList.appendChild(resourceItem);
    });

    // Render file-based shared resources
    files.forEach(file => {
        const fileItem = document.createElement('li');
        const fileLink = document.createElement('a');
        fileLink.href = `${API_BASE_URL}/resourcesfile/${file._id}`; // Adjust URL as needed
        fileLink.textContent = `${file.file.originalName}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deleteResource(file._id, 'file');

        fileItem.appendChild(fileLink);
        fileItem.appendChild(deleteButton);
        sharedResourceList.appendChild(fileItem);
    });
};


    // Fetch resources and shared resources on page load
    fetchResources(`${API_BASE_URL}/resources`).then(resources => {
        fetchResources(`${API_BASE_URL}/resourcesfile`).then(files => {
            renderResources(resources, files);
        });
    });

    fetchSharedResources();
});
