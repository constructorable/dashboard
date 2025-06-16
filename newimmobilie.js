// Funktionen für das Anlegen neuer Immobilien


document.addEventListener('DOMContentLoaded', function() {
    initNewPropertyModal();
});


function initNewPropertyModal() {
    const newImmoBtn = document.getElementById('newImmoBtn');
    const newPropertyModal = document.getElementById('newPropertyModal');
    const closeNewModal = document.getElementById('closeNewModal');
    const cancelNewProperty = document.getElementById('cancelNewProperty');
    const newPropertyForm = document.getElementById('newPropertyForm');

    // Portfolio-Dropdown beim Laden initialisieren
    if (window.portfolioManager) {
        initializePortfolioDropdown();
    }

    // Modal öffnen
    newImmoBtn.addEventListener('click', function() {
        // Portfolio-Dropdown aktualisieren
        updatePortfolioDropdown();
        
        // Aktuelles Jahr als Standard setzen
        const currentYear = new Date().getFullYear();
        document.getElementById('accountingYear').value = currentYear;
        
        newPropertyModal.style.display = 'flex';
    });

    // Modal schließen
    closeNewModal.addEventListener('click', closeModal);
    cancelNewProperty.addEventListener('click', closeModal);

    // Modal schließen bei Klick außerhalb
    newPropertyModal.addEventListener('click', function(e) {
        if (e.target === newPropertyModal) {
            closeModal();
        }
    });

    // Formular absenden
    newPropertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewProperty();
    });

    function closeModal() {
        newPropertyModal.style.display = 'none';
        newPropertyForm.reset();
    }

    function initializePortfolioDropdown() {
        // Portfolio-Dropdown beim ersten Laden initialisieren
        setTimeout(() => {
            updatePortfolioDropdown();
        }, 100);
    }

    function updatePortfolioDropdown() {
        const portfolioSelect = document.getElementById('propertyPortfolio');
        if (portfolioSelect && window.portfolioManager) {
            window.portfolioManager.populatePortfolioDropdown(portfolioSelect, 'Standard');
        }
    }

    function createNewProperty() {
        // Formulardaten sammeln
        const formData = {
            name: document.getElementById('propertyName').value.trim(),
            portfolio: document.getElementById('propertyPortfolio').value, // Portfolio hinzugefügt
            type: document.getElementById('propertyType').value,
            hasHeating: document.getElementById('hasHeating').value === 'true',
            accountingYear: parseInt(document.getElementById('accountingYear').value),
            accountingPeriod: document.getElementById('accountingPeriod').value.trim()
        };

        // Validierung
        if (!validateFormData(formData)) {
            return;
        }

        // Neue Immobilie erstellen
        const newProperty = {
            id: generateUniqueId(),
            name: formData.name,
            portfolio: formData.portfolio, // Portfolio in Objekt speichern
            type: formData.type,
            hasHeating: formData.hasHeating,
            accountingYear: formData.accountingYear,
            accountingPeriod: formData.accountingPeriod,
            isDemo: false,
            notes: [],
            specialFeatures: [],
            checklist: createInitialChecklist(formData.type, formData.hasHeating),
            createdAt: new Date().toISOString()
        };

        // Immobilie speichern
        saveNewProperty(newProperty);

        // UI aktualisieren
        updateAllViews();

        // Modal schließen
        closeModal();

        // Erfolg anzeigen
        if (window.portfolioManager) {
            window.portfolioManager.showMessage('Immobilie erfolgreich erstellt', 'success');
        } else {
            alert('Immobilie erfolgreich erstellt');
        }
    }

    function validateFormData(data) {
        // Name validieren
        if (!data.name) {
            alert('Bitte geben Sie einen Immobiliennamen ein.');
            return false;
        }

        // Portfolio validieren
        if (!data.portfolio) {
            alert('Bitte wählen Sie ein Portfolio aus.');
            return false;
        }

        // Typ validieren
        if (!data.type) {
            alert('Bitte wählen Sie einen Typ aus.');
            return false;
        }

        // Heizkosten validieren
        if (data.hasHeating === undefined || data.hasHeating === null) {
            alert('Bitte wählen Sie aus, ob eine Heizkostenabrechnung benötigt wird.');
            return false;
        }

        // Jahr validieren
        if (!data.accountingYear || data.accountingYear < 2020 || data.accountingYear > 2030) {
            alert('Bitte geben Sie ein gültiges Abrechnungsjahr ein (2020-2030).');
            return false;
        }

        // Zeitraum validieren
        if (!data.accountingPeriod) {
            alert('Bitte geben Sie einen Abrechnungszeitraum ein.');
            return false;
        }

        // Prüfen ob Name bereits existiert
        const existingProperties = loadPropertiesFromStorage();
        const nameExists = existingProperties.some(prop => 
            prop.name.toLowerCase() === data.name.toLowerCase()
        );

        if (nameExists) {
            alert('Eine Immobilie mit diesem Namen existiert bereits.');
            return false;
        }

        return true;
    }

    function createInitialChecklist(type, hasHeating) {
        let checklistItems = [];
        
        // Checkliste basierend auf Typ und Heizkosten erstellen
        if (type === 'WEG') {
            checklistItems = hasHeating ? getChecklistWEGMitHeiz() : getChecklistWEGOhneHeiz();
        } else if (type === 'MV') {
            checklistItems = hasHeating ? getChecklistMVMitHeiz() : getChecklistMVOhneHeiz();
        }

        // Alle Items als nicht erledigt initialisieren
        const checklist = {};
        checklistItems.forEach(item => {
            checklist[item] = {
                completed: false,
                specialOption: null
            };
        });

        return checklist;
    }

    function saveNewProperty(property) {
        const existingProperties = loadPropertiesFromStorage();
        existingProperties.push(property);
        savePropertiesToStorage(existingProperties);
    }

    function generateUniqueId() {
        return 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function updateAllViews() {
        // Views aktualisieren
        if (typeof updatePropertyCards === 'function') {
            updatePropertyCards();
        }
        if (typeof updateSidebarList === 'function') {
            updateSidebarList();
        }
        if (typeof updateStatusCards === 'function') {
            updateStatusCards();
        }
        if (typeof updatePeriodFilter === 'function') {
            updatePeriodFilter();
        }
        
        // Portfolio-Filter aktualisieren
        if (window.portfolioManager) {
            window.portfolioManager.updatePortfolioFilter();
        }
    }
}

