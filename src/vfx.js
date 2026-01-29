const VFX = {
    spawnClick(x, y) {
        const s = gridToScreen(x, y);
        Game.particles.push({ x: s.x, y: s.y, vx: 0, vy: -1, life: 20, size: 5, color: 'rgba(255,255,255,0.5)' });
    },
    spawnText(x, y, text, color) {
        const s = gridToScreen(x, y);
        // We can add a special particle that is text
        Game.particles.push({
            x: s.x,
            y: s.y,
            vx: 0,
            vy: -1,
            life: 40,
            text: text,
            color: color,
            type: 'text'
        });
    }
};
