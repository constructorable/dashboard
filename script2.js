// Haupt-JavaScript-Datei für die Immobilienverwaltung

// Globale Variablen
let isInitialized = false;
// currentModalProperty wird bereits in modalimmo.js deklariert

// HILFSFUNKTIONEN HINZUFÜGEN
// Debounce-Hilfsfunktion
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle-Hilfsfunktion für häufige Events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Icon-Funktion für verschiedene Immobilien-Typen hinzufügen
function getPropertyTypeIcon(propertyType) {
    switch(propertyType) {
        case 'WEG':
            return '<i class="fas fa-users property-type-icon property-type-weg" title="Wohnungseigentümergemeinschaft"></i>';
        case 'MV':
            return '<i class="fas fa-user-tie property-type-icon property-type-mv" title="Mietverwaltung"></i>';
        default:
            return '<i class="fas fa-building property-type-icon" title="Immobilie"></i>';
    }
}

// Initialisierung der Anwendung
document.addEventListener('DOMContentLoaded', function() {
    console.log('Immobilienverwaltung wird gestartet...');
    
    try {
        initializeApplication();
    } catch (error) {
        console.error('Kritischer Fehler beim Starten der Anwendung:', error);
        showErrorModal('Die Anwendung konnte nicht gestartet werden. Bitte laden Sie die Seite neu.');
    }
});

// Hauptinitialisierung
async function initializeApplication() {
    if (isInitialized) {
        console.log('Anwendung bereits initialisiert');
        return;
    }
    
    console.log('Starte Anwendungsinitialisierung...');
    
    try {
        // Storage initialisieren
        initializeStorage();
        
        // Module in der richtigen Reihenfolge initialisieren
        await initializeModules();
        
        // Event-Handler einrichten
        setupGlobalEventHandlers();
        
        // Initiale Daten laden und Views rendern
        await loadInitialData();
        
        // Performance-Optimierungen anwenden
        optimizePerformance();
        
        isInitialized = true;
        console.log('Anwendung erfolgreich initialisiert');
        
        // Willkommensmeldung anzeigen
     /*    showWelcomeMessage(); */
        
    } catch (error) {
        console.error('Fehler bei der Initialisierung:', error);
        throw error;
    }
}

// Module initialisieren
async function initializeModules() {
    const modules = [
        'initializeSearchFilterSort',  // NEU: Ersetzt die 4 einzelnen Module
        'initializeNewPropertyModule', 
        'initializeDeleteModule'
    ];
    
    for (const moduleName of modules) {
        try {
            if (typeof window[moduleName] === 'function') {
                await window[moduleName]();
                console.log(`Modul ${moduleName} initialisiert`);
            } else {
                console.warn(`Modul ${moduleName} nicht gefunden`);
            }
        } catch (error) {
            console.error(`Fehler beim Initialisieren von ${moduleName}:`, error);
        }
    }
}

// Initiale Daten laden
async function loadInitialData() {
    try {
        // Demo-Daten und gespeicherte Daten kombinieren
        if (typeof initializeDemoData === 'function') {
            currentProperties = initializeDemoData();
            filteredProperties = [...currentProperties];
            console.log(`${currentProperties.length} Immobilien geladen`);
        } else {
            console.warn('initializeDemoData noch nicht verfügbar, warte...');
            // Warten und nochmal versuchen
            await new Promise(resolve => setTimeout(resolve, 500));
            if (typeof initializeDemoData === 'function') {
                currentProperties = initializeDemoData();
                filteredProperties = [...currentProperties];
                console.log(`${currentProperties.length} Immobilien geladen`);
            }
        }
       
        // Views rendern - mit verbessertem Fallback
        if (typeof renderAllViews === 'function') {
            await renderAllViews();
            console.log('Views erfolgreich gerendert');
        } else {
            console.log('renderAllViews noch nicht verfügbar, warte auf DOM-Elemente...');
            
            // Alternative: Direkt die einzelnen Render-Funktionen aufrufen
            const renderFunctions = [
                'renderPropertyCards',
                'renderSidebar', 
                'updateCounts',
                'renderStatusCards'
            ];
            
            let functionsLoaded = 0;
            for (const funcName of renderFunctions) {
                if (typeof window[funcName] === 'function') {
                    try {
                        window[funcName]();
                        functionsLoaded++;
                    } catch (error) {
                        console.warn(`Fehler beim Ausführen von ${funcName}:`, error);
                    }
                }
            }
            
            if (functionsLoaded > 0) {
                console.log(`${functionsLoaded} Render-Funktionen erfolgreich ausgeführt`);
            } else {
                console.log('Keine Render-Funktionen verfügbar - Views werden später geladen');
            }
        }
       
        // Dynamische Filter erstellen
        if (typeof updateFiltersOnDataChange === 'function') {
            updateFiltersOnDataChange();
        }
       
    } catch (error) {
        console.error('Fehler beim Laden der initialen Daten:', error);
        throw error;
    }
}

