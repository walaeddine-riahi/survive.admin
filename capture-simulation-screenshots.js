const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Script pour prendre des captures d'écran automatiques des formulaires de simulation
 * Utilisation: node capture-simulation-screenshots.js
 */

const SIMULATION_URL = 'http://localhost:3000/simulation/[simulationId]/participant-view';
const SCREENSHOTS_DIR = './public/screenshots/simulation-forms';

// Configuration des captures
const FORMS_CONFIG = [
  {
    name: 'email-form',
    description: 'Formulaire Email',
    steps: [
      { action: 'click', selector: '[data-testid="email-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'sms-form',
    description: 'Formulaire SMS',
    steps: [
      { action: 'click', selector: '[data-testid="sms-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'call-form',
    description: 'Formulaire Appel',
    steps: [
      { action: 'click', selector: '[data-testid="call-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'alert-form',
    description: 'Formulaire Alerte',
    steps: [
      { action: 'click', selector: '[data-testid="alert-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'memo-form',
    description: 'Formulaire Memo',
    steps: [
      { action: 'click', selector: '[data-testid="memo-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'news-form',
    description: 'Formulaire Diffusion de Nouvelles',
    steps: [
      { action: 'click', selector: '[data-testid="news-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'journal-form',
    description: 'Formulaire Journal',
    steps: [
      { action: 'click', selector: '[data-testid="journal-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  },
  {
    name: 'social-form',
    description: 'Formulaire Social',
    steps: [
      { action: 'click', selector: '[data-testid="social-channel"]' },
      { action: 'click', selector: 'button:contains("Composer")' },
      { action: 'wait', duration: 1000 }
    ]
  }
];

async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Dossier créé: ${dirPath}`);
  }
}

async function executeStep(page, step) {
  switch (step.action) {
    case 'click':
      await page.click(step.selector);
      break;
    case 'wait':
      await page.waitForTimeout(step.duration);
      break;
    case 'type':
      await page.type(step.selector, step.text);
      break;
    case 'select':
      await page.select(step.selector, step.value);
      break;
  }
}

async function captureFormScreenshot(page, formConfig) {
  try {
    console.log(`📸 Capture de ${formConfig.description}...`);
    
    // Exécuter les étapes pour ouvrir le formulaire
    for (const step of formConfig.steps) {
      await executeStep(page, step);
    }
    
    // Attendre que le formulaire soit visible
    await page.waitForTimeout(2000);
    
    // Prendre la capture d'écran
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${formConfig.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1200,
        height: 800
      }
    });
    
    console.log(`✅ Capture sauvegardée: ${screenshotPath}`);
    
    // Fermer le formulaire (Échap ou bouton Annuler)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la capture de ${formConfig.name}:`, error.message);
  }
}

async function captureOverviewScreenshots(page) {
  console.log('📸 Capture des vues d\'ensemble...');
  
  // Vue d'ensemble de l'interface
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'interface-overview.png'),
    fullPage: true
  });
  
  // Vue des canaux de communication
  const channelsSection = await page.$('[data-testid="communication-channels"]');
  if (channelsSection) {
    await channelsSection.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'communication-channels.png')
    });
  }
  
  console.log('✅ Captures d\'ensemble terminées');
}

async function main() {
  console.log('🚀 Démarrage du script de capture d\'écran...');
  
  // Créer le dossier de screenshots
  await ensureDirectoryExists(SCREENSHOTS_DIR);
  
  const browser = await puppeteer.launch({
    headless: false, // Mettre à true pour mode silencieux
    defaultViewport: {
      width: 1200,
      height: 800
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurer la page
    await page.setViewport({ width: 1200, height: 800 });
    
    // Aller à la page de simulation
    console.log(`🌐 Navigation vers: ${SIMULATION_URL}`);
    await page.goto(SIMULATION_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Attendre que la page soit complètement chargée
    await page.waitForTimeout(3000);
    
    // Prendre les captures d'ensemble
    await captureOverviewScreenshots(page);
    
    // Prendre les captures de chaque formulaire
    for (const formConfig of FORMS_CONFIG) {
      await captureFormScreenshot(page, formConfig);
    }
    
    console.log('🎉 Toutes les captures ont été prises avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await browser.close();
  }
}

// Vérifier les prérequis
if (!fs.existsSync('package.json')) {
  console.error('❌ Ce script doit être exécuté à la racine du projet');
  process.exit(1);
}

// Instructions d'utilisation
console.log(`
📋 Instructions d'utilisation:

1. Assurez-vous que le serveur de développement est démarré:
   npm run dev

2. Remplacez [simulationId] dans SIMULATION_URL par un ID valide

3. Exécutez le script:
   node capture-simulation-screenshots.js

4. Les captures seront sauvegardées dans: ${SCREENSHOTS_DIR}

`);

// Demander confirmation avant de commencer
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Voulez-vous continuer? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    main();
  } else {
    console.log('❌ Script annulé');
  }
  rl.close();
});