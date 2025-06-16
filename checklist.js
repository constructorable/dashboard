// Checklist-Funktionen für verschiedene Immobilientypen

function getChecklistMVMitHeiz() {
    return [
        'Verbrauchsrechnungen vorhanden',
        'Dienstleistungsrechnung vorhanden',
        'Wartungsrechnung vorhanden',
        'Belege für Heizkostenabrechnungen vorhanden',
        'Heizkostenaufstellung eingereicht',
        'Heizkostenabrechnung zurückerhalten',
        'Buchungen durchgeführt',
        'Abrechnung dem Eigentümer zur Freigabe geschickt',
        'Freigabe vom Eigentümer erhalten',
        'Abrechnung verschickt'
    ];
}

function getChecklistMVOhneHeiz() {
    return [
        'Verbrauchsrechnungen vorhanden',
        'Dienstleistungsrechnung vorhanden',
        'Wartungsrechnung vorhanden',
        'Buchungen durchgeführt',
        'Abrechnung erstellt',
        'Abrechnung dem Eigentümer zur Freigabe geschickt',
        'Freigabe vom Eigentümer erhalten',
        'Abrechnung buchen / sollstellen',
        'Abrechnung verschickt'
    ];
}

function getChecklistWEGMitHeiz() {
    return [
        'Verbrauchsrechnungen vorhanden',
        'Heizkostenaufstellung eingereicht',
        'Heizkostenaufstellung zurückerhalten',
        'Wartungsrechnung vorhanden',
        'Dienstleistungsrechnung vorhanden',
        'Jahresabrechnung von Eigentümer freigegeben',
        'Buchungen durchgeführt',
        'Abrechnung an Eigentümer/Mieter verschickt'
    ];
}

function getChecklistWEGOhneHeiz() {
    return [
        'Verbrauchsrechnungen vorhanden',
        'Dienstleistungsrechnung vorhanden',
        'Wartungsrechnung vorhanden',
        'Jahresabrechnung von Eigentümer freigegeben',
        'Buchungen erstellen',
        'Belegprüfung duch Verwaltungsbeirat / Rechnungsprüfer',
        'Jahresabrechnung mit Einladung an Eigentümer verschickt',
        'Jahresabrechnung von Eigentümergemeinschaft freigegeben',
        'Jahresabrechnung buchuen / sollstellen',
        'bei Sondereigentumsverwaltung: Betrieskostenabrechnung an Mieter verschickt'
    ];
}

// Hauptfunktion zur Bestimmung der richtigen Checkliste
function getChecklistForProperty(type, hasHeating) {
    if (type === 'MV') {
        return hasHeating ? getChecklistMVMitHeiz() : getChecklistMVOhneHeiz();
    } else if (type === 'WEG') {
        return hasHeating ? getChecklistWEGMitHeiz() : getChecklistWEGOhneHeiz();
    } else {
        console.error('Unbekannter Immobilientyp:', type);
        return [];
    }
}

// Funktion zur Initialisierung einer neuen Checkliste für eine Immobilie
function initializeChecklistForProperty(property) {
    const checklistItems = getChecklistForProperty(property.type, property.hasHeating);
    const checklist = {};
    
    checklistItems.forEach(item => {
        checklist[item] = {
            completed: false,
            hasSpecialOption: hasSpecialOption(item),
            specialOptionChecked: false
        };
    });
    
    return checklist;
}

// Funktion zur Bestimmung, welche Checklistenpunkte Sonderoptionen haben
// Funktion zur Bestimmung, welche Checklistenpunkte Sonderoptionen haben
function hasSpecialOption(checklistItem) {
    const specialOptionItems = [
        'Heizkostenabrechnung zurückerhalten',
        'Heizkostenaufstellung zurückerhalten',
        'Freigabe vom Eigentümer erhalten',  // ✅ HINZUGEFÜGT
        'Abrechnung dem Eigentümer zur Freigabe geschickt'
    ];
    
    return specialOptionItems.includes(checklistItem);
}

// Funktion zur Berechnung des Fortschritts einer Checkliste
// Funktion zur Berechnung des Fortschritts einer Checkliste
function calculateProgress(checklist) {
    if (!checklist || Object.keys(checklist).length === 0) {
        return 0;
    }
    
    const totalItems = Object.keys(checklist).length;
    let completedItems = 0;
    
    // Durch alle Checklist-Items iterieren
    Object.keys(checklist).forEach(itemName => {
        const item = checklist[itemName];
        
        if (isItemCompleted(itemName, item)) {
            completedItems++;
        }
    });
    
    return Math.round((completedItems / totalItems) * 100);
}

// Neue Hilfsfunktion zur Bestimmung ob ein Item als completed gilt
function isItemCompleted(itemName, itemData) {
    // Spezielle Heating-Items (mit Radio-Buttons)
    if (itemName.includes('Heizkostenabrechnung zurückerhalten') || 
        itemName.includes('Heizkostenaufstellung zurückerhalten')) {
        return itemData.heatingStatus === 'ja';
    }
    
    // Spezielle Owner-Approval-Items (mit Radio-Buttons)
    if (itemName.includes('Freigabe vom Eigentümer erhalten')) {
        return itemData.ownerApprovalStatus === 'ja';
    }
    
    // Normale Checkbox-Items
    return itemData.completed === true;
}

