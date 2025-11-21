// --- GAME LOOP & STATE MANAGEMENT ---
const GameLoop = {
    checkGameState() {
        // 1. Check Loss (Party Dead)
        const alive = Game.party.filter(p => p.hp > 0);
        if (alive.length === 0) {
            this.triggerGameOver();
            return;
        }

        // 2. Check Win (Boss Dead)
        const boss = Game.entities.find(e => e.id === 'gargoyle');
        if (boss && boss.hp <= 0) {
             Dialogue.start('end_combat');
        }
    },

    triggerGameOver() {
        Game.active = false;

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.style.background = 'rgba(20,0,0,0.9)';
        overlay.style.opacity = '1';
        overlay.innerHTML = `
            <h1 style="color:#c0392b; font-family:var(--font-header); font-size:4em; margin-bottom:10px;">YOU DIED</h1>
            <p style="color:#888;">The Hollow claims another soul.</p>
            <button class="start-btn" onclick="location.reload()">Try Again</button>
        `;
        document.body.appendChild(overlay);
    },

    triggerVictory() {
        Game.active = false;

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.style.background = 'rgba(0,20,20,0.9)';
        overlay.style.opacity = '1';
        overlay.innerHTML = `
            <h1 style="color:var(--accent-gold); font-family:var(--font-header); font-size:4em; margin-bottom:10px;">VICTORY</h1>
            <p style="color:#ccc;">You have crossed the Veil.</p>
            <p style="color:#888; font-size:0.8em;">Chapter II Coming Soon...</p>
            <button class="start-btn" onclick="location.reload()">Return to Menu</button>
        `;
        document.body.appendChild(overlay);
    }
};
