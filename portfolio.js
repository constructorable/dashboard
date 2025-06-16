// portfolio.js - Portfolio-Verwaltung für Immobilien (KORRIGIERTE VERSION)

class PortfolioManager {
    constructor() {
        this.storageKey = 'immobilien_portfolios';
        this.init();
    }

    init() {
        this.loadPortfolios();
        this.initEventListeners();
    }

    // Standard-Portfolios laden oder erstellen
    loadPortfolios() {
        let portfolios = localStorage.getItem(this.storageKey);
        if (!portfolios) {
            // Standard-Portfolios erstellen (CI-Invest hinzugefügt)
            const defaultPortfolios = [
                'Standard',
                'Immo Stiftung',
                'PuP Portfolio',
                'Verwaltung Eigen',
                'CI-Invest'
            ];
            this.savePortfolios(defaultPortfolios);
            return defaultPortfolios;
        }
        return JSON.parse(portfolios);
    }

    // Portfolios im LocalStorage speichern
    savePortfolios(portfolios) {
        localStorage.setItem(this.storageKey, JSON.stringify(portfolios));
    }

    // Alle Portfolios abrufen
    getPortfolios() {
        return this.loadPortfolios();
    }

    // Neues Portfolio hinzufügen
    addPortfolio(portfolioName) {
        if (!portfolioName || portfolioName.trim() === '') {
            throw new Error('Portfolio-Name darf nicht leer sein');
        }

        const portfolios = this.getPortfolios();
        const trimmedName = portfolioName.trim();

        if (portfolios.includes(trimmedName)) {
            throw new Error('Portfolio existiert bereits');
        }

        portfolios.push(trimmedName);
        portfolios.sort(); // Alphabetisch sortieren
        this.savePortfolios(portfolios);
        this.updateAllPortfolioDropdowns();
        return portfolios;
    }

    // Portfolio bearbeiten/umbenennen
    editPortfolio(oldName, newName) {
        if (!newName || newName.trim() === '') {
            throw new Error('Portfolio-Name darf nicht leer sein');
        }

        const portfolios = this.getPortfolios();
        const trimmedNewName = newName.trim();

        if (oldName === trimmedNewName) {
            return portfolios; // Keine Änderung
        }

        if (portfolios.includes(trimmedNewName)) {
            throw new Error('Portfolio-Name existiert bereits');
        }

        const index = portfolios.indexOf(oldName);
        if (index === -1) {
            throw new Error('Portfolio nicht gefunden');
        }

        // Portfolio-Name in Array ändern
        portfolios[index] = trimmedNewName;
        portfolios.sort(); // Alphabetisch sortieren
        this.savePortfolios(portfolios);

        // Portfolio-Name in allen Immobilien aktualisieren
        this.updatePortfolioNameInProperties(oldName, trimmedNewName);

        this.updateAllPortfolioDropdowns();
        return portfolios;
    }

    // Portfolio-Name in allen Immobilien aktualisieren
    updatePortfolioNameInProperties(oldName, newName) {
        const properties = typeof loadPropertiesFromStorage === 'function' ? loadPropertiesFromStorage() : [];
        let updated = false;

        properties.forEach(property => {
            if (property.portfolio === oldName) {
                property.portfolio = newName;
                updated = true;
            }
        });

        if (updated && typeof savePropertiesToStorage === 'function') {
            savePropertiesToStorage(properties);
        }
    }

    // Portfolio löschen
    deletePortfolio(portfolioName) {
        if (portfolioName === 'Standard') {
            throw new Error('Das Standard-Portfolio kann nicht gelöscht werden');
        }

        const portfolios = this.getPortfolios();
        const index = portfolios.indexOf(portfolioName);

        if (index === -1) {
            throw new Error('Portfolio nicht gefunden');
        }

        // KORRIGIERT: Prüfen ob Portfolio verwendet wird (echte + Demo Immobilien)
        const useCount = this.getPropertyCountForPortfolio(portfolioName);

        if (useCount > 0) {
            throw new Error(`Portfolio wird noch von ${useCount} Immobilie(n) verwendet und kann nicht gelöscht werden`);
        }

        portfolios.splice(index, 1);
        this.savePortfolios(portfolios);
        this.updateAllPortfolioDropdowns();
        return portfolios;
    }

