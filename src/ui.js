const UI = {
    log(msg, type='info') {
        const log = document.getElementById('combat-log');
        const div = document.createElement('div');
        div.className = 'log-msg';
        div.innerText = `> ${msg}`;
        if (type==='error') div.style.color = '#c0392b';
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    },

    updatePartyFrames() {
        const con = document.getElementById('party-frames');
        con.innerHTML = '';

        Game.party.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = `char-frame ${Game.playerIdx === idx ? 'active' : ''}`;
            div.onclick = () => {
                Game.playerIdx = idx;
                UI.updatePartyFrames();
                UI.updateActionBar();
            };

            let pips = '';
            for(let i=0; i<p.maxAp; i++) pips += `<div class="ap-pip ${i < p.ap ? 'filled' : ''}"></div>`;

            div.innerHTML = `
                <div class="char-portrait">${LINEAGES[p.lineage].icon}</div>
                <div class="char-details">
                    <div class="char-name">${p.name}</div>
                    <div class="bar-container"><div class="hp-fill" style="width:${(p.hp/p.maxHp)*100}%"></div></div>
                    <div class="ap-pips">${pips}</div>
                </div>
            `;
            con.appendChild(div);
        });
        this.updateActionBar();
    },

    updateActionBar() {
        const actor = Game.party[Game.playerIdx];
        if (!actor) return;

        // We have slots for skills. 1 is Move, 2 is Attack. 3+ are skills.
        // But for now, let's just repurpose "btn-skill1"
        const skillBtn = document.getElementById('btn-skill1');
        const skillId = LINEAGES[actor.lineage].skills[0]; // Use first skill for now
        const skillData = SKILLS[skillId];

        if (skillData) {
            skillBtn.innerHTML = `${skillData.icon} <div class="key-hint">3</div>`;

            // IMPORTANT: We must set the onclick to call Engine.setMode with the SPECIFIC skillId
            // The previous issue was likely that the Engine.setMode was not updating the Game.mode correctly
            // or the UI update wasn't reflecting it immediately.

            skillBtn.onclick = () => {
                Engine.setMode(skillId);
                // Force UI update to show active state immediately
                UI.updateActionBar();
            };

            skillBtn.title = `${skillData.name}: ${skillData.desc} (${skillData.ap} AP)`;

            // Update active state visual
            if (Game.mode === skillId) skillBtn.classList.add('active');
            else skillBtn.classList.remove('active');
        }

        // Update Move/Attack active state
        document.getElementById('btn-move').classList.toggle('active', Game.mode === 'move');
        document.getElementById('btn-attack').classList.toggle('active', Game.mode === 'attack');
    }
};
