// Demo-Immobiliendaten für die Anwendung - Feste Zuordnungen
function getDemoProperties() {
    const properties = [
        // Erste 10 Immobilien (detailliert)
        {
            id: 'demo-1',
            name: 'Amalienstr. 38',
            portfolio: 'CI Invest',
            type: 'MV',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_1',
                    timestamp: '2025-06-10T08:30:00.000Z',
                    text: 'Eigentümerversammlung für 15.07.2025 geplant. Alle Unterlagen sind vorbereitet.',
                    author: 'Verwalter Schmidt'
                }
            ],
            specialFeatures: [
                { type: 'Tiefgarage', description: '15 Stellplätze mit Stromanschluss' },
                { type: 'Aufzug', description: 'Modernisierung 2023 abgeschlossen' }
            ],
            checklist: getPartialChecklistState('WEG', true, 0.8),
            createdAt: new Date('2024-01-15').toISOString()
        },
        {
            id: 'demo-2',
            name: 'Ammonstr. 2',
            portfolio: 'Standard_2',
            type: 'MV',
            hasHeating: false,
            accountingYear: 2024,
            accountingPeriod: '01.06.2024 - 31.05.2025',
            isDemo: true,
            notes: [
                {
                    id: 'note_2',
                    timestamp: '2025-06-08T09:15:00.000Z',
                    text: 'Mieter hat Elektroheizung - keine zentrale Heizkostenabrechnung erforderlich.',
                    author: 'Buchhalter Müller'
                }
            ],
            specialFeatures: [
                { type: 'Elektroheizung', description: 'Dezentrale Nachtspeicherheizung' }
            ],
            checklist: getPartialChecklistState('MV', false, 0.4),
            createdAt: new Date('2024-02-20').toISOString()
        },
        {
            id: 'demo-3',
            name: 'Ammonstr. 4',
            portfolio: 'Standard_2',
            type: 'MV',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_3',
                    timestamp: '2025-06-12T16:45:00.000Z',
                    text: 'Heizkostenabrechnung von Techem erhalten. Überprüfung läuft.',
                    author: 'Admin'
                }
            ],
            specialFeatures: [
                { type: 'Gasheizung', description: 'Zentrale Gasheizung, Baujahr 2019' }
            ],
            checklist: getPartialChecklistState('MV', true, 0.6),
            createdAt: new Date('2024-01-10').toISOString()
        },
        {
            id: 'demo-4',
            name: 'Anne-Frank-Str. 43',
            portfolio: 'Standard_2',
            type: 'MV',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_4',
                    timestamp: '2025-06-05T11:30:00.000Z',
                    text: 'Verwaltungsbeirat muss Abrechnung noch freigeben. Termin: 20.06.2025',
                    author: 'Verwalter Schmidt'
                }
            ],
            specialFeatures: [
                { type: 'Spielplatz', description: 'Gemeinschaftsspielplatz im Innenhof' }
            ],
            checklist: getPartialChecklistState('WEG', true, 0.7),
            createdAt: new Date('2024-03-05').toISOString()
        },
        {
            id: 'demo-5',
            name: 'Arnulfstr. 4',
            portfolio: 'Wulle',
            type: 'WEG',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.04.2024 - 31.03.2025',
            isDemo: true,
            notes: [
                {
                    id: 'note_5',
                    timestamp: '2025-06-09T14:20:00.000Z',
                    text: 'Gewerbeobjekt mit Büroflächen. Separate Heizkostenerfassung pro Einheit.',
                    author: 'Admin'
                }
            ],
            specialFeatures: [
                { type: 'Gewerbe', description: 'Büroflächen im Erdgeschoss' }
            ],
            checklist: getPartialChecklistState('MV', true, 0.9),
            createdAt: new Date('2024-04-12').toISOString()
        },
        {
            id: 'demo-6',
            name: 'Äußere Großweidenmühlstr. 10',
            portfolio: 'Standard_2',
            type: 'MV',
            hasHeating: false,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_6',
                    timestamp: '2025-06-11T15:45:00.000Z',
                    text: 'Neubau mit Wärmepumpen pro Wohnung. Keine zentrale Heizung.',
                    author: 'System'
                }
            ],
            specialFeatures: [
                { type: 'Neubau', description: 'Fertigstellung 2023, KfW 55 Standard' },
                { type: 'Wärmepumpe', description: 'Dezentrale Luft-Wasser-Wärmepumpen' }
            ],
            checklist: getPartialChecklistState('WEG', false, 0.3),
            createdAt: new Date('2024-05-08').toISOString()
        },
        {
            id: 'demo-7',
            name: 'Badstr. 52',
            portfolio: 'Wulle',
            type: 'WEG',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.06.2024 - 31.05.2025',
            isDemo: true,
            notes: [
                {
                    id: 'note_7',
                    timestamp: '2025-06-07T12:10:00.000Z',
                    text: 'Altbau mit Fernwärmeanschluss. Mieter sehr zufrieden.',
                    author: 'Hausmeister'
                }
            ],
            specialFeatures: [
                { type: 'Fernwärme', description: 'Anschluss an städtisches Fernwärmenetz' }
            ],
            checklist: getPartialChecklistState('MV', true, 0.5),
            createdAt: new Date('2024-01-20').toISOString()
        },
        {
            id: 'demo-8',
            name: 'Bahnhofstr. 79',
            portfolio: 'Wulle',
            type: 'WEG',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_8',
                    timestamp: '2025-06-06T14:20:00.000Z',
                    text: 'Zentrale Lage am Hauptbahnhof. Eigentümergemeinschaft sehr aktiv.',
                    author: 'Verwalter Schmidt'
                }
            ],
            specialFeatures: [
                { type: 'Bahnhofsnähe', description: '5 Minuten Fußweg zum Hauptbahnhof' }
            ],
            checklist: getPartialChecklistState('WEG', true, 1.0),
            createdAt: new Date('2024-02-14').toISOString()
        },
        {
            id: 'demo-9',
            name: 'Bogenstr. 42',
            portfolio: 'Standard_2',
            type: 'WEG',
            hasHeating: false,
            accountingYear: 2024,
            accountingPeriod: '01.07.2024 - 30.06.2025',
            isDemo: true,
            notes: [
                {
                    id: 'note_9',
                    timestamp: '2025-06-14T16:00:00.000Z',
                    text: 'Sanierte Altbauwohnung mit Elektroheizung. Niedrige Nebenkosten.',
                    author: 'Admin'
                }
            ],
            specialFeatures: [
                { type: 'Saniert', description: 'Komplettsanierung 2020' }
            ],
            checklist: getPartialChecklistState('MV', false, 0.2),
            createdAt: new Date('2024-03-22').toISOString()
        },
        {
            id: 'demo-10',
            name: 'Emilienstr. 1',
            portfolio: 'Standard_2',
            type: 'WEG',
            hasHeating: true,
            accountingYear: 2024,
            accountingPeriod: '01.01.2024 - 31.12.2024',
            isDemo: true,
            notes: [
                {
                    id: 'note_10',
                    timestamp: '2025-06-04T11:15:00.000Z',
                    text: 'Exklusive Wohnanlage mit gehobener Ausstattung.',
                    author: 'Verwalter Schmidt'
                }
            ],
            specialFeatures: [
                { type: 'Luxus', description: 'Gehobene Ausstattung und Lage' },
                { type: 'Concierge', description: 'Hausmeisterservice täglich' }
            ],
            checklist: getPartialChecklistState('WEG', true, 0.1),
            createdAt: new Date('2024-06-01').toISOString()
        }
    ];

    // Restliche Immobilien mit festen Zuordnungen
    const additionalProperties = [
        { name: 'Flugplatzstr. 80', portfolio: 'WEG Flugplatzstr. 80', type: 'WEG', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Frauentorgraben 3', portfolio: 'Aydin', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.6 },
        { name: 'Frauentorgraben 3 / Eilgutstr. 5', portfolio: 'Aydin', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Friedrichstr. 9', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 1.0 },
        { name: 'Fürther Str. 45', portfolio: 'P&P', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.4 },
        { name: 'Fürther Str. 54 - 56', portfolio: 'CI Invest', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.5 },
        { name: 'Fürther Str. 62', portfolio: 'Standard_2', type: 'WEG', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.9 },
        { name: 'Fürther Str. 99', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.3 },
        { name: 'Gibitzenhofstr. 61', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Grenzstr. 13', portfolio: 'P&P', type: 'MV', hasHeating: false, period: '01.06.2024 - 31.05.2025', completion: 0.2 },
        { name: 'Grünerstr. 2 / Johann-Geismann-Str. 1', portfolio: 'P&P', type: 'WEG', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Hallstr. 6', portfolio: 'CI Invest', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.3 },
        { name: 'Hans-Vogel-Str. 20', portfolio: 'Aydin', type: 'MV', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.6 },
        { name: 'Hauptstr. 57', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.9 },
        { name: 'Hauptstr. 60', portfolio: 'Aydin', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Hirschenstr. 31', portfolio: 'CI Invest', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.4 },
        { name: 'Hornschuchpromenade 25', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.5 },
        { name: 'Innerer Kleinreuther Weg 5-7', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Ipsheimer Str. 12', portfolio: 'Zechmeister', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.1 },
        { name: 'Johannisstr. 108', portfolio: 'Zechmeister', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.6 },
        { name: 'Katharinengasse 24', portfolio: 'Standard_2', type: 'WEG', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.8 },
        { name: 'Kirchenweg 43', portfolio: 'Immo Stiftung', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.9 },
        { name: 'Kneippallee 5', portfolio: 'P&P', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.3 },
        { name: 'Kneippallee 5-7', portfolio: 'P&P', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.4 },
        { name: 'Königswarterstr. 20', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Krugstr. 27', portfolio: 'Zechmeister', type: 'MV', hasHeating: false, period: '01.06.2024 - 31.05.2025', completion: 0.2 },
        { name: 'Kurgartenstr. 19', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Landgrabenstr. 14', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.6 },
        { name: 'Lilienstr. 57, Nelkenstr. 3+5, Nelkenstr. 11', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.5 },
        { name: 'Mondstr. 8', portfolio: 'Standard_2', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.4 },
        { name: 'Neubleiche 8', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Neutormauer 2', portfolio: 'Immo Stiftung', type: 'WEG', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.9 },
        { name: 'Obere Turnstr. 9', portfolio: 'Standard_2', type: 'WEG', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.3 },
        { name: 'Peterstr. 71', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.8 },
        { name: 'Prinzregentenufer 5', portfolio: 'Standard_2', type: 'WEG', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.6 },
        { name: 'Rankestr. 60 / Hertastr. 21', portfolio: 'Standard_2', type: 'WEG', hasHeating: false, period: '01.06.2024 - 31.05.2025', completion: 0.5 },
        { name: 'Regensburger Str. 314', portfolio: 'P&P', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Reitmorstr. 50', portfolio: 'Wulle', type: 'WEG', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.4 },
        { name: 'Saalfelder Str. 5', portfolio: 'Standard_2', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Saalfelder Str. 6', portfolio: 'Standard_2', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.9 },
        { name: 'Sauerbruchstr. 10', portfolio: 'P&P', type: 'MV', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.2 },
        { name: 'Schlotfegergasse 6', portfolio: 'Wulle', type: 'WEG', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.6 },
        { name: 'Schumannstr. 13', portfolio: 'Immo Stiftung', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.7 },
        { name: 'Schwabacher Str. 4 / Hirschenstr. 7', portfolio: 'P&P', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.5 },
        { name: 'Schwabacher Str. 85', portfolio: 'CI Invest', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.8 },
        { name: 'Sigmund-Nathan-Str. 4', portfolio: 'Standard_2', type: 'WEG', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.3 },
        { name: 'Sigmundstr. 139', portfolio: 'Zechmeister', type: 'MV', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.9 },
        { name: 'Spitzwegstr. 27', portfolio: 'Standard_2', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.2 },
        { name: 'Sprottauer Str. 10', portfolio: 'Immo Stiftung', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.6 },
        { name: 'Stephanstr. 14', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.7 },
        { name: 'Stephanstr. 16', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Stephanstr. 21', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.5 },
        { name: 'Strauchstr. 29', portfolio: 'CI Invest', type: 'MV', hasHeating: false, period: '01.07.2024 - 30.06.2025', completion: 0.4 },
        { name: 'Thurn-und-Taxis-Str. 18', portfolio: 'Zechmeister', type: 'MV', hasHeating: true, period: '01.01.2024 - 31.12.2024', completion: 0.9 },
        { name: 'Vacher Str. 471', portfolio: 'Standard_2', type: 'WEG', hasHeating: true, period: '01.06.2024 - 31.05.2025', completion: 0.3 },
        { name: 'Willy-Brandt-Platz 10', portfolio: 'Standard_2', type: 'MV', hasHeating: true, period: '01.02.2024 - 31.01.2025', completion: 0.1 },
        { name: 'Wodanstr. 34', portfolio: 'Zechmeister', type: 'MV', hasHeating: false, period: '01.01.2024 - 31.12.2024', completion: 0.8 },
        { name: 'Zollhof 8', portfolio: 'P&P', type: 'MV', hasHeating: true, period: '01.04.2024 - 31.03.2025', completion: 0.6 }
    ];

    // Zusätzliche Immobilien zu Array hinzufügen
    additionalProperties.forEach((prop, index) => {
        properties.push({
            id: `demo-${index + 11}`,
            name: prop.name,
            portfolio: prop.portfolio,
            type: prop.type,
            hasHeating: prop.hasHeating,
            accountingYear: 2024,
            accountingPeriod: prop.period,
            isDemo: true,
            notes: generateFixedNotes(prop.name, index),
            specialFeatures: generateFixedFeatures(prop.name, prop.type),
            checklist: getPartialChecklistState(prop.type, prop.hasHeating, prop.completion),
            createdAt: new Date(2024, Math.floor(index / 10), (index % 10) + 1).toISOString()
        });
    });

    return properties;
}

// Feste Notizen basierend auf Immobilie
function generateFixedNotes(street, index) {
    const notes = [];
    const notesByStreet = {
        'Flugplatzstr. 80': [{ text: 'Nähe zum Flughafen, Lärmschutz beachten.', author: 'Verwalter Schmidt' }],
        'Frauentorgraben 3': [{ text: 'Historisches Gebäude in der Altstadt.', author: 'Admin' }],
        'Königstr. 25-27': [{ text: 'Fußgängerzone, sehr zentrale Lage.', author: 'Hausmeister' }],
        'Hornschuchpromenade 25': [{ text: 'Exklusive Lage am Wöhrder See.', author: 'Verwalter Schmidt' }]
    };

    const streetNotes = notesByStreet[street] || [{ text: 'Alle Unterlagen vollständig.', author: 'Admin' }];

    streetNotes.forEach((note, i) => {
        notes.push({
            id: `note_${index * 10 + i + 100}`,
            timestamp: new Date(2025, 5, (index % 15) + 1, 9, 0).toISOString(),
            text: note.text,
            author: note.author
        });
    });

    return notes;
}

// Feste Besonderheiten basierend auf Immobilie
function generateFixedFeatures(street, type) {
    const featuresByStreet = {
        'Flugplatzstr. 80': [{ type: 'Flughafennähe', description: 'Gute Anbindung zum Flughafen' }],
        'Frauentorgraben 3': [{ type: 'Altstadt', description: 'Historisches Zentrum von Nürnberg' }],
        'Königstr. 25-27': [{ type: 'Fußgängerzone', description: 'Mitten in der Einkaufsstraße' }],
        'Hornschuchpromenade 25': [{ type: 'Seeblick', description: 'Direkter Blick auf den Wöhrder See' }],
        'Bahnhofstr. 79': [{ type: 'Bahnhofsnähe', description: 'Sehr gute Verkehrsanbindung' }]
    };

    const defaultFeatures = type === 'WEG'
        ? [{ type: 'Gemeinschaftsflächen', description: 'Gemeinsame Nutzungsflächen' }]
        : [{ type: 'Mietobjekt', description: 'Vermietete Wohneinheit' }];

    return featuresByStreet[street] || defaultFeatures;
}

// Hilfsfunktion für realistische Checklisten-Status (deterministische Version)
function getPartialChecklistState(type, hasHeating, completionRate) {
    let checklistItems = [];

    if (type === 'WEG') {
        checklistItems = hasHeating ? getChecklistWEGMitHeiz() : getChecklistWEGOhneHeiz();
    } else {
        checklistItems = hasHeating ? getChecklistMVMitHeiz() : getChecklistMVOhneHeiz();
    }

    const checklist = {};
    const targetCompleted = Math.floor(checklistItems.length * completionRate);

    checklistItems.forEach((item, index) => {
        let isCompleted = index < targetCompleted;
        let specialOption = null;

        // Deterministische Sonderoptionen basierend auf Index
        if (isCompleted && index % 7 === 0) { // Jeder 7. erledigte Item
            specialOption = 'approved';
        } else if (isCompleted && index % 11 === 0) { // Jeder 11. erledigte Item
            specialOption = 'pending';
        } else if (!isCompleted && index % 13 === 0) { // Jeder 13. offene Item
            specialOption = 'correction';
        } else if (!isCompleted && index % 17 === 0) { // Jeder 17. offene Item
            specialOption = 'rejected';
        }

        checklist[item] = {
            completed: isCompleted,
            specialOption: specialOption
        };
    });

    return checklist;
}

// Hauptfunktion - kombiniert alle Demo-Daten
function initializeDemoData() {
    const demoProperties = getDemoProperties();

    // Echte Immobilien aus localStorage laden
    const realProperties = typeof loadPropertiesFromStorage === 'function' ? loadPropertiesFromStorage() : [];

    // Alle zusammenfügen
    return [...demoProperties, ...realProperties];
}

// Hilfsfunktionen bleiben unverändert
function isDemoProperty(propertyId) {
    return propertyId.startsWith('demo-');
}

function getRealProperties(allProperties) {
    return allProperties.filter(property => !property.isDemo);
}

function getDemoPropertiesOnly(allProperties) {
    return allProperties.filter(property => property.isDemo);
}

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDemoProperties,
        initializeDemoData,
        isDemoProperty,
        getRealProperties,
        getDemoPropertiesOnly
    };
}

function getAllDemoProperties() {
    return getDemoData(); // oder wie auch immer Ihre Hauptfunktion heißt
}

// Global verfügbar machen
window.getAllDemoProperties = getAllDemoProperties;
window.getDemoProperties = getDemoData;