// Funktion zur Bestimmung des Status basierend auf dem Fortschritt
function getStatusFromProgress(progress) {
    if (progress === 0) {
        return 'notStarted';
    } else if (progress === 100) {
        return 'completed';
    } else {
        return 'inProgress';
    }
}

// Funktion zur Aktualisierung einer Checkliste bei Änderung der Immobiliendaten
function updateChecklistForPropertyChange(property, oldType, oldHasHeating) {
    // Prüfen ob sich der Typ oder die Heizkosteneinstellung geändert hat
    if (property.type !== oldType || property.hasHeating !== oldHasHeating) {
        // Neue Checkliste erstellen
        const newChecklist = initializeChecklistForProperty(property);
        
        // Versuchen, bestehende Fortschritte zu übernehmen wo möglich
        if (property.checklist) {
            Object.keys(newChecklist).forEach(item => {
                if (property.checklist[item]) {
                    // Bestehenden Status übernehmen, wenn der Punkt in der alten Checkliste existierte
                    newChecklist[item] = {
                        ...newChecklist[item],
                        completed: property.checklist[item].completed,
                        specialOptionChecked: property.checklist[item].specialOptionChecked || false
                    };
                }
            });
        }
        
        return newChecklist;
    }
    
    // Keine Änderung erforderlich
    return property.checklist;
}

// Funktion zur Validierung einer Checkliste
function validateChecklist(checklist, type, hasHeating) {
    const expectedItems = getChecklistForProperty(type, hasHeating);
    const actualItems = Object.keys(checklist);
    
    // Prüfen ob alle erwarteten Items vorhanden sind
    const missingItems = expectedItems.filter(item => !actualItems.includes(item));
    
    // Prüfen ob zusätzliche Items vorhanden sind
    const extraItems = actualItems.filter(item => !expectedItems.includes(item));
    
    return {
        isValid: missingItems.length === 0 && extraItems.length === 0,
        missingItems,
        extraItems
    };
}

// Funktion zur Reparatur einer beschädigten Checkliste
function repairChecklist(property) {
    const validation = validateChecklist(property.checklist, property.type, property.hasHeating);
    
    if (!validation.isValid) {
        console.warn('Checkliste repariert für Immobilie:', property.name);
        
        // Neue korrekte Checkliste erstellen
        const correctChecklist = initializeChecklistForProperty(property);
        
        // Bestehende Werte übernehmen wo möglich
        if (property.checklist) {
            Object.keys(correctChecklist).forEach(item => {
                if (property.checklist[item]) {
                    correctChecklist[item] = {
                        ...correctChecklist[item],
                        completed: property.checklist[item].completed,
                        specialOptionChecked: property.checklist[item].specialOptionChecked || false
                    };
                }
            });
        }
        
        return correctChecklist;
    }
    
    return property.checklist;
}

// Funktion zur Erstellung einer benutzerdefinierten Checkliste (für spezielle Fälle)
function createCustomChecklist(items) {
    const checklist = {};
    
    items.forEach(item => {
        checklist[item] = {
            completed: false,
            hasSpecialOption: hasSpecialOption(item),
            specialOptionChecked: false
        };
    });
    
    return checklist;
}

// Hilfsfunktion zur Ermittlung der nächsten zu erledigenden Aufgabe
// Hilfsfunktion zur Ermittlung der nächsten zu erledigenden Aufgabe
function getNextTask(checklist) {
    const items = Object.keys(checklist);
    for (let item of items) {
        if (!isItemCompleted(item, checklist[item])) {
            return item;
        }
    }
    return null; // Alle Aufgaben erledigt
}
// Funktion zur Ermittlung der Checklistenstatistiken
// Funktion zur Ermittlung der Checklistenstatistiken
function getChecklistStats(checklist) {
    const total = Object.keys(checklist).length;
    let completed = 0;
    
    // Erweiterte Completed-Zählung
    Object.keys(checklist).forEach(itemName => {
        if (isItemCompleted(itemName, checklist[itemName])) {
            completed++;
        }
    });
    
    const remaining = total - completed;
    const progress = calculateProgress(checklist);
    
    return {
        total,
        completed,
        remaining,
        progress,
        status: getStatusFromProgress(progress),
        nextTask: getNextTask(checklist)
    };
}
// Funktion zur Ermittlung der Statusfarbe basierend auf dem Fortschritt
function getStatusColor(progress) {
    if (progress === 0) {
        return '#e74c3c'; // Rot
    } else if (progress <= 20) {
        return '#f39c12'; // Orange
    } else if (progress <= 40) {
        return '#f1c40f'; // Gelb
    } else if (progress <= 60) {
        return '#9acd32'; // Gelbgrün
    } else if (progress <= 80) {
        return '#2ecc71'; // Hellgrün
    } else if (progress < 100) {
        return '#27ae60'; // Grün
    } else {
        return '#1e8449'; // Dunkelgrün
    }
}

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getChecklistMVMitHeiz,
        getChecklistMVOhneHeiz,
        getChecklistWEGMitHeiz,
        getChecklistWEGOhneHeiz,
        getChecklistForProperty,
        initializeChecklistForProperty,
        hasSpecialOption,
        calculateProgress,
        isItemCompleted,
        getStatusFromProgress,
        updateChecklistForPropertyChange,
        validateChecklist,
        repairChecklist,
        createCustomChecklist,
        getNextTask,
        getChecklistStats,
        getStatusColor
    };
}