export function orangesRotting(cultivo) {
    let queue = [];
    let visited = new Set();
    let days = [];
    let freshCount = 0;
    const rows = cultivo.length;
    const columns = cultivo[0].length;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (cultivo[i][j] === 2) {
                queue.push([`${i},${j}`, 0]);
            } else if (cultivo[i][j] === 1) {
                freshCount++;
            }
        }
    }

    if (freshCount === 0) return 0;

    while (queue.length > 0) {
        const [coordinates, step] = queue.shift();
        const [x, y] = coordinates.split(',').map(Number);

        if (!visited.has(coordinates)) {
            visited.add(coordinates);
            const right = [x+1, y];
            const left  = [x-1, y];
            const up    = [x, y+1];
            const down  = [x, y-1];

            if (right[0] >= 0 && right[0] < rows && right[1] >= 0 && right[1] < columns && cultivo[right[0]][right[1]] === 1) {
                cultivo[right[0]][right[1]] = 2;
                freshCount--;
                queue.push([`${right[0]},${right[1]}`, step + 1]);
            }

            if (left[0] >= 0 && left[0] < rows && left[1] >= 0 && left[1] < columns && cultivo[left[0]][left[1]] === 1) {
                cultivo[left[0]][left[1]] = 2;
                freshCount--;
                queue.push([`${left[0]},${left[1]}`, step + 1]);
            }

            if (up[0] >= 0 && up[0] < rows && up[1] >= 0 && up[1] < columns && cultivo[up[0]][up[1]] === 1) {
                cultivo[up[0]][up[1]] = 2;
                freshCount--;
                queue.push([`${up[0]},${up[1]}`, step + 1]);
            }

            if (down[0] >= 0 && down[0] < rows && down[1] >= 0 && down[1] < columns && cultivo[down[0]][down[1]] === 1) {
                cultivo[down[0]][down[1]] = 2;
                freshCount--;
                queue.push([`${down[0]},${down[1]}`, step + 1]);
            }

            days.push(step);
        }
    }

    if (freshCount !== 0) return -1;

    return days.length > 0 ? Math.max(...days) : 0;
}