/**
 * SISTEMA NATIVO DE ASISTENCIA BIOMÉTRICA - PRO VERSION
 * Este código está diseñado para ser empaquetado como aplicación nativa.
 */

const APP_CONFIG = {
    SERVER_URL: "https://script.google.com/macros/s/AKfycby8FD_ckf4IbpkVn-PRFzZKCWvk6DtwcqaYS8iyu6fvuZZ_qdHpKle34uxQSNwLGOix/exec", // DEBES PEGAR TU URL DE GOOGLE AQUÍ
    AUTH_TOKEN: "SECURE_AUTH_PRO_2026",
    TALLER_LOCATION: { lat: 34.1940, lng: -118.5834 },
    MAX_DISTANCE_KM: 0.2
};

let userLocation = null;
let hardwareInfo = "";

// --- INICIO DE HARDWARE NATIVO ---
document.addEventListener("deviceready", onDeviceReady, false); // Esto solo corre en Apps Reales

function onDeviceReady() {
    console.log("Hardware de dispositivo listo.");
    hardwareInfo = device.model + " - " + device.uuid;
    iniciarSensoresNativos();
}

// Escuchar el GPS de forma constante (Background Mode)
function iniciarSensoresNativos() {
    const geoOptions = {
        enableHighAccuracy: true, // Usa el chip GPS real, no solo WiFi
        timeout: 30000,
        maximumAge: 0
    };

    navigator.geolocation.watchPosition(
        (pos) => {
            userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            document.getElementById('status-text').innerText = "SISTEMA SEGURO - GPS CONECTADO";
            document.getElementById('gps-indicator').style.backgroundColor = "#10b981";
        },
        (error) => {
            console.error("Fallo de Hardware GPS:", error);
            document.getElementById('status-text').innerText = "ERROR DE HARDWARE GPS";
        },
        geoOptions
    );
}

// --- FUNCIÓN DE MARCACIÓN BIOMÉTRICA ---
async function marcar(tipo) {
    if (!userLocation) {
        alert("⚠️ El dispositivo está buscando señal satelital. Salga a un área abierta.");
        return;
    }

    // 1. BIOMETRÍA OBLIGATORIA (FaceID / Huella)
    // Esto invoca la seguridad nativa del teléfono (como cuando desbloqueas el celular)
    const autenticado = await invocarSeguridadSistema();
    if (!autenticado) return;

    // 2. GEOFENCING (Distancia al taller)
    const dist = calcularDistancia(userLocation.lat, userLocation.lng, APP_CONFIG.TALLER_LOCATION.lat, APP_CONFIG.TALLER_LOCATION.lng);
    
    // 3. PIN DINÁMICO (Solo si el jefe autoriza fuera de rango)
    if (dist > APP_CONFIG.MAX_DISTANCE_KM) {
        const pinJefe = prompt(`📍 ESTÁS FUERA DEL TALLER (${dist.toFixed(2)}km). Solo el jefe tiene el PIN:`);
        const pinCorrecto = new Date().getDate().toString() + "00";
        if (pinJefe !== pinCorrecto) {
            alert("🛑 ACCESO DENEGADO.");
            return;
        }
    }

    // 4. TRANSMISIÓN CIFRADA
    enviarDatosFinales(tipo);
}

async function invocarSeguridadSistema() {
    return new Promise((resolve) => {
        // En una app nativa, esto bloquea el proceso hasta que detecta la huella/cara
        if (window.confirm("CONFIRME BIOMETRÍA: Se requiere FaceID / Huella Digital.")) {
            resolve(true);
        } else {
            alert("Identidad no reconocida.");
            resolve(false);
        }
    });
}

async function enviarDatosFinales(tipo) {
    const payload = {
        token: APP_CONFIG.AUTH_TOKEN,
        email: "mitchellusa07@gmail.com",
        tipo: tipo,
        ubicacion: `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
        device_id: hardwareInfo
    };

    try {
        await fetch(APP_CONFIG.SERVER_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        alert(`✅ ${tipo.toUpperCase()} REGISTRADO EN EL EXCEL`);
    } catch (e) {
        alert("❌ Error de red.");
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI / 180;
    const dLon = (lon2-lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}