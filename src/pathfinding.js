const Pathfinding = {
    findPath(start, end, map) {
        // Simple A* implementation
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const startKey = `${start.x},${start.y}`;
        const endKey = `${end.x},${end.y}`;

        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, end));

        openSet.push(start);

        while (openSet.length > 0) {
            // Get node with lowest fScore
            let current = openSet.reduce((a, b) =>
                (fScore.get(`${a.x},${a.y}`) || Infinity) < (fScore.get(`${b.x},${b.y}`) || Infinity) ? a : b
            );

            const currentKey = `${current.x},${current.y}`;
            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(cameFrom, current);
            }

            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(currentKey);

            const neighbors = this.getNeighbors(current, map);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                if (closedSet.has(neighborKey)) continue;

                // Cost is 1 for normal movement
                const tentGScore = (gScore.get(currentKey) || 0) + 1;

                if (tentGScore < (gScore.get(neighborKey) || Infinity)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentGScore);
                    fScore.set(neighborKey, tentGScore + this.heuristic(neighbor, end));

                    if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        return null; // No path
    },

    heuristic(a, b) {
        // Manhattan distance for grid
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },

    getNeighbors(node, map) {
        const dirs = [
            {x:0, y:-1}, {x:0, y:1},
            {x:-1, y:0}, {x:1, y:0}
        ];
        const result = [];

        for (const d of dirs) {
            const nx = node.x + d.x;
            const ny = node.y + d.y;

            // Bounds check
            if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length) {
                const tile = map[ny][nx];
                // Collision check (water, walls)
                // Assuming entities block path? For now, let's say dynamic entities block path
                // But we need access to entities list. For this basic version, just map tiles.
                if (tile.type !== 'water' && tile.type !== 'wall') {
                    // Also check if an entity is there (except the target, maybe?)
                    // For strict A*, we should block occupied tiles.
                    if (!this.isBlockedByEntity(nx, ny)) {
                        result.push({x: nx, y: ny});
                    }
                }
            }
        }
        return result;
    },

    isBlockedByEntity(x, y) {
        // We need access to Game.entities. simpler to pass it or access global
        // However, we usually want to be able to click on an enemy to attack,
        // but for MOVEMENT, we can't walk through them.
        // If the target is the endpoint, we might want to allow it if we are calculating range,
        // but for "Move To", we can't move ONTOP of them.

        if (typeof Game === 'undefined') return false; // Safety

        return Game.entities.some(e => e.x === x && e.y === y && e.hp > 0);
    },

    reconstructPath(cameFrom, current) {
        const totalPath = [current];
        let currentKey = `${current.x},${current.y}`;
        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = `${current.x},${current.y}`;
            totalPath.unshift(current);
        }
        return totalPath;
    }
};
