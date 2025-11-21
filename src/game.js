// --- GLOBAL STATE ---
const Game = {
    active: false,
    turn: 'exploration', // exploration, player, enemy
    mode: 'move',
    map: [],
    entities: [],
    particles: [],
    camera: { x: 0, y: 0 },
    mouse: { x: 0, y: 0, grid: {x:0, y:0} },
    playerIdx: 0, // Current active party member index
    party: [],
    time: 0,
    flags: {
        introPlayed: false,
        ferrymanTalked: false,
        gateOpened: false
    },
    reputation: {
        'Umbra': 0,
        'Lycoris': 0,
        'Sirenia': 0,
        'Oracle': 0,
        'Bound': 0
    }
};

// Helper functions
function getDist(a, b) {
    if (!a || !b) return 999;
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function varToHex(v) {
    // Simple mapping based on the CSS variables
    const vars = {
        '--accent-gold': '#c5a059',
        '--accent-magic': '#9b59b6',
        '--accent-danger': '#c0392b',
        '--accent-umbra': '#8e44ad',
        '--accent-lycoris': '#27ae60'
    };
    return vars[v] || '#c5a059';
}

function adjustColor(col, amt) {
    if (!col) return '#000000';
    let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
