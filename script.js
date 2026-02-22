
// ================================================
// GLOBAL HELPERS
// ================================================

function showGlobalToast(message, type = 'success') {
    const toast = document.getElementById('globalToast');
    if (!toast) return;

    toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + message;
    toast.className = `toast-global ${type} show`;

    setTimeout(() => {
        toast.className = 'toast-global';
    }, 4500);
}

// ================================================
// PAGE NAVIGATION
// ================================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(el => {
        el.classList.remove('active');
    });

    const target = document.getElementById('page-' + page);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close mobile menu
    document.getElementById('hamburger')?.classList.remove('active');
    document.getElementById('navMenu')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');

    // Lazy init map when services page is opened
    if (page === 'services' && !window.mapInitialized) {
        setTimeout(initMap, 400);
    }
}

// ================================================
// HEADER + MOBILE MENU
// ================================================

window.addEventListener('scroll', () => {
    document.getElementById('mainHeader')?.classList.toggle('scrolled', window.scrollY > 60);
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const overlay = document.getElementById('overlay');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// ================================================
// FOOTER INJECTION
// ================================================

function injectFooters() {
    const template = document.getElementById('footerTemplate');
    if (!template) return;

    const slots = [
        'footer-home',
        'footer-about',
        'footer-contact',
        'footer-services',
        'footer-press',
        'footer-profile'
    ];

    slots.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.appendChild(template.content.cloneNode(true));
        }
    });
}

// ================================================
// AI CHATBOT (simple contact responder)
// ================================================

const BOT_RESPONSE = `
<div class="ai-contact-info">
    <strong>📞 संपर्क करें:</strong><br>
    फोन: <a href="tel:+919058545076">+91 90585 45076</a><br>
    ईमेल: <a href="mailto:b.l.verdantix2026@gmail.com">b.l.verdantix2026@gmail.com</a><br><br>
    हमारी टीम जल्द ही आपकी सहायता करेगी! 🌱
</div>`;

function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const messages = document.getElementById('aiChatMessages');
    if (!messages) return;

    // User message
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-message user';
    userDiv.innerHTML = `<div class="ai-message-bubble">${text}</div>`;
    messages.appendChild(userDiv);

    input.value = '';
    scrollChat();

    // Show typing
    const typing = document.getElementById('aiTypingIndicator');
    if (typing) typing.style.display = 'block';
    scrollChat();

    setTimeout(() => {
        if (typing) typing.style.display = 'none';

        const botDiv = document.createElement('div');
        botDiv.className = 'ai-message bot';
        botDiv.innerHTML = `<div class="ai-message-bubble">${BOT_RESPONSE}</div>`;
        messages.appendChild(botDiv);

        scrollChat();
    }, 1400);
}

function scrollChat() {
    const messages = document.getElementById('aiChatMessages');
    if (messages) messages.scrollTop = messages.scrollHeight;
}

document.getElementById('aiSendBtn')?.addEventListener('click', sendAIMessage);
document.getElementById('aiChatInput')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendAIMessage();
    }
});

document.getElementById('aiChatButton')?.addEventListener('click', () => {
    const win = document.getElementById('aiChatWindow');
    if (win) {
        win.classList.toggle('active');
        if (win.classList.contains('active')) {
            document.getElementById('aiChatInput')?.focus();
        }
    }
});

document.getElementById('aiCloseChat')?.addEventListener('click', () => {
    document.getElementById('aiChatWindow')?.classList.remove('active');
});

// ================================================
// SERVICES – GPS MAP
// ================================================

let map = null;
let drawnItems = null;
let drawControl = null;
window.mapInitialized = false;

function initMap() {
    if (window.mapInitialized) return;

    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    map = L.map('map').setView([28.98, 77.71], 12); // Meerut area

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    map.on(L.Draw.Event.CREATED, e => {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        calculateArea(layer);
        document.getElementById('polygonInfo')?.classList.remove('show');
    });

    map.on(L.Draw.Event.EDITED, e => {
        e.layers.eachLayer(layer => calculateArea(layer));
    });

    window.mapInitialized = true;
}

function calculateArea(layer) {
    if (!layer || typeof turf === 'undefined') return;

    const latlngs = layer.getLatLngs()[0];
    const coords = latlngs.map(ll => [ll.lng, ll.lat]);
    coords.push(coords[0]); // close ring

    const poly = turf.polygon([coords]);
    const areaM2 = turf.area(poly);
    const periM = turf.length(poly, { units: 'meters' }) * 1000;

    document.getElementById('areaSqM')?.textContent = areaM2.toFixed(2);
    document.getElementById('areaAcre')?.textContent = (areaM2 / 4046.86).toFixed(4);
    document.getElementById('areaHectare')?.textContent = (areaM2 / 10000).toFixed(4);
    document.getElementById('areaBigha')?.textContent = (areaM2 / 2529.29).toFixed(4);
    document.getElementById('perimeter')?.textContent = periM.toFixed(2);

    document.getElementById('resultCard')?.classList.add('show');

    layer.bindPopup(`<strong>क्षेत्रफल:</strong><br>${areaM2.toFixed(2)} m²<br>${(areaM2 / 4046.86).toFixed(4)} एकड़`).openPopup();
}