// Globale Event-Handler
function setupGlobalEventHandlers() {
    // Keyboard-Shortcuts
    setupKeyboardShortcuts();
    
    // Window-Events
    setupWindowEvents();
    
    // Error-Handler
    setupErrorHandlers();
    
    console.log('Globale Event-Handler eingerichtet');
}

// Keyboard-Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Shortcuts nur wenn kein Modal geöffnet ist oder Input fokussiert
        if (isModalOpen() || isInputFocused()) {
            return;
        }
        
        switch(e.key) {
            case 'n':
            case 'N':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    openNewPropertyModal();
                }
                break;
                
            case 'f':
            case 'F':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    focusSearchInput();
                }
                break;
                
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    resetAllFilters();
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                closeAllModals();
                clearSearch();
                break;
        }
    });
}

// Window-Events
function setupWindowEvents() {
    // Resize-Handler
    window.addEventListener('resize', debounce(() => {
        handleWindowResize();
    }, 250));
    
    // Before-Unload für Warnung bei ungespeicherten Änderungen
    window.addEventListener('beforeunload', function(e) {
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?';
            return e.returnValue;
        }
    });
    
    // Online/Offline-Events
    window.addEventListener('online', () => {
        console.log('Internetverbindung wiederhergestellt');
        showNotification('Verbindung wiederhergestellt', 'success', 3000);
    });
    
    window.addEventListener('offline', () => {
        console.log('Internetverbindung verloren');
        showNotification('Keine Internetverbindung - Arbeiten Sie offline weiter', 'warning', 5000);
    });
}

// Error-Handler
function setupErrorHandlers() {
    window.addEventListener('error', function(e) {
        console.error('JavaScript-Fehler:', e.error);
        handleGlobalError(e.error);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unbehandelte Promise-Rejection:', e.reason);
        handleGlobalError(e.reason);
    });
}

// Checklisten-Item aktualisieren
function updateChecklistItem(propertyId, encodedItem, isCompleted) {
    try {
        const item = atob(encodedItem);
        const property = currentProperties.find(p => p.id === propertyId);
        
        if (!property) {
            console.error('Property nicht gefunden:', propertyId);
            return;
        }
        
        if (!property.checklist[item]) {
            console.error('Checklist-Item nicht gefunden:', item);
            return;
        }
        
        // Status aktualisieren
        property.checklist[item].completed = isCompleted;
        
        // Sonderoptionen-Container ein-/ausblenden
        const specialOptions = document.querySelector(`#checklist_${propertyId}_${encodedItem}`).parentNode.querySelector('.special-options');
        if (specialOptions) {
            specialOptions.style.display = isCompleted ? 'block' : 'none';
            
            // Sonderoption zurücksetzen wenn Item nicht mehr completed
            if (!isCompleted) {
                property.checklist[item].specialOptionChecked = false;
            }
        }
        
        // Property speichern
        savePropertyToStorage(property);
        
        // selectedProperty aktualisieren falls nötig
        if (selectedProperty && selectedProperty.id === propertyId) {
            selectedProperty = property;
        }
        
        // Views aktualisieren
        refreshAfterPropertyChange(propertyId, 'checklist');
        
        console.log(`Checklist-Item aktualisiert: ${item} = ${isCompleted}`);
        
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Checklist-Items:', error);
        showErrorMessage('Fehler beim Speichern der Änderung');
    }
}

