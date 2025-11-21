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
    'Umbra': { icon: '🦇', desc: "Aristocratic and deadly. Masters of blood magic.", skill: "Sanguine Step", skills: ['umbra_teleport'] },
    'Lycoris': { icon: '🐺', desc: "Guardians of the wild. Fierce melee combatants.", skill: "Feral Lunge", skills: ['lycoris_bleed'] },
    'Sirenia': { icon: '🧜‍♀️', desc: "Manipulators of emotion and water.", skill: "Siren's Call", skills: ['siren_heal'] },
    'Oracle': { icon: '👁️', desc: "Seers of the unseen. High damage magic.", skill: "Mind Spike", skills: ['oracle_blast'] },
    'Bound': { icon: '⛓️', desc: "Reanimated scholars. Durable and resistant.", skill: "Necrotic Touch", skills: ['bound_drain'] }
};

const SKILLS = {
    'basic_attack': {
        name: "Attack",
        ap: 1,
        range: 1.5,
        cooldown: 0,
        type: 'damage',
        val: 10, // Base damage
        icon: "⚔️",
        desc: "Basic melee attack."
    },
    'umbra_teleport': {
        name: "Sanguine Step",
        ap: 2,
        range: 5,
        cooldown: 3,
        type: 'teleport',
        val: 0,
        icon: "🦇",
        desc: "Teleport to target location."
    },
    'lycoris_bleed': {
        name: "Feral Lunge",
        ap: 2,
        range: 1.5,
        cooldown: 3,
        type: 'status',
        status: 'bleed',
        statusVal: 5,
        statusDur: 3,
        val: 15,
        icon: "🐺",
        desc: "High dmg attack causing bleed."
    },
    'siren_heal': {
        name: "Siren's Call",
        ap: 2,
        range: 4,
        cooldown: 3,
        type: 'heal',
        val: 25,
        icon: "🎵",
        desc: "Heal ally or self."
    },
    'oracle_blast': {
        name: "Mind Spike",
        ap: 2,
        range: 4,
        cooldown: 2,
        type: 'damage',
        val: 30,
        icon: "👁️",
        desc: "Ranged psychic damage."
    },
    'bound_drain': {
        name: "Necrotic Touch",
        ap: 2,
        range: 1.5,
        cooldown: 3,
        type: 'drain',
        val: 15,
        icon: "💀",
        desc: "Damage enemy and heal self."
    }
};

const ITEMS = {
    'potion_hp': { name: "Health Potion", type: "consumable", effect: "heal", value: 20, icon: "🧪", desc: "Restores 20 HP" },
    'potion_ap': { name: "Stamina Tonic", type: "consumable", effect: "restore_ap", value: 2, icon: "⚡", desc: "Restores 2 AP" },
    'ancient_coin': { name: "Ancient Coin", type: "quest", effect: "none", value: 0, icon: "🪙", desc: "A coin from a fallen era." }
};
