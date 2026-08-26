sample_grid = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
]
output = 1

def count_closed_islands(grid: list[list[int]]) -> int:
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
                row, col = stack.pop()
                if row < 0 or row >= rows or col < 0 or col >= cols or grid[row][col] != 0:
                    continue
                grid[row][col] = 2  # visited
                if row == 0 or row == rows - 1 or col == 0 or col == cols - 1:
                    touches_border = True
                stack.append((row + 1, col))
                stack.append((row - 1, col))
                stack.append((row, col + 1))
                stack.append((row, col - 1))
            # Count only if the island never touched the border (fully surrounded by water/1s)
            if not touches_border:
                count += 1
    return count

print(count_closed_islands(sample_grid) == output)