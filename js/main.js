// Helper: map event id to icon (using Material Symbols)
const eventIcons = {
  carroms: 'casino',                    // Board game icon
  chess: 'chess',                       // Casino/board games (closest available)
  foosball: 'sports_soccer',            // Soccer icon works well for foosball
  dart: 'gps_fixed',                    // Target/precision icon
  fungames: 'celebration',              // Party/fun icon
  cricket: 'sports_cricket',            // Perfect match
  football: 'sports_and_outdoors',      // Football icon
  badminton: 'sports_tennis',           // Tennis racket icon (closest for racket sports)
  bowling: 'album',                     // Circular icon representing bowling ball
  'walking-race': 'directions_walk',    // Walking person icon
  'running-race': 'directions_run',     // Running person icon
  relay: 'swap_horiz',                  // Horizontal swap/exchange icon
  shotput: 'circle',            // Gym/strength training icon
  frisbee: 'album',                     // Disc-shaped icon
  'basketball-shooting': 'sports_basketball', // Perfect match
  'penalty-shootout': 'sports_soccer',  // Soccer icon for penalty kicks
  'cricket-ball-throw': 'sports_cricket', // Cricket icon for cricket-related events
  'march-past': 'emoji_people'          // People/parade icon
};

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
  container.innerHTML = events.map((event, idx) => {
    const { status, badgeClass } = getEventStatus(event);
    let fixturesHtml = '';
    if (Array.isArray(event.fixtures) && event.fixtures.length > 0) {
      fixturesHtml = `<div class="fixtures" id="fixtures-${event.id}" style="display:none; margin-top:10px;">
        <strong>Fixtures:</strong>
        <ul style="margin:0; padding-left:18px;">
          ${event.fixtures.map(f => `<li>${f.teamA} vs ${f.teamB} <span style='color:#888;'>(${f.time})</span></li>`).join('')}
        </ul>
      </div>`;
    }
    return `
      <div class="event-card" data-id="${event.id}" tabindex="0" aria-label="View details for ${event.name}">
        <div class="event-card-content" style="display: flex; align-items: flex-start; width: 100%;">
          <div style="flex:1; display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;">
            <h3 style="margin: 0;">${event.name}</h3>
            <span class="status-badge ${badgeClass}" style="margin-top: 0.2rem;">${status}</span>
          </div>
          <span class="event-icon material-symbols-outlined" style="font-size:2.2rem; margin-left: 1.2rem; align-self: flex-start;">${eventIcons[event.id] || 'sports'}</span>
        </div>
      </div>
    `;
  }).join('');

  // Add click and keyboard listeners to event cards for navigation
  Array.from(container.getElementsByClassName('event-card')).forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      const id = card.getAttribute('data-id');
      window.location.href = `event-detail.html?event=${encodeURIComponent(id)}`;
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
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
