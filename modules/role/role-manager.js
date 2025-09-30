// =====================
// Sidebar Submenu Toggle (Updated)
// =====================
document.querySelectorAll('.submenu-toggle').forEach(toggle => {
  toggle.addEventListener('click', e => {
    // Only toggle submenu, do not block child links
    e.preventDefault(); 

    const parentLi = toggle.parentElement;
    parentLi.classList.toggle('open'); // rotate arrow
    const submenu = toggle.nextElementSibling;
    submenu.style.display = parentLi.classList.contains('open') ? 'block' : 'none';
  });
});

// =====================
// Role Management
// =====================

// Active roles and recycle bin
let roles = [
  { id: 1, name: 'Administrator', description: 'Full access to system', modifiedBy: 'System', restoreBy: '-' },
  { id: 2, name: 'User', description: 'Standard access', modifiedBy: 'System', restoreBy: '-' }
];
let recycleBin = [];
let nextId = 3;
let editId = null;

const modal = document.getElementById("roleModal");
const modalTitle = document.getElementById("modalTitle");
const roleForm = document.getElementById("roleForm");
const roleNameInput = document.getElementById("roleName");
const roleDescInput = document.getElementById("roleDesc");
const closeBtn = document.querySelector(".close");

// =====================
// Render Functions
// =====================
function renderActiveRoles(list = roles) {
  const tbody = document.getElementById("activeRoleBody");
  tbody.innerHTML = "";
  list.forEach(role => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${role.id}</td>
      <td>${role.name}</td>
      <td>${role.description}</td>
      <td>${role.restoreBy || '-'}</td>
      <td>${role.modifiedBy || '-'}</td>
      <td>
        <button class="edit-btn" onclick="openEditModal(${role.id})">Edit</button>
        <button class="delete-btn" onclick="deleteRole(${role.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderRecycleBin() {
  const tbody = document.getElementById("recycleBinBody");
  tbody.innerHTML = "";
  recycleBin.forEach(role => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${role.id}</td>
      <td>${role.name}</td>
      <td>${role.description}</td>
      <td>${role.deletedBy || '-'}</td>
      <td>
        <button class="restore-btn" onclick="restoreRole(${role.id})">Restore</button>
        <button class="permanent-delete-btn" onclick="permanentDelete(${role.id})">Permanent Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// =====================
// Modal Functions
// =====================
function openAddModal() {
  editId = null;
  modalTitle.textContent = "Add Role";
  roleNameInput.value = "";
  roleDescInput.value = "";
  modal.style.display = "block";
}

function openEditModal(id) {
  const role = roles.find(r => r.id === id);
  if (!role) return;
  editId = id;
  modalTitle.textContent = "Edit Role";
  roleNameInput.value = role.name;
  roleDescInput.value = role.description;
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

// =====================
// CRUD Functions
// =====================
function saveRole(e) {
  e.preventDefault();
  const name = roleNameInput.value.trim();
  const desc = roleDescInput.value.trim();
  if (!name || !desc) return alert("Please enter role name and description.");

  if (editId) {
    const role = roles.find(r => r.id === editId);
    if (role) {
      role.name = name;
      role.description = desc;
      role.modifiedBy = "Admin";
    }
  } else {
    roles.push({ id: nextId++, name, description: desc, modifiedBy: "Admin", restoreBy: "-" });
  }

  renderActiveRoles();
  closeModal();
}

function deleteRole(id) {
  if (!confirm("Are you sure you want to delete this role?")) return;
  const index = roles.findIndex(r => r.id === id);
  if (index !== -1) {
    const deletedRole = roles.splice(index, 1)[0];
    deletedRole.deletedBy = "Admin";
    recycleBin.push(deletedRole);
  }
  renderActiveRoles();
  renderRecycleBin();
}

function restoreRole(id) {
  const index = recycleBin.findIndex(r => r.id === id);
  if (index !== -1) {
    const restoredRole = recycleBin.splice(index, 1)[0];
    restoredRole.restoreBy = "Admin";
    roles.push(restoredRole);
  }
  renderActiveRoles();
  renderRecycleBin();
}

function permanentDelete(id) {
  if (!confirm("Permanently delete this role?")) return;
  recycleBin = recycleBin.filter(r => r.id !== id);
  renderRecycleBin();
}

// =====================
// Search Functions
// =====================
function searchRole() {
  const query = document.getElementById("searchRole").value.toLowerCase();
  const filtered = roles.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query)
  );
  renderActiveRoles(filtered);
}

function clearSearch() {
  document.getElementById("searchRole").value = "";
  renderActiveRoles();
}

// =====================
// Event Listeners
// =====================
document.getElementById("addRoleBtn").addEventListener("click", openAddModal);
document.getElementById("clearSearch").addEventListener("click", clearSearch);
document.getElementById("searchRole").addEventListener("input", searchRole);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => { if (e.target === modal) closeModal(); });
roleForm.addEventListener("submit", saveRole);

// Initial render
renderActiveRoles();
renderRecycleBin();
