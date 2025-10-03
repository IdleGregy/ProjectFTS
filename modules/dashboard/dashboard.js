// =====================
// Dashboard.js - Dynamic Role-aware Sidebar with Accordion + Animations
// =====================

const modules = [
  { name: "Dashboard", path: "/modules/dashboard/dashboard.html", roles: ["user", "admin"] },
  {
    name: "User Management",
    path: "#",
    roles: ["admin"],
    children: [
      { name: "User Manager", path: "/modules/usermanager/user-manager.html", roles: ["admin"] },
      { name: "Role Manager", path: "/modules/role/role-manager.html", roles: ["admin"] }
    ]
  },
  { name: "Reports", path: "/modules/reports/reports.html", roles: ["admin"] },
  { name: "Settings", path: "/modules/settings/settings.html", roles: ["user", "admin"] }
];

function generateSidebar(role) {
  const sidebar = document.getElementById('sidebarMenu');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  modules.forEach(item => {
    if (!item.roles.includes(role)) return;

    const li = document.createElement('li');
    li.classList.add('menu-item');

    if (item.children && item.children.length > 0) {
      const a = document.createElement('a');
      a.href = 'javascript:void(0)'; // Prevent page refresh
      a.textContent = item.name;
      a.classList.add('submenu-toggle');
      li.appendChild(a);

      const ul = document.createElement('ul');
      ul.classList.add('submenu');
      ul.style.maxHeight = '0';
      ul.style.opacity = '0';
      ul.style.overflow = 'hidden';
      ul.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
      ul.style.display = 'flex';
      ul.style.flexDirection = 'column';

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

      // Accordion toggle
      a.addEventListener('click', e => {
        e.preventDefault();
        const isOpen = li.classList.contains('open');

        // Close other open submenus
        document.querySelectorAll('.menu-item.open').forEach(otherLi => {
          if (otherLi !== li) {
            const otherUl = otherLi.querySelector('.submenu');
            if (otherUl) {
              otherUl.style.maxHeight = '0';
              otherUl.style.opacity = '0';
            }
            otherLi.classList.remove('open');
          }
        });

        // Toggle clicked submenu
        if (isOpen) {
          ul.style.maxHeight = '0';
          ul.style.opacity = '0';
        } else {
          ul.style.maxHeight = ul.scrollHeight + 'px';
          ul.style.opacity = '1';
        }
        li.classList.toggle('open', !isOpen);
      });

    } else {
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = item.name;
      li.appendChild(a);
    }

    sidebar.appendChild(li);
  });

  // Highlight current page
  document.querySelectorAll('#sidebarMenu a').forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
      link.style.transition = "background 0.4s ease, color 0.4s ease";
      link.style.background = "rgba(251, 191, 36, 0.6)"; // 60% opacity
      link.style.color = "#1f2937";


      const parentUl = link.closest('.submenu');
      if (parentUl) {
        parentUl.style.maxHeight = parentUl.scrollHeight + 'px';
        parentUl.style.opacity = '1';
        const parentLi = parentUl.closest('.menu-item');
        if (parentLi) parentLi.classList.add('open');
      }
    }
  });
}

// Fetch user info
async function getUserInfo() {
  try {
    const res = await fetch('/api/dashboard', { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');
    return await res.json();
  } catch (err) {
    console.error(err);
    window.location.href = '/modules/login/login.html';
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = await getUserInfo();
  if (!userInfo) return;

  const usernameDisplay = document.getElementById('usernameDisplay');
  if (usernameDisplay) {
    usernameDisplay.textContent = userInfo.username;
    usernameDisplay.style.opacity = '0';
    setTimeout(() => {
      usernameDisplay.style.transition = "opacity 0.6s ease";
      usernameDisplay.style.opacity = '1';
    }, 100);
  }

  generateSidebar(userInfo.role);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.style.transition = "transform 0.2s ease, opacity 0.3s ease";
      logoutBtn.style.transform = "scale(0.9)";
      logoutBtn.style.opacity = "0.6";
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setTimeout(() => window.location.href = '/modules/login/login.html', 300);
    });
  }
});
