// =====================
// Role Manager JS (Final Updated)
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

  // Load from localStorage or defaults
  let roles = JSON.parse(localStorage.getItem("roles")) || [
    { id: 1, name: "Admin", desc: "Full system access", modifiedBy: "System" },
    { id: 2, name: "User", desc: "Basic access", modifiedBy: "System" }
  ];
  let deletedRoles = JSON.parse(localStorage.getItem("deletedRoles")) || [];
  let editingRoleId = null;

  // ===== Helper: Save + Dispatch Event =====
  function saveAndNotify() {
    localStorage.setItem("roles", JSON.stringify(roles));
    localStorage.setItem("deletedRoles", JSON.stringify(deletedRoles));

    // Notify other modules (like user-manager.js)
    document.dispatchEvent(new Event("rolesUpdated"));
    window.dispatchEvent(new Event("storage")); // triggers cross-tab sync
  }

  // ========== Modal Handling ==========
  addRoleBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add New Role";
    roleForm.reset();
    editingRoleId = null;
    roleModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    roleModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === roleModal) roleModal.style.display = "none";
  });

  // ========== Form Submit ==========
  roleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roleName = document.getElementById("roleName").value.trim();
    const roleDesc = document.getElementById("roleDesc").value.trim();

    if (!roleName || !roleDesc) {
      alert("Please fill out all fields.");
      return;
    }

    if (editingRoleId) {
      // Update role
      const role = roles.find(r => r.id === editingRoleId);
      if (role) {
        role.name = roleName;
        role.desc = roleDesc;
        role.modifiedBy = "Admin"; // TODO: replace with logged in user
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
    renderRoles();
    roleForm.reset();
    roleModal.style.display = "none";
  });

  // ========== Search ==========
  searchInput.addEventListener("input", () => {
    renderRoles(searchInput.value);
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderRoles();
  });

  // ========== Render ==========
  function renderRoles(filter = "") {
    activeRoleBody.innerHTML = "";
    recycleBinBody.innerHTML = "";

    // Active roles
    roles
      .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
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

    // Deleted roles
    deletedRoles.forEach(role => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${role.id}</td>
        <td>${role.name}</td>
        <td>${role.desc}</td>
        <td>${role.modifiedBy}</td>
        <td>
          <button class="restore-btn" data-id="${role.id}">Restore</button>
          <button class="permanent-delete-btn" data-id="${role.id}">Permanent Delete</button>
        </td>
      `;
      recycleBinBody.appendChild(tr);
    });

    attachActions(filter);
  }

  // ========== Attach Actions ==========
  function attachActions(filter = "") {
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const role = roles.find(r => r.id === id);
        if (role) {
          editingRoleId = id;
          modalTitle.textContent = "Edit Role";
          document.getElementById("roleName").value = role.name;
          document.getElementById("roleDesc").value = role.desc;
          roleModal.style.display = "block";
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const roleIndex = roles.findIndex(r => r.id === id);
        if (roleIndex > -1) {
          deletedRoles.push(roles[roleIndex]);
          roles.splice(roleIndex, 1);
          saveAndNotify();
          renderRoles(filter);
        }
      });
    });

    document.querySelectorAll(".restore-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const roleIndex = deletedRoles.findIndex(r => r.id === id);
        if (roleIndex > -1) {
          roles.push(deletedRoles[roleIndex]);
          deletedRoles.splice(roleIndex, 1);
          saveAndNotify();
          renderRoles(filter);
        }
      });
    });

    document.querySelectorAll(".permanent-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        deletedRoles = deletedRoles.filter(r => r.id !== id);
        saveAndNotify();
        renderRoles(filter);
      });
    });
  }

  // Init render
  renderRoles();
});
