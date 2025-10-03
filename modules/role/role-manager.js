// =====================
// Role Manager JS (Updated for New Layout)
// =====================

document.addEventListener("DOMContentLoaded", () => {
  const addRoleBtn = document.getElementById("addRoleBtn");
  const roleModal = document.getElementById("roleModal");
  const closeModal = roleModal.querySelector(".close");
  const roleForm = document.getElementById("roleForm");
  const modalTitle = document.getElementById("modalTitle");
  const searchInput = document.getElementById("searchRole");
  const clearSearchBtn = document.getElementById("clearSearch");

  const activeRoleBody = document.getElementById("activeRoleBody");
  const recycleBinBody = document.getElementById("recycleBinBody");

  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Load from localStorage or defaults
  let roles = JSON.parse(localStorage.getItem("roles")) || [
    { id: 1, name: "Admin", desc: "Full system access", modifiedBy: "System" },
    { id: 2, name: "User", desc: "Basic access", modifiedBy: "System" }
  ];
  let deletedRoles = JSON.parse(localStorage.getItem("deletedRoles")) || [];
  let editingRoleId = null;

  // ===== Helper: Save + Notify =====
  function saveAndNotify() {
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("deletedRoles", JSON.stringify(deletedRoles));
    document.dispatchEvent(new Event("rolesUpdated"));
    window.dispatchEvent(new Event("storage"));
  }

  // ===== Modal Handling =====
  addRoleBtn.addEventListener("click", () => openModal("Add New Role"));
  closeModal.addEventListener("click", () => closeModalFunc());
  window.addEventListener("click", e => { if (e.target === roleModal) closeModalFunc(); });

  function openModal(title) {
    modalTitle.textContent = title;
    roleForm.reset();
    roleModal.style.display = "block";
  }

  function closeModalFunc() {
    roleModal.style.display = "none";
    editingRoleId = null;
  }

  // ===== Form Submit =====
  roleForm.addEventListener("submit", e => {
    e.preventDefault();
    const roleName = document.getElementById("roleName").value.trim();
    const roleDesc = document.getElementById("roleDesc").value.trim();

    if (!roleName || !roleDesc) return alert("Please fill out all fields.");

    if (editingRoleId) {
      // Update existing role
      const role = roles.find(r => r.id === editingRoleId);
      if (role) {
        role.name = roleName;
        role.desc = roleDesc;
        role.modifiedBy = "Admin"; // TODO: replace with logged-in user
      }
    } else {
      // Add new role
      const newRole = {
        id: roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1,
        name: roleName,
        desc: roleDesc,
        modifiedBy: "Admin"
      };
      roles.push(newRole);
    }

    saveAndNotify();
    renderRoles(searchInput.value);
    closeModalFunc();
  });

  // ===== Search =====
  searchInput.addEventListener("input", () => renderRoles(searchInput.value));
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderRoles();
  });

  // ===== Tab Switching =====
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // ===== Render Roles =====
  function renderRoles(filter = "") {
    activeRoleBody.innerHTML = "";
    recycleBinBody.innerHTML = "";

    // Active Roles
    roles.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach(role => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${role.id}</td>
          <td>${role.name}</td>
          <td>${role.desc}</td>
          <td>${role.modifiedBy}</td>
          <td>
            <button class="edit-btn" data-id="${role.id}">Edit</button>
            <button class="delete-btn" data-id="${role.id}">Delete</button>
          </td>
        `;
        activeRoleBody.appendChild(tr);
      });

    // Recycle Bin Roles
    deletedRoles.forEach(role => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${role.id}</td>
        <td>${role.name}</td>
        <td>${role.desc}</td>
        <td>${role.modifiedBy}</td>
        <td>
          <button class="restore-btn" data-id="${role.id}">Restore</button>
          <button class="permanent-delete-btn" data-id="${role.id}">Delete</button>
        </td>
      `;
      recycleBinBody.appendChild(tr);
    });

    attachActions(filter);
  }

  // ===== Attach Actions =====
  function attachActions(filter = "") {
    // Edit
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id);
        const role = roles.find(r => r.id === id);
        if (role) {
          editingRoleId = id;
          modalTitle.textContent = "Edit Role";
          document.getElementById("roleName").value = role.name;
          document.getElementById("roleDesc").value = role.desc;
          roleModal.style.display = "block";
        }
      };
    });

    // Delete
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id);
        const index = roles.findIndex(r => r.id === id);
        if (index > -1) {
          deletedRoles.push(roles[index]);
          roles.splice(index, 1);
          saveAndNotify();
          renderRoles(filter);
        }
      };
    });

    // Restore
    document.querySelectorAll(".restore-btn").forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id);
        const index = deletedRoles.findIndex(r => r.id === id);
        if (index > -1) {
          roles.push(deletedRoles[index]);
          deletedRoles.splice(index, 1);
          saveAndNotify();
          renderRoles(filter);
        }
      };
    });

    // Permanent Delete
    document.querySelectorAll(".permanent-delete-btn").forEach(btn => {
      btn.onclick = () => {
        const id = parseInt(btn.dataset.id);
        deletedRoles = deletedRoles.filter(r => r.id !== id);
        saveAndNotify();
        renderRoles(filter);
      };
    });
  }

  // ===== Initial Render =====
  renderRoles();
});
