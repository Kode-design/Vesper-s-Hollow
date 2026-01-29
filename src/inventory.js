const Inventory = {
    useItem(actor, itemKey, index) {
        const item = ITEMS[itemKey];
        if (!item) return;

        if (item.type === 'consumable') {
            if (item.effect === 'heal') {
                actor.hp = Math.min(actor.hp + item.value, actor.maxHp);
                UI.log(`${actor.name} used ${item.name}. Healed ${item.value} HP.`);
                VFX.spawnText(actor.x, actor.y, `+${item.value}`, 'green');
            }
            if (item.effect === 'restore_ap') {
                actor.ap = Math.min(actor.ap + item.value, actor.maxAp);
                UI.log(`${actor.name} used ${item.name}. Restored ${item.value} AP.`);
                VFX.spawnText(actor.x, actor.y, `+${item.value} AP`, 'yellow');
            }

            // Remove 1 instance
            actor.inventory.splice(index, 1);
            UI.updatePartyFrames();
            // If we had an inventory UI open, we'd update it here
            InventoryUI.render(actor);
        }
    }
};

const InventoryUI = {
    toggle(actor) {
        const el = document.getElementById('inventory-modal');
        if (el.style.display === 'block') {
            el.style.display = 'none';
        } else {
            this.render(actor);
            el.style.display = 'block';
        }
    },

    render(actor) {
        const el = document.getElementById('inventory-content');
        el.innerHTML = '';

        if (!actor.inventory || actor.inventory.length === 0) {
            el.innerHTML = '<div style="color:#888; font-style:italic;">Empty</div>';
            return;
        }

        actor.inventory.forEach((key, idx) => {
            const item = ITEMS[key];
            const div = document.createElement('div');
            div.className = 'inv-item';
            div.innerHTML = `
                <div class="inv-icon">${item.icon}</div>
                <div class="inv-info">
                    <div class="inv-name">${item.name}</div>
                    <div class="inv-desc">${item.desc}</div>
                </div>
                <button class="inv-use-btn" onclick="Inventory.useItem(Game.party[Game.playerIdx], '${key}', ${idx})">Use</button>
            `;
            el.appendChild(div);
        });
    }
};