    // Portfolio-Dropdown befüllen
    populatePortfolioDropdown(selectElement, selectedValue = 'Standard') {
        const portfolios = this.getPortfolios();
        selectElement.innerHTML = '';

        portfolios.forEach(portfolio => {
            const option = document.createElement('option');
            option.value = portfolio;
            option.textContent = portfolio;
            if (portfolio === selectedValue) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    // Alle Portfolio-Dropdowns aktualisieren
    updateAllPortfolioDropdowns() {
        // Dropdown in "Neue Immobilie" Modal
        const newPropertyPortfolio = document.getElementById('propertyPortfolio');
        if (newPropertyPortfolio) {
            this.populatePortfolioDropdown(newPropertyPortfolio);
        }

        // Dropdown in Stammdaten Modal
        const masterdataPortfolio = document.getElementById('editPropertyPortfolioModal');
        if (masterdataPortfolio) {
            const currentValue = masterdataPortfolio.value;
            this.populatePortfolioDropdown(masterdataPortfolio, currentValue);
        }

        // Filter-Dropdown aktualisieren
        this.updatePortfolioFilter();
    }

    // Portfolio-Filter in Sidebar aktualisieren
    updatePortfolioFilter() {
        let portfolioFilter = document.getElementById('portfolioFilter');
        if (!portfolioFilter) {
            this.createPortfolioFilter();
            portfolioFilter = document.getElementById('portfolioFilter');
        }

        const portfolios = this.getPortfolios();
        const currentValue = portfolioFilter ? portfolioFilter.value : '';

        if (portfolioFilter) {
            portfolioFilter.innerHTML = '<option value="">Alle Portfolios</option>';

            portfolios.forEach(portfolio => {
                const option = document.createElement('option');
                option.value = portfolio;
                option.textContent = portfolio;
                if (portfolio === currentValue) {
                    option.selected = true;
                }
                portfolioFilter.appendChild(option);
            });
        }
    }

    // Portfolio-Filter erstellen
    createPortfolioFilter() {
        const filterControls = document.querySelector('.filter-controls');
        if (!filterControls) return;

        let portfolioFilter = document.getElementById('portfolioFilter');
        if (portfolioFilter) {
            this.updatePortfolioFilter();
            return;
        }

        portfolioFilter = document.createElement('select');
        portfolioFilter.id = 'portfolioFilter';
        portfolioFilter.className = 'filter-select';

        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter && periodFilter.parentNode) {
            periodFilter.parentNode.insertBefore(portfolioFilter, periodFilter.nextSibling);
        } else {
            filterControls.appendChild(portfolioFilter);
        }

        this.updatePortfolioFilter();

        portfolioFilter.addEventListener('change', (e) => {
            if (typeof handleFilterChange === 'function') {
                handleFilterChange(e);
            }
        });

        console.log('Portfolio-Filter erstellt und Event-Handler registriert');
    }

    // Portfolio-Management Modal erstellen (KORRIGIERTE VERSION)
    createPortfolioModal() {
        // Bestehendes Modal entfernen
        const existingModal = document.getElementById('portfolioModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="portfolioModal" class="modal">
                <div class="modal-content portfolio-modal-large">
                    <div class="modal-header">
                        <h2><i class="fas fa-briefcase"></i> Portfolio-Verwaltung</h2>
                        <button class="modal-close" id="closePortfolioModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <!-- Neues Portfolio hinzufügen Bereich -->
                        <div class="portfolio-add-section">
                            <h3><i class="fas fa-plus-circle"></i> Neues Portfolio hinzufügen</h3>
                            <div class="portfolio-form-row">
                                <div class="form-group-inline">
                                    <label for="newPortfolioName">Portfolio-Name:</label>
                                    <input type="text" id="newPortfolioName" placeholder="z.B. Immobilien AG" maxlength="50">
                                    <button type="button" id="addPortfolioBtn" class="btn btn-primary">
                                        <i class="fas fa-plus"></i> Hinzufügen
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Trennlinie -->
                        <div class="section-divider"></div>
                        
                        <!-- Portfolio-Tabelle -->
                        <div class="portfolio-table-section">
                            <h3><i class="fas fa-table"></i> Vorhandene Portfolios</h3>
                            <div class="portfolio-table-container">
                                <table class="portfolio-table">
                                    <thead>
                                        <tr>
                                            <th><i class="fas fa-briefcase"></i> Portfolio-Name</th>
                                            <th><i class="fas fa-building"></i> Anzahl Immobilien</th>
                                            <th><i class="fas fa-info-circle"></i> Status</th>
                                            <th><i class="fas fa-cogs"></i> Aktionen</th>
                                        </tr>
                                    </thead>
                                    <tbody id="portfolioTableBody">
                                        <!-- Wird dynamisch befüllt -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <!-- Info-Bereich -->
                        <div class="portfolio-info-section">
                            <div class="info-box">
                                <i class="fas fa-info-circle"></i>
                                <div class="info-content">
                                    <strong>Hinweise:</strong>
                                    <ul>
                                        <li>Das <strong>Standard-Portfolio</strong> kann nicht gelöscht oder umbenannt werden</li>
                                        <li>Portfolios mit zugewiesenen Immobilien können nicht gelöscht werden</li>
                                        <li>Bei Umbenennung werden alle zugewiesenen Immobilien automatisch aktualisiert</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('Portfolio Modal HTML eingefügt');
    }

    // Portfolio-Liste im Modal anzeigen (KORRIGIERTE VERSION)
    displayPortfolioList() {
        console.log('displayPortfolioList() wird ausgeführt');

        const tableBody = document.getElementById('portfolioTableBody');
        if (!tableBody) {
            console.error('portfolioTableBody Element nicht gefunden!');
            return;
        }

        const portfolios = this.getPortfolios();
        console.log('Portfolios zu zeigen:', portfolios);

        // Tabelle leeren
        tableBody.innerHTML = '';

        if (portfolios.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: var(--secondary-color);">
                    <i class="fas fa-inbox"></i><br>
                    Keine Portfolios vorhanden
                </td>
            </tr>
        `;
            return;
        }

        portfolios.forEach((portfolio, index) => {
            console.log(`Portfolio ${index + 1}: ${portfolio}`);

            // KORRIGIERT: Alle Immobilien laden (echte + Demo)
            const useCount = this.getPropertyCountForPortfolio(portfolio);
            const isInUse = useCount > 0;
            const isStandard = portfolio === 'Standard';

            console.log(`Portfolio "${portfolio}": ${useCount} Immobilien zugeordnet`);

            const row = document.createElement('tr');
            row.className = isStandard ? 'portfolio-row standard-portfolio' : 'portfolio-row';

            row.innerHTML = `
            <td class="portfolio-name-cell">
                <div class="portfolio-name-wrapper">
                    <i class="fas fa-briefcase portfolio-icon"></i>
                    <span class="portfolio-name">${this.escapeHtml(portfolio)}</span>
                    ${isStandard ? '<span class="standard-badge">Standard</span>' : ''}
                </div>
            </td>
            <td class="portfolio-count-cell">
                <div class="count-wrapper">
                    <span class="count-number">${useCount}</span>
                    <span class="count-label">Immobilien</span>
                </div>
            </td>
            <td class="portfolio-status-cell">
                ${isStandard
                    ? '<span class="status-badge status-protected"><i class="fas fa-shield-alt"></i> Geschützt</span>'
                    : isInUse
                        ? '<span class="status-badge status-in-use"><i class="fas fa-check-circle"></i> In Verwendung</span>'
                        : '<span class="status-badge status-unused"><i class="fas fa-circle"></i> Nicht verwendet</span>'
                }
            </td>
            <td class="portfolio-actions-cell">
                <div class="action-buttons">
                    ${!isStandard ? `
                        <button class="btn btn-sm btn-secondary edit-portfolio-btn" 
                                data-portfolio="${this.escapeHtml(portfolio)}" 
                                title="Portfolio bearbeiten">
                            <i class="fas fa-edit"></i>
                            <span>Bearbeiten</span>
                        </button>
                        <button class="btn btn-sm btn-danger delete-portfolio-btn" 
                                data-portfolio="${this.escapeHtml(portfolio)}" 
                                ${isInUse ? 'disabled' : ''}
                                title="${isInUse ? 'Portfolio wird verwendet und kann nicht gelöscht werden' : 'Portfolio löschen'}">
                            <i class="fas fa-trash"></i>
                            <span>Löschen</span>
                        </button>
                    ` : `
                        <span class="no-actions">
                            <i class="fas fa-lock"></i>
                            Keine Aktionen verfügbar
                        </span>
                    `}
                </div>
            </td>
        `;

            tableBody.appendChild(row);
            console.log(`Zeile für Portfolio "${portfolio}" hinzugefügt`);
        });

        // Event Listener für Bearbeiten-Buttons
        const editButtons = tableBody.querySelectorAll('.edit-portfolio-btn');
        console.log(`${editButtons.length} Bearbeiten-Buttons gefunden`);

        editButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const portfolioName = e.currentTarget.dataset.portfolio;
                this.showEditPortfolioDialog(portfolioName);
            });
        });

        // Event Listener für Löschen-Buttons
        const deleteButtons = tableBody.querySelectorAll('.delete-portfolio-btn');
        console.log(`${deleteButtons.length} Löschen-Buttons gefunden`);

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const portfolioName = e.currentTarget.dataset.portfolio;
                this.showDeletePortfolioDialog(portfolioName);
            });
        });

        console.log(`${portfolios.length} Portfolios erfolgreich in Tabelle angezeigt`);
    }

    // ERWEITERTE DEBUG-VERSION: Anzahl Immobilien für Portfolio ermitteln
    // VOLLSTÄNDIGE DATENSUCHE - Alle localStorage Keys durchsuchen
getPropertyCountForPortfolio(portfolioName) {
    console.log(`=== SUCHE IMMOBILIEN für Portfolio "${portfolioName}" ===`);
    
    let allProperties = [];
    
    // === METHODE 1: Echte Immobilien aus localStorage ===
    try {
        if (typeof loadPropertiesFromStorage === 'function') {
            const realProperties = loadPropertiesFromStorage() || [];
            console.log(`✓ Echte Immobilien geladen: ${realProperties.length}`);
            allProperties = allProperties.concat(realProperties);
        }
    } catch (error) {
        console.log('✗ Fehler beim Laden echter Immobilien:', error);
    }
    
    // === METHODE 2: Demo-Daten VOLLSTÄNDIG laden ===
    try {
        // Versuche verschiedene Methoden für Demo-Daten
        let demoProperties = [];
        
        // Option A: getDemoData() Funktion
        if (typeof getDemoData === 'function') {
            demoProperties = getDemoData() || [];
            console.log(`✓ getDemoData(): ${demoProperties.length} Demo-Immobilien`);
        }
        
        // Option B: window.demoData
        else if (typeof window.demoData !== 'undefined' && Array.isArray(window.demoData)) {
            demoProperties = window.demoData;
            console.log(`✓ window.demoData: ${demoProperties.length} Demo-Immobilien`);
        }
        
        // Option C: Direkt aus demodata.js Modul laden
        else if (typeof window.getDemoProperties === 'function') {
            demoProperties = window.getDemoProperties();
            console.log(`✓ window.getDemoProperties(): ${demoProperties.length} Demo-Immobilien`);
        }
        
        // Option D: Aus localStorage
        else {
            const storedDemo = localStorage.getItem('demo_properties');
            if (storedDemo) {
                demoProperties = JSON.parse(storedDemo);
                console.log(`✓ localStorage demo_properties: ${demoProperties.length} Demo-Immobilien`);
            }
        }
        
        // Demo-Daten hinzufügen
        if (demoProperties.length > 0) {
            allProperties = allProperties.concat(demoProperties);
            console.log(`Demo-Daten hinzugefügt. Gesamt: ${allProperties.length}`);
        } else {
            console.log('⚠️ Keine Demo-Daten gefunden - verwende Notfall-Demo-Daten');
            // Notfall-Demo-Daten basierend auf Ihrem Code-Snippet
            const fallbackDemoData = this.createFallbackDemoData();
            allProperties = allProperties.concat(fallbackDemoData);
        }
        
    } catch (error) {
        console.log('✗ Fehler beim Laden der Demo-Daten:', error);
    }
    
    // === METHODE 3: Alle verfügbaren localStorage Keys durchsuchen ===
    console.log('=== DURCHSUCHE ALLE LOCALSTORAGE KEYS ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('immobili') || key.includes('propert') || key.includes('demo')) {
            try {
                const value = localStorage.getItem(key);
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed) && parsed.length > 5) { // Nur größere Arrays
                    console.log(`✓ Gefunden in localStorage["${key}"]: ${parsed.length} Einträge`);
                    // Prüfen ob es Immobilien sind
                    const firstItem = parsed[0];
                    if (firstItem && (firstItem.name || firstItem.portfolio)) {
                        // Duplikate vermeiden
                        const newItems = parsed.filter(item => 
                            !allProperties.some(existing => existing.id === item.id || existing.name === item.name)
                        );
                        if (newItems.length > 0) {
                            allProperties = allProperties.concat(newItems);
                            console.log(`  ${newItems.length} neue Immobilien hinzugefügt`);
                        }
                    }
                }
            } catch (e) {
                // Nicht JSON
            }
        }
    }
    
    // Duplikate entfernen
    const uniqueProperties = allProperties.filter((prop, index, self) => 
        index === self.findIndex(p => p.id === prop.id || (p.name === prop.name && p.portfolio === prop.portfolio))
    );
    
    console.log(`=== ERGEBNIS ===`);
    console.log(`Gesamt gefundene Immobilien: ${allProperties.length}`);
    console.log(`Eindeutige Immobilien: ${uniqueProperties.length}`);
    
    if (uniqueProperties.length > 0) {
        // Portfolio-Verteilung anzeigen
        const portfolioStats = {};
        uniqueProperties.forEach(prop => {
            const portfolio = prop.portfolio || 'Standard';
            portfolioStats[portfolio] = (portfolioStats[portfolio] || 0) + 1;
        });
        
        console.log('Portfolio-Verteilung:', portfolioStats);
        
        // Anzahl für gewünschtes Portfolio
        const count = uniqueProperties.filter(property => {
            const propertyPortfolio = property.portfolio || 'Standard';
            return propertyPortfolio === portfolioName;
        }).length;
        
        console.log(`✓ Portfolio "${portfolioName}": ${count} Immobilien zugeordnet`);
        return count;
    } else {
        console.log('❌ Keine Immobilien gefunden!');
        return 0;
    }
}


    // ALTERNATIVE FUNKTION: Falls die obigen Funktionen nicht verfügbar sind
    getAllAvailableProperties() {
        let allProperties = [];

        // Methode 1: Aus localStorage
        try {
            const stored = localStorage.getItem('immobilien_data');
            if (stored) {
                const parsedData = JSON.parse(stored);
                if (Array.isArray(parsedData)) {
                    allProperties = allProperties.concat(parsedData);
                }
            }
        } catch (error) {
            console.warn('Fehler beim Laden aus localStorage:', error);
        }

        // Methode 2: Demo-Daten direkt einbinden (falls nötig)
        const defaultDemoData = [
            {
                id: 'demo-1',
                name: 'Musterstraße 1',
                portfolio: 'Standard',
                type: 'MV',
                hasHeating: true,
                year: '2024',
                period: '01.01.2024 - 31.12.2024'
            },
            {
                id: 'demo-2',
                name: 'Beispielweg 5',
                portfolio: 'Immo Stiftung',
                type: 'WEG',
                hasHeating: false,
                year: '2024',
                period: '01.01.2024 - 31.12.2024'
            },
            {
                id: 'demo-3',
                name: 'Testgasse 12',
                portfolio: 'PuP Portfolio',
                type: 'MV',
                hasHeating: true,
                year: '2024',
                period: '01.01.2024 - 31.12.2024'
            },
            {
                id: 'demo-4',
                name: 'Probeallee 8',
                portfolio: 'Standard',
                type: 'WEG',
                hasHeating: true,
                year: '2024',
                period: '01.01.2024 - 31.12.2024'
            },
            {
                id: 'demo-5',
                name: 'Versuchsplatz 3',
                portfolio: 'Verwaltung Eigen',
                type: 'MV',
                hasHeating: false,
                year: '2024',
                period: '01.01.2024 - 31.12.2024'
            }
        ];

        // Demo-Daten hinzufügen falls noch keine vorhanden
        if (allProperties.length === 0) {
            allProperties = defaultDemoData;
            console.log('Standard Demo-Daten verwendet');
        }

        return allProperties;
    }


    // Portfolio-Modal öffnen (KORRIGIERTE VERSION)
    openPortfolioModal() {
        console.log('Portfolio Modal wird geöffnet...');

        let modal = document.getElementById('portfolioModal');
        if (!modal) {
            console.log('Modal existiert nicht, wird erstellt...');
            this.createPortfolioModal();
            modal = document.getElementById('portfolioModal');

            // Event Listeners nach der Erstellung einrichten
            this.setupPortfolioModalEvents();
        }

        // Modal anzeigen
        modal.style.display = 'flex';

        // Portfolios laden und anzeigen (mit kleiner Verzögerung)
        setTimeout(() => {
            console.log('Portfolios werden geladen...');
            this.displayPortfolioList();
        }, 100);
    }

    // HTML escapen (HILFSFUNKTION)
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Portfolio bearbeiten Dialog
    showEditPortfolioDialog(portfolioName) {
        const newName = prompt(`Portfolio-Name bearbeiten:`, portfolioName);

        if (newName === null) return; // Abgebrochen

        if (newName.trim() === '') {
            alert('Portfolio-Name darf nicht leer sein!');
            return;
        }

        try {
            this.editPortfolio(portfolioName, newName.trim());
            this.displayPortfolioList();
            this.showMessage(`Portfolio wurde von "${portfolioName}" zu "${newName.trim()}" umbenannt`, 'success');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // Portfolio löschen Dialog
    showDeletePortfolioDialog(portfolioName) {
        const confirmed = confirm(`Möchten Sie das Portfolio "${portfolioName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`);

        if (!confirmed) return;

        try {
            this.deletePortfolio(portfolioName);
            this.displayPortfolioList();
            this.showMessage(`Portfolio "${portfolioName}" wurde erfolgreich gelöscht`, 'success');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // Event Listeners initialisieren
    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'portfolioManagementBtn') {
                this.openPortfolioModal();
            }
        });
    }

    // Portfolio-Modal schließen
    closePortfolioModal() {
        const modal = document.getElementById('portfolioModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Portfolio-Modal Events einrichten (KORRIGIERTE VERSION)
    setupPortfolioModalEvents() {
        console.log('Modal Events werden eingerichtet...');

        // Modal schließen
        const closeBtn = document.getElementById('closePortfolioModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePortfolioModal();
            });
            console.log('Close Button Event registriert');
        }

        // Portfolio hinzufügen
        const addBtn = document.getElementById('addPortfolioBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.handleAddPortfolio();
            });
            console.log('Add Button Event registriert');
        }

        // Enter-Taste im Input-Feld
        const nameInput = document.getElementById('newPortfolioName');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAddPortfolio();
                }
            });
            console.log('Input Enter Event registriert');
        }

        // Modal schließen bei Klick außerhalb
        const modal = document.getElementById('portfolioModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'portfolioModal') {
                    this.closePortfolioModal();
                }
            });
            console.log('Modal Backdrop Event registriert');
        }
    }

    // Portfolio hinzufügen verarbeiten
    handleAddPortfolio() {
        const input = document.getElementById('newPortfolioName');
        const portfolioName = input.value.trim();

        if (!portfolioName) {
            alert('Bitte geben Sie einen Portfolio-Namen ein');
            return;
        }

        try {
            this.addPortfolio(portfolioName);
            input.value = '';
            this.displayPortfolioList();
            this.showMessage('Portfolio erfolgreich hinzugefügt', 'success');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // Nachricht anzeigen
    showMessage(message, type = 'info') {
        // Einfache Alert-Implementierung
        if (type === 'error') {
            alert('Fehler: ' + message);
        } else {
            // Für Erfolg und Info einfach console.log verwenden
            console.log(message);
        }
    }

    // Debug-Funktion (kann entfernt werden nach dem Test)
    debugPortfolios() {
        console.log('=== PORTFOLIO DEBUG ===');
        const portfolios = this.getPortfolios();
        console.log('Portfolios aus getPortfolios():', portfolios);

        const tableBody = document.getElementById('portfolioTableBody');
        console.log('portfolioTableBody Element:', tableBody);

        if (tableBody) {
            console.log('Tabelle HTML vor Update:', tableBody.innerHTML);
            this.displayPortfolioList();
            console.log('Tabelle HTML nach Update:', tableBody.innerHTML);
        }
    }
}

// Portfolio-Manager global verfügbar machen
window.portfolioManager = new PortfolioManager();

// Hilfsfunktion für andere Module
function getPortfolioManager() {
    return window.portfolioManager;
}