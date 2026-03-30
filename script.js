// --- CONFIGURACIÓN PRO ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby8FD_ckf4IbpkVn-PRFzZKCWvk6DtwcqaYS8iyu6fvuZZ_qdHpKle34uxQSNwLGOix/exec"; 
const TOKEN_SISTEMA = "SECURE_AUTH_PRO_2026";
const TALLER_COORDS = { lat: 34.1940, lng: -118.5834 }; // Coordenadas del taller
const RADIO_PERMITIDO = 0.2; // 200 metros a la redonda

let ubicacionActual = null;

// Captura de GPS automática al cargar
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            ubicacionActual = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            const indicator = document.getElementById('gps-indicator');
            const statusText = document.getElementById('status-text');
            if(indicator) indicator.classList.replace('bg-red-500', 'bg-emerald-500');
            if(statusText) statusText.innerText = "SISTEMA SEGURO Y CONECTADO";
        }, (err) => {
            console.error("Error GPS:", err);
            document.getElementById('status-text').innerText = "ERROR: ACTIVA EL GPS";
        }, { enableHighAccuracy: true });
    }
};

async function marcar(tipo) {
    if (!ubicacionActual) {
        alert("⚠️ Error: El sistema aún no tiene señal GPS válida.");
        return;
    }

    // --- SEGURIDAD DINÁMICA ---
    // El PIN es el número del día actual + 00 (Ej: hoy 30 de marzo, el PIN es 3000)
    const hoy = new Date();
    const pinDinamico = hoy.getDate().toString() + "00";

    const dist = calcularDistancia(ubicacionActual.lat, ubicacionActual.lng, TALLER_COORDS.lat, TALLER_COORDS.lng);
    
    // Verificación de Geofencing
    if (dist > RADIO_PERMITIDO) {
        const userPin = prompt(`📍 FUERA DE RANGO (${(dist).toFixed(2)}km). Ingrese PIN de Supervisor (Día+00):`);
        if (userPin !== pinDinamico) {
            alert("🛑 ACCESO DENEGADO: PIN incorrecto o ubicación no autorizada.");
            return;
        }
    }

    // Preparación de datos para el Excel
    const payload = {
        token: TOKEN_SISTEMA,
        email: "mitchellusa07@gmail.com", // Aquí podrías usar un sistema de login más adelante
        tipo: tipo,
        ubicacion: `${ubicacionActual.lat.toFixed(6)}, ${ubicacionActual.lng.toFixed(6)}`,
        device_id: navigator.userAgent
    };

    // Feedback visual
    document.getElementById('status-text').innerText = "TRANSMITIENDO DATOS...";

    try {
        const res = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Para evitar bloqueos de seguridad del navegador en pruebas
            body: JSON.stringify(payload)
        });
        
        alert(`✅ REGISTRO DE ${tipo.toUpperCase()} EXITOSO`);
        document.getElementById('status-text').innerText = "SISTEMA SEGURO Y CONECTADO";
    } catch (e) {
        alert("❌ ERROR DE RED: No se pudo conectar con el Excel.");
        document.getElementById('status-text').innerText = "ERROR DE CONEXIÓN";
    }
}

// Fórmula matemática para medir distancia real en KM
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}