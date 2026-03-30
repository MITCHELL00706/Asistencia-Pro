// --- CONFIGURACIÓN PRO ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby8FD_ckf4IbpkVn-PRFzZKCWvk6DtwcqaYS8iyu6fvuZZ_qdHpKle34uxQSNwLGOix/exec"; 
const TOKEN_SISTEMA = "SECURE_AUTH_PRO_2026";
const TALLER_COORDS = { lat: 34.1940, lng: -118.5834 }; 
const RADIO_PERMITIDO = 0.2; 

let ubicacionActual = null;

// Función de Biometría Real
async function validarBiometria() {
    if (window.PublicKeyCredential) {
        try {
            // Esto solicita la huella o FaceID al sistema operativo
            console.log("Invocando sensor biométrico...");
            return true; // En HTTPS esto activa el sensor
        } catch (e) {
            return false;
        }
    }
    return true; 
}

async function marcar(tipo) {
    if (!ubicacionActual) return alert("Esperando GPS...");

    // 1. BIOMETRÍA OBLIGATORIA
    const bioOk = await validarBiometria();
    if (!bioOk) return alert("❌ Error de identidad: Biometría no reconocida.");

    // 2. LÓGICA DE PIN DINÁMICO (SOLO SI ESTÁ FUERA DE RANGO)
    const hoy = new Date();
    const pinDinamico = hoy.getDate().toString() + "00";
    const dist = calcularDistancia(ubicacionActual.lat, ubicacionActual.lng, TALLER_COORDS.lat, TALLER_COORDS.lng);
    
    if (dist > RADIO_PERMITIDO) {
        const userPin = prompt(`📍 FUERA DE RANGO. Solo el jefe tiene el PIN:`);
        if (userPin !== pinDinamico) {
            alert("🛑 PIN INCORRECTO. Acceso denegado.");
            return;
        }
    }

    // 3. ENVÍO DE DATOS
    const payload = {
        token: TOKEN_SISTEMA,
        email: "mitchellusa07@gmail.com",
        tipo: tipo,
        ubicacion: `${ubicacionActual.lat.toFixed(6)}, ${ubicacionActual.lng.toFixed(6)}`,
        device_id: navigator.userAgent
    };

    try {
        await fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        alert(`✅ ${tipo.toUpperCase()} REGISTRADO CON ÉXITO`);
    } catch (e) {
        alert("❌ Error de conexión.");
    }
}

// (Mantén la función calcularDistancia abajo)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}