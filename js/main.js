// Navigation logic
const navDashboard = document.getElementById('nav-dashboard');
const navLeaderboard = document.getElementById('nav-leaderboard');
const dashboardSection = document.getElementById('dashboard-section');
const leaderboardSection = document.getElementById('leaderboard-section');

navDashboard.addEventListener('click', () => {
  navDashboard.classList.add('active');
  navLeaderboard.classList.remove('active');
  dashboardSection.style.display = '';
  leaderboardSection.style.display = 'none';
});
navLeaderboard.addEventListener('click', () => {
  navLeaderboard.classList.add('active');
  navDashboard.classList.remove('active');
  dashboardSection.style.display = 'none';
  leaderboardSection.style.display = '';
});

// Status and participants mock data (replace with real data as needed)
// const eventStatus = {
//   'Carroms': {status: 'Live', participants: 8},
//   'Chess': {status: 'Upcoming', participants: 12},
//   'Foosball': {status: 'Completed', participants: 6},
//   'Dart': {status: 'Live', participants: 10},
//   'Fungames': {status: 'Upcoming', participants: 15},
//   'Cricket': {status: 'Live', participants: 8},
//   'Football': {status: 'Upcoming', participants: 10},
//   'Basketball shooting': {status: 'Completed', participants: 6},
//   'Penalty shootout': {status: 'Live', participants: 10},
//   'Badminton': {status: 'Live', participants: 16},
//   'Bowling': {status: 'Upcoming', participants: 12},
//   'Walking race': {status: 'Completed', participants: 20},
//   'Running race': {status: 'Upcoming', participants: 18},
//   'Relay': {status: 'Upcoming', participants: 8},
//   'Shotput': {status: 'Completed', participants: 8},
//   'Frisbee': {status: 'Live', participants: 12},
//   'Cricket Ball Throw': {status: 'Upcoming', participants: 14},
//   'March past': {status: 'Upcoming', participants: 24}
// };

// Fetch and render event schedule
document.addEventListener('DOMContentLoaded', () => {
  fetch('data/events.json')
    .then(res => res.json())
    .then(data => renderAllEvents(data))
    .catch(() => showError('all-events-content', 'Unable to load event schedule.'));

  fetch('data/points.json')
    .then(res => res.json())
    .then(data => renderPoints(data))
    .catch(() => showError('points-content', 'Unable to load team points.'));
});

function getEventStatus(event) {
  // Assumes event.date is YYYY-MM-DD and event.time is in 12hr format
  if (!event.date || !event.time) return { status: 'Upcoming', badgeClass: 'status-upcoming' };
  const now = new Date();
  const eventStart = new Date(`${event.date} ${event.time}`);
  // Assume each event lasts 2 hours for demo
  const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
  if (now < eventStart) return { status: 'Upcoming', badgeClass: 'status-upcoming' };
  if (now >= eventStart && now <= eventEnd) return { status: 'Live', badgeClass: 'status-live' };
  return { status: 'Completed', badgeClass: 'status-completed' };
}

function renderAllEvents(events) {
  const container = document.getElementById('all-events-content');
  if (!Array.isArray(events) || events.length === 0) {
    container.innerHTML = '<div class="loading">No events scheduled.</div>';
    return;
  }
  // Sort by date and time
  events.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA - dateB;
  });
  container.innerHTML = events.map(event => {
    const { status, badgeClass } = getEventStatus(event);
    return `
      <div class="event-card">
        <h3>${event.name}</h3>
        <div class="event-details">
          <span class="status-badge ${badgeClass}">${status}</span><br>
          <strong>Date:</strong> ${event.date || 'TBD'}<br>
          <strong>Time:</strong> ${event.time || 'TBD'}<br>
          <strong>Venue:</strong> ${event.venue || 'TBD'}
        </div>
      </div>
    `;
  }).join('');
}

function renderPoints(points) {
  const container = document.getElementById('points-content');
  if (!Array.isArray(points) || points.length === 0) {
    container.innerHTML = '<div class="loading">No points data available.</div>';
    return;
  }
  container.innerHTML = points.map(team => `
    <div class="team-card">
      <h3>${team.team}</h3>
      <div class="team-details">
        <strong>Points:</strong> ${team.points}
      </div>
    </div>
  `).join('');
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = `<div id="error-message">${message}</div>`;
}

// Show footer only when scrolled to bottom
window.addEventListener('scroll', function() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;
  if (scrollY + windowHeight >= bodyHeight - 2) {
    footer.style.display = '';
  } else {
    footer.style.display = 'none';
  }
});
// Hide footer initially
window.addEventListener('DOMContentLoaded', function() {
  const footer = document.querySelector('footer');
  if (footer) footer.style.display = 'none';
});
