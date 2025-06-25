const ENCRYPTED_PASS = [10, 37, 43, 42, 110, 126, 121, 105];
const PASS_KEY = 77;
function decryptPass(arr, key) {
  return String.fromCharCode(...arr.map(c => c ^ key));
}
const ADMIN_PASSWORD = decryptPass(ENCRYPTED_PASS, PASS_KEY);

const adminLogin = document.getElementById('admin-login');
const adminSection = document.getElementById('admin-section');
const loginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('admin-logout-btn');
const loginError = document.getElementById('admin-login-error');

loginBtn.onclick = function() {
  const input = document.getElementById('admin-password').value;
  if (input === ADMIN_PASSWORD) {
    adminLogin.style.display = 'none';
    adminSection.style.display = 'block';
    loginError.textContent = '';
    loadAdminData();
  } else {
    loginError.textContent = 'Incorrect password.';
  }
};
logoutBtn.onclick = function() {
  adminLogin.style.display = 'flex';
  adminSection.style.display = 'none';
  document.getElementById('admin-password').value = '';
};

// --- Admin Data Management ---
let eventsData = [];
let pointsData = [];

function loadAdminData() {
  loadEvents();
  loadPoints();
}

function loadEvents() {
  fetch('data/events.json')
    .then(res => res.json())
    .then(events => {
      eventsData = events;
      renderEventsAdmin(eventsData);
    })
    .catch(() => {
      document.getElementById('events-admin').innerHTML = '<div class="admin-error">Failed to load events.json</div>';
    });
}
function renderEventsAdmin(events) {
  let html = `<table class="admin-table"><tr><th>ID</th><th>Name</th><th>Categories</th><th>Actions</th></tr>`;
  for (const [idx, ev] of events.entries()) {
    html += `<tr><td>${ev.id}</td><td>${ev.name}</td><td>${Array.isArray(ev.categories) ? ev.categories.join(', ') : ''}</td><td class="admin-actions"><button onclick="editEvent(${idx})">Edit</button><button onclick="deleteEvent(${idx})">Delete</button></td></tr>`;
  }
  html += `</table>`;
  html += `<form class="admin-add-form" onsubmit="return addEvent(event)"><input type="text" placeholder="ID" id="add-event-id" required><input type="text" placeholder="Name" id="add-event-name" required><input type="text" placeholder="Categories (comma separated)" id="add-event-categories"><button type="submit">Add Event</button></form>`;
  html += `<button onclick="downloadEvents()" type="button">Save & Download events.json</button>`;
  document.getElementById('events-admin').innerHTML = html;
}
window.editEvent = function(idx) {
  const ev = eventsData[idx];
  let catsHtml = '';
  if (Array.isArray(ev.categories)) {
    ev.categories.forEach((cat, cidx) => {
      catsHtml += `<div style='border:1px solid #bbb; border-radius:8px; margin:8px 0; padding:8px;'>
        <label>Category Label: <input type='text' value='${cat.label || ''}' id='edit-cat-label-${cidx}'></label>
        <button type='button' onclick='addFixture(${idx},${cidx})'>Add Fixture</button>
        <button type='button' onclick='deleteCategory(${idx},${cidx})'>Delete Category</button>
        <div style='margin-left:1em;'>
          ${(cat.fixtures||[]).map((fix, fidx) => `
            <div style='border:1px dashed #ccc; margin:6px 0; padding:6px;'>
              <label>Team A: <input type='text' value='${fix.teamA||''}' id='edit-fix-teamA-${cidx}-${fidx}'></label>
              <label>Team B: <input type='text' value='${fix.teamB||''}' id='edit-fix-teamB-${cidx}-${fidx}'></label>
              <label>Date: <input type='text' value='${fix.date||''}' id='edit-fix-date-${cidx}-${fidx}'></label>
              <label>Time: <input type='text' value='${fix.time||''}' id='edit-fix-time-${cidx}-${fidx}'></label>
              <label>Venue: <input type='text' value='${fix.venue||''}' id='edit-fix-venue-${cidx}-${fidx}'></label>
              <button type='button' onclick='deleteFixture(${idx},${cidx},${fidx})'>Delete Fixture</button>
            </div>
          `).join('')}
        </div>
      </div>`;
    });
  }
  const form = `<form class="admin-edit-form" onsubmit="return saveEventEdit(event,${idx})">
    <input type="text" value="${ev.id}" id="edit-event-id" required>
    <input type="text" value="${ev.name}" id="edit-event-name" required>
    <div id='edit-categories'>${catsHtml}</div>
    <button type='button' onclick='addCategory(${idx})'>Add Category</button>
    <button type="submit">Save</button>
    <button onclick="cancelEventEdit()" type="button">Cancel</button>
  </form>`;
  document.getElementById('events-admin').innerHTML = form;
};
window.addCategory = function(idx) {
  eventsData[idx].categories = eventsData[idx].categories || [];
  eventsData[idx].categories.push({label:'',fixtures:[]});
  window.editEvent(idx);
};
window.deleteCategory = function(idx, cidx) {
  eventsData[idx].categories.splice(cidx,1);
  window.editEvent(idx);
};
window.addFixture = function(idx, cidx) {
  eventsData[idx].categories[cidx].fixtures = eventsData[idx].categories[cidx].fixtures || [];
  eventsData[idx].categories[cidx].fixtures.push({teamA:'',teamB:'',date:'',time:'',venue:''});
  window.editEvent(idx);
};
window.deleteFixture = function(idx, cidx, fidx) {
  eventsData[idx].categories[cidx].fixtures.splice(fidx,1);
  window.editEvent(idx);
};
window.saveEventEdit = function(e, idx) {
  e.preventDefault();
  const ev = eventsData[idx];
  ev.id = document.getElementById('edit-event-id').value.trim();
  ev.name = document.getElementById('edit-event-name').value.trim();
  if (Array.isArray(ev.categories)) {
    ev.categories.forEach((cat, cidx) => {
      cat.label = document.getElementById(`edit-cat-label-${cidx}`).value.trim();
      if (Array.isArray(cat.fixtures)) {
        cat.fixtures.forEach((fix, fidx) => {
          fix.teamA = document.getElementById(`edit-fix-teamA-${cidx}-${fidx}`).value.trim();
          fix.teamB = document.getElementById(`edit-fix-teamB-${cidx}-${fidx}`).value.trim();
          fix.date = document.getElementById(`edit-fix-date-${cidx}-${fidx}`).value.trim();
          fix.time = document.getElementById(`edit-fix-time-${cidx}-${fidx}`).value.trim();
          fix.venue = document.getElementById(`edit-fix-venue-${cidx}-${fidx}`).value.trim();
        });
      }
    });
  }
  renderEventsAdmin(eventsData);
  return false;
};
window.deleteEvent = function(idx) {
  if (confirm('Delete this event?')) {
    eventsData.splice(idx, 1);
    renderEventsAdmin(eventsData);
  }
};
window.addEvent = function(e) {
  e.preventDefault();
  eventsData.push({
    id: document.getElementById('add-event-id').value.trim(),
    name: document.getElementById('add-event-name').value.trim(),
    categories: document.getElementById('add-event-categories').value.split(',').map(s => s.trim()).filter(Boolean)
  });
  renderEventsAdmin(eventsData);
  return false;
};
window.downloadEvents = function() {
  const blob = new Blob([JSON.stringify(eventsData, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'events.json';
  a.click();
};

function loadPoints() {
  fetch('data/points.json')
    .then(res => res.json())
    .then(points => {
      pointsData = points;
      renderPointsAdmin(pointsData);
    })
    .catch(() => {
      document.getElementById('points-admin').innerHTML = '<div class="admin-error">Failed to load points.json</div>';
    });
}
function renderPointsAdmin(points) {
  let html = `<table class="admin-table"><tr><th>Team</th><th>Points</th><th>Actions</th></tr>`;
  for (const [idx, pt] of points.entries()) {
    html += `<tr><td>${pt.team}</td><td>${pt.points}</td><td class="admin-actions"><button onclick="editPoint(${idx})">Edit</button><button onclick="deletePoint(${idx})">Delete</button></td></tr>`;
  }
  html += `</table>`;
  html += `<form class="admin-add-form" onsubmit="return addPoint(event)"><input type="text" placeholder="Team" id="add-point-team" required><input type="number" placeholder="Points" id="add-point-value" required><button type="submit">Add Points</button></form>`;
  html += `<button onclick="downloadPoints()" type="button">Save & Download points.json</button>`;
  document.getElementById('points-admin').innerHTML = html;
}
window.editPoint = function(idx) {
  const pt = pointsData[idx];
  const form = `<form class="admin-edit-form" onsubmit="return savePointEdit(event,${idx})"><input type="text" value="${pt.team}" id="edit-point-team" required><input type="number" value="${pt.points}" id="edit-point-value" required><button type="submit">Save</button><button onclick="cancelPointEdit()" type="button">Cancel</button></form>`;
  document.getElementById('points-admin').insertAdjacentHTML('afterbegin', form);
};
window.savePointEdit = function(e, idx) {
  e.preventDefault();
  pointsData[idx] = {
    team: document.getElementById('edit-point-team').value.trim(),
    points: parseInt(document.getElementById('edit-point-value').value, 10)
  };
  renderPointsAdmin(pointsData);
  return false;
};
window.cancelPointEdit = function() { renderPointsAdmin(pointsData); };
window.deletePoint = function(idx) {
  if (confirm('Delete this entry?')) {
    pointsData.splice(idx, 1);
    renderPointsAdmin(pointsData);
  }
};
window.addPoint = function(e) {
  e.preventDefault();
  pointsData.push({
    team: document.getElementById('add-point-team').value.trim(),
    points: parseInt(document.getElementById('add-point-value').value, 10)
  });
  renderPointsAdmin(pointsData);
  return false;
};
window.downloadPoints = function() {
  const blob = new Blob([JSON.stringify(pointsData, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'points.json';
  a.click();
};
