// Helper: map event id to icon (using Tabler Icons)
const eventIcons = {
  carroms: 'ti-box-model',
  chess: 'ti-chess-queen',
  foosball: 'ti-soccer-field',
  dart: 'ti-target-arrow',
  fungames: 'ti-confetti',
  cricket: 'ti-cricket',
  football: 'ti-ball-football',
  badminton: 'ti-table',
  bowling: 'ti-bowling',
  'walking-race': 'ti-walk',
  'running-race': 'ti-run',
  relay: 'ti-arrows-exchange',
  shotput: 'ti-play-handball',
  frisbee: 'ti-disc',
  'basketball-shooting': 'ti-ball-basketball',
  'penalty-shootout': 'ti-ball-football',
  'cricket-ball-throw': 'ti-bounce-right',
  'march-past': 'ti-users-group'
};

// Navigation logic
const navDashboard = document.getElementById('nav-dashboard');
const navLeaderboard = document.getElementById('nav-leaderboard');
const dashboardSection = document.getElementById('dashboard-section');
const leaderboardSection = document.getElementById('leaderboard-section');

navDashboard.addEventListener('click', () => {
  window.location.hash = '#dashboard';
  navDashboard.classList.add('active');
  navLeaderboard.classList.remove('active');
  dashboardSection.style.display = '';
  leaderboardSection.style.display = 'none';
});
navLeaderboard.addEventListener('click', () => {
  window.location.hash = '#leaderboard';
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
  // Switch to dashboard tab if hash is #dashboard
  if (window.location.hash === '#dashboard') {
    navDashboard.classList.add('active');
    navLeaderboard.classList.remove('active');
    dashboardSection.style.display = '';
    leaderboardSection.style.display = 'none';
  }
  fetch('data/events.json')
    .then(res => res.json())
    .then(data => renderAllEvents(data))
    .catch(() => showError('all-events-content', 'Unable to load event schedule.'));

  fetch('data/points.json')
    .then(res => res.json())
    .then(data => renderPoints(data))
    .catch(() => showError('points-content', 'Unable to load team points.'));
});

function parseDateTime(dateStr, timeStr) {
  // Accepts MM/DD/YYYY or YYYY-MM-DD and time like '2pm' or '14:00'
  if (!dateStr || !timeStr || dateStr === 'TBD' || timeStr === 'TBD') return null;
  let [month, day, year] = [null, null, null];
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    // MM/DD/YYYY
    [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day, ...parseTime(timeStr));
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // YYYY-MM-DD
    [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, ...parseTime(timeStr));
  }
  return new Date(`${dateStr} ${timeStr}`); // fallback
}
function parseTime(timeStr) {
  // Returns [hour, minute] from '2pm', '14:00', etc.
  if (!timeStr) return [0, 0];
  let t = timeStr.trim().toLowerCase();
  if (t.match(/am|pm/)) {
    let [h, m] = t.replace(/am|pm/, '').split(':');
    h = Number(h);
    m = m ? Number(m) : 0;
    if (t.includes('pm') && h < 12) h += 12;
    if (t.includes('am') && h === 12) h = 0; // 12am is 0, 12pm is 12
    return [h, m];
  } else if (t.includes(':')) {
    let [h, m] = t.split(':').map(Number);
    return [h, m];
  } else {
    let h = Number(t);
    return [isNaN(h) ? 0 : h, 0];
  }
}
function getFixtureStatus(fixture) {
  if (!fixture.date || !fixture.time || fixture.date === 'TBD' || fixture.time === 'TBD') return 'TBD';
  const now = new Date();
  const start = parseDateTime(fixture.date, fixture.time);
  if (!start || isNaN(start.getTime())) return 'TBD';
  if (now < start) return 'upcoming';
  if (now >= start && now <= new Date(start.getTime() + 2 * 60 * 60 * 1000)) return 'live';
  return 'completed';
}