function clearAllDrawings() {
    if (drawnItems) drawnItems.clearLayers();
    document.getElementById('resultCard')?.classList.remove('show');
    document.getElementById('polygonInfo')?.classList.remove('show');
    if (drawControl) map?.removeControl(drawControl);
}

// ================================================
// SERVICES – AGRI CALCULATORS
// ================================================

const agriData = {
    states: {
        "Uttar Pradesh": ["Meerut", "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Prayagraj", "Bareilly", "Moradabad", "Aligarh", "Gorakhpur", "Saharanpur", "Noida", "Mathura", "Bijnor", "Muzaffarnagar", "Amroha", "Bulandshahr"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Gurdaspur", "Ferozepur", "Sangrur"],
        "Haryana": ["Faridabad", "Gurgaon", "Hisar", "Rohtak", "Panipat", "Karnal", "Sonipat", "Yamunanagar", "Ambala", "Kurukshetra"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Nainital", "Haldwani", "Rishikesh", "Pauri", "Almora", "Rudrapur", "Kashipur"]
    },
    crops: {
        "Wheat": { urea: 260, dap: 130, npk: 50 },
        "Rice": { urea: 220, dap: 110, npk: 60 },
        "Cotton": { urea: 325, dap: 130, npk: 75 },
        "Sugarcane": { urea: 435, dap: 175, npk: 100 },
        "Maize": { urea: 260, dap: 130, npk: 50 },
        "Soybean": { urea: 65, dap: 175, npk: 50 },
        "Potato": { urea: 325, dap: 175, npk: 125 },
        "Tomato": { urea: 260, dap: 130, npk: 100 }
    },
    soilTypes: {
        "Loamy": 1.0, "Clay": 1.15, "Sandy": 1.25, "Silt": 1.1,
        "Red Soil": 1.2, "Black Soil": 0.95, "Alluvial": 1.0
    },
    prices: { urea: 6.5, dap: 27, npk: 18, pesticide: 350 },
    trees: [
        { name: "Mango", icon: "🥭" }, { name: "Apple", icon: "🍎" }, { name: "Orange", icon: "🍊" },
        { name: "Banana", icon: "🍌" }, { name: "Guava", icon: "🍐" }, { name: "Papaya", icon: "🍈" },
        { name: "Coconut", icon: "🥥" }, { name: "Lemon", icon: "🍋" }, { name: "Pomegranate", icon: "🍒" },
        { name: "Grapes", icon: "🍇" }
    ]
};

let selectedTreeIndex = -1;

function initAgriCalculators() {
    // States
    const stateSel = document.getElementById('state');
    if (stateSel) {
        Object.keys(agriData.states).forEach(s => {
            let opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            stateSel.appendChild(opt);
        });
    }

    // Crops
    const cropSel = document.getElementById('crop');
    if (cropSel) {
        Object.keys(agriData.crops).forEach(c => {
            let opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            cropSel.appendChild(opt);
        });
    }

    // Soils
    const soilSel = document.getElementById('soil');
    if (soilSel) {
        Object.keys(agriData.soilTypes).forEach(s => {
            let opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            soilSel.appendChild(opt);
        });
    }

    // Tree grid
    const grid = document.getElementById('treeGrid');
    if (grid) {
        agriData.trees.forEach((t, i) => {
            let card = document.createElement('div');
            card.className = 'tree-card';
            card.innerHTML = `<div class="t-icon">${t.icon}</div><div class="t-name">${t.name}</div>`;
            card.onclick = () => selectTree(i, card);
            grid.appendChild(card);
        });
    }
}

function selectTree(idx, el) {
    document.querySelectorAll('.tree-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedTreeIndex = idx;
}

// ... rest of calculator functions (fertilizer, irrigation, etc.) can be added similarly ...

// ================================================
// PROFILE LANGUAGE TOGGLE (simple)
// ================================================

function toggleProfileLanguage(lang) {
    document.querySelectorAll('[data-en], [data-hi]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
}

// ================================================
// INIT
// ================================================

window.addEventListener('DOMContentLoaded', () => {
    injectFooters();
    initAgriCalculators();

    // Optional default language
    // toggleProfileLanguage('en');
});
