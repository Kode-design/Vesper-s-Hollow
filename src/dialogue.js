const Dialogue = {
    data: {
        'charon': {
            start: {
                speaker: 'Charon',
                text: "The toll is heavy for the living. Why do you seek the Hollow?",
                options: [
                    { text: "I have an invitation.", next: 'invite' },
                    { text: "[Umbra] Do not trifle with me, Ferryman.", next: 'threat', req: 'Umbra', rep: {'Umbra': 1, 'Bound': -1} },
                    { text: "[Bound] I am not fully living.", next: 'kin', req: 'Bound', rep: {'Bound': 1} }
                ]
            },
            invite: {
                speaker: 'Charon',
                text: "Many have invitations. Few have the soul to endure the crossing. Very well. Prepare yourself.",
                options: [{ text: "Board the ferry.", action: 'start_event' }]
            },
            threat: {
                speaker: 'Charon',
                text: "Hmph. The arrogance of the Sanguine. Fine. Step aboard, little prince.",
                options: [{ text: "Board.", action: 'start_event' }]
            },
            kin: {
                speaker: 'Charon',
                text: "Ah... one who has touched the other side. You may pass without toll.",
                options: [{ text: "Board.", action: 'start_event' }]
            }
        },
        'valerius': {
            start: {
                speaker: 'Valerius',
                text: "About time. I expected the new 'Prism' to be... taller. Look out!",
                options: [{ text: "What?", action: 'spawn_gargoyle' }]
            }
        },
        'end_combat': {
            start: {
                speaker: 'Valerius',
                text: "Not bad. You didn't die instantly. Welcome to Vesper's Hollow.",
                options: [{ text: "End Chapter I", action: 'finish_game' }]
            }
        }
    },

    start(id) {
        const node = this.data[id].start;
        this.render(node, id);
        document.getElementById('dialogue-box').style.display = 'block';
    },

    render(node, id) {
        document.getElementById('diag-speaker').innerText = node.speaker;
        document.getElementById('diag-text').innerText = node.text;

        const optsDiv = document.getElementById('diag-options');
        optsDiv.innerHTML = '';

        node.options.forEach(opt => {
            // Req check
            if (opt.req && Game.party[0].lineage !== opt.req) return;

            const btn = document.createElement('div');
            btn.className = 'dialogue-btn';

            // Tag styling
            let tag = '';
            if (opt.req) tag = `<span class="tag-${opt.req.toLowerCase()}">[${opt.req}]</span> `;

            btn.innerHTML = tag + opt.text;
            btn.onclick = () => {
                if (opt.rep) {
                    // Apply reputation change
                    for (const [faction, amount] of Object.entries(opt.rep)) {
                        Game.reputation[faction] = (Game.reputation[faction] || 0) + amount;
                        UI.log(`Reputation with ${faction}: ${amount > 0 ? '+' : ''}${amount} (Total: ${Game.reputation[faction]})`);
                    }
                }
                if (opt.action) this.doAction(opt.action);
                else if (opt.next) this.render(this.data[id][opt.next], id);
                else this.close();
            };
            optsDiv.appendChild(btn);
        });
    },

    doAction(act) {
        this.close();
        if (act === 'start_event') {
            // Teleport to Gates
            UI.log("The Ferry crosses the misty waters...");
            setTimeout(() => {
                Game.camera.x -= 200; // Pan
                // Spawn Valerius
                const val = { id: 'valerius', name: 'Valerius', lineage: 'Umbra', hp: 80, maxHp: 80, ap: 3, maxAp: 3, x: 10, y: 10, team: 'player' };
                Game.party.push(val);
                Game.entities.push(val);
                UI.updatePartyFrames();
                Dialogue.start('valerius');
            }, 1000);
        }
        if (act === 'spawn_gargoyle') {
            const boss = { id: 'gargoyle', name: 'Gargoyle', lineage: 'Bound', hp: 60, maxHp: 60, ap: 2, maxAp: 2, x: 14, y: 10, team: 'enemy' };
            Game.entities.push(boss);
            UI.log("Combat Started!");
            Game.turn = 'player';
        }
        if (act === 'finish_game') {
            GameLoop.triggerVictory();
        }
    },

    close() {
        document.getElementById('dialogue-box').style.display = 'none';
    }
};
