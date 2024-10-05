class AppHeader extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
        <div class="header">
            <img class="logo" src="./Icons/logo.svg" alt="Logo">
            <input id="searchInput" onkeyup="filterSections()" class="search" type="text" placeholder="Search">
            <ul>
                <li>
                    <a href="notifications.html">
                        <div class="notification-bell">
                            <img src="./Icons/notifications.svg" alt="Notifications" style="color: white; transition: transform 0.3s;">
                            <span class="notification-dot" style="display: none;"></span> <!-- Red dot -->
                        </div>
                    </a>
                </li>
                <li><a href="bus-schedule.html"><img src="./Icons/bus.svg" alt="Bus" width="30px"></a></li>
            </ul>
            <ul class="account-link">
                <a href="Profile.html" id="profile-link">
                    <img id="profile-picture" src="./Icons/profile2.jpg" alt="Profile Picture">
                    <span id="profile-name">Default Name</span>
                </a>
            </ul>
        </div>
    `;

    // Call the method to update the notification dot
    this.updateNotificationDot();
  }

  // Method to check for unread notifications and show/hide the dot
  updateNotificationDot() {
    const hasUnreadNotifications = localStorage.getItem('hasUnreadNotifications');
    const notificationDot = this.querySelector('.notification-dot');

    if (hasUnreadNotifications === 'true') {
      notificationDot.style.display = 'block'; // Show the red dot
    } else {
      notificationDot.style.display = 'none'; // Hide the red dot
    }
  }
}

function filterSections() {
  const input = document.getElementById('searchInput').value.toLowerCase();

  // Filter dashboard sections (if applicable)
  const dashboardSections = document.getElementById('dashboardSections'); // Check if the section container exists
  if (dashboardSections) {
    const sections = dashboardSections.getElementsByTagName('button');
    for (let i = 0; i < sections.length; i++) {
      const sectionText = sections[i].innerText.toLowerCase();
      sections[i].style.display = sectionText.includes(input) ? '' : 'none'; // Show or hide section
    }
  }

  // Filter alert rows in the table (if applicable)
  const alertList = document.getElementById('alert-list'); // Check if the table exists
  if (alertList) {
    const rows = alertList.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const rowText = rows[i].innerText.toLowerCase();
      rows[i].style.display = rowText.includes(input) ? '' : 'none'; // Show or hide row
    }
  }

    const busScheduleList = document.getElementById('bus-schedule-list');
    const busCards = busScheduleList.getElementsByClassName('bus-card');

    if(busCards){
    Array.from(busCards).forEach(card => {
        const routeID = card.querySelector('h2').innerText.toLowerCase();
        const busID = card.querySelector('p').innerText.toLowerCase();
        const stops = card.querySelectorAll('.bus-stops tbody tr'); // Select all stop rows
        let matches = false;

        // Check if the Route ID or Bus ID matches
        if (routeID.includes(input) || busID.includes(input)) {
            matches = true;
        } else {
            // Check each stop for matching Stop ID, Arrival Time, or Departure Time
            stops.forEach(stop => {
                const stopId = stop.children[0].innerText.toLowerCase();
                const arrivalTime = stop.children[1].innerText.toLowerCase();
                const departureTime = stop.children[2].innerText.toLowerCase();
                
                if (stopId.includes(input) || arrivalTime.includes(input) || departureTime.includes(input)) {
                    matches = true; // Set to true if any stop matches
                }
            });
        }

        // Show or hide card based on matches
        card.style.display = matches ? '' : 'none';
    });

  }

  const resourceList = document.querySelector('.resource-list ul');
  const resourceItems = resourceList.getElementsByTagName('li');

  if(resourceItems){
  Array.from(resourceItems).forEach(item => {
      const resourceLink = item.querySelector('a');
      const resourceText = resourceLink.textContent.toLowerCase();
      
      // Show item if it matches the search input, otherwise hide it
      item.style.display = resourceText.includes(input) ? '' : 'none';
  });
}
}


class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="sidebar" class="sidebar">
        <button id="toggleButton" class="toggle-button">
          <img src="./Icons/arrow-left-svgrepo-com.svg" alt="Toggle">
        </button>
        <ul>
          <li><a href="dashboard.html"><img src="./Icons/dashboard-svgrepo-com.svg" alt="Dashboard"> <span>Dashboard</span></a></li>
          <li><a href="AvailableTutors.html"><img src="./Icons/people-svgrepo-com.svg" alt="Tutors"> <span>Tutors</span></a></li>
          <li><a href="csessions.html"><img src="./Icons/sessions.svg" alt="Sessions" alt="Review sessions"><span>Review sessions</span></a></li>
          <li><a href="virtualTutoring.html"><img src="./Icons/schedule-svgrepo-com.svg" alt="Virtual Tutoring"> <span>Virtual Tutoring</span></a></li>
          <li><a href="resource-sharing.html"><img src="./Icons/resources-svgrepo-com.svg" alt="Resources"> <span>Resources</span></a></li>
          <li><a href="Events.html"><img src="./Icons/event.svg" alt="Event"> <span>Event</span></a></li>
          <li><a href="CampusSafety.html"><img src="./Icons/safety.svg" alt="Safety"> <span>Campus Safety</span></a></li>
          <li><a href="#" id="logout"><img src="./Icons/logout-icon.svg" alt="Logout"> <span>Logout</span></a></li>
        </ul>
      </div>
    `;

    // Handle logout
    this.querySelector('#logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('selectedTutor');
      localStorage.removeItem('selectedSubject');
      localStorage.removeItem('role');
      window.location.href = './login.html';
    });

    // Ensure user is authenticated
    document.addEventListener('DOMContentLoaded', () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = './login.html';
      } else {
        document.body.style.display = 'block';
      }
    });

    // Handle sidebar toggle
    const sidebar = this.querySelector('#sidebar');
    const toggleButton = this.querySelector('#toggleButton');
    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

// Define the new custom elements
customElements.define('app-sidebar', AppSidebar);
customElements.define('app-header', AppHeader);
