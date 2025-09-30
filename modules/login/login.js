// login.js - handles captcha retrieval, form validation, and submission
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : '';

let currentCaptchaId = null;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('captchaCanvas');
  const ctx = canvas.getContext('2d');
  const reloadBtn = document.getElementById('reloadCaptcha');
  const toggleBtn = document.getElementById('togglePwd');
  const pwdInput = document.getElementById('password');
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });

  // Load captcha
  async function loadCaptcha() {
    msg.textContent = 'Loading captcha...';
    try {
      const res = await fetch(`${API_BASE}/api/captcha`);
      if (!res.ok) throw new Error('Failed to get captcha');
      const data = await res.json();
      currentCaptchaId = data.id;
      drawCaptcha(data.word);
      msg.textContent = '';
    } catch (err) {
      console.error(err);
      msg.textContent = 'Captcha load error';
    }
  }

  function drawCaptcha(word) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = '#ddd';
      ctx.stroke();
    }
    ctx.font = '26px Arial';
    ctx.fillStyle = '#111';
    const startX = 12;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const x = startX + i * 22 + (Math.random() * 6 - 3);
      const y = 30 + (Math.random() * 6 - 3);
      ctx.save();
      const angle = (Math.random() * 12 - 6) * Math.PI / 180;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }

  reloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loadCaptcha();
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    msg.textContent = '';
    const username = document.getElementById('username').value.trim();
    const password = pwdInput.value;
    const captchaInput = document.getElementById('captchaInput').value.trim();
    const remember = document.getElementById('remember').checked;

    if (!username || !password || !captchaInput) {
      msg.textContent = 'All fields are required!';
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          captcha: captchaInput,
          captcha_id: currentCaptchaId,
          remember
        })
      });

      let body = {};
      try { body = await resp.json(); } catch {}

      if (resp.ok) {
        // Save username & role locally for dashboard
        localStorage.setItem('username', username);
        localStorage.setItem('role', body.role || 'user');

        msg.textContent = 'Login successful! Redirecting...';
        setTimeout(() => {
          window.location.href = '/modules/dashboard/dashboard.html';
        }, 600);
      } else {
        msg.textContent = body.detail || 'Login failed';
        loadCaptcha();
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Network error';
    }
  });

  // Initial captcha load
  loadCaptcha();
});