// Sonderoption aktualisieren
function updateSpecialOption(propertyId, encodedItem, isChecked) {
    try {
        const item = atob(encodedItem);
        const property = currentProperties.find(p => p.id === propertyId);
        
        if (!property || !property.checklist[item]) {
            console.error('Property oder Checklist-Item nicht gefunden');
            return;
        }
        
        // Sonderoption aktualisieren
        property.checklist[item].specialOptionChecked = isChecked;
        
        // Property speichern
        savePropertyToStorage(property);
        
        // selectedProperty aktualisieren
        if (selectedProperty && selectedProperty.id === propertyId) {
            selectedProperty = property;
        }
        
        // Views aktualisieren
        refreshAfterPropertyChange(propertyId, 'checklist');
        
        console.log(`Sonderoption aktualisiert: ${item} = ${isChecked}`);
        
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Sonderoption:', error);
        showErrorMessage('Fehler beim Speichern der Sonderoption');
    }
}

// Besonderheit hinzufügen
function addSpecialFeature(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property) {
        showErrorMessage('Immobilie nicht gefunden');
        return;
    }
    
    // Einfaches Prompt für Typ und Beschreibung
    const type = prompt('Typ der Besonderheit:');
    if (!type) return;
    
    const description = prompt('Beschreibung:');
    if (!description) return;
    
    // Besonderheit hinzufügen
    if (!property.specialFeatures) {
        property.specialFeatures = [];
    }
    
    property.specialFeatures.push({
        type: type.trim(),
        description: description.trim()
    });
    
    // Speichern und aktualisieren
    savePropertyToStorage(property);
    
    if (selectedProperty && selectedProperty.id === propertyId) {
        selectedProperty = property;
        loadSpecialFeaturesTab(property);
    }
    
    refreshAfterPropertyChange(propertyId, 'update');
    
    showSuccessMessage('Besonderheit hinzugefügt');
}

// Besonderheit bearbeiten
function editSpecialFeature(propertyId, index) {
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property || !property.specialFeatures || !property.specialFeatures[index]) {
        showErrorMessage('Besonderheit nicht gefunden');
        return;
    }
    
    const feature = property.specialFeatures[index];
    
    const newType = prompt('Typ der Besonderheit:', feature.type);
    if (newType === null) return; // Abgebrochen
    
    const newDescription = prompt('Beschreibung:', feature.description);
    if (newDescription === null) return; // Abgebrochen
    
    // Besonderheit aktualisieren
    property.specialFeatures[index] = {
        type: newType.trim(),
        description: newDescription.trim()
    };
    
    // Speichern und aktualisieren
    savePropertyToStorage(property);
    
    if (selectedProperty && selectedProperty.id === propertyId) {
        selectedProperty = property;
        loadSpecialFeaturesTab(property);
    }
    
    refreshAfterPropertyChange(propertyId, 'update');
    
    showSuccessMessage('Besonderheit aktualisiert');
}

// Besonderheit löschen
function deleteSpecialFeature(propertyId, index) {
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property || !property.specialFeatures || !property.specialFeatures[index]) {
        showErrorMessage('Besonderheit nicht gefunden');
        return;
    }
    
    const feature = property.specialFeatures[index];
    
    if (confirm(`Besonderheit "${feature.type}" wirklich löschen?`)) {
        // Besonderheit entfernen
        property.specialFeatures.splice(index, 1);
        
        // Speichern und aktualisieren
        savePropertyToStorage(property);
        
        if (selectedProperty && selectedProperty.id === propertyId) {
            selectedProperty = property;
            loadSpecialFeaturesTab(property);
        }
        
        refreshAfterPropertyChange(propertyId, 'update');
        
        showSuccessMessage('Besonderheit gelöscht');
    }
}