// Event Listeners für neue Immobilie
function initializeNewPropertyModule() {
    // Button zum Öffnen des Modals
    const newImmoBtn = document.getElementById('newImmoBtn');
    if (newImmoBtn) {
        newImmoBtn.addEventListener('click', openNewPropertyModal);
    }
    
    // Form Submit Handler
    const newPropertyForm = document.getElementById('newPropertyForm');
    if (newPropertyForm) {
        newPropertyForm.addEventListener('submit', handleNewPropertySubmit);
    }
    
    // Cancel Button
    const cancelBtn = document.getElementById('cancelNewProperty');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeNewPropertyModal);
    }
    
    // Aktuelles Jahr als Standard setzen
    const accountingYearInput = document.getElementById('accountingYear');
    if (accountingYearInput && !accountingYearInput.value) {
        accountingYearInput.value = new Date().getFullYear();
    }
}

// Modal für neue Immobilie öffnen
function openNewPropertyModal() {
    const modal = document.getElementById('newPropertyModal');
    
    // Form zurücksetzen
    resetNewPropertyForm();
    
    // Modal anzeigen
    modal.classList.add('show');
    
    // Focus auf erstes Eingabefeld setzen
    setTimeout(() => {
        const firstInput = document.getElementById('propertyName');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

// newimmobilie.js - Erweitert für Portfolio-Unterstützung

document.addEventListener('DOMContentLoaded', function() {
    initNewPropertyModal();
});

function initNewPropertyModal() {
    const newImmoBtn = document.getElementById('newImmoBtn');
    const newPropertyModal = document.getElementById('newPropertyModal');
    const closeNewModal = document.getElementById('closeNewModal');
    const cancelNewProperty = document.getElementById('cancelNewProperty');
    const newPropertyForm = document.getElementById('newPropertyForm');

    // Portfolio-Dropdown beim Laden initialisieren
    if (window.portfolioManager) {
        initializePortfolioDropdown();
    }

    // Modal öffnen
    newImmoBtn.addEventListener('click', function() {
        // Portfolio-Dropdown aktualisieren
        updatePortfolioDropdown();
        
        // Aktuelles Jahr als Standard setzen
        const currentYear = new Date().getFullYear();
        document.getElementById('accountingYear').value = currentYear;
        
        newPropertyModal.style.display = 'flex';
    });

    // Modal schließen
    closeNewModal.addEventListener('click', closeModal);
    cancelNewProperty.addEventListener('click', closeModal);

    // Modal schließen bei Klick außerhalb
    newPropertyModal.addEventListener('click', function(e) {
        if (e.target === newPropertyModal) {
            closeModal();
        }
    });

    // Formular absenden
    newPropertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewProperty();
    });

    function closeModal() {
        newPropertyModal.style.display = 'none';
        newPropertyForm.reset();
    }

    function initializePortfolioDropdown() {
        // Portfolio-Dropdown beim ersten Laden initialisieren
        setTimeout(() => {
            updatePortfolioDropdown();
        }, 100);
    }

    function updatePortfolioDropdown() {
        const portfolioSelect = document.getElementById('propertyPortfolio');
        if (portfolioSelect && window.portfolioManager) {
            window.portfolioManager.populatePortfolioDropdown(portfolioSelect, 'Standard');
        }
    }

    function createNewProperty() {
        // Formulardaten sammeln
        const formData = {
            name: document.getElementById('propertyName').value.trim(),
            portfolio: document.getElementById('propertyPortfolio').value, // Portfolio hinzugefügt
            type: document.getElementById('propertyType').value,
            hasHeating: document.getElementById('hasHeating').value === 'true',
            accountingYear: parseInt(document.getElementById('accountingYear').value),
            accountingPeriod: document.getElementById('accountingPeriod').value.trim()
        };

        // Validierung
        if (!validateFormData(formData)) {
            return;
        }

        // Neue Immobilie erstellen
        const newProperty = {
            id: generateUniqueId(),
            name: formData.name,
            portfolio: formData.portfolio, // Portfolio in Objekt speichern
            type: formData.type,
            hasHeating: formData.hasHeating,
            accountingYear: formData.accountingYear,
            accountingPeriod: formData.accountingPeriod,
            isDemo: false,
            notes: [],
            specialFeatures: [],
            checklist: createInitialChecklist(formData.type, formData.hasHeating),
            createdAt: new Date().toISOString()
        };

        // Immobilie speichern
        saveNewProperty(newProperty);

        // UI aktualisieren
        updateAllViews();

        // Modal schließen
        closeModal();

        // Erfolg anzeigen
        if (window.portfolioManager) {
            window.portfolioManager.showMessage('Immobilie erfolgreich erstellt', 'success');
        } else {
            alert('Immobilie erfolgreich erstellt');
        }
    }

    function validateFormData(data) {
        // Name validieren
        if (!data.name) {
            alert('Bitte geben Sie einen Immobiliennamen ein.');
            return false;
        }

        // Portfolio validieren
        if (!data.portfolio) {
            alert('Bitte wählen Sie ein Portfolio aus.');
            return false;
        }

        // Typ validieren
        if (!data.type) {
            alert('Bitte wählen Sie einen Typ aus.');
            return false;
        }

        // Heizkosten validieren
        if (data.hasHeating === undefined || data.hasHeating === null) {
            alert('Bitte wählen Sie aus, ob eine Heizkostenabrechnung benötigt wird.');
            return false;
        }

        // Jahr validieren
        if (!data.accountingYear || data.accountingYear < 2020 || data.accountingYear > 2030) {
            alert('Bitte geben Sie ein gültiges Abrechnungsjahr ein (2020-2030).');
            return false;
        }

        // Zeitraum validieren
        if (!data.accountingPeriod) {
            alert('Bitte geben Sie einen Abrechnungszeitraum ein.');
            return false;
        }

        // Prüfen ob Name bereits existiert
        const existingProperties = loadPropertiesFromStorage();
        const nameExists = existingProperties.some(prop => 
            prop.name.toLowerCase() === data.name.toLowerCase()
        );

        if (nameExists) {
            alert('Eine Immobilie mit diesem Namen existiert bereits.');
            return false;
        }

        return true;
    }

    function createInitialChecklist(type, hasHeating) {
        let checklistItems = [];
        
        // Checkliste basierend auf Typ und Heizkosten erstellen
        if (type === 'WEG') {
            checklistItems = hasHeating ? getChecklistWEGMitHeiz() : getChecklistWEGOhneHeiz();
        } else if (type === 'MV') {
            checklistItems = hasHeating ? getChecklistMVMitHeiz() : getChecklistMVOhneHeiz();
        }

        // Alle Items als nicht erledigt initialisieren
        const checklist = {};
        checklistItems.forEach(item => {
            checklist[item] = {
                completed: false,
                specialOption: null
            };
        });

        return checklist;
    }

    function saveNewProperty(property) {
        const existingProperties = loadPropertiesFromStorage();
        existingProperties.push(property);
        savePropertiesToStorage(existingProperties);
    }

    function generateUniqueId() {
        return 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function updateAllViews() {
        // Views aktualisieren
        if (typeof updatePropertyCards === 'function') {
            updatePropertyCards();
        }
        if (typeof updateSidebarList === 'function') {
            updateSidebarList();
        }
        if (typeof updateStatusCards === 'function') {
            updateStatusCards();
        }
        if (typeof updatePeriodFilter === 'function') {
            updatePeriodFilter();
        }
        
        // Portfolio-Filter aktualisieren
        if (window.portfolioManager) {
            window.portfolioManager.updatePortfolioFilter();
        }
    }
}

// Hilfsfunktionen für andere Module
function openNewPropertyModal() {
    const newPropertyModal = document.getElementById('newPropertyModal');
    if (newPropertyModal) {
        // Portfolio-Dropdown aktualisieren
        const portfolioSelect = document.getElementById('propertyPortfolio');
        if (portfolioSelect && window.portfolioManager) {
            window.portfolioManager.populatePortfolioDropdown(portfolioSelect, 'Standard');
        }
        
        newPropertyModal.style.display = 'flex';
    }
}

// Modal für neue Immobilie schließen
function closeNewPropertyModal() {
    const modal = document.getElementById('newPropertyModal');
    modal.classList.remove('show');
    
    // Form zurücksetzen
    resetNewPropertyForm();
}

// Form für neue Immobilie zurücksetzen
function resetNewPropertyForm() {
    const form = document.getElementById('newPropertyForm');
    if (form) {
        form.reset();
        
        // Aktuelles Jahr als Standard setzen
        const accountingYearInput = document.getElementById('accountingYear');
        if (accountingYearInput) {
            accountingYearInput.value = new Date().getFullYear();
        }
        
        // Fehler-Styles entfernen
        clearFormErrors();
    }
}

// Form-Fehler zurücksetzen
function clearFormErrors() {
    const formInputs = document.querySelectorAll('#newPropertyForm input, #newPropertyForm select');
    formInputs.forEach(input => {
        input.classList.remove('error');
        input.style.borderColor = '';
    });
    
    // Bestehende Fehlermeldungen entfernen
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
}

// Form-Submit behandeln
function handleNewPropertySubmit(event) {
    event.preventDefault();
    
    // Form-Daten validieren
    const validationResult = validateNewPropertyForm();
    
    if (!validationResult.isValid) {
        showFormErrors(validationResult.errors);
        return;
    }
    
    // Neue Immobilie erstellen
    const propertyData = collectFormData();
    const success = createNewProperty(propertyData);
    
    if (success) {
        // Erfolgsmeldung anzeigen
        showSuccessMessage('Immobilie erfolgreich erstellt!');
        
        // Modal schließen
        closeNewPropertyModal();
        
        // Views aktualisieren
        refreshAllViews();
    } else {
        showErrorMessage('Fehler beim Erstellen der Immobilie. Bitte versuchen Sie es erneut.');
    }
}

// Form-Daten sammeln
function collectFormData() {
    const name = document.getElementById('propertyName').value.trim();
    const type = document.getElementById('propertyType').value;
    const hasHeating = document.getElementById('hasHeating').value === 'true';
    const accountingYear = parseInt(document.getElementById('accountingYear').value);
    const accountingPeriod = document.getElementById('accountingPeriod').value.trim(); // <-- Neue Zeile
   
    return {
        id: generateUniquePropertyId(),
        name,
        type,
        hasHeating,
        accountingYear,
        accountingPeriod, // <-- Neue Zeile
        isDemo: false,
        notes: '',
        specialFeatures: [],
        checklist: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// Eindeutige Property-ID generieren
function generateUniquePropertyId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `prop_${timestamp}_${random}`;
}

// Form-Daten validieren
function validateNewPropertyForm() {
    const errors = [];
   
    // Name validieren
    const name = document.getElementById('propertyName').value.trim();
    if (!name) {
        errors.push({
            field: 'propertyName',
            message: 'Immobilienname ist erforderlich'
        });
    } else if (name.length < 3) {
        errors.push({
            field: 'propertyName',
            message: 'Immobilienname muss mindestens 3 Zeichen lang sein'
        });
    } else if (name.length > 100) {
        errors.push({
            field: 'propertyName',
            message: 'Immobilienname darf maximal 100 Zeichen lang sein'
        });
    } else if (isPropertyNameDuplicate(name)) {
        errors.push({
            field: 'propertyName',
            message: 'Eine Immobilie mit diesem Namen existiert bereits'
        });
    }
   
    // Typ validieren
    const type = document.getElementById('propertyType').value;
    if (!type || !['WEG', 'MV'].includes(type)) {
        errors.push({
            field: 'propertyType',
            message: 'Bitte wählen Sie einen gültigen Immobilientyp'
        });
    }
   
    // Heizkostenabrechnung validieren
    const hasHeating = document.getElementById('hasHeating').value;
    if (!hasHeating || !['true', 'false'].includes(hasHeating)) {
        errors.push({
            field: 'hasHeating',
            message: 'Bitte wählen Sie eine Option für die Heizkostenabrechnung'
        });
    }
   
    // Abrechnungsjahr validieren
    const accountingYear = document.getElementById('accountingYear').value;
    const year = parseInt(accountingYear);
    const currentYear = new Date().getFullYear();
   
    if (!accountingYear || isNaN(year)) {
        errors.push({
            field: 'accountingYear',
            message: 'Abrechnungsjahr ist erforderlich'
        });
    } else if (year < 2020 || year > currentYear + 2) {
        errors.push({
            field: 'accountingYear',
            message: `Abrechnungsjahr muss zwischen 2020 und ${currentYear + 2} liegen`
        });
    }

    // Abrechnungszeitraum validieren
    const accountingPeriod = document.getElementById('accountingPeriod').value.trim();
    if (!accountingPeriod) {
        errors.push({
            field: 'accountingPeriod',
            message: 'Abrechnungszeitraum ist erforderlich'
        });
    } else if (accountingPeriod.length < 5) {
        errors.push({
            field: 'accountingPeriod',
            message: 'Abrechnungszeitraum ist zu kurz'
        });
    } else if (accountingPeriod.length > 50) {
        errors.push({
            field: 'accountingPeriod',
            message: 'Abrechnungszeitraum ist zu lang (max. 50 Zeichen)'
        });
    }
   
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Prüfen ob Immobilienname bereits existiert
function isPropertyNameDuplicate(name) {
    const existingProperties = loadPropertiesFromStorage();
    return existingProperties.some(property => 
        property.name.toLowerCase() === name.toLowerCase()
    );
}

// Form-Fehler anzeigen
function showFormErrors(errors) {
    // Bestehende Fehler löschen
    clearFormErrors();
    
    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            // Feld rot markieren
            field.style.borderColor = '#e74c3c';
            field.classList.add('error');
            
            // Fehlermeldung erstellen
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.textContent = error.message;
            
            // Fehlermeldung nach dem Feld einfügen
            field.parentNode.appendChild(errorDiv);
        }
    });
    
    // Zum ersten Fehlerfeld scrollen
    if (errors.length > 0) {
        const firstErrorField = document.getElementById(errors[0].field);
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }
}

// Neue Immobilie erstellen
function createNewProperty(propertyData) {
    try {
        // Checkliste für neue Immobilie initialisieren
        propertyData.checklist = initializeChecklistForProperty(propertyData);
        
        // Immobilie zu den aktuellen Properties hinzufügen
        currentProperties.push(propertyData);
        
        // Im LocalStorage speichern
        const success = savePropertyToStorage(propertyData);
        
        if (success) {
            console.log('Neue Immobilie erstellt:', propertyData.name);
            return true;
        } else {
            // Bei Speicherfehler aus currentProperties entfernen
            const index = currentProperties.findIndex(p => p.id === propertyData.id);
            if (index > -1) {
                currentProperties.splice(index, 1);
            }
            return false;
        }
    } catch (error) {
        console.error('Fehler beim Erstellen der Immobilie:', error);
        return false;
    }
}

// Erfolgsmeldung anzeigen
function showSuccessMessage(message) {
    // Einfache Benachrichtigung (kann später durch Toast-System ersetzt werden)
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Styling für Benachrichtigung
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-hover);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Nach 3 Sekunden automatisch entfernen
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fehlermeldung anzeigen
function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-hover);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}


 
// Event Listeners für dynamische Vorschau
function setupDynamicPreview() {
    const typeSelect = document.getElementById('propertyType');
    const heatingSelect = document.getElementById('hasHeating');
    
/*     if (typeSelect && heatingSelect) {
        typeSelect.addEventListener('change', showChecklistPreview);
        heatingSelect.addEventListener('change', showChecklistPreview);
    } */
}

