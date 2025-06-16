// Chart-Funktionen für Fortschrittsdiagramme

// Funktion zur Erstellung eines Ring-Diagramms (Doughnut Chart)
function createProgressChart(canvasId, progress, size = 120) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas-Element nicht gefunden:', canvasId);
        return null;
    }
   
    const ctx = canvas.getContext('2d');
    
    // DPI-Skalierung berücksichtigen
    const dpr = window.devicePixelRatio || 1;
    
    // Canvas-Größe für hohe DPI-Displays anpassen
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    
    // CSS-Größe setzen (sichtbare Größe)
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // Context für hohe DPI skalieren
    ctx.scale(dpr, dpr);
   
    // Chart zeichnen
    drawProgressRing(ctx, progress, size);
   
    return {
        canvas,
        update: (newProgress) => {
            // Context neu skalieren bei Update
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
            ctx.scale(dpr, dpr);
            drawProgressRing(ctx, newProgress, size);
        }
    };
}

// Funktion zum Zeichnen des Fortschritts-Rings
function drawProgressRing(ctx, progress, size) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const lineWidth = 8;
    
    // Canvas leeren
    ctx.clearRect(0, 0, size, size);
    
    // Hintergrund-Ring zeichnen
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e8ecf0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Fortschritts-Ring zeichnen
    if (progress > 0) {
        const angle = (progress / 100) * 2 * Math.PI;
        const startAngle = -Math.PI / 2; // Start oben
        const endAngle = startAngle + angle;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = getProgressColor(progress);
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    // Prozenttext in der Mitte
    ctx.fillStyle = getProgressColor(progress);
    ctx.font = `bold ${size / 6}px 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${progress}%`, centerX, centerY);
}

// Funktion zur Bestimmung der Farbe basierend auf dem Fortschritt
function getProgressColor(progress) {
    if (progress === 0) {
        return '#e74c3c'; // Rot
    } else if (progress <= 15) {
        return '#e67e22'; // Orange-Rot
    } else if (progress <= 30) {
        return '#f39c12'; // Orange
    } else if (progress <= 45) {
        return '#f1c40f'; // Gelb
    } else if (progress <= 60) {
        return '#9acd32'; // Gelbgrün
    } else if (progress <= 75) {
        return '#2ecc71'; // Hellgrün
    } else if (progress <= 90) {
        return '#27ae60'; // Grün
    } else {
        return '#1e8449'; // Dunkelgrün
    }
}

// Funktion zur Erstellung eines kleinen Progress-Rings für Karten
// Funktion zur Erstellung eines kleinen Progress-Rings für Karten
function createSmallProgressChart(canvasId, progress) {
    return createProgressChart(canvasId, progress, 120); // Von 80 auf 120 erhöht
}
// Funktion zur Erstellung eines großen Progress-Rings für Modals
function createLargeProgressChart(canvasId, progress) {
    return createProgressChart(canvasId, progress, 150);
}

