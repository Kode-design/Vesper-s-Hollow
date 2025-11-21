const TILE_W = 64;
const TILE_H = 32;
const GRID_SIZE = 20;

const COLORS = {
    water: '#0a0a15',
    waterHighlight: '#151525',
    stoneDark: '#1a1a1a',
    stoneLight: '#2a2a2a',
    woodDark: '#3e2723',
    woodLight: '#5d4037',
    grass: '#1b2e1b',
    highlight: 'rgba(255,255,255,0.2)',
    danger: 'rgba(255,0,0,0.3)',
    range: 'rgba(100,255,255,0.2)'
};

const LINEAGES = {
    'Umbra': { icon: '🦇', desc: "Aristocratic and deadly. Masters of blood magic.", skill: "Sanguine Step" },
    'Lycoris': { icon: '🐺', desc: "Guardians of the wild. Fierce melee combatants.", skill: "Feral Lunge" },
    'Sirenia': { icon: '🧜‍♀️', desc: "Manipulators of emotion and water.", skill: "Siren's Call" },
    'Oracle': { icon: '👁️', desc: "Seers of the unseen. High damage magic.", skill: "Mind Spike" },
    'Bound': { icon: '⛓️', desc: "Reanimated scholars. Durable and resistant.", skill: "Necrotic Touch" }
};

const ITEMS = {
    'potion_hp': { name: "Health Potion", type: "consumable", effect: "heal", value: 20, icon: "🧪", desc: "Restores 20 HP" },
    'potion_ap': { name: "Stamina Tonic", type: "consumable", effect: "restore_ap", value: 2, icon: "⚡", desc: "Restores 2 AP" },
    'ancient_coin': { name: "Ancient Coin", type: "quest", effect: "none", value: 0, icon: "🪙", desc: "A coin from a fallen era." }
};