function getEventSortKey(event) {
  // Gather all fixture dates
  let allFixtures = [];
  if (Array.isArray(event.categories)) {
    event.categories.forEach(cat => {
      if (Array.isArray(cat.fixtures)) allFixtures = allFixtures.concat(cat.fixtures);
    });
  } else if (Array.isArray(event.fixtures)) {
    allFixtures = event.fixtures;
  }
  let hasUpcoming = false, hasTBD = false, mostRecent = null;
  for (const fix of allFixtures) {
    const status = getFixtureStatus(fix);
    if (status === 'TBD') hasTBD = true;
    else if (status === 'upcoming' || status === 'live') {
      hasUpcoming = true;
      const dt = parseDateTime(fix.date, fix.time);
      if (dt && (!mostRecent || dt < mostRecent)) mostRecent = dt;
    }
  }
  // Sort key: [0, date] for upcoming, [1, date] for completed, [2, 0] for TBD
  if (hasUpcoming && mostRecent) return [0, mostRecent.getTime()];
  if (!hasUpcoming && !hasTBD && allFixtures.length > 0) {
    // All completed, use latest fixture date
    let latest = null;
    for (const fix of allFixtures) {
      if (fix.date && fix.time && fix.date !== 'TBD' && fix.time !== 'TBD') {
        const dt = parseDateTime(fix.date, fix.time);
        if (dt && (!latest || dt > latest)) latest = dt;
      }
    }
    return [1, latest ? latest.getTime() : 0];
  }
  return [2, 0]; // TBD
}

function getEventStatus(event) {
  // Use fixture-level status
  let allFixtures = [];
  if (Array.isArray(event.categories)) {
    event.categories.forEach(cat => {
      if (Array.isArray(cat.fixtures)) allFixtures = allFixtures.concat(cat.fixtures);
    });
  } else if (Array.isArray(event.fixtures)) {
    allFixtures = event.fixtures;
  }
  let hasLive = false, hasUpcoming = false, hasTBD = false;
  for (const fix of allFixtures) {
    const status = getFixtureStatus(fix);
    if (status === 'live') hasLive = true;
    else if (status === 'upcoming') hasUpcoming = true;
    else if (status === 'TBD') hasTBD = true;
  }
  if (hasLive) return { status: 'Live', badgeClass: 'status-live' };
  if (hasUpcoming) return { status: 'Upcoming', badgeClass: 'status-upcoming' };
  if (!hasUpcoming && !hasTBD && allFixtures.length > 0) return { status: 'Completed', badgeClass: 'status-completed' };
  return { status: 'Upcoming', badgeClass: 'status-upcoming' };
}

function renderAllEvents(events) {
  const container = document.getElementById('all-events-content');
  if (!Array.isArray(events) || events.length === 0) {
    container.innerHTML = '<div class="loading">No events scheduled.</div>';
    return;
  }
  // Sort events by fixture logic
  events.sort((a, b) => {
    const ka = getEventSortKey(a);
    const kb = getEventSortKey(b);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    return ka[1] - kb[1];
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
          <span class="event-icon"><i class="ti ${eventIcons[event.id] || 'ti-trophy'}"></i></span>
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
  // Sort by points descending
  const sorted = [...points].sort((a, b) => b.points - a.points);
  const maxPoints = sorted[0]?.points || 1;
  const teamColors = ['team-a', 'team-b', 'team-c', 'team-d', 'team-e', 'team-f'];
  // Check if there is a unique leader
  const isUniqueLeader = sorted.length > 1 ? sorted[0].points > sorted[1].points : true;
  container.innerHTML = `
    <div class="leaderboard-container">
      <div class="leaderboard-card">
        ${sorted.map((team, i) => `
          <div class="team-entry${i === 0 && isUniqueLeader ? ' winner' : ''}">
            <div class="rank-badge">${i + 1}</div>
            <div class="team-header" style="margin-left:2.5rem;">
              <h2>
                ${isUniqueLeader && i === 0 ? '🥇 ' : ''}
                ${isUniqueLeader && i === 1 ? '🥈 ' : ''}
                ${team.team}
                ${isUniqueLeader && i === 0 ? ' <span class=\"leader-badge\">LEADING</span> 👑' : ''}
              </h2>
              <div class="points">${team.points.toLocaleString()} <span>points</span></div>
            </div>
            <div class="progress-container">
              <div class="progress-bar ${teamColors[i % teamColors.length]}" style="width:${(team.points / maxPoints) * 100}%">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
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
