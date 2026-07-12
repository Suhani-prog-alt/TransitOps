document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const role = document.getElementById('role').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing in...';
  submitBtn.disabled = true;
  
  try {
    let port;
    let targetApp;
    
    if (role === 'dispatcher') {
      port = 5003;
      targetApp = 'http://localhost:5173';
    } else if (role === 'safety_officer') {
      port = 5002;
      targetApp = 'http://localhost:5174';
    } else if (role === 'financial_analyst') {
      port = 5005;
      targetApp = 'http://localhost:3000';
    } else if (role === 'fleet_manager') {
      port = 5004;
      targetApp = 'http://localhost:5175';
    }
    
    // Attempt login by calling the backend API directly
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.token || data.success) {
      // Backend returned success and a token
      const token = data.token;
      // Redirect to frontend app, passing token in URL so it can pick it up
      window.location.href = `${targetApp}/?token=${token}`;
    } else {
      alert('Login failed: ' + (data.message || 'Invalid credentials'));
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (err) {
    alert('Error connecting to backend: ' + err.message);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
