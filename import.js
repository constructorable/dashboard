// Import-Funktionalität für Immobilienverwaltung

// Import-Konfiguration
const IMPORT_CONFIG = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedVersions: ['1.0'],
    allowedExtensions: ['.json']
};

// Haupt-Import-Funktion
function importData(jsonData, options = {}) {
    try {
        const {
            mergeWithExisting = false,
            skipDemoData = true,
            validateStructure = true,
            createBackup = true
        } = options;

        // Backup erstellen falls gewünscht
        if (createBackup) {
            const backupKey = `import_backup_${Date.now()}`;
            const currentData = exportAllData();
            if (currentData) {
                localStorage.setItem(backupKey, currentData);
                console.log('Backup vor Import erstellt:', backupKey);
            }
        }

        // JSON parsen
        let importedData;
        try {
            importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        } catch (parseError) {
            throw new Error('Ungültiges JSON-Format');
        }

        // Struktur validieren
        if (validateStructure) {
            validateImportStructure(importedData);
        }

        // Properties verarbeiten
        let propertiesToImport = importedData.properties || [];
        
        // Demo-Daten filtern falls gewünscht
        if (skipDemoData) {
            propertiesToImport = propertiesToImport.filter(prop => !prop.isDemo);
        }

        // Properties validieren und reparieren
        const validatedProperties = propertiesToImport.map(property => {
            const validated = validateAndRepairImportedProperty(property);
            validated.isDemo = false; // Importierte Daten sind nie Demo
            validated.importedAt = new Date().toISOString();
            return validated;
        });

        // Bestehende echte Properties laden (ohne Demo-Daten)
        const existingProperties = loadPropertiesFromStorage();

        let finalProperties;
        if (mergeWithExisting) {
            // Daten zusammenführen
            finalProperties = mergeProperties(existingProperties, validatedProperties);
        } else {
            // Bestehende Daten ersetzen
            finalProperties = validatedProperties;
        }

        // Daten speichern
        const saveSuccess = savePropertiesToStorage(finalProperties);
        
        if (!saveSuccess) {
            throw new Error('Fehler beim Speichern der importierten Daten');
        }

        // Settings importieren falls vorhanden
        let settingsImported = false;
        if (importedData.settings) {
            const currentSettings = loadSettingsFromStorage();
            const mergedSettings = { ...currentSettings, ...importedData.settings };
            settingsImported = saveSettingsToStorage(mergedSettings);
        }

        // Globale Variablen aktualisieren
        updateGlobalVariablesAfterImport();

        const result = {
            success: true,
            importedProperties: validatedProperties.length,
            totalProperties: finalProperties.length,
            previousProperties: existingProperties.length,
            settingsImported,
            mergedWithExisting: mergeWithExisting,
            metadata: importedData.metadata || null
        };

        console.log('Import erfolgreich abgeschlossen:', result);
        return result;

    } catch (error) {
        console.error('Fehler beim Import:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Spezielle Validierung für importierte Properties
function validateAndRepairImportedProperty(property) {
    // Grundlegende Struktur sicherstellen mit Demo-Data-Format
    const repairedProperty = {
        id: property.id || generateUniqueId(),
        name: property.name || 'Unbenannte Immobilie',
        portfolio: property.portfolio || 'Standard', // Portfolio-Feld hinzugefügt
        type: property.type || 'MV',
        hasHeating: property.hasHeating !== undefined ? property.hasHeating : false,
        accountingYear: property.accountingYear || new Date().getFullYear(),
        accountingPeriod: property.accountingPeriod || '',
        isDemo: false, // Importierte Properties sind nie Demo
        notes: property.notes || '',
        specialFeatures: Array.isArray(property.specialFeatures) ? property.specialFeatures : [],
        checklist: property.checklist || {},
        createdAt: property.createdAt || new Date().toISOString(),
        updatedAt: property.updatedAt || new Date().toISOString(),
        importedAt: new Date().toISOString()
    };
    
    // Checkliste validieren und reparieren
    repairedProperty.checklist = validateAndRepairChecklist(repairedProperty.checklist, repairedProperty);
    
    // SpecialFeatures validieren
    repairedProperty.specialFeatures = repairedProperty.specialFeatures.map(feature => ({
        type: feature.type || 'Unbekannt',
        description: feature.description || ''
    }));
    
    console.log('Property validiert:', repairedProperty.name, 'Portfolio:', repairedProperty.portfolio);
    
    return repairedProperty;
}

// Checkliste validieren und reparieren
function validateAndRepairChecklist(checklist, property) {
    const validatedChecklist = {};
    
    // Basis-Checkliste für den Property-Typ erstellen
    const baseChecklist = createBaseChecklistForProperty(property);
    
    // Importierte Checklist-Items durchgehen
    for (const [itemName, itemData] of Object.entries(checklist)) {
        validatedChecklist[itemName] = {
            completed: itemData.completed === true,
            hasSpecialOption: itemData.hasSpecialOption === true,
            specialOptionChecked: itemData.specialOptionChecked === true
        };
    }
    
    // Fehlende Standard-Items hinzufügen
    for (const [itemName, itemData] of Object.entries(baseChecklist)) {
        if (!validatedChecklist[itemName]) {
            validatedChecklist[itemName] = itemData;
        }
    }
    
    return validatedChecklist;
}

// Basis-Checkliste für Property-Typ erstellen
function createBaseChecklistForProperty(property) {
    const baseItems = {
        'Verbrauchsrechnungen vorhanden': { completed: false, hasSpecialOption: false, specialOptionChecked: false },
        'Wartungsrechnung vorhanden': { completed: false, hasSpecialOption: false, specialOptionChecked: false },
        'Dienstleistungsrechnung vorhanden': { completed: false, hasSpecialOption: false, specialOptionChecked: false },
        'Jahresabrechnung von Eigentümer freigegeben': { completed: false, hasSpecialOption: false, specialOptionChecked: false },
        'Buchungen durchgeführt': { completed: false, hasSpecialOption: false, specialOptionChecked: false },
        'Abrechnung an Eigentümer/Mieter verschickt': { completed: false, hasSpecialOption: false, specialOptionChecked: false }
    };

    // Heizkosten-spezifische Items hinzufügen
    if (property.hasHeating) {
        baseItems['Heizkostenaufstellung eingereicht'] = { completed: false, hasSpecialOption: false, specialOptionChecked: false };
        baseItems['Heizkostenaufstellung zurückerhalten'] = { completed: false, hasSpecialOption: true, specialOptionChecked: false };
    }

    return baseItems;
}

// Import-Struktur validieren
function validateImportStructure(data) {
    // Grundlegende Struktur prüfen
    if (!data || typeof data !== 'object') {
        throw new Error('Ungültige Datenstruktur: Hauptobjekt fehlt');
    }

    // Properties Array prüfen
    if (!data.properties || !Array.isArray(data.properties)) {
        throw new Error('Ungültige Datenstruktur: Properties-Array fehlt oder ist ungültig');
    }

    // Version prüfen falls vorhanden
    if (data.metadata && data.metadata.exportVersion) {
        if (!IMPORT_CONFIG.supportedVersions.includes(data.metadata.exportVersion)) {
            console.warn(`Warnung: Export-Version ${data.metadata.exportVersion} möglicherweise nicht vollständig kompatibel`);
        }
    }

    // Properties validieren
    data.properties.forEach((property, index) => {
        if (!property.id) {
            throw new Error(`Property ${index + 1}: ID fehlt`);
        }
        if (!property.name) {
            throw new Error(`Property ${index + 1}: Name fehlt`);
        }
        if (!['WEG', 'MV'].includes(property.type)) {
            console.warn(`Property ${index + 1}: Unbekannter Type "${property.type}", wird auf "MV" gesetzt`);
        }
    });

    return true;
}

// Properties zusammenführen
function mergeProperties(existing, imported) {
    const merged = [...existing];
   
    imported.forEach(importedProp => {
        const existingIndex = merged.findIndex(prop => prop.id === importedProp.id);
       
        if (existingIndex !== -1) {
            // Bestehende Property aktualisieren
            merged[existingIndex] = {
                ...merged[existingIndex],
                ...importedProp,
                // Portfolio explizit behandeln: importiertes Portfolio hat Vorrang, falls vorhanden
                portfolio: importedProp.portfolio || merged[existingIndex].portfolio || 'Standard',
                updatedAt: new Date().toISOString(),
                mergedFromImport: true
            };
            console.log('Property gemerged:', merged[existingIndex].name, 'Portfolio:', merged[existingIndex].portfolio);
        } else {
            // Neue Property hinzufügen
            const newProperty = {
                ...importedProp,
                portfolio: importedProp.portfolio || 'Standard', // Portfolio sicherstellen
                importedAt: new Date().toISOString()
            };
            merged.push(newProperty);
            console.log('Property hinzugefügt:', newProperty.name, 'Portfolio:', newProperty.portfolio);
        }
    });
   
    return merged;
}

// Globale Variablen nach Import aktualisieren
function updateGlobalVariablesAfterImport() {
    try {
        // currentProperties mit Demo-Daten neu initialisieren
        if (typeof initializeDemoData === 'function') {
            if (typeof window !== 'undefined') {
                window.currentProperties = initializeDemoData();
                window.filteredProperties = [...window.currentProperties];
            }
        }
        
        console.log('Globale Variablen nach Import aktualisiert');
    } catch (error) {
        console.error('Fehler beim Aktualisieren der globalen Variablen:', error);
    }
}

// Views nach Import aktualisieren
function updateViewsAfterImport() {
    try {
        // Verschiedene Update-Funktionen versuchen
        if (typeof renderAllViews === 'function') {
            renderAllViews();
        } else if (typeof refreshAllViews === 'function') {
            refreshAllViews();
        } else if (typeof updateAllViews === 'function') {
            updateAllViews();
        }
        
        // Filter aktualisieren
        if (typeof updateFiltersOnDataChange === 'function') {
            updateFiltersOnDataChange();
        }
        
        console.log('Views nach Import aktualisiert');
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Views:', error);
    }
}

// Datei-Import aus File Input
function importFromFile(file, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            // Datei validieren
            const validationResult = validateImportFile(file);
            if (!validationResult.valid) {
                reject(new Error(validationResult.error));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const result = importData(e.target.result, options);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Fehler beim Lesen der Datei'));
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Datei validieren
function validateImportFile(file) {
    // Dateigröße prüfen
    if (file.size > IMPORT_CONFIG.maxFileSize) {
        return {
            valid: false,
            error: `Datei zu groß. Maximum: ${IMPORT_CONFIG.maxFileSize / (1024 * 1024)}MB`
        };
    }

    // Dateiendung prüfen
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!IMPORT_CONFIG.allowedExtensions.includes(fileExtension)) {
        return {
            valid: false,
            error: `Ungültiger Dateityp. Erlaubt: ${IMPORT_CONFIG.allowedExtensions.join(', ')}`
        };
    }

    return { valid: true };
}

// Import-Optionen Modal anzeigen
function showImportOptionsModal() {
    const modalHtml = `
        <div class="modal fade" id="importModal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-upload mr-2"></i>
                            Daten importieren
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="file-upload-area" id="fileUploadArea">
                            <div class="upload-content">
                                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                                <h6>Datei hier ablegen oder klicken zum Auswählen</h6>
                                <p class="text-muted">JSON-Dateien bis zu 10MB</p>
                                <input type="file" id="importFileInput" accept=".json" style="display: none;">
                                <button type="button" class="btn btn-outline-primary" onclick="document.getElementById('importFileInput').click()">
                                    <i class="fas fa-folder-open mr-1"></i>
                                    Datei auswählen
                                </button>
                            </div>
                        </div>
                        
                        <div id="fileInfo" style="display: none;" class="mt-3">
                            <div class="border rounded p-3 bg-light">
                                <h6><i class="fas fa-file-alt mr-2"></i>Datei-Informationen:</h6>
                                <div id="fileDetails"></div>
                            </div>
                        </div>
                        
                        <form id="importForm" style="display: none;" class="mt-3">
                            <div class="form-group mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="mergeWithExisting">
                                    <label class="form-check-label" for="mergeWithExisting">
                                        Mit bestehenden Daten zusammenführen
                                    </label>
                                    <small class="form-text text-muted">
                                        Bestehende Immobilien werden aktualisiert, neue hinzugefügt
                                    </small>
                                </div>
                            </div>
                            
                            <div class="form-group mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="skipDemoData" checked>
                                    <label class="form-check-label" for="skipDemoData">
                                        Demo-Daten überspringen
                                    </label>
                                    <small class="form-text text-muted">
                                        Demo-Immobilien werden nicht importiert
                                    </small>
                                </div>
                            </div>
                            
                            <div class="form-group mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" id="createBackup" checked>
                                    <label class="form-check-label" for="createBackup">
                                        Backup vor Import erstellen
                                    </label>
                                    <small class="form-text text-muted">
                                        Aktuelle Daten werden vor dem Import gesichert
                                    </small>
                                </div>
                            </div>
                        </form>
                        
                        <div id="importProgress" style="display: none;" class="mt-3">
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                            </div>
                            <div class="text-center mt-2">
                                <small class="text-muted">Import wird durchgeführt...</small>
                            </div>
                        </div>
                        
                        <div id="importResult" style="display: none;" class="mt-3"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>
                            Abbrechen
                        </button>
                        <button type="button" class="btn btn-primary" id="executeImport" style="display: none;">
                            <i class="fas fa-upload mr-1"></i>
                            Import starten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Altes Modal entfernen falls vorhanden
    const existingModal = document.getElementById('importModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Neues Modal hinzufügen
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event-Listener für Datei-Upload
    setupFileUploadListeners();

    // Modal schließen Event-Listener
    const closeButtons = document.querySelectorAll('#importModal [data-bs-dismiss="modal"]');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeImportModal();
        });
    });

    // Escape-Taste zum Schließen
    const escapeHandler = function(e) {
        if (e.key === 'Escape' && document.getElementById('importModal')) {
            closeImportModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);

    // Modal anzeigen
    showModal('importModal');
}

// File Upload Event-Listener einrichten
function setupFileUploadListeners() {
    const fileInput = document.getElementById('importFileInput');
    const uploadArea = document.getElementById('fileUploadArea');
    const executeButton = document.getElementById('executeImport');

    // Datei-Input Change Event
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Drag & Drop Events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    // Import-Button Event
    executeButton.addEventListener('click', function() {
        executeFileImport();
    });
}

// Datei-Auswahl behandeln
function handleFileSelection(file) {
    try {
        // Datei validieren
        const validation = validateImportFile(file);
        if (!validation.valid) {
            showImportError(validation.error);
            return;
        }

        // Datei-Informationen anzeigen
        showFileInfo(file);

        // Datei-Vorschau laden
        loadFilePreview(file);

    } catch (error) {
        showImportError('Fehler beim Verarbeiten der Datei: ' + error.message);
    }
}

// Datei-Informationen anzeigen
function showFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileDetails = document.getElementById('fileDetails');
    
    const fileSize = (file.size / 1024).toFixed(2);
    const fileSizeUnit = fileSize > 1024 ? `${(fileSize / 1024).toFixed(2)} MB` : `${fileSize} KB`;

    fileDetails.innerHTML = `
        <div class="row">
            <div class="col-sm-4"><strong>Dateiname:</strong></div>
            <div class="col-sm-8">${file.name}</div>
        </div>
        <div class="row">
            <div class="col-sm-4"><strong>Größe:</strong></div>
            <div class="col-sm-8">${fileSizeUnit}</div>
        </div>
        <div class="row">
            <div class="col-sm-4"><strong>Typ:</strong></div>
            <div class="col-sm-8">${file.type || 'application/json'}</div>
        </div>
        <div class="row">
            <div class="col-sm-4"><strong>Letzte Änderung:</strong></div>
            <div class="col-sm-8">${new Date(file.lastModified).toLocaleString('de-DE')}</div>
        </div>
    `;

    fileInfo.style.display = 'block';
}

// Datei-Vorschau laden
function loadFilePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            showImportPreview(data);
            
            // Import-Formular und Button anzeigen
            document.getElementById('importForm').style.display = 'block';
            document.getElementById('executeImport').style.display = 'inline-block';
            
        } catch (error) {
            showImportError('Ungültiges JSON-Format in der Datei');
        }
    };
    
    reader.onerror = function() {
        showImportError('Fehler beim Lesen der Datei');
    };
    
    reader.readAsText(file);
}

// Import-Vorschau anzeigen
function showImportPreview(data) {
    const importResult = document.getElementById('importResult');
    
    try {
        const properties = data.properties || [];
        const realProperties = properties.filter(p => !p.isDemo);
        const demoProperties = properties.filter(p => p.isDemo);
        const exportDate = data.metadata ? new Date(data.metadata.exportDate).toLocaleString('de-DE') : 'Unbekannt';
        
        importResult.innerHTML = `
            <div class="border rounded p-3 bg-info bg-opacity-10">
                <h6><i class="fas fa-info-circle mr-2"></i>Import-Vorschau:</h6>
                <div class="row">
                    <div class="col-sm-6">
                        <div><strong>Gesamt-Immobilien:</strong> ${properties.length}</div>
                        <div class="ml-3">
                            <div><i class="fas fa-circle mr-1 text-success" style="font-size: 8px;"></i>Echte: ${realProperties.length}</div>
                            ${demoProperties.length > 0 ? `<div><i class="fas fa-circle mr-1 text-warning" style="font-size: 8px;"></i>Demo: ${demoProperties.length}</div>` : ''}
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div><strong>Export-Datum:</strong> ${exportDate}</div>
                        <div><strong>Version:</strong> ${data.metadata?.exportVersion || '1.0'}</div>
                        <div><strong>Einstellungen:</strong> ${data.settings ? 'Enthalten' : 'Nicht enthalten'}</div>
                    </div>
                </div>
            </div>
        `;
        
        importResult.style.display = 'block';
        
    } catch (error) {
        showImportError('Fehler beim Analysieren der Daten: ' + error.message);
    }
}

// Import ausführen
function executeFileImport() {
    const fileInput = document.getElementById('importFileInput');
    
    if (fileInput.files.length === 0) {
        showImportError('Keine Datei ausgewählt');
        return;
    }

    const options = {
        mergeWithExisting: document.getElementById('mergeWithExisting').checked,
        skipDemoData: document.getElementById('skipDemoData').checked,
        createBackup: document.getElementById('createBackup').checked
    };

    // Progress anzeigen
    showImportProgress();

    // Import mit Verzögerung für bessere UX
    setTimeout(() => {
        importFromFile(fileInput.files[0], options)
            .then(result => {
                hideImportProgress();
                if (result.success) {
                    showImportSuccess(result);
                    
                    // Views aktualisieren nach Import
                    setTimeout(() => {
                        updateViewsAfterImport();
                        closeImportModal();
                    }, 2000);
                } else {
                    showImportError(result.error);
                }
            })
            .catch(error => {
                hideImportProgress();
                showImportError(error.message);
            });
    }, 500);
}

// Import-Progress anzeigen
function showImportProgress() {
    document.getElementById('importProgress').style.display = 'block';
    document.getElementById('executeImport').disabled = true;
    
    // Progress-Animation
    const progressBar = document.querySelector('#importProgress .progress-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 100);
}

// Import-Progress verstecken
function hideImportProgress() {
    document.getElementById('importProgress').style.display = 'none';
    document.getElementById('executeImport').disabled = false;
}

// Import-Erfolg anzeigen
function showImportSuccess(result) {
    const importResult = document.getElementById('importResult');
    
    importResult.innerHTML = `
        <div class="alert alert-success">
            <h6><i class="fas fa-check-circle mr-2"></i>Import erfolgreich!</h6>
            <div>
                <div><strong>Importierte Immobilien:</strong> ${result.importedProperties}</div>
                <div><strong>Gesamt-Immobilien:</strong> ${result.totalProperties}</div>
                ${result.mergedWithExisting ? 
                    `<div><strong>Modus:</strong> Mit bestehenden Daten zusammengeführt</div>` : 
                    `<div><strong>Modus:</strong> Bestehende Daten ersetzt</div>`
                }
                ${result.settingsImported ? '<div>Einstellungen wurden ebenfalls importiert</div>' : ''}
            </div>
            <small class="text-muted">Die Anwendung wird automatisch aktualisiert...</small>
        </div>
    `;

    // Erfolgs-Notification mit deinem System
    if (typeof showNotification === 'function') {
        showNotification(
            `${result.importedProperties} Immobilien wurden importiert`,
            'success',
            4000
        );
    }
}

// Import-Fehler anzeigen
function showImportError(errorMessage) {
    const importResult = document.getElementById('importResult');
    
    importResult.innerHTML = `
        <div class="alert alert-danger">
            <h6><i class="fas fa-exclamation-triangle mr-2"></i>Import-Fehler</h6>
            <div>${errorMessage}</div>
        </div>
    `;
    
    importResult.style.display = 'block';

    // Fehler-Notification
    if (typeof showNotification === 'function') {
        showNotification(errorMessage, 'error', 5000);
    }
}

// Modal schließen
function closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Modal anzeigen (einfache Implementierung ohne Bootstrap)
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        
        // Animation
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);
        
        // Body-Scroll verhindern
        document.body.style.overflow = 'hidden';
        
        // Backdrop-Klick zum Schließen
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImportModal();
            }
        });
    }
}

// Event-Listener für den Import-Button
function attachImportButtonListener() {
    const importBtn = document.getElementById('importBtn');
    
    if (importBtn) {
        // Eventuell vorhandene Event-Listener entfernen
        importBtn.replaceWith(importBtn.cloneNode(true));
        
        // Neuen Event-Listener hinzufügen
        const newImportBtn = document.getElementById('importBtn');
        newImportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showImportOptionsModal();
        });
        
        console.log('Import-Button Event-Listener erfolgreich hinzugefügt');
    } else {
        console.warn('Import-Button (#importBtn) nicht gefunden');
    }
}

// CSS-Styles für Import-Modal hinzufügen
function addImportStyles() {
    if (!document.getElementById('importStyles')) {
        const styles = `
            <style id="importStyles">
                #importModal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                   background: rgba(0, 0, 0, 0.5);
                   z-index: 9999;
                   transition: all 0.3s ease;
               }
               
               .file-upload-area {
                   border: 2px dashed var(--border-color);
                   border-radius: var(--border-radius);
                   padding: 2rem;
                   text-align: center;
                   transition: all 0.3s ease;
                   cursor: pointer;
               }
               
               .file-upload-area:hover,
               .file-upload-area.drag-over {
                   border-color: var(--primary-color);
                   background-color: var(--light-color);
               }
               
               .upload-icon {
                   font-size: 3rem;
                   color: var(--secondary-color);
                   margin-bottom: 1rem;
               }
               
               .progress {
                   height: 1rem;
                   background-color: var(--light-color);
                   border-radius: var(--border-radius);
                   overflow: hidden;
               }
               
               .progress-bar {
                   background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                   transition: width 0.3s ease;
               }
               
               .alert {
                   padding: 1rem;
                   border-radius: var(--border-radius);
                   border: 1px solid;
               }
               
               .alert-success {
                   background-color: #d4edda;
                   border-color: #c3e6cb;
                   color: #155724;
               }
               
               .alert-danger {
                   background-color: #f8d7da;
                   border-color: #f5c6cb;
                   color: #721c24;
               }
               
               .bg-info {
                   background-color: var(--info-color) !important;
               }
               
               .bg-opacity-10 {
                   opacity: 0.1;
               }
               
               .form-check-input {
                   margin-right: 0.5rem;
               }
               
               .form-text {
                   font-size: 0.875rem;
                   color: var(--secondary-color);
               }
           </style>
       `;
       
       document.head.insertAdjacentHTML('beforeend', styles);
   }
}

// Initialisierung
function initializeImportFunctionality() {
   console.log('Initialisiere Import-Funktionalität...');
   
   // Styles hinzufügen
   addImportStyles();
   
   // Event-Listener für Import-Button hinzufügen
   let attempts = 0;
   const maxAttempts = 10;
   
   function tryAttachListener() {
       attempts++;
       const importBtn = document.getElementById('importBtn');
       
       if (importBtn) {
           attachImportButtonListener();
           console.log('Import-Funktionalität erfolgreich initialisiert');
       } else if (attempts < maxAttempts) {
           console.log(`Import-Button noch nicht gefunden, Versuch ${attempts}/${maxAttempts}`);
           setTimeout(tryAttachListener, 500);
       } else {
           console.error('Import-Button (#importBtn) konnte nicht gefunden werden nach', maxAttempts, 'Versuchen');
       }
   }
   
   tryAttachListener();
}

// Globale Funktionen verfügbar machen
window.showImportOptionsModal = showImportOptionsModal;
window.importData = importData;
window.importFromFile = importFromFile;

// Automatische Initialisierung wenn DOM geladen ist
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initializeImportFunctionality);
} else {
   initializeImportFunctionality();
}

// Export für Node.js falls benötigt
if (typeof module !== 'undefined' && module.exports) {
   module.exports = {
       importData,
       importFromFile,
       validateImportStructure,
       showImportOptionsModal
   };
}