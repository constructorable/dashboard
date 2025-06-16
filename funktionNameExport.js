// Modal erstellen
const modal = document.createElement('div');
Object.assign(modal.style, {
  position: 'fixed', top: '50%', left: '50%', 
  transform: 'translate(-50%, -50%)',
  width: '700px', maxHeight: '80vh', 
  background: '#f8f8f8', border: '1px solid #ccc',
  padding: '20px', overflow: 'auto', zIndex: '9999', 
  fontFamily: 'monospace', fontSize: '14px',
  boxShadow: '0 0 15px rgba(0,0,0,0.3)'
});

// Header mit Titel
const header = document.createElement('div');
header.style.marginBottom = '15px';

const title = document.createElement('h3');
title.textContent = 'Funktionsfinder';
title.style.margin = '0 0 10px 0';

// Eingabefeld für Dateinamen
const inputContainer = document.createElement('div');
inputContainer.style.display = 'flex';
inputContainer.style.gap = '10px';
inputContainer.style.marginBottom = '15px';

const input = document.createElement('input');
input.type = 'text';
input.placeholder = 'Dateiname eingeben (z.B. app.js)';
input.style.flex = '1';
input.style.padding = '8px';

const searchBtn = document.createElement('button');
searchBtn.textContent = 'Suchen';
searchBtn.style.padding = '8px 15px';

// Close-Button
const closeBtn = document.createElement('button');
closeBtn.textContent = 'Schließen';
closeBtn.style.float = 'right';
closeBtn.onclick = () => modal.remove();

// Content Bereich
const content = document.createElement('div');
content.style.lineHeight = '1.5';
content.style.minHeight = '200px';

// Zusammenbauen
header.append(title, closeBtn);
inputContainer.append(input, searchBtn);
modal.append(header, inputContainer, content);
document.body.appendChild(modal);

// Funktion zum Scannen einer bestimmten Datei
async function scanSpecificFile(filename) {
  content.textContent = 'Scanne...';
  
  try {
    // Passenden Script-Tag finden
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const targetScript = scripts.find(s => 
      s.src.includes(filename) && 
      s.src.split('/').pop().split('?')[0] === filename
    );

    if (!targetScript) {
      content.textContent = `Datei "${filename}" nicht gefunden!`;
      return;
    }

    // Dateiinhalt holen
    const response = await fetch(targetScript.src);
    const code = await response.text();
    
    // Funktionen finden
    const funcPatterns = [
      /function\s+([^\s(]+)/g,
      /(?:const|let|var)\s+([^\s=]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/g,
      /export\s+(?:function\s+([^\s(]+)|const\s+([^\s=]+))/g
    ];
    
    const functions = new Set();
    
    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const funcName = match[1] || match[2];
        if (funcName) functions.add(funcName);
      }
    }

    // Ergebnisse anzeigen
    if (functions.size > 0) {
      content.textContent = `${filename}:\n\n` + 
        Array.from(functions).sort().map(f => `• ${f}`).join('\n');
    } else {
      content.textContent = `Keine Funktionen in "${filename}" gefunden.`;
    }
    
  } catch (e) {
    content.textContent = `Fehler beim Scannen von "${filename}":\n${e.message}`;
    console.error(e);
  }
}

// Event Listener für Suchbutton
searchBtn.addEventListener('click', () => {
  const filename = input.value.trim();
  if (filename) {
    scanSpecificFile(filename);
  } else {
    content.textContent = 'Bitte einen Dateinamen eingeben!';
  }
});

// Event Listener für Enter-Taste
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Fokus auf Input setzen
input.focus();