// Notizen speichern
function saveNotes(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    const notesTextarea = document.getElementById('propertyNotes');
    
    if (!property || !notesTextarea) {
        showErrorMessage('Fehler beim Speichern der Notizen');
        return;
    }
    
    // Notizen aktualisieren
    property.notes = notesTextarea.value.trim();
    property.updatedAt = new Date().toISOString();
    
    // Speichern
    savePropertyToStorage(property);
    
    if (selectedProperty && selectedProperty.id === propertyId) {
        selectedProperty = property;
    }
    
    refreshAfterPropertyChange(propertyId, 'update');
    
    showSuccessMessage('Notizen gespeichert');
}

// Stammdaten speichern
function saveMasterData(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property) {
        showErrorMessage('Immobilie nicht gefunden');
        return;
    }
    
    // Alte Werte für Checklisten-Update merken
    const oldType = property.type;
    const oldHasHeating = property.hasHeating;
    
    // Neue Werte aus Formular lesen
    const newName = document.getElementById('editPropertyName').value.trim();
    const newType = document.getElementById('editPropertyType').value;
    const newHasHeating = document.getElementById('editHasHeating').value === 'true';
    const newAccountingYear = parseInt(document.getElementById('editAccountingYear').value);
    
    // Validierung
    if (!newName || !newType || !newAccountingYear) {
        showErrorMessage('Bitte füllen Sie alle Felder aus');
        return;
    }
    
    // Duplikatsprüfung (außer für die aktuelle Immobilie)
    const existingProperty = currentProperties.find(p => 
        p.id !== propertyId && p.name.toLowerCase() === newName.toLowerCase()
    );
    
    if (existingProperty) {
        showErrorMessage('Eine Immobilie mit diesem Namen existiert bereits');
        return;
    }
    
    // Daten aktualisieren
    property.name = newName;
    property.type = newType;
    property.hasHeating = newHasHeating;
    property.accountingYear = newAccountingYear;
    property.updatedAt = new Date().toISOString();
    
    // Checkliste aktualisieren falls nötig
    if (oldType !== newType || oldHasHeating !== newHasHeating) {
        property.checklist = updateChecklistForPropertyChange(property, oldType, oldHasHeating);
        
        // Modal-Content neu laden
        if (selectedProperty && selectedProperty.id === propertyId) {
            selectedProperty = property;
            loadChecklistTab(property);
        }
    }
    
    // Speichern
    savePropertyToStorage(property);
    
    // Modal-Titel aktualisieren
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = property.name;
    }
    
    refreshAfterPropertyChange(propertyId, 'update');
    
    showSuccessMessage('Stammdaten gespeichert');
}

// Property bearbeiten (öffnet Modal)
function editProperty(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    
    if (!property) {
        showErrorMessage('Immobilie nicht gefunden');
        return;
    }
    
    openPropertyModal(property);
    
    // Zum Stammdaten-Tab wechseln
    setTimeout(() => {
        switchModalTab('masterdata');
    }, 100);
}

// Hilfsfunktionen

function isModalOpen() {
    const modals = document.querySelectorAll('.modal.show');
    return modals.length > 0;
}

function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
    );
}

function closeAllModals() {
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
    });
    selectedProperty = null;
}

function focusSearchInput() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function handleWindowResize() {
    // Chart-Größen anpassen
    if (typeof optimizeChartRendering === 'function') {
        optimizeChartRendering();
    }
    
    // Layout-Anpassungen für mobile Geräte
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer && window.innerWidth <= 768) {
        mainContainer.classList.add('mobile-layout');
    } else if (mainContainer) {
        mainContainer.classList.remove('mobile-layout');
    }
}

