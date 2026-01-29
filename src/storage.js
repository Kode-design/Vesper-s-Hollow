const Storage = {
    saveKey: 'vespers_hollow_save_v1',

    saveGame() {
        const data = {
            party: Game.party,
            // We only save party for now as they are the main "entities" the player cares about.
            // But we should also save other entities if we want persistence of the world state.
            // For this prototype, let's assume enemies reset on load or we just save the active level state.
            // Ideally, we serialize Game.entities.
            // Circular references? No, entities are simple objects.

            // Need to be careful about saving 'map' if it's huge, but here it's small.
            // Actually, the map is generated. If it's deterministic or static, we don't need to save it.
            // If we modified the map (opened doors), we should save that state or the whole map.

            flags: Game.flags,
            reputation: Game.reputation,
            camera: Game.camera,
            locationText: document.getElementById('location-text').innerText
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(data));
            UI.log("Game Saved.", 'success');
        } catch (e) {
            console.error(e);
            UI.log("Failed to save game.", 'error');
        }
    },

    loadGame() {
        const raw = localStorage.getItem(this.saveKey);
        if (!raw) {
            UI.log("No save found.", 'error');
            return;
        }

        try {
            const data = JSON.parse(raw);

            // Restore
            Game.party = data.party;
            Game.flags = data.flags || {};
            Game.reputation = data.reputation || {};
            Game.camera = data.camera || {x:0, y:0};

            if (data.locationText) {
                document.getElementById('location-text').innerText = data.locationText;
            }

            // Reconstruct entities list
            // This is tricky because we mix party and enemies in Game.entities.
            // For this prototype, let's just put the party back and maybe respawn enemies or
            // if we saved the full entity list, restore that.
            // Simplest:
            Game.entities = [...Game.party];

            // Add Charon back if he's supposed to be there?
            // Or if we saved the whole entities list.
            // Let's rely on "party" for player state and respawn standard NPCs for now,
            // OR improvement: Save full entities list.

            // If we modify Storage to save entities:
            // Game.entities = data.entities;
            // But we need to re-link references if any.

            // Let's stick to restoring Party + State, and re-init Map/World if needed.
            // Since we don't have multiple levels yet, we just reload the current level's base state
            // and inject the party.

            // Re-spawn Charon if not in party (he never is)
            // This is a bit hacky for a "generic" load, but fits the prototype.
            const charon = { id: 'charon', name: 'Charon', lineage: 'Bound', hp: 1000, maxHp: 1000, ap: 0, maxAp: 0, x: 15, y: 10, team: 'neutral' };
            // Check if we already talked?
            // Ideally, entities should be saved.

            Game.entities.push(charon);

            // UI
            UI.updatePartyFrames();
            UI.log("Game Loaded.", 'success');

            // Force redraw
            Game.active = true;
            document.getElementById('screen-creation').classList.add('hidden');
            document.getElementById('ui-layer').classList.remove('hidden');
            if (Game.map.length === 0) Engine.init(); // If loaded from fresh page

        } catch (e) {
            console.error(e);
            UI.log("Failed to load save.", 'error');
        }
    }
};
