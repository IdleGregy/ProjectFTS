// =====================
// user-manager.js - User Manager + Dynamic Sidebar + Role Sync
// =====================

// --- Sidebar & Dashboard integration ---
document.addEventListener('DOMContentLoaded', () => {
  try {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (!username || !role) {
      window.location.href = '/modules/login/login.html';
      return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) usernameDisplay.textContent = username;

    // Generate dynamic sidebar from dashboard.js modules
    if (typeof generateSidebar === "function") generateSidebar(role);

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/modules/login/login.html';
      });
    }

    // 🔄 Load roles into select right after DOM ready
    loadRolesIntoSelect();

  } catch (err) {
    console.error(err);
    window.location.href = '/modules/login/login.html';
  }
});

// =====================
// User Manager Modal Logic
// =====================

const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const closeModal = document.querySelector('.close');
const addUserForm = document.getElementById('addUserForm');
const userTable = document.getElementById('userTableBody');
const roleSelect = document.getElementById('role'); // <select id="role">

let editingRow = null;

// ===== Load Roles into Dropdown =====
function loadRolesIntoSelect() {
  if (!roleSelect) return;
  const roles = JSON.parse(localStorage.getItem("roles")) || [];

  roleSelect.innerHTML = "";

  if (roles.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No roles available";
    roleSelect.appendChild(opt);
    return;
  }

  roles.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.name;
    opt.textContent = r.name;
    roleSelect.appendChild(opt);
  });
}

// 🔔 Listen for updates from role-manager.js
document.addEventListener("rolesUpdated", () => {
  console.log("🔄 Roles updated, reloading dropdown...");
  loadRolesIntoSelect();
});

// ===== Modal Handling =====
addUserBtn.addEventListener('click', () => {
  editingRow = null;
  addUserForm.reset();
  addUserForm.querySelector('button[type="submit"]').textContent = "Save";
  loadRolesIntoSelect(); // reload roles each time modal opens
  userModal.style.display = 'block';
});

closeModal.addEventListener('click', () => userModal.style.display = 'none');
window.addEventListener('click', (e) => { if(e.target === userModal) userModal.style.display = 'none'; });

// ===== Add or Edit user =====
addUserForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value.trim();
  const role = roleSelect.value;

  if(password !== confirmPassword){
    alert("Passwords do not match!");
    return;
  }

  const username = firstName.toLowerCase() + "." + surname.toLowerCase();

  if(editingRow){ 
    editingRow.innerHTML = `
      <td>${editingRow.rowIndex}</td>
      <td>${username}</td>
      <td>${email}</td>
      <td>${role}</td>
      <td><button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button></td>
    `;
  } else { 
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${userTable.children.length + 1}</td>
      <td>${username}</td>
      <td>${email}</td>
      <td>${role}</td>
      <td><button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button></td>
    `;
    userTable.appendChild(newRow);
  }

  addUserForm.reset();
  userModal.style.display = 'none';
  attachRowButtons();
});

// ===== Attach Edit and Delete button listeners =====
function attachRowButtons(){
  const editButtons = document.querySelectorAll('.edit-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  editButtons.forEach(btn => {
    btn.onclick = (e) => {
      editingRow = e.target.closest('tr');
      const cells = editingRow.children;
      const [id, username, email, role] = [cells[0].textContent, cells[1].textContent, cells[2].textContent, cells[3].textContent];

      const names = username.split('.');
      document.getElementById('firstName').value = names[0] || '';
      document.getElementById('middleName').value = '';
      document.getElementById('surname').value = names[1] || '';
      document.getElementById('email').value = email;
      roleSelect.value = role;
      document.getElementById('password').value = '';
      document.getElementById('confirmPassword').value = '';

      addUserForm.querySelector('button[type="submit"]').textContent = "Save Changes";
      userModal.style.display = 'block';
    };
  });

  deleteButtons.forEach(btn => {
    btn.onclick = (e) => {
      if(confirm("Are you sure you want to delete this user?")){
        e.target.closest('tr').remove();
        updateRowIndices();
      }
    };
  });
}

function updateRowIndices(){
  const rows = userTable.querySelectorAll('tr');
  rows.forEach((row, index) => {
    row.children[0].textContent = index + 1;
  });
}

attachRowButtons();
