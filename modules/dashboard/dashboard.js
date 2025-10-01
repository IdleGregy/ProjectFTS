// =====================
// Dashboard.js - Dynamic Role-aware Sidebar with Submodules
// =====================

// Modules array with optional submodules
const modules = [
  {
    name: "Dashboard",
    path: "/modules/dashboard/dashboard.html",
    roles: ["user", "admin"]
  },
  {
    name: "User Management",
    path: "#",
    roles: ["admin"],
    children: [
      { name: "User Manager", path: "/modules/usermanager/user-manager.html", roles: ["admin"] },
      { name: "Role Manager", path: "/modules/role/role-manager.html", roles: ["admin"] }

    ]
  },
  {
    name: "Reports",
    path: "/modules/reports/reports.html",
    roles: ["admin"]
  },
  {
    name: "Settings",
    path: "/modules/settings/settings.html",
    roles: ["user", "admin"]
  }
];

// Generate sidebar with nested submodules
function generateSidebar(role) {
  const sidebar = document.getElementById('sidebarMenu');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  modules.forEach(item => {
    if (!item.roles.includes(role)) return;

    const li = document.createElement('li');
    li.classList.add('menu-item');

    if (item.children && item.children.length > 0) {
      // Parent module with submodules
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = item.name;
      a.classList.add('submenu-toggle');
      li.appendChild(a);

      const ul = document.createElement('ul');
      ul.classList.add('submenu');
      ul.style.display = 'none';

      item.children.forEach(child => {
        if (!child.roles.includes(role)) return;
        const childLi = document.createElement('li');
        const childA = document.createElement('a');
        childA.href = child.path;
        childA.textContent = child.name;
        childLi.appendChild(childA);
        ul.appendChild(childLi);
      });

      li.appendChild(ul);

      // Toggle submenu on click with arrow rotation
      a.addEventListener('click', e => {
        e.preventDefault();
        const isOpen = ul.style.display === 'block';
        ul.style.display = isOpen ? 'none' : 'block';
        li.classList.toggle('open', !isOpen);
      });

    } else {
      // Single module
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = item.name;
      li.appendChild(a);
    }

    sidebar.appendChild(li);
  });

  // Highlight current page and expand submenu if active
  document.querySelectorAll('#sidebarMenu a').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
      const parentUl = link.closest('.submenu');
      if (parentUl) {
        parentUl.style.display = 'block';
        const parentLi = parentUl.closest('.menu-item');
        if (parentLi) parentLi.classList.add('open');
      }
    }
  });
}

// Fetch user info from backend instead of localStorage
async function getUserInfo() {
  try {
    const res = await fetch('/api/dashboard', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    return data; // { username, role }
  } catch (err) {
    console.error(err);
    window.location.href = '/modules/login/login.html';
  }
}

// Dashboard init
document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = await getUserInfo();
  if (!userInfo) return;

  const usernameDisplay = document.getElementById('usernameDisplay');
  if (usernameDisplay) usernameDisplay.textContent = userInfo.username;

  generateSidebar(userInfo.role);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/modules/login/login.html';
    });
  }
});