function hasUnsavedChanges() {
    // Prüfen ob es ungespeicherte Änderungen gibt
    // Vereinfachte Implementierung - könnte erweitert werden
    return false;
}

function handleGlobalError(error) {
    // Globale Fehlerbehandlung
    console.error('Globaler Fehler:', error);
    
    // Kritische Fehler anzeigen
    if (error && error.message && error.message.includes('Storage')) {
        showErrorModal('Speicherfehler aufgetreten. Ihre Daten könnten nicht gespeichert werden.');
    } else if (error && error.message && error.message.includes('Network')) {
        showErrorModal('Netzwerkfehler aufgetreten. Bitte prüfen Sie Ihre Internetverbindung.');
    }
}

function optimizePerformance() {
    // Performance-Optimierungen
    
    // Intersection Observer für lazy loading (falls benötigt)
    if ('IntersectionObserver' in window) {
        setupIntersectionObserver();
    }
    
    // Service Worker registrieren (falls vorhanden)
    if ('serviceWorker' in navigator) {
        // navigator.serviceWorker.register('/sw.js');
    }
    
    console.log('Performance-Optimierungen angewendet');
}

function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element ist sichtbar - Chart zeichnen falls noch nicht geschehen
                const canvas = entry.target.querySelector('canvas');
                if (canvas && !canvas.dataset.drawn) {
                    const propertyId = entry.target.dataset.propertyId;
                    if (propertyId) {
                        const property = currentProperties.find(p => p.id === propertyId);
                        if (property) {
                            const progress = calculateProgress(property.checklist);
                            createSmallProgressChart(canvas.id, progress);
                            canvas.dataset.drawn = 'true';
                        }
                    }
                }
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Property-Karten beobachten
    document.querySelectorAll('.property-card').forEach(card => {
        observer.observe(card);
    });
}

// Benachrichtigungssystem
function showNotification(message, type = 'info', duration = 3000) {
    if (typeof createNotification === 'function') {
        createNotification(type, message, duration);
    } else {
        // Fallback
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

/* function showWelcomeMessage() {
    const propertyCount = currentProperties.length;
    const demoCount = currentProperties.filter(p => p.isDemo).length;
    const realCount = propertyCount - demoCount;
    
    let message = `Willkommen! ${propertyCount} Immobilien geladen`;
    if (demoCount > 0) {
        message += ` (${demoCount} Demo, ${realCount} eigene)`;
    }
    
    showNotification(message, 'success', 4000);
} */

function showErrorModal(message) {
    // Einfaches Error-Modal
    alert('Fehler: ' + message);
}

// Debug-Funktionen (nur in Development)
function enableDebugMode() {
    // Warten bis searchfiltersort.js geladen ist
    if (typeof window.searchFilterSortDebug !== 'undefined') {
        window.debugInfo = {
            ...window.searchFilterSortDebug.state(),
            selectedProperty
        };
    } else {
        // Fallback falls searchfiltersort.js noch nicht geladen ist
        setTimeout(enableDebugMode, 500);
        return;
    }
    
    console.log('Debug-Modus aktiviert. Verwenden Sie window.debugInfo für Debugging.');
}

// Aktivierung im Development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Warten bis alle Module geladen sind
    setTimeout(enableDebugMode, 1000);
}

// Globale Utility-Funktionen
// Globale Utility-Funktionen
window.immobilienApp = {
    refresh: () => {
        if (typeof refreshAllViews === 'function') {
            return refreshAllViews();
        } else {
            console.warn('refreshAllViews nicht verfügbar');
        }
    },
    resetFilters: () => {
        if (typeof resetAllFilters === 'function') {
            return resetAllFilters();
        } else {
            console.warn('resetAllFilters nicht verfügbar');
        }
    },
    clearSearch: () => {
        if (typeof clearSearch === 'function') {
            return clearSearch();
        } else {
            console.warn('clearSearch nicht verfügbar');
        }
    },
    exportData: () => {
        if (typeof exportAllData === 'function') {
            return exportAllData();
        } else {
            console.warn('exportAllData nicht verfügbar');
        }
    },
    getStats: () => {
        if (typeof window.searchFilterSortDebug !== 'undefined') {
            const state = window.searchFilterSortDebug.state();
            return {
                properties: state.currentProperties,
                filtered: state.filteredProperties,
                demo: 'Nicht verfügbar' // Demo-Count wird in searchfiltersort.js berechnet
            };
        } else {
            return {
                properties: 'Modul nicht geladen',
                filtered: 'Modul nicht geladen',
                demo: 'Modul nicht geladen'
            };
        }
    }
};

// Console-Meldung für Entwickler
console.log(`
🏢 Immobilienverwaltung v1.0
Verfügbare Debug-Befehle:
- window.immobilienApp.refresh()
- window.immobilienApp.resetFilters()
- window.immobilienApp.clearSearch()
- window.immobilienApp.getStats()
`);

// Export für Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApplication,
        updateChecklistItem,
        updateSpecialOption,
        addSpecialFeature,
        editSpecialFeature,
        deleteSpecialFeature,
        saveNotes,
        saveMasterData,
        editProperty
    };
}


