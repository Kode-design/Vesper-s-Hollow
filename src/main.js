// --- INIT HELPERS ---
function selectLineage(l) {
    document.querySelectorAll('.race-btn').forEach(b => b.classList.remove('selected'));
    // In real app, bind click target properly. Hack for prototype:
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    document.getElementById('lore-title').innerText = l;
    document.getElementById('lore-preview').innerHTML = LINEAGES[l].desc + `<br><br><strong>Ability:</strong> ${LINEAGES[l].skill}`;

    // Store temp selection
    window.selectedLineage = l;
}

function startGame() {
    const name = document.getElementById('inp-name').value;
    const lin = window.selectedLineage || 'Umbra';

    const hero = {
        id: 'hero',
        name: name,
        lineage: lin,
        hp: 100, maxHp: 100,
        ap: 3, maxAp: 3,
        x: 18, y: 10,
        team: 'player',
        inventory: ['potion_hp', 'potion_hp', 'potion_ap']
    };

    Game.party.push(hero);
    Game.entities.push(hero);

    // Spawn Charon
    Game.entities.push({
        id: 'charon', name: 'Charon', lineage: 'Bound', hp: 1000, maxHp: 1000, ap: 0, maxAp: 0, x: 15, y: 10, team: 'neutral'
    });

    document.getElementById('screen-creation').classList.add('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');

    Game.active = true;
    UI.updatePartyFrames();
    UI.log("Welcome to the Crossing.");
    Engine.init();
}