// Funktion zur Animation des Fortschritts
function animateProgress(chartInstance, fromProgress, toProgress, duration = 1000) {
    if (!chartInstance || !chartInstance.update) {
        return;
    }
    
    const startTime = Date.now();
    const progressDiff = toProgress - fromProgress;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        
        // Easing-Funktion für sanfte Animation
        const easedProgress = easeOutCubic(progressRatio);
        const currentProgress = Math.round(fromProgress + (progressDiff * easedProgress));
        
        chartInstance.update(currentProgress);
        
        if (progressRatio < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Easing-Funktion für sanfte Animation
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Funktion zur Erstellung eines Status-Indikators (kleiner Kreis für Sidebar)
function createStatusIndicator(progress) {
    const canvas = document.createElement('canvas');
    canvas.width = 12;
    canvas.height = 12;
    canvas.className = 'status-indicator';
    
    const ctx = canvas.getContext('2d');
    const centerX = 6;
    const centerY = 6;
    const radius = 5;
    
    // Kreis zeichnen
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = getProgressColor(progress);
    ctx.fill();
    
    // Border für bessere Sichtbarkeit
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    return canvas;
}

// Funktion zur Aktualisierung aller Charts einer Immobilie
function updatePropertyCharts(propertyId, progress) {
    // Chart in der Immobilienkarte aktualisieren
    const cardChart = document.querySelector(`[data-property-id="${propertyId}"] .chart-container canvas`);
    if (cardChart) {
        // Canvas-Dimensionen korrekt setzen (wichtig nach View-Updates!)
        const dpr = window.devicePixelRatio || 1;
        const size = 120;
        
        cardChart.width = size * dpr;
        cardChart.height = size * dpr;
        cardChart.style.width = size + 'px';
        cardChart.style.height = size + 'px';
        
        const ctx = cardChart.getContext('2d');
        ctx.scale(dpr, dpr);
        drawProgressRing(ctx, progress, size);
    }
   
    // Chart im Modal aktualisieren (falls geöffnet)
    const modalChart = document.getElementById('modalChart');
    if (modalChart && modalChart.dataset.propertyId === propertyId) {
        // Canvas-Dimensionen für Modal setzen
        const dpr = window.devicePixelRatio || 1;
        const size = 150;
        
        modalChart.width = size * dpr;
        modalChart.height = size * dpr;
        modalChart.style.width = size + 'px';
        modalChart.style.height = size + 'px';
        
        const ctx = modalChart.getContext('2d');
        ctx.scale(dpr, dpr);
        drawProgressRing(ctx, progress, size);
       
        // Prozentanzeige im Modal aktualisieren
        const progressText = document.getElementById('modalProgressPercent');
        if (progressText) {
            progressText.textContent = `${progress}%`;
            progressText.style.color = getProgressColor(progress);
        }
    }
   
    // Status-Indikator in der Sidebar aktualisieren
    const sidebarItem = document.querySelector(`[data-property-id="${propertyId}"] .status-indicator`);
    if (sidebarItem) {
        sidebarItem.style.backgroundColor = getProgressColor(progress);
    }
}

// Funktion zur Erstellung eines Übersichts-Charts für alle Immobilien
function createOverviewChart(canvasId, statusCounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas-Element nicht gefunden:', canvasId);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    const centerX = 100;
    const centerY = 100;
    const radius = 120;
    
    const total = statusCounts.notStarted + statusCounts.inProgress + statusCounts.completed;
    
    if (total === 0) {
        // Leerer Kreis wenn keine Daten
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#e8ecf0';
        ctx.lineWidth = 10;
        ctx.stroke();
        
        ctx.fillStyle = '#6b8ba4';
        ctx.font = 'bold 16px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Keine Daten', centerX, centerY);
        
        return null;
    }
    
    // Segmente berechnen
    const segments = [
        { count: statusCounts.notStarted, color: '#e74c3c', label: 'Nicht begonnen' },
        { count: statusCounts.inProgress, color: '#f39c12', label: 'In Bearbeitung' },
        { count: statusCounts.completed, color: '#1e8449', label: 'Abgeschlossen' }
    ];
    
    let currentAngle = -Math.PI / 2; // Start oben
    
    segments.forEach(segment => {
        if (segment.count > 0) {
            const segmentAngle = (segment.count / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = 20;
            ctx.stroke();
            
            currentAngle += segmentAngle;
        }
    });
    
    // Gesamtzahl in der Mitte
    ctx.fillStyle = '#3a5169';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 5);
    
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('Gesamt', centerX, centerY + 15);
    
    return {
        canvas,
        update: (newStatusCounts) => createOverviewChart(canvasId, newStatusCounts)
    };
}

// Funktion zur Erstellung einer Fortschrittsleiste (alternative Darstellung)
function createProgressBar(containerId, progress, showText = true) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container-Element nicht gefunden:', containerId);
        return null;
    }
    
    container.innerHTML = '';
    container.className = 'progress-bar-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = `${progress}%`;
    progressFill.style.backgroundColor = getProgressColor(progress);
    
    progressBar.appendChild(progressFill);
    container.appendChild(progressBar);
    
    if (showText) {
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = `${progress}% abgeschlossen`;
        progressText.style.color = getProgressColor(progress);
        container.appendChild(progressText);
    }
    
    return {
        container,
        update: (newProgress) => {
            progressFill.style.width = `${newProgress}%`;
            progressFill.style.backgroundColor = getProgressColor(newProgress);
            if (showText) {
                progressText.textContent = `${newProgress}% abgeschlossen`;
                progressText.style.color = getProgressColor(newProgress);
            }
        }
    };
}

// Funktion zur Erstellung eines Mini-Charts für Listen
function createMiniChart(progress, size = 24) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.className = 'mini-chart';
    
    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 2;
    
    // Hintergrund
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e8ecf0';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fortschritt
    if (progress > 0) {
        const angle = (progress / 100) * 2 * Math.PI;
        const startAngle = -Math.PI / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
        ctx.strokeStyle = getProgressColor(progress);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    return canvas;
}

// Funktion zur Batch-Aktualisierung mehrerer Charts
function updateMultipleCharts(updates) {
    updates.forEach(update => {
        if (update.propertyId && update.progress !== undefined) {
            updatePropertyCharts(update.propertyId, update.progress);
        }
    });
}

// Funktion zur Erstellung eines responsiven Charts
function createResponsiveChart(containerId, progress, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container-Element nicht gefunden:', containerId);
        return null;
    }
    
    const defaultOptions = {
        type: 'ring', // 'ring', 'bar', 'mini'
        size: 'auto', // 'auto', number
        showText: true,
        animate: true
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Größe bestimmen
    let size = opts.size;
    if (size === 'auto') {
        const containerWidth = container.offsetWidth;
        size = Math.min(containerWidth - 20, 200);
    }
    
    // Chart erstellen basierend auf Typ
    switch (opts.type) {
        case 'ring':
            const canvas = document.createElement('canvas');
            canvas.id = `${containerId}_canvas`;
            container.appendChild(canvas);
            return createProgressChart(canvas.id, progress, size);
            
        case 'bar':
            return createProgressBar(containerId, progress, opts.showText);
            
        case 'mini':
            const miniCanvas = createMiniChart(progress, size);
            container.appendChild(miniCanvas);
            return { canvas: miniCanvas };
            
        default:
            console.error('Unbekannter Chart-Typ:', opts.type);
            return null;
    }
}

// Utility-Funktion zur Chart-Bereinigung
function cleanupChart(chartInstance) {
    if (chartInstance && chartInstance.canvas) {
        const canvas = chartInstance.canvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Funktion zur Chart-Performance-Optimierung
function optimizeChartRendering() {
    // Alle Canvas-Elemente finden und auf High-DPI-Displays optimieren
    const canvases = document.querySelectorAll('canvas');
    
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        if (devicePixelRatio > 1) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * devicePixelRatio;
            canvas.height = rect.height * devicePixelRatio;
            
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }
    });
}

// Export für Verwendung in anderen Dateien
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createProgressChart,
        createSmallProgressChart,
        createLargeProgressChart,
        createStatusIndicator,
        createOverviewChart,
        createProgressBar,
        createMiniChart,
        createResponsiveChart,
        updatePropertyCharts,
        updateMultipleCharts,
        animateProgress,
        getProgressColor,
        cleanupChart,
        optimizeChartRendering
    };
}