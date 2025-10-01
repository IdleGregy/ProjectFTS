// login.js - handles captcha retrieval, form validation, and submission
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : '';

let currentCaptchaId = null;

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('captchaCanvas');
  const ctx = canvas?.getContext('2d');
  const reloadBtn = document.getElementById('reloadCaptcha');
  const toggleBtn = document.getElementById('togglePwd');
  const pwdInput = document.getElementById('password');
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('msg');
  const submitBtn = document.getElementById('loginSubmit');

  function setMsg(text) {
    if (msg) msg.textContent = text;
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Logging in...' : 'Login';
  }

  // Toggle password visibility
  toggleBtn?.addEventListener('click', () => {
    if (!pwdInput) return;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });

  // Load captcha
  async function loadCaptcha() {
    setMsg('Loading captcha...');
    try {
      const res = await fetch(`${API_BASE}/api/captcha`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to get captcha');
      const data = await res.json();
      currentCaptchaId = data.id;
      drawCaptcha(data.word);
      setMsg('');
      console.log('Captcha loaded:', data);
    } catch (err) {
      console.error('Captcha load error:', err);
      setMsg('Captcha load error — reload page or try again');
      currentCaptchaId = null;
    }
  }

  // Draw captcha
  function drawCaptcha(word) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 2; i++) {
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
      ctx.fillText(word[i], startX + i * 22, 30);
    }
  }

  // Reload button
  reloadBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loadCaptcha();
  });

  // Handle login submit
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    setMsg('');
    setSubmitting(true);

    const username = (document.getElementById('username')?.value || '').trim();
    const password = pwdInput?.value || '';
    const captchaInput = (document.getElementById('captchaInput')?.value || '').trim();
    const remember = !!document.getElementById('remember')?.checked;

    if (!username || !password || !captchaInput) {
      setMsg('All fields are required!');
      setSubmitting(false);
      return;
    }

    // Auto-reload captcha kung null
    if (!currentCaptchaId) {
      setMsg('Captcha not loaded. Reloading...');
      await loadCaptcha();
      setSubmitting(false);
      return;
    }

    console.log('Submitting login:', { username, password, captchaInput, currentCaptchaId, remember });

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

      if (resp.status === 200) {
        localStorage.setItem('username', username);
        localStorage.setItem('role', body.role || 'user');
        setMsg('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/modules/dashboard/dashboard.html';
        }, 400);
      } else if (resp.status === 400) {
        setMsg(body.detail || 'Captcha invalid or expired');
        await loadCaptcha();
      } else if (resp.status === 401) {
        setMsg(body.detail || 'Invalid username or password');
        await loadCaptcha();
      } else {
        setMsg(body.detail || `Login failed (status ${resp.status})`);
        await loadCaptcha();
      }
    } catch (err) {
      console.error('Login error:', err);
      setMsg('Network error — check console or try again');
    } finally {
      setSubmitting(false);
    }
  });

  // Initial captcha load
  loadCaptcha();
});
