const Combat = {
    moveEntity(ent, x, y) {
        if (ent.ap <= 0 && Game.turn === 'player') {
            UI.log("No AP to move!", 'error');
            return;
        }

        // Use A*
        const path = Pathfinding.findPath(ent, {x, y}, Game.map);
        if (!path) {
            UI.log("Path blocked or unreachable.", 'error');
            return;
        }

        const cost = path.length - 1; // Path includes start
        if (cost > ent.ap && Game.turn === 'player') {
            UI.log(`Too far! Need ${cost} AP.`, 'error');
            return;
        }

        // Animate Movement (instant for now, but loop points)
        // In a full engine, we'd tween through path.
        ent.x = x;
        ent.y = y;

        if (Game.turn === 'player') {
            ent.ap -= cost;
            UI.log(`${ent.name} moved (${cost} AP).`);
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

    useSkill(attacker, skillId, targetPos) {
        const skill = SKILLS[skillId];
        if (!skill) return;

        // Checks
        if (attacker.ap < skill.ap) {
            UI.log(`Need ${skill.ap} AP!`, 'error');
            return;
        }
        if (attacker.cooldowns && attacker.cooldowns[skillId] > 0) {
            UI.log(`Skill on cooldown! (${attacker.cooldowns[skillId]} turns)`, 'error');
            return;
        }
        if (getDist(attacker, targetPos) > skill.range) {
            UI.log("Out of range!", 'error');
            return;
        }

        // Apply Cost
        attacker.ap -= skill.ap;

        // Initialize cooldowns if missing
        if(!attacker.cooldowns) attacker.cooldowns = {};
        attacker.cooldowns[skillId] = skill.cooldown;

        // Logic
        let tEnt = Game.entities.find(e => e.x === targetPos.x && e.y === targetPos.y);

        if (skill.type === 'teleport') {
            attacker.x = targetPos.x;
            attacker.y = targetPos.y;
            VFX.spawnText(attacker.x, attacker.y, "Blink", '#a0f');
        }
        else if (skill.type === 'heal') {
            if (tEnt) {
                tEnt.hp = Math.min(tEnt.hp + skill.val, tEnt.maxHp);
                VFX.spawnText(tEnt.x, tEnt.y, `+${skill.val}`, 'green');
            }
        }
        else {
             // Damage / Status
             if (tEnt) {
                 let dmg = skill.val;
                 tEnt.hp -= dmg;
                 VFX.spawnText(tEnt.x, tEnt.y, `-${dmg}`, 'red');

                 if (skill.type === 'status' && skill.status) {
                     if(!tEnt.effects) tEnt.effects = [];
                     tEnt.effects.push({type: skill.status, duration: skill.statusDur, val: skill.statusVal});
                     UI.log(`${tEnt.name} is affected by ${skill.status}!`);
                 }
                 if (skill.type === 'drain') {
                     attacker.hp = Math.min(attacker.hp + skill.val, attacker.maxHp);
                     VFX.spawnText(attacker.x, attacker.y, `+${skill.val}`, 'green');
                 }

                 if (tEnt.hp <= 0) {
                     tEnt.x = -100;
                     UI.log(`${tEnt.name} defeated.`);
                     Combat.handleDeath(tEnt);
                 }
             } else {
                 UI.log("Missed!", 'info');
             }
        }

        UI.updatePartyFrames();
    },

    handleDeath(ent) {
        // Drop Loot
        if (ent.team === 'enemy') {
            // Simple chance
            if (Math.random() > 0.5) {
                const item = 'potion_hp';
                Game.loot.push({x: ent.x, y: ent.y, item: item});
                UI.log(`${ent.name} dropped ${ITEMS[item].name}.`);
            }
        }

        // Check Win/Loss
        GameLoop.checkGameState();
    },

    endTurn() {
        if (Game.turn === 'player') {
            // Process Player Effects (end of turn)
            this.processEffects(Game.party);

            Game.turn = 'enemy';
            UI.log("Enemy Turn...");
            setTimeout(Combat.enemyTurn, 1000);
        }
    },

    processEffects(entities) {
        entities.forEach(ent => {
            if(!ent.effects) return;
            ent.effects = ent.effects.filter(eff => {
                if(eff.type === 'bleed') {
                    ent.hp -= eff.val;
                    VFX.spawnText(ent.x, ent.y, `-${eff.val}`, 'red');
                    UI.log(`${ent.name} bleeds for ${eff.val}.`);
                }
                eff.duration--;
                return eff.duration > 0;
            });

            // Cooldowns
            if(ent.cooldowns) {
                for(let k in ent.cooldowns) {
                    if(ent.cooldowns[k] > 0) ent.cooldowns[k]--;
                }
            }
        });
        UI.updatePartyFrames(); // Update HP bars if bleed happened
    },

    enemyTurn() {
        const enemies = Game.entities.filter(e => e.team === 'enemy' && e.hp > 0);

        // Process Enemy Effects (start of their turn)
        this.processEffects(enemies);

        enemies.forEach(en => {
            if (en.hp <= 0) return; // Died from bleed?

            // Simple AI: Move to closest player
            const target = Game.party[0];
            const dist = getDist(en, target);

            if(dist > 1.5) {
                // Try to move closer with A*
                // Find a tile adjacent to target?
                // For now, just path to target tile, but stop before it.
                const path = Pathfinding.findPath(en, {x: target.x, y: target.y}, Game.map);
                if (path && path.length > 2) {
                    // Move towards
                    const next = path[1]; // 0 is current, 1 is next step
                    // Simply move one step per turn for this basic AI
                    en.x = next.x;
                    en.y = next.y;
                } else if (!path) {
                   // Fallback simple move
                    if (en.x < target.x) en.x++;
                    else if (en.x > target.x) en.x--;
                }
            } else {
                target.hp -= 5;
                VFX.spawnText(target.x, target.y, "-5", 'red');
                if (target.hp <= 0) {
                    GameLoop.checkGameState(); // Player might have died
                }
            }
        });

        Game.turn = 'player';
        // Process Player Cooldowns tick? Usually at start of their turn
        // Let's do it in endTurn of previous or here.
        // We did player end-turn processing.

        // Restore AP
        Game.party.forEach(p => {
             p.ap = p.maxAp;
             // Cooldowns can also tick here for player if we prefer "start of turn" refresh
             if(p.cooldowns) {
                 for(let k in p.cooldowns) {
                     // if(p.cooldowns[k] > 0) p.cooldowns[k]--;
                     // Already did it in endTurn processEffects for simplicity
                 }
             }
        });

        UI.log("Player Turn.");
        UI.updatePartyFrames();
    }
};
