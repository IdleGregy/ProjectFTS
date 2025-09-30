// =====================
// Dashboard.js - Role-aware Sidebar
// =====================

// Sidebar toggle
function initSidebarToggle() {
  document.querySelectorAll('.submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const parentLi = toggle.parentElement;
      parentLi.classList.toggle('open');
      const submenu = toggle.nextElementSibling;
      if (submenu) submenu.style.display = parentLi.classList.contains('open') ? 'block' : 'none';
    });
  });
}

// Sidebar generation
function generateSidebar(role) {
  const sidebar = document.getElementById('sidebarMenu');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  const menuItems = [
    { label: 'Home', href: '/modules/dashboard/dashboard.html', roles: ['user', 'admin'] },
    { label: 'User Management', href: '#', roles: ['admin'], children: [
      { label: 'User Manager', href: '/modules/user-manager/user-manager.html', roles: ['admin'] },
      { label: 'Role Manager', href: '/modules/role-manager/role-manager.html', roles: ['admin'] }
    ]},
    { label: 'Reports', href: '#', roles: ['admin'] },
    { label: 'Settings', href: '#', roles: ['user', 'admin'] }
  ];

  menuItems.forEach(item => {
    if (!item.roles.includes(role)) return;

    const li = document.createElement('li');
    li.classList.add('menu-item');

    if (item.children) {
      const a = document.createElement('a');
      a.href = item.href;
      a.classList.add('submenu-toggle');
      a.textContent = item.label;
      li.appendChild(a);

      const ul = document.createElement('ul');
      ul.classList.add('submenu');
      ul.style.display = 'none';

      item.children.forEach(child => {
        if (!child.roles.includes(role)) return;
        const childLi = document.createElement('li');
        const childA = document.createElement('a');
        childA.href = child.href;
        childA.textContent = child.label;
        childLi.appendChild(childA);
        ul.appendChild(childLi);
      });

      li.appendChild(ul);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
    }

    sidebar.appendChild(li);
  });

  // Highlight active
  document.querySelectorAll('#sidebarMenu a').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });
}

// Dashboard init
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (!username || !role) {
      window.location.href = '/modules/login/login.html';
      return;
    }

    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) usernameDisplay.textContent = username;

    generateSidebar(role);
    initSidebarToggle();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '/modules/login/login.html';
      });
    }
  } catch (err) {
    console.error(err);
    window.location.href = '/modules/login/login.html';
  }
});
