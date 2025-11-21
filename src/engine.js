// --- ASSETS & GENERATION ---
function generateMap() {
    const map = [];
    for(let y=0; y<GRID_SIZE; y++) {
        const row = [];
        for(let x=0; x<GRID_SIZE; x++) {
            // Default Water
            let type = 'water';
            let h = 0;

            // Island / Dock Shape
            const dx = x - 10;
            const dy = y - 10;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Main Platform
            if (x > 5 && x < 15 && y > 5 && y < 15) {
                type = 'stone';
                h = 0;
            }

            // The Dock (Path)
            if (x >= 15 && y >= 9 && y <= 11) {
                type = 'wood';
                h = 0;
            }

            // Walls/Ruins
            if ((x===6 || x===14) && (y>5 && y<15)) {
                if (y !== 10) type = 'wall';
            }

            row.push({ type, h, x, y, noise: Math.random() });
        }
        map.push(row);
    }
    return map;
}

// --- ENGINE CORE ---
const Canvas = document.getElementById('canvas');
const Ctx = Canvas.getContext('2d');

const Engine = {
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        Canvas.addEventListener('mousemove', e => this.handleMouseMove(e));
        Canvas.addEventListener('mousedown', e => this.handleClick(e));
        window.addEventListener('keydown', e => this.handleKey(e));

        Game.map = generateMap();

        // Center Camera
        Game.camera.x = window.innerWidth/2;
        Game.camera.y = 100;

        this.loop();
    },

    resize() {
        Canvas.width = window.innerWidth;
        Canvas.height = window.innerHeight;
    },

    handleMouseMove(e) {
        const rect = Canvas.getBoundingClientRect();
        Game.mouse.x = e.clientX - rect.left;
        Game.mouse.y = e.clientY - rect.top;

        // Grid Projection
        const adjX = Game.mouse.x - Game.camera.x;
        const adjY = Game.mouse.y - Game.camera.y;

        const isoY = (2 * adjY - adjX * (TILE_H/(TILE_W/2))) / (2 * TILE_H);
        const isoX = (adjX / (TILE_W/2)) + isoY;

        Game.mouse.grid = { x: Math.floor(isoX), y: Math.floor(isoY) };
    },

    handleClick(e) {
        if (!Game.active) return;

        const gx = Game.mouse.grid.x;
        const gy = Game.mouse.grid.y;

        // Clicked UI? (Handled by DOM events usually, but blocking canvas here)
        // ...

        if (Game.turn === 'exploration' || Game.turn === 'player') {
            const actor = Game.party[Game.playerIdx];
            if (!actor) return;

            // Check Interactions
            const npc = Game.entities.find(en => en.x === gx && en.y === gy && en.team === 'neutral');
            if (npc && getDist(actor, npc) <= 2) {
                Dialogue.start(npc.id);
                return;
            }

            if (Game.mode === 'move') {
                // AP Check handled in move function
                if (Game.map[gy] && Game.map[gy][gx] && Game.map[gy][gx].type !== 'water' && Game.map[gy][gx].type !== 'wall') {
                    Combat.moveEntity(actor, gx, gy);
                    VFX.spawnClick(gx, gy);
                }
            } else if (Game.mode === 'attack') {
                const target = Game.entities.find(en => en.x === gx && en.y === gy && en.team === 'enemy');
                if (target) Combat.attack(actor, target, 'basic');
            } else if (Game.mode === 'skill1') {
                // Skill Logic
                const target = Game.entities.find(en => en.x === gx && en.y === gy);
                Combat.useSkill(actor, target || {x:gx, y:gy});
            }
        }
    },

    handleKey(e) {
        if(e.key === '1') this.setMode('move');
        if(e.key === '2') this.setMode('attack');
        if(e.key === '3') this.setMode('skill1');
        if(e.key === ' ') Combat.endTurn();
    },

    setMode(mode) {
        Game.mode = mode;
        // UI Update
        document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-'+mode);
        if(btn) btn.classList.add('active');
    },

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    update() {
        Game.time += 0.02;

        // Sort entities for rendering
        Game.entities.sort((a,b) => a.y - b.y || a.x - b.x);

        // Particle updates
        Game.particles = Game.particles.filter(p => p.life > 0);
        Game.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        });

        // Camera Follow Active Player
        if(Game.party[Game.playerIdx]) {
            const p = Game.party[Game.playerIdx];
            const targetScreen = gridToScreen(p.x, p.y);
            // Smooth Lerp
            // Game.camera.x += (window.innerWidth/2 - targetScreen.x) * 0.05;
            // Game.camera.y += (window.innerHeight/2 - targetScreen.y) * 0.05;
        }
    },

    draw() {
        // Clear
        Ctx.fillStyle = '#050508';
        Ctx.fillRect(0, 0, Canvas.width, Canvas.height);

        // Draw Map
        for(let y=0; y<GRID_SIZE; y++) {
            for(let x=0; x<GRID_SIZE; x++) {
                const tile = Game.map[y][x];
                const screen = gridToScreen(x, y);

                // Draw Tile
                drawTile(Ctx, screen.x, screen.y, tile);

                // Cursor Highlight
                if (Game.mouse.grid.x === x && Game.mouse.grid.y === y) {
                    drawIsoPoly(Ctx, screen.x, screen.y, COLORS.highlight);
                }
            }
        }

        // Draw Entities
        Game.entities.forEach(ent => {
            if (ent.hp <= 0) return;
            const pos = gridToScreen(ent.x, ent.y);
            drawEntity(Ctx, pos.x, pos.y, ent);
        });

        // Draw Particles
        Game.particles.forEach(p => {
            Ctx.fillStyle = p.color;
            if (p.type === 'text') {
                Ctx.font = "20px Arial";
                Ctx.textAlign = "center";
                Ctx.fillText(p.text, p.x, p.y);
            } else {
                Ctx.beginPath();
                Ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                Ctx.fill();
            }
        });

        // Visualize Path
        if (Game.mode === 'move' && Game.turn === 'player') {
            const actor = Game.party[Game.playerIdx];
            if (actor) {
                const path = Pathfinding.findPath(actor, Game.mouse.grid, Game.map);
                if (path) {
                    path.forEach(node => {
                        const sc = gridToScreen(node.x, node.y);
                        drawIsoPoly(Ctx, sc.x, sc.y, 'rgba(0,255,0,0.2)');
                    });
                }
            }
        }

        // Dynamic Lighting / Fog
        // Create a dark overlay mask
        // We want to punch holes where light sources are.
        // Since composite operations can be tricky with single layer, we do a simple trick:
        // Fill dark, then use 'destination-out' gradient for lights? No, that clears to transparent.
        // We want to clear the fog (which is black with alpha).

        Ctx.save();
        // Draw Fog
        // We use a temporary canvas or just draw directly if simple
        // Let's stick to the gradient method but make it centered on player
        const p = Game.party[Game.playerIdx];
        if (p) {
             const ps = gridToScreen(p.x, p.y);
             const grad = Ctx.createRadialGradient(
                ps.x, ps.y - 40, 150,
                ps.x, ps.y - 40, 600
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.6, 'rgba(5,5,10,0.5)');
            grad.addColorStop(1, 'rgba(5,5,10,0.95)');
            Ctx.fillStyle = grad;
            Ctx.fillRect(0,0, Canvas.width, Canvas.height);
        } else {
             // Fallback
             Ctx.fillStyle = 'rgba(0,0,0,0.8)';
             Ctx.fillRect(0,0, Canvas.width, Canvas.height);
        }
        Ctx.restore();
    }
};

// --- RENDER HELPERS ---
function gridToScreen(gx, gy) {
    return {
        x: (gx - gy) * TILE_W / 2 + Game.camera.x,
        y: (gx + gy) * TILE_H / 2 + Game.camera.y
    };
}

function drawTile(ctx, x, y, tile) {
    let color = COLORS.stoneDark;
    let topColor = COLORS.stoneLight;
    let lift = 0;

    if (tile.type === 'water') {
        const wave = Math.sin(Game.time + tile.x + tile.y) * 2;
        topColor = COLORS.water;
        y += wave;
        lift = -10; // Sunk
    } else if (tile.type === 'wood') {
        topColor = COLORS.woodLight;
        color = COLORS.woodDark;
    } else if (tile.type === 'wall') {
        topColor = '#444';
        lift = 40;
    }

    // Draw Sides (if lifted)
    if (lift > 0) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_H);
        ctx.lineTo(x + TILE_W/2, y + TILE_H/2);
        ctx.lineTo(x + TILE_W/2, y + TILE_H/2 - lift);
        ctx.lineTo(x, y + TILE_H - lift);
        ctx.fill();

        ctx.fillStyle = adjustColor(color, -20);
        ctx.beginPath();
        ctx.moveTo(x, y + TILE_H);
        ctx.lineTo(x - TILE_W/2, y + TILE_H/2);
        ctx.lineTo(x - TILE_W/2, y + TILE_H/2 - lift);
        ctx.lineTo(x, y + TILE_H - lift);
        ctx.fill();
    }

    // Top Face
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x, y - lift);
    ctx.lineTo(x + TILE_W/2, y + TILE_H/2 - lift);
    ctx.lineTo(x, y + TILE_H - lift);
    ctx.lineTo(x - TILE_W/2, y + TILE_H/2 - lift);
    ctx.fill();

    // Texture Detail (Simple noise)
    if (tile.type === 'stone') {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        if (tile.noise > 0.7) ctx.fillRect(x, y - lift + 10, 4, 4);
        if (tile.noise < 0.3) ctx.fillRect(x-10, y - lift + 5, 3, 3);
    } else if (tile.type === 'wood') {
         ctx.strokeStyle = 'rgba(0,0,0,0.2)';
         ctx.beginPath();
         ctx.moveTo(x - 10, y - lift + 5);
         ctx.lineTo(x + 10, y - lift + 15);
         ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Highlight
    if (tile.type === 'water' && Math.random() > 0.98) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x, y, 2, 2);
    }
}

function drawEntity(ctx, x, y, ent) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 14, 8, 0, 0, Math.PI*2);
    ctx.fill();

    const bob = Math.sin(Game.time * 2) * 3;
    y += bob;

    // Simple Sprite Drawing
    let color = '#fff';
    let icon = '?';

    if (ent.team === 'player') {
        color = varToHex('--accent-gold');
        icon = LINEAGES[ent.lineage].icon;
    } else if (ent.team === 'enemy') {
        color = '#c0392b';
        icon = '👹'; // Gargoyle
    } else {
        color = '#aaa';
        icon = '💀'; // Ferryman
    }

    // Base
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y-40);
    ctx.lineTo(x+10, y);
    ctx.lineTo(x-10, y);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffe0bd'; // Skin
    if (ent.id === 'charon') ctx.fillStyle = '#555'; // Pale
    if (ent.id === 'gargoyle') ctx.fillStyle = '#777'; // Stone

    ctx.beginPath();
    ctx.arc(x, y-45, 10, 0, Math.PI*2);
    ctx.fill();

    // Icon/Face
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(icon, x, y-60);

    // Bars
    if (ent.team !== 'neutral') {
        const pct = ent.hp / ent.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(x-15, y-70, 30, 4);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(x-15, y-70, 30*pct, 4);
    }

    // Active Indicator
    if (Game.active && Game.party[Game.playerIdx] === ent) {
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.ellipse(x, y+10, 16, 10, 0, 0, Math.PI*2);
        ctx.stroke();
    }
}

function drawIsoPoly(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + TILE_W/2, y + TILE_H/2);
    ctx.lineTo(x, y + TILE_H);
    ctx.lineTo(x - TILE_W/2, y + TILE_H/2);
    ctx.fill();
}
