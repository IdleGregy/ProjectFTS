// apply.js
document.addEventListener("DOMContentLoaded", () => {

  // ---------- Generic modal helper ----------
  function setupModal(modalId, openBtnId, closeBtnId, cancelBtnId, formId, message) {
    const modal = document.getElementById(modalId);
    const openBtn = openBtnId ? document.getElementById(openBtnId) : null;
    const closeBtn = closeBtnId ? document.getElementById(closeBtnId) : null;
    const cancelBtn = cancelBtnId ? document.getElementById(cancelBtnId) : null;
    const form = formId ? document.getElementById(formId) : null;

    // Only require modal + openBtn; others are optional
    if (!modal || (openBtnId && !openBtn)) {
      console.error(`Missing element(s) for modal: ${modalId}`);
      return;
    }

    // Open
    if (openBtn) openBtn.addEventListener("click", () => (modal.style.display = "block"));

    // Close helpers
    const closeModal = () => (modal.style.display = "none");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // close on outside click
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // form submit if provided
    if (form && message) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert(message);
        closeModal();
        form.reset();
      });
    }
  }

  // ---------- Initialize modals that use forms ----------
  setupModal("leaveModal", "btn-leave", "closeLeaveModal", "cancelLeave", "leaveForm", "✅ Leave application submitted!");
  setupModal("overtimeModal", "btn-overtime", "closeOvertimeModal", "cancelOvertime", "overtimeForm", "✅ Overtime application submitted!");
  setupModal("workRestdayModal", "btn-work-restday", "closeWorkRestdayModal", "cancelWorkRestday", "workRestdayForm", "✅ Work on Rest Day application submitted!");
  setupModal("workHolidayModal", "btn-work-holiday", "closeWorkHolidayModal", "cancelWorkHoliday", "workHolidayForm", "✅ Work on Holiday application submitted!");
  setupModal("changeScheduleModal", "btn-change-schedule", "closeChangeScheduleModal", "cancelChangeSchedule", "changeScheduleForm", "✅ Change schedule request submitted!");

  // TimeLog modal setup (main)
  setupModal("timeLogModal", "btn-timelog", "closeTimeLogModal", "cancelTimeLog", null, null);

  // TimeLog edit modal setup (add/edit)
  setupModal("timeLogEditModal", null, "closeTimeLogEditModal", "cancelTimeLogEdit", "timeLogForm", null);

  // ---------- Time log management (in-memory) ----------
  const timeLogs = []; // each: { id, date, in, out, reason }

  const timeLogListEl = document.getElementById("timeLogList");
  const emptyMsg = document.getElementById("emptyTimeLogMsg");

  function renderTimeLogs() {
    // clear
    timeLogListEl.innerHTML = "";
    if (timeLogs.length === 0) {
      emptyMsg.style.display = "block";
      return;
    }
    emptyMsg.style.display = "none";

    const ul = document.createElement("div");
    ul.style.display = "flex";
    ul.style.flexDirection = "column";
    ul.style.gap = "10px";

    timeLogs.forEach((t) => {
      const card = document.createElement("div");
      card.style.border = "1px solid #ddd";
      card.style.padding = "10px";
      card.style.borderRadius = "8px";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "center";
      card.style.background = "#fff";

      const left = document.createElement("div");
      left.innerHTML = `<strong>${t.date}</strong><br>In: ${t.in} - Out: ${t.out}<br><small>${t.reason}</small>`;

      const right = document.createElement("div");
      right.style.display = "flex";
      right.style.gap = "8px";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn";
      editBtn.style.padding = "6px 10px";
      editBtn.addEventListener("click", () => openEditTimeLog(t.id));

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "btn";
      delBtn.style.background = "#ccc";
      delBtn.style.padding = "6px 10px";
      delBtn.addEventListener("click", () => {
        if (confirm("Delete this time log?")) {
          const idx = timeLogs.findIndex((x) => x.id === t.id);
          if (idx >= 0) {
            timeLogs.splice(idx, 1);
            renderTimeLogs();
          }
        }
      });

      right.appendChild(editBtn);
      right.appendChild(delBtn);

      card.appendChild(left);
      card.appendChild(right);
      ul.appendChild(card);
    });

    timeLogListEl.appendChild(ul);
  }

  // Elements for timeLog edit
  const btnAddTimeLog = document.getElementById("btnAddTimeLog");
  const timeLogEditModal = document.getElementById("timeLogEditModal");
  const timeLogForm = document.getElementById("timeLogForm");
  const timeLogEditTitle = document.getElementById("timeLogEditTitle");
  const inputTimeLogId = document.getElementById("timeLogId");
  const inputTLDate = document.getElementById("tlDate");
  const inputTLIn = document.getElementById("tlIn");
  const inputTLOut = document.getElementById("tlOut");
  const inputTLReason = document.getElementById("tlReason");

  // Open Add modal
  btnAddTimeLog.addEventListener("click", () => {
    inputTimeLogId.value = "";
    inputTLDate.value = "";
    inputTLIn.value = "";
    inputTLOut.value = "";
    inputTLReason.value = "";
    timeLogEditTitle.textContent = "Add Time Log";
    timeLogEditModal.style.display = "block";
  });

  // Open edit modal with data
  function openEditTimeLog(id) {
    const t = timeLogs.find((x) => x.id === id);
    if (!t) return alert("Record not found");
    inputTimeLogId.value = t.id;
    inputTLDate.value = t.date;
    inputTLIn.value = t.in;
    inputTLOut.value = t.out;
    inputTLReason.value = t.reason;
    timeLogEditTitle.textContent = "Edit Time Log";
    timeLogEditModal.style.display = "block";
  }

  // Save (add or edit)
  timeLogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = inputTimeLogId.value;
    const data = {
      id: id || String(Date.now()),
      date: inputTLDate.value,
      in: inputTLIn.value,
      out: inputTLOut.value,
      reason: inputTLReason.value,
    };

    if (!data.date || !data.in || !data.out) {
      return alert("Please fill date, time in and time out.");
    }

    if (id) {
      // edit
      const idx = timeLogs.findIndex((x) => x.id === id);
      if (idx >= 0) timeLogs[idx] = data;
    } else {
      // add
      timeLogs.push(data);
    }

    timeLogEditModal.style.display = "none";
    timeLogForm.reset();
    renderTimeLogs();
  });

  // Initial render
  renderTimeLogs();

  // Expose renderTimeLogs to window console for debugging (optional)
  window._renderTimeLogs = renderTimeLogs;
});
