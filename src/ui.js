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
            div.onclick = () => { Game.playerIdx = idx; UI.updatePartyFrames(); };

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
    }
};
