// Modal elements
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const closeModal = document.querySelector('.close');
const addUserForm = document.getElementById('addUserForm');
const userTable = document.querySelector('.user-table tbody');

let editingRow = null; // Track the row being edited

// Open modal for Add
addUserBtn.addEventListener('click', () => {
  editingRow = null;
  addUserForm.reset();
  addUserForm.querySelector('button[type="submit"]').textContent = "Save";
  userModal.style.display = 'block';
});

// Close modal
closeModal.addEventListener('click', () => userModal.style.display = 'none');

// Close modal on outside click
window.addEventListener('click', (e) => { 
  if(e.target === userModal) userModal.style.display = 'none'; 
});

// Add or Edit user
addUserForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const middleName = document.getElementById('middleName').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const email = document.getElementById('email').value.trim();
  const role = document.getElementById('role').value;

  if(password !== confirmPassword){
    alert("Passwords do not match!");
    return;
  }

  const username = firstName.toLowerCase() + "." + surname.toLowerCase();

  if(editingRow){ 
    // Update existing row
    editingRow.innerHTML = `
      <td>${editingRow.rowIndex}</td>
      <td>${username}</td>
      <td>${email}</td>
      <td>${role}</td>
      <td><button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button></td>
    `;
  } else { 
    // Add new row
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
  attachRowButtons(); // Re-attach buttons after changes
});

// Attach Edit and Delete button listeners
function attachRowButtons(){
  const editButtons = document.querySelectorAll('.edit-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  editButtons.forEach(btn => {
    btn.onclick = (e) => {
      editingRow = e.target.closest('tr');
      const cells = editingRow.children;
      const [id, username, email, role] = [cells[0].textContent, cells[1].textContent, cells[2].textContent, cells[3].textContent];

      // Split username into first and surname
      const names = username.split('.');
      document.getElementById('firstName').value = names[0] || '';
      document.getElementById('middleName').value = '';
      document.getElementById('surname').value = names[1] || '';
      document.getElementById('email').value = email;
      document.getElementById('role').value = role;
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

// Update table row IDs after deletion
function updateRowIndices(){
  const rows = userTable.querySelectorAll('tr');
  rows.forEach((row, index) => {
    row.children[0].textContent = index + 1;
  });
}

// Initial attach
attachRowButtons();
