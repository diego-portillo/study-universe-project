input = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
]
output = 1

def count_closed_islands(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0

    for i in range(rows):
        for j in range(cols):
            if grid[i][j] != 0:  # 0 = land (island)
                continue
            # Explore this island (connected 0s) with BFS
            stack = [(i, j)]
            touches_border = False
            while stack:
                r, c = stack.pop()
                if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 0:
                    continue
                grid[r][c] = 2  # visited
                if r == 0 or r == rows - 1 or c == 0 or c == cols - 1:
                    touches_border = True
                stack.append((r + 1, c))
                stack.append((r - 1, c))
                stack.append((r, c + 1))
                stack.append((r, c - 1))
            # Count only if the island never touched the border (fully surrounded by water/1s)
            if not touches_border:
                count += 1
    return count

print(count_closed_islands(input) == output)