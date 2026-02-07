
const WEBHOOK_URL = 'https://smart031.app.n8n.cloud/webhook/verif';

// Scénarios de test
const TEST_CASES = [
  { 
    name: 'Cas A: Code VALIDE (Simulé)', 
    payload: { code: 'TEST-VALIDE-123', email: 'test@success.com' },
    expected: true
  },
  { 
    name: 'Cas B: Code INVALIDE (Simulé)', 
    payload: { code: 'TEST-INVALID-999', email: 'test@invalid.com' },
    expected: false
  }
];

async function runTests() {
  console.log('🚀 Démarrage des tests Webhook...\n');
  console.log(`URL Cible: ${WEBHOOK_URL}\n`);

  for (const testCase of TEST_CASES) {
    console.log(`--- Test: ${testCase.name} ---`);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      console.log(`  Statut HTTP: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('  Réponse JSON:', JSON.stringify(data, null, 2));
        
        // Analyse de la réponse
        if (data && data.hasOwnProperty('data')) {
            const isSuccess = data.data === true;
            if (isSuccess) {
                console.log('  ✅ Résultat interprété comme: Succès (Code Valide)');
            } else {
                console.log('  ❌ Résultat interprété comme: Échec (Code Invalide)');
            }
        } else {
            console.log('  ⚠️ Format de réponse inattendu (pas de propriété "data")');
        }

      } else {
        console.log('  ❌ Erreur HTTP:', await response.text());
      }

    } catch (error) {
      console.error('  🔥 Erreur technique:', error);
    }
    console.log('\n');
  }
}

runTests();