// In setupGlobalEventHandlers() Funktion hinzufügen:
function setupGlobalEventHandlers() {
    setupKeyboardShortcuts();
    setupWindowEvents();
    setupErrorHandlers();
    
    // FILTER-EVENT-LISTENERS EXPLIZIT EINRICHTEN
    setTimeout(() => {
        const typeFilter = document.getElementById('typeFilter');
        const heatingFilter = document.getElementById('heatingFilter');
        const resetButton = document.getElementById('resetFilters');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                console.log('Type Filter geändert:', e.target.value);
                if (typeof activeFilters !== 'undefined') {
                    activeFilters.type = e.target.value;
                    if (typeof applyCurrentFilters === 'function') {
                        applyCurrentFilters();
                    }
                }
            });
        }
        
        if (heatingFilter) {
            heatingFilter.addEventListener('change', (e) => {
                console.log('Heating Filter geändert:', e.target.value);
                if (typeof activeFilters !== 'undefined') {
                    activeFilters.heating = e.target.value;
                    if (typeof applyCurrentFilters === 'function') {
                        applyCurrentFilters();
                    }
                }
            });
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                console.log('Reset Button geklickt');
                if (typeof resetAllFilters === 'function') {
                    resetAllFilters();
                }
            });
        }
        
        console.log('Filter Event-Listeners manuell eingerichtet');
    }, 500);
    
    console.log('Globale Event-Handler eingerichtet');
}

document.addEventListener('DOMContentLoaded', function() {
    // Zuerst Portfolio-Manager initialisieren
    if (window.portfolioManager) {
        window.portfolioManager.updateAllPortfolioDropdowns();
    }
    
    // Dann SearchFilterSort initialisieren
    if (typeof initializeSearchFilterSort === 'function') {
        initializeSearchFilterSort();
    }
    
    // Portfolio-Filter nach kurzer Verzögerung erstellen falls noch nicht vorhanden
    setTimeout(() => {
        if (window.portfolioManager && !document.getElementById('portfolioFilter')) {
            window.portfolioManager.createPortfolioFilter();
        }
    }, 500);
});

// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    
    // Hamburger Menu Toggle
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        
        // Icon ändern
        const icon = hamburgerBtn.querySelector('i');
        if (hamburgerMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
    
    // Menu schließen bei Klick außerhalb
    document.addEventListener('click', function(e) {
        if (!hamburgerMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
    
    // Menu schließen bei Klick auf Menu-Item
    document.querySelectorAll('.hamburger-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        });
    });
    
    // Menu schließen bei Window Resize (falls von Mobile zu Desktop gewechselt wird)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            hamburgerMenu.classList.remove('active');
            hamburgerBtn.querySelector('i').className = 'fas fa-bars';
        }
    });
});