// pdfexport.js - Kompakter PDF-Export für externe Firmen

class PDFExporter {
    constructor() {
        this.selectedProperties = [];
        this.init();
    }

    init() {
        console.log('PDFExporter init() gestartet');
        // addPDFExportButton() ENTFERNEN - Button ist jetzt im HTML
        this.setupEventListeners();
        console.log('PDFExporter init() abgeschlossen');
    }

    // PDF-Export Button hinzufügen


    // Event Listeners
    setupEventListeners() {
        // Event Delegation verwenden statt direkten Event Listener
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pdfExportBtn' || e.target.closest('#pdfExportBtn')) {
                console.log('PDF Export Button geklickt');
                this.openModal();
            }
        });
        
        console.log('PDF Export Event Listeners registriert');
    }

    // Modal öffnen
openModal() {
    console.log('PDF Export Modal wird geöffnet');
    this.createModal();
    
    // Sofort Vorschau aktualisieren (keine populateFilters mehr nötig)
    setTimeout(() => {
        this.updatePreview();
    }, 50);
    
    document.getElementById('pdfExportModal').style.display = 'flex';
}


    // Modal erstellen
// Modal erstellen - NEUE VERSION mit vorausgefüllten Daten
createModal() {
    document.getElementById('pdfExportModal')?.remove();

    // ZUERST die Daten laden
    const properties = this.getAllProperties();
    
    // Optionen vorbereiten
    const objects = [...new Set(properties.map(p => p.name))].sort();
    const periods = [...new Set(properties.map(p => p.accountingPeriod).filter(p => p))].sort();
    const portfolios = [...new Set(properties.map(p => p.portfolio || 'Standard'))].sort();
    
    console.log('Modal erstellen mit Daten:', {
        objects: objects.length,
        periods: periods.length,
        portfolios: portfolios.length
    });

    // HTML mit bereits befüllten Optionen erstellen
    const objectOptions = objects.map(obj => `<option value="${this.escapeHtml(obj)}">${this.escapeHtml(obj)}</option>`).join('');
    const periodOptions = periods.map(period => `<option value="${this.escapeHtml(period)}">${this.escapeHtml(period)}</option>`).join('');
    const portfolioOptions = portfolios.map(portfolio => `<option value="${this.escapeHtml(portfolio)}">${this.escapeHtml(portfolio)}</option>`).join('');

    const modal = `
        <div id="pdfExportModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
            <div class="modal-content" style="margin: auto; margin-top: 5%; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0; color: #3a5169;"><i class="fas fa-file-pdf"></i> PDF-Export</h2>
                    <button class="modal-close" onclick="pdfExporter.closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="margin-top: 0; color: #3a5169;"><i class="fas fa-filter"></i> Filter</h3>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2d3e50;">Objekt:</label>
                                <select id="objectFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 8px; background: white; font-size: 14px; color: #2d3e50;">
                                    <option value="">Alle Objekte</option>
                                    ${objectOptions}
                                </select>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2d3e50;">Zeitraum:</label>
                                <select id="periodFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 8px; background: white; font-size: 14px; color: #2d3e50;">
                                    <option value="">Alle Zeiträume</option>
                                    ${periodOptions}
                                </select>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #2d3e50;">Portfolio:</label>
                                <select id="portfolioFilter" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d9e0; border-radius: 8px; background: white; font-size: 14px; color: #2d3e50;">
                                    <option value="">Alle Portfolios</option>
                                    ${portfolioOptions}
                                </select>
                            </div>
                            
                            <button class="btn btn-secondary" onclick="pdfExporter.resetFilters()" style="padding: 8px 16px; background: #6b8ba4; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-undo"></i> Zurücksetzen
                            </button>
                            
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
                                Debug Info:<br>
                                Objekte: ${objects.length}<br>
                                Zeiträume: ${periods.length}<br>
                                Portfolios: ${portfolios.length}
                            </div>
                        </div>
                        <div>
                            <h3 style="margin-top: 0; color: #3a5169;"><i class="fas fa-eye"></i> Vorschau</h3>
                            <div id="preview" class="preview-container" style="max-height: 200px; overflow-y: auto; border: 1px solid #d1d9e0; border-radius: 8px; padding: 10px; background: #f8f9fa;">
                                <p style="color: #666; margin: 0;">Wird geladen...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px;">
                    <button class="btn btn-secondary" onclick="pdfExporter.closeModal()" style="padding: 10px 20px; background: #6b8ba4; color: white; border: none; border-radius: 8px; cursor: pointer;">Abbrechen</button>
                    <button id="generateBtn" class="btn btn-primary" onclick="pdfExporter.generatePDF()" style="padding: 10px 20px; background: #3a5169; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-download"></i> PDF erstellen
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Event Listeners hinzufügen
    ['objectFilter', 'periodFilter', 'portfolioFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => this.updatePreview());
            console.log(`✅ Event Listener für ${id} hinzugefügt`);
        }
    });
    
    console.log('Modal erstellt mit vorausgefüllten Dropdowns');
}

// Hilfsfunktion für HTML-Escaping
escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

    // Filter befüllen
    // Filter befüllen - DEBUG VERSION
    populateFilters() {
        console.log('=== PDF Export: populateFilters() gestartet ===');

        const properties = this.getAllProperties();
        console.log('Geladene Properties:', properties.length);

        if (properties.length === 0) {
            console.warn('Keine Immobilien gefunden - Filter können nicht befüllt werden');
            return;
        }

        // Objekte (funktioniert bereits)
        const objects = [...new Set(properties.map(p => p.name))].sort();
        console.log('🟢 Gefundene Objekte:', objects.length, objects);
        this.populateSelect('objectFilter', objects);

        // Zeiträume (Problem hier)
        console.log('🔍 Debug Zeiträume:');
        const periodsRaw = properties.map(p => {
            console.log(`- Property "${p.name}": accountingPeriod = "${p.accountingPeriod}"`);
            return p.accountingPeriod;
        });
        const periodsFiltered = periodsRaw.filter(p => {
            const isValid = p && p.trim() !== '';
            console.log(`- Period "${p}" ist ${isValid ? 'gültig' : 'ungültig'}`);
            return isValid;
        });
        const periods = [...new Set(periodsFiltered)].sort();
        console.log('🔴 Finale Zeiträume für populateSelect:', periods.length, periods);

        if (periods.length > 0) {
            this.populateSelect('periodFilter', periods);
            console.log('✅ periodFilter aufgerufen mit', periods.length, 'Zeiträumen');
        } else {
            console.error('❌ Keine gültigen Zeiträume gefunden!');
        }

        // Portfolios (Problem hier)
        console.log('🔍 Debug Portfolios:');
        const portfoliosRaw = properties.map(p => {
            const portfolio = p.portfolio || 'Standard';
            console.log(`- Property "${p.name}": portfolio = "${portfolio}"`);
            return portfolio;
        });
        const portfolios = [...new Set(portfoliosRaw)].sort();
        console.log('🔴 Finale Portfolios für populateSelect:', portfolios.length, portfolios);

        if (portfolios.length > 0) {
            this.populateSelect('portfolioFilter', portfolios);
            console.log('✅ portfolioFilter aufgerufen mit', portfolios.length, 'Portfolios');
        } else {
            console.error('❌ Keine gültigen Portfolios gefunden!');
        }

        console.log('=== PDF Export: populateFilters() abgeschlossen ===');
    }
    // Notfall: Manuelle HTML-Erstellung
    // NUCLEAR OPTION: Kompletter Select-Austausch
    populateSelect(id, options) {
        const oldSelect = document.getElementById(id);
        if (!oldSelect) return;

        const parent = oldSelect.parentNode;

        // Komplett neues Select erstellen
        const newSelect = document.createElement('select');
        newSelect.id = id;
        newSelect.style.cssText = oldSelect.style.cssText;

        let defaultText = id === 'objectFilter' ? 'Alle Objekte' :
            id === 'periodFilter' ? 'Alle Zeiträume' :
                id === 'portfolioFilter' ? 'Alle Portfolios' : 'Alle';

        // Standard-Option
        const defaultOpt = document.createElement('option');
        defaultOpt.value = '';
        defaultOpt.textContent = defaultText;
        newSelect.appendChild(defaultOpt);

        // Alle Optionen
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            newSelect.appendChild(opt);
        });

        // Event Listener
        newSelect.addEventListener('change', () => this.updatePreview());

        // Austauschen
        parent.replaceChild(newSelect, oldSelect);

        console.log(`${id} komplett ersetzt mit ${options.length} Optionen`);
    }

    // Hilfsfunktion hinzufügen
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Vorschau aktualisieren
    updatePreview() {
        this.selectedProperties = this.getFilteredProperties();
        const preview = document.getElementById('preview');
        const btn = document.getElementById('generateBtn');

        if (this.selectedProperties.length === 0) {
            preview.innerHTML = '<p style="color: #666; margin: 0;">Keine Immobilien gefunden</p>';
            btn.disabled = true;
            return;
        }

        preview.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>${this.selectedProperties.length} Immobilien</strong> ausgewählt
                <br><small style="color: #666;">Je Immobilie eine PDF-Seite</small>
            </div>
            ${this.selectedProperties.slice(0, 5).map(p => `
                <div style="padding: 8px; border-bottom: 1px solid #eee; background: white; margin-bottom: 5px; border-radius: 4px;">
                    <strong>${p.name}</strong><br>
                    <small style="color: #666;">${p.type} • ${this.calculateProgress(p.checklist)}% erledigt</small>
                </div>
            `).join('')}
            ${this.selectedProperties.length > 5 ? `<div style="color: #666; font-style: italic;">...und ${this.selectedProperties.length - 5} weitere</div>` : ''}
        `;
        btn.disabled = false;
    }

    // Gefilterte Properties
    getFilteredProperties() {
        const all = this.getAllProperties();
        const filters = {
            object: document.getElementById('objectFilter')?.value,
            period: document.getElementById('periodFilter')?.value,
            portfolio: document.getElementById('portfolioFilter')?.value
        };

        return all.filter(p => {
            return (!filters.object || p.name === filters.object) &&
                (!filters.period || p.accountingPeriod === filters.period) &&
                (!filters.portfolio || (p.portfolio || 'Standard') === filters.portfolio);
        });
    }

    // Alle Properties laden
    getAllProperties() {
        // Zuerst prüfen ob die Funktion verfügbar ist
        if (typeof initializeDemoData === 'function') {
            const allProperties = initializeDemoData();
            console.log('PDF Export: Immobilien geladen:', allProperties.length);
            return allProperties;
        }

        // Fallback: Versuche direkt aus localStorage und Demo-Daten zu laden
        try {
            const demoProperties = typeof getDemoProperties === 'function' ? getDemoProperties() : [];
            const realProperties = typeof loadPropertiesFromStorage === 'function' ? loadPropertiesFromStorage() : [];
            const combined = [...demoProperties, ...realProperties];
            console.log('PDF Export: Fallback-Laden erfolgreich:', combined.length);
            return combined;
        } catch (error) {
            console.error('Fehler beim Laden der Immobilien für PDF-Export:', error);
            return [];
        }
    }

    // Filter zurücksetzen
    resetFilters() {
        ['objectFilter', 'periodFilter', 'portfolioFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        this.updatePreview();
    }

    // PDF generieren
    async generatePDF() {
        if (this.selectedProperties.length === 0) return;

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Erstelle PDF...';

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            await this.createPDFContent(pdf);

            const filename = `Immobilien_Status_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(filename);

            this.closeModal();
            alert('PDF erfolgreich erstellt!');

        } catch (error) {
            console.error('PDF-Fehler:', error);
            alert('Fehler beim Erstellen der PDF: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-download"></i> PDF erstellen';
        }
    }

    // PDF-Inhalt erstellen
    async createPDFContent(pdf) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Erste Seite: Übersichtsseite
        await this.createOverviewPage(pdf);

        // Jede Immobilie auf eigener Seite
        for (let i = 0; i < this.selectedProperties.length; i++) {
            const property = this.selectedProperties[i];

            // Neue Seite für jede Immobilie
            pdf.addPage();
            await this.createPropertyPage(pdf, property, i + 1);
        }

        // Letzte Seite: Legende
        pdf.addPage();
        this.addLegend(pdf);

        // Footer für alle Seiten hinzufügen
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            this.addPageFooter(pdf, i, totalPages);
        }
    }

    // Übersichtsseite erstellen
    async createOverviewPage(pdf) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 30;

        // Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Immobilien-Statusbericht', pageWidth / 2, y, { align: 'center' });
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth / 2, y, { align: 'center' });
        y += 30;

        // Gesamtstatistik
        const totalProgress = this.selectedProperties.reduce((sum, p) =>
            sum + this.calculateProgress(p.checklist), 0) / this.selectedProperties.length;

        const statusCounts = this.getStatusCounts();

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Gesamtübersicht', 20, y);
        y += 15;

        // Statistik-Box
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, y, pageWidth - 40, 40, 'FD');
        y += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Immobilien gesamt: ${this.selectedProperties.length}`, 30, y);
        y += 8;
        pdf.text(`Durchschnittlicher Fortschritt: ${Math.round(totalProgress)}%`, 30, y);
        y += 8;
        pdf.text(`Nicht begonnen: ${statusCounts.notStarted} | In Bearbeitung: ${statusCounts.inProgress} | Abgeschlossen: ${statusCounts.completed}`, 30, y);
        y += 25;

        // Immobilien-Liste
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Enthaltene Immobilien:', 20, y);
        y += 12;

        for (let i = 0; i < this.selectedProperties.length; i++) {
            const property = this.selectedProperties[i];
            const progress = this.calculateProgress(property.checklist);
            const color = this.getProgressColor(progress);

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${i + 1}. ${property.name}`, 25, y);

            pdf.setTextColor(color.r, color.g, color.b);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${progress}%`, pageWidth - 40, y);

            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`${property.type} • ${property.portfolio || 'Standard'}`, 25, y + 5);

            y += 12;

            // Neue Spalte wenn Platz zu Ende
            if (y > 250 && i < this.selectedProperties.length - 1) {
                y = 80;
                // Weitere Immobilien in rechter Spalte würden hier beginnen
                // Für Einfachheit bleiben wir bei einer Spalte
            }
        }

        pdf.setTextColor(0, 0, 0);
    }

    // Einzelne Property-Seite erstellen
    async createPropertyPage(pdf, property, index) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let y = 30;

        const progress = this.calculateProgress(property.checklist);
        const color = this.getProgressColor(progress);
        const statusText = this.getStatusText(progress);

        // Seitentitel
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index}. ${property.name}`, 20, y);

        // Status rechts oben
        pdf.setTextColor(color.r, color.g, color.b);
        pdf.setFontSize(16);
        pdf.text(`${progress}%`, pageWidth - 50, y);
        pdf.setFontSize(10);
        pdf.text(statusText, pageWidth - 50, y + 8);
        pdf.setTextColor(0, 0, 0);
        y += 25;

        // Stammdaten-Bereich
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, y, pageWidth - 40, 35, 'FD');
        y += 8;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Stammdaten', 25, y);
        y += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Typ: ${property.type}`, 25, y);
        pdf.text(`Portfolio: ${property.portfolio || 'Standard'}`, 110, y);
        y += 7;
        pdf.text(`Heizkostenabrechnung: ${property.hasHeating ? 'Ja' : 'Nein'}`, 25, y);
        pdf.text(`Abrechnungsjahr: ${property.accountingYear}`, 110, y);
        y += 7;
        pdf.text(`Abrechnungszeitraum: ${property.accountingPeriod || 'Nicht definiert'}`, 25, y);
        y += 20;

        // Fortschritts-Balken
        const barWidth = 120;
        const barHeight = 8;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(25, y, barWidth, barHeight, 'F');
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.rect(25, y, (barWidth * progress) / 100, barHeight, 'F');

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${progress}% der Aufgaben erledigt`, 150, y + 5);
        y += 25;

        // Checkliste-Bereich
        const checklist = property.checklist || {};
        const checklistItems = Object.keys(checklist);

        if (checklistItems.length > 0) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Checkliste', 20, y);
            y += 10;

            // Statistik
            const completedCount = checklistItems.filter(item => checklist[item]?.completed).length;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text(`${completedCount} von ${checklistItems.length} Aufgaben erledigt`, 25, y);
            pdf.setTextColor(0, 0, 0);
            y += 15;

            // Sortierte Items (erledigte zuerst)
            const sortedItems = checklistItems.sort((a, b) => {
                const aCompleted = checklist[a]?.completed || false;
                const bCompleted = checklist[b]?.completed || false;
                return bCompleted - aCompleted;
            });

            // Maximale Anzahl Aufgaben pro Seite berechnen
            const maxItemsPerPage = Math.floor((pageHeight - y - 40) / 12);
            let itemsDisplayed = 0;

            // Alle Checkpunkte auflisten (maximal was auf Seite passt)
            for (let i = 0; i < sortedItems.length && itemsDisplayed < maxItemsPerPage; i++) {
                const item = sortedItems[i];
                const checkData = checklist[item];
                const isCompleted = checkData?.completed || false;
                const specialOption = checkData?.specialOption;

                // Checkbox
                this.drawSimpleCheckbox(pdf, 25, y - 1, isCompleted);

                // Nummerierung
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(120, 120, 120);
                pdf.text(`${i + 1}.`, 32, y + 1);

                // Vollständiger Text mit intelligentem Umbruch
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');

                if (isCompleted) {
                    pdf.setTextColor(25, 135, 84); // Grün
                } else {
                    pdf.setTextColor(220, 53, 69); // Rot
                }

                // Text auf verfügbare Breite begrenzen
                const maxWidth = pageWidth - 60;
                const lines = this.splitTextToLines(pdf, item, maxWidth);

                // Nur erste 2 Zeilen anzeigen wenn zu lang
                const displayLines = lines.slice(0, 2);
                if (lines.length > 2) {
                    displayLines[1] = displayLines[1].substring(0, displayLines[1].length - 3) + '...';
                }

                displayLines.forEach((line, lineIndex) => {
                    pdf.text(line, 40, y + 1 + (lineIndex * 4));
                });

                // Spezialoptionen anzeigen
                if (specialOption && specialOption !== 'normal') {
                    pdf.setFontSize(8);
                    pdf.setTextColor(255, 193, 7); // Gelb
                    const specialText = this.getSpecialOptionText(specialOption);
                    pdf.text(`→ ${specialText}`, 45, y + 1 + (displayLines.length * 4) + 2);
                }

                pdf.setTextColor(0, 0, 0);
                y += Math.max(10, displayLines.length * 4 + (specialOption && specialOption !== 'normal' ? 6 : 0));
                itemsDisplayed++;
            }

            // Hinweis wenn nicht alle Aufgaben auf Seite passen
            if (sortedItems.length > maxItemsPerPage) {
                y += 10;
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`... und ${sortedItems.length - maxItemsPerPage} weitere Aufgaben`, 25, y);
                pdf.setTextColor(0, 0, 0);
            }

        } else {
            pdf.setFontSize(12);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Keine Checkliste verfügbar', 25, y);
            pdf.setTextColor(0, 0, 0);
        }

        // Zusammenfassung am Ende der Seite
        if (checklistItems.length > 0) {
            const completedCount = checklistItems.filter(item => checklist[item]?.completed).length;
            y = pageHeight - 60;

            pdf.setDrawColor(200, 200, 200);
            pdf.line(20, y, pageWidth - 20, y);
            y += 10;

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(58, 81, 105);
            pdf.text('Zusammenfassung', 25, y);
            y += 10;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Erledigte Aufgaben: ${completedCount}`, 30, y);
            pdf.text(`Offene Aufgaben: ${checklistItems.length - completedCount}`, 110, y);
            y += 7;
            pdf.text(`Gesamtfortschritt: ${progress}%`, 30, y);

            pdf.setTextColor(color.r, color.g, color.b);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Status: ${statusText}`, 110, y);
            pdf.setTextColor(0, 0, 0);
        }
    }

    // Status-Statistiken berechnen
    getStatusCounts() {
        let notStarted = 0;
        let inProgress = 0;
        let completed = 0;

        this.selectedProperties.forEach(property => {
            const progress = this.calculateProgress(property.checklist);
            if (progress === 0) notStarted++;
            else if (progress === 100) completed++;
            else inProgress++;
        });

        return { notStarted, inProgress, completed };
    }

    // Seiten-Footer hinzufügen
    addPageFooter(pdf, currentPage, totalPages) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Seite ${currentPage} von ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Immobilienverwaltung Dashboard', 20, pageHeight - 10);
        pdf.setTextColor(0, 0, 0);
    }

    // Text in Zeilen aufteilen für Umbruch
    splitTextToLines(pdf, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = pdf.getTextWidth(testLine);

            if (textWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                    currentLine = '';
                }
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.length > 0 ? lines : [text];
    }

    drawSimpleCheckbox(pdf, x, y, isCompleted) {
        const size = 3;

        if (isCompleted) {
            pdf.setFillColor(25, 135, 84);
            pdf.rect(x, y, size, size, 'F');
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.line(x + 0.5, y + 1.5, x + 1.3, y + 2.3);
            pdf.line(x + 1.3, y + 2.3, x + 2.5, y + 0.7);
        } else {
            pdf.setFillColor(220, 53, 69);
            pdf.rect(x, y, size, size, 'F');
            pdf.setDrawColor(255, 255, 255);
            pdf.setLineWidth(0.3);
            pdf.line(x + 0.5, y + 0.5, x + 2.5, y + 2.5);
            pdf.line(x + 2.5, y + 0.5, x + 0.5, y + 2.5);
        }
    }

    // Spezielle Optionen Text
    getSpecialOptionText(specialOption) {
        switch (specialOption) {
            case 'correction': return 'In Korrektur';
            case 'rejected': return 'Abgelehnt';
            case 'pending': return 'Ausstehend';
            case 'approved': return 'Genehmigt';
            default: return specialOption || 'Sonderfall';
        }
    }

    // Status-Text basierend auf Fortschritt
    getStatusText(progress) {
        if (progress === 0) return 'Nicht begonnen';
        if (progress === 100) return 'Abgeschlossen';
        return 'In Bearbeitung';
    }

    // Legende hinzufügen
    addLegend(pdf) {
        let y = 30;

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Legende und Erläuterungen', 20, y);
        y += 20;

        // Fortschritts-Farben
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Fortschritts-Status:', 20, y);
        y += 12;

        const progressLegend = [
            { range: '0%', text: 'Nicht begonnen', color: { r: 220, g: 53, b: 69 } },
            { range: '1-49%', text: 'In Bearbeitung', color: { r: 255, g: 193, b: 7 } },
            { range: '50-99%', text: 'Fortgeschritten', color: { r: 40, g: 167, b: 69 } },
            { range: '100%', text: 'Abgeschlossen', color: { r: 25, g: 135, b: 84 } }
        ];

        progressLegend.forEach(item => {
            pdf.setFillColor(item.color.r, item.color.g, item.color.b);
            pdf.rect(25, y - 2, 8, 4, 'F');

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${item.range}: ${item.text}`, 40, y);
            y += 8;
        });

        y += 15;

        // Checkbox-Legende
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Checklisten-Symbole:', 20, y);
        y += 12;

        this.drawSimpleCheckbox(pdf, 25, y - 1, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Aufgabe erledigt', 35, y);
        y += 10;

        this.drawSimpleCheckbox(pdf, 25, y - 1, false);
        pdf.text('Aufgabe noch offen', 35, y);
        y += 20;

        // Hinweise
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Dokumentstruktur:', 20, y);
        y += 12;

        const notes = [
            'Seite 1: Gesamtübersicht aller ausgewählten Immobilien',
            'Seite 2-X: Eine Immobilie pro Seite mit vollständigen Details',
            'Letzte Seite: Diese Legende und Erläuterungen',
            'Lange Aufgabentexte werden automatisch umgebrochen',
            'Bei sehr vielen Aufgaben wird die Anzeige optimiert',
            'Erledigte Aufgaben stehen vor offenen Aufgaben'
        ];

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        notes.forEach(note => {
            pdf.text(`• ${note}`, 25, y);
            y += 7;
        });
    }

    // Hilfsfunktionen
    calculateProgress(checklist) {
        if (!checklist || Object.keys(checklist).length === 0) return 0;
        const items = Object.values(checklist);
        const completed = items.filter(item => item.completed).length;
        return Math.round((completed / items.length) * 100);
    }

    getProgressColor(progress) {
        if (progress === 0) return { r: 220, g: 53, b: 69 };
        if (progress < 50) return { r: 255, g: 193, b: 7 };
        if (progress < 100) return { r: 40, g: 167, b: 69 };
        return { r: 25, g: 135, b: 84 };
    }

    closeModal() {
        const modal = document.getElementById('pdfExportModal');
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// jsPDF laden falls nicht vorhanden
function loadJsPDF() {
    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('jsPDF geladen');
        };
        script.onerror = () => {
            console.error('Fehler beim Laden von jsPDF');
        };
        document.head.appendChild(script);
    }
}

// PDF-Exporter initialisieren - KORRIGIERTE VERSION
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM geladen, initialisiere PDF Exporter');
    
    // jsPDF laden
    loadJsPDF();
    
    // PDF Exporter initialisieren (ohne Button-Erstellung)
    setTimeout(() => {
        window.pdfExporter = new PDFExporter();
        console.log('PDF Exporter erfolgreich initialisiert');
    }, 500);
});

// Globale Funktion für manuellen Zugriff
window.initPDFExporter = function() {
    if (!window.pdfExporter) {
        loadJsPDF();
        setTimeout(() => {
            window.pdfExporter = new PDFExporter();
            console.log('PDF Exporter manuell initialisiert');
        }, 500);
    }
};

// Globale Funktion für direkten Modal-Zugriff
window.openPDFExport = function() {
    if (window.pdfExporter) {
        window.pdfExporter.openModal();
    } else {
        console.log('PDF Exporter noch nicht initialisiert, versuche Initialisierung...');
        window.initPDFExporter();
        setTimeout(() => {
            if (window.pdfExporter) {
                window.pdfExporter.openModal();
            }
        }, 1000);
    }
};

// Filter befüllen - DEBUG VERSION
