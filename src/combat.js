const Combat = {
    moveEntity(ent, x, y) {
        if (getDist(ent, {x,y}) > ent.ap + 3) {
            UI.log("Too far!", 'error');
            return;
        }

        ent.x = x;
        ent.y = y;

        if (Game.turn === 'player') {
            ent.ap -= 1;
            if (ent.ap <= 0) ent.ap = 0;
            UI.updatePartyFrames();
        }
    },

    attack(attacker, target, type) {
        if (attacker.ap <= 0) { UI.log("No AP!", 'error'); return; }
        if (getDist(attacker, target) > 1.5) { UI.log("Too far to strike!", 'error'); return; }

        let dmg = 10 + Math.floor(Math.random() * 5);
        target.hp -= dmg;
        VFX.spawnText(target.x, target.y, `-${dmg}`, 'red');
        UI.log(`${attacker.name} hits ${target.name} for ${dmg}.`);
        attacker.ap--;

        if (target.hp <= 0) {
            target.x = -100; // Remove from map
            UI.log(`${target.name} defeated.`);
            if (target.id === 'gargoyle') {
                Dialogue.start('end_combat');
            }
        }
        UI.updatePartyFrames();
    },

    useSkill(attacker, target) {
        if (attacker.ap < 2) { UI.log("Need 2 AP!", 'error'); return; }

        // Placeholder Skill Logic
        let dmg = 20;
        if (attacker.lineage === 'Umbra') {
            // Teleport
            attacker.x = target.x; attacker.y = target.y;
            VFX.spawnText(attacker.x, attacker.y, "Blink", '#a0f');
            dmg = 0;
        } else {
             // Generic Blast
             const tEnt = Game.entities.find(e => e.x === target.x && e.y === target.y);
             if(tEnt) {
                 tEnt.hp -= dmg;
                 VFX.spawnText(tEnt.x, tEnt.y, `-${dmg}`, '#a0f');
             }
        }
        attacker.ap -= 2;
        UI.updatePartyFrames();
    },

    endTurn() {
        if (Game.turn === 'player') {
            Game.turn = 'enemy';
            UI.log("Enemy Turn...");
            setTimeout(Combat.enemyTurn, 1000);
        }
    },

    enemyTurn() {
        const enemies = Game.entities.filter(e => e.team === 'enemy' && e.hp > 0);
        enemies.forEach(en => {
            // Simple AI: Move to closest player
            const target = Game.party[0]; // Simplified
            if(getDist(en, target) > 1.5) {
                if (en.x < target.x) en.x++;
                else if (en.x > target.x) en.x--;
            } else {
                target.hp -= 5;
                VFX.spawnText(target.x, target.y, "-5", 'red');
            }
        });

        Game.turn = 'player';
        Game.party.forEach(p => p.ap = p.maxAp);
        UI.log("Player Turn.");
        UI.updatePartyFrames();
    }
};