// Keyboard-Shortcuts für Modal
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const newModal = document.getElementById('newPropertyModal');
        const isModalOpen = newModal && newModal.classList.contains('show');
        
        if (isModalOpen) {
            // ESC zum Schließen
            if (e.key === 'Escape') {
                e.preventDefault();
                closeNewPropertyModal();
            }
            
            // Enter zum Speichern (wenn nicht in Textarea)
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                const form = document.getElementById('newPropertyForm');
                if (form && e.target.closest('#newPropertyForm')) {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
    });
}

// Auto-Save Draft-Funktionalität (optional)
function setupAutoSaveDraft() {
    const formFields = ['propertyName', 'propertyType', 'hasHeating', 'accountingYear'];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', saveDraftData);
            field.addEventListener('change', saveDraftData);
        }
    });
}

function saveDraftData() {
    const draftData = {
        propertyName: document.getElementById('propertyName').value,
        propertyType: document.getElementById('propertyType').value,
        hasHeating: document.getElementById('hasHeating').value,
        accountingYear: document.getElementById('accountingYear').value,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('newPropertyDraft', JSON.stringify(draftData));
    } catch (error) {
        console.warn('Konnte Draft nicht speichern:', error);
    }
}

function loadDraftData() {
    try {
        const draftData = localStorage.getItem('newPropertyDraft');
        if (draftData) {
            const data = JSON.parse(draftData);
            
            // Nur laden wenn nicht älter als 1 Stunde
            if (Date.now() - data.timestamp < 3600000) {
                document.getElementById('propertyName').value = data.propertyName || '';
                document.getElementById('propertyType').value = data.propertyType || '';
                document.getElementById('hasHeating').value = data.hasHeating || '';
                document.getElementById('accountingYear').value = data.accountingYear || new Date().getFullYear();
            }
        }
    } catch (error) {
        console.warn('Konnte Draft nicht laden:', error);
    }
}

function clearDraftData() {
    try {
        localStorage.removeItem('newPropertyDraft');
    } catch (error) {
        console.warn('Konnte Draft nicht löschen:', error);
    }
}

// CSS für Animationen hinzufügen
function addNotificationStyles() {
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .form-error {
                animation: fadeIn 0.2s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    initializeNewPropertyModule();
    setupDynamicPreview();
    setupKeyboardShortcuts();
    setupAutoSaveDraft();
    addNotificationStyles();
});

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openNewPropertyModal,
        closeNewPropertyModal,
        createNewProperty,
        validateNewPropertyForm,
        generateUniquePropertyId,
        showSuccessMessage,
        showErrorMessage,
        initializeNewPropertyModule
    };
}