


const API_URL = 'http://localhost:3001/api';
// You might need a valid token if auth is enforced on these endpoints.
// For testing purposes, you might want to temporarily disable auth on the test route or login first.

const LOGIN_EMAIL = 'user@gmail.com'; 
const LOGIN_PASSWORD = 'password'; // Ensure this user exists or create one first

async function runTests() {
  console.log('🚀 Starting Integration Tests...');

  try {
    // 1. Login to get token
    console.log('🔑 Logging in...');
    // Note: ensure user exists. If not, this will fail. Ideally seed user first.
    let token = '';
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD })
        });
        
        if (loginRes.ok) {
            const data: any = await loginRes.json();
            token = data.token;
            console.log('✅ Login successful');
        } else {
             // Try registering if login fails
             console.log('⚠️ Login failed, trying registration...');
             const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD, name: 'Test User' })
            });
            const data: any = await regRes.json();
            token = data.token;
             console.log('✅ Registration successful');
        }

    } catch (e) {
        console.error('❌ Auth failed:', e);
        return;
    }

    // 2. Test Telegram (via /api/verify)
    console.log('\n📡 Testing Telegram Notification (via /api/verify)...');
    const verifyRes = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ code: 'TEST-12345', cardId: 'neosurf' })
    });

    if (verifyRes.ok) {
      console.log('✅ Telegram Test: Success (Check your Telegram chat)');
    } else {
      console.error('❌ Telegram Test: Failed', await verifyRes.text());
    }

    // 3. Test Webhook
    console.log('\n🔗 Testing Webhook Proxy...');
    const webhookRes = await fetch(`${API_URL}/verify/webhook`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code: 'WEBHOOK-TEST-123', email: 'test@webhook.com' })
    });

    if (webhookRes.ok) {
      const data = await webhookRes.json();
      console.log('✅ Webhook Test: Success', data);
    } else {
      console.error('❌ Webhook Test: Failed', await webhookRes.text());
    }

  } catch (err) {
    console.error('❌ Global Test Error:', err);
  }
}

runTests();
