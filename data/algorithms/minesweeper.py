# Test 1: Click on empty cell with no adjacent mines (triggers BFS cascade)
board1 = [
    ["E", "E", "E", "E", "E"],
    ["E", "E", "M", "E", "E"],
    ["E", "E", "E", "E", "E"],
    ["E", "E", "E", "M", "E"],
    ["E", "E", "E", "E", "E"]
]
click1 = [0, 0]

# Test 2: Click directly on a mine
board2 = [
    ["E", "E", "E"],
    ["E", "M", "E"],
    ["E", "E", "E"]
]
click2 = [1, 1]

# Test 3: Click on empty cell adjacent to a mine (no cascade, just digit)
board3 = [
    ["E", "E", "E"],
    ["E", "M", "E"],
    ["E", "E", "E"]
]
click3 = [0, 0]

# Test 4: Click on a cell surrounded by multiple mines
board4 = [
    ["M", "M", "M"],
    ["M", "E", "M"],
    ["M", "M", "M"]
]
click4 = [1, 1]

# Test 5: Single cell board - empty
board5 = [["E"]]
click5 = [0, 0]

# Test 6: Single cell board - mine
board6 = [["M"]]
click6 = [0, 0]

# Test 7: Large board with mines clustered, click far away (big BFS cascade)
board7 = [
    ["E", "E", "E", "E", "E", "E", "E"],
    ["E", "E", "E", "E", "E", "E", "E"],
    ["E", "E", "E", "E", "E", "E", "E"],
    ["E", "E", "E", "E", "M", "M", "E"],
    ["E", "E", "E", "E", "M", "E", "E"],
    ["E", "E", "E", "E", "E", "E", "E"]
]
click7 = [0, 0]

# Test 8: Already partially revealed board, click on unrevealed empty cell
board8 = [
    ["B", "1", "E"],
    ["B", "1", "M"],
    ["B", "1", "E"]
]
click8 = [0, 2]

# Test 9: Click on border cell with adjacent mine
board9 = [
    ["E", "M", "E", "E"],
    ["E", "E", "E", "E"],
    ["E", "E", "M", "E"],
    ["E", "E", "E", "E"]
]
click9 = [0, 0]

# Test 10: All mines except one cell
board10 = [
    ["M", "M", "M"],
    ["M", "E", "M"],
    ["M", "M", "M"]
]
click10 = [1, 1]

directions = [ 
        (0,1),(0,-1),(1,0),(-1,0),
        (-1,1),(1,1),(1,-1),(-1,-1)
    ]

def count_adjacent_mines(board: list[list[str]], click: list[int]) -> list[tuple[int, int]]:
    mines = []
    for direction in directions:
        row = click[0] + direction[0]
        col = click[1] + direction[1]
        is_inside_bounds = 0 <= row < len(board) and 0 <= col < len(board[row])
        if is_inside_bounds and board[row][col] == 'M':
            mines.append((row,col))
    return mines

def bfs_minesweeper(board: list[list[str]], click: list[int]) -> list[list[str]]:
    row = click[0]
    col = click[1]
    if board[row][col] == 'M':
        board[row][col] = 'X'
        return board
    adjacent_mines = count_adjacent_mines(board, click)
    if len(adjacent_mines) > 0:
        board[row][col] = str(len(adjacent_mines))
    elif len(adjacent_mines) == 0:
        board[row][col] = 'B'
        queue = []
        visited = set()
        for direction in directions:
            row = click[0] + direction[0]
            col = click[1] + direction[1]
            is_inside_bounds = 0 <= row < len(board) and 0 <= col < len(board[row])
            if is_inside_bounds and board[row][col] == 'E':
                queue.append((row,col))
        while queue:
            i, j = queue.pop(0)
            if (i,j) not in visited:
                visited.add((i,j))
                adjacent_mines = count_adjacent_mines(board, [i,j])
                if len(adjacent_mines) > 0:
                    board[i][j] = str(len(adjacent_mines))
                elif len(adjacent_mines) == 0:
                    board[i][j] = 'B'
                    for direction in directions:
                        next_row = i + direction[0]
                        next_col = j + direction[1]
                        is_inside_bounds = 0 <= next_row < len(board) and 0 <= next_col < len(board[next_row])
                        if is_inside_bounds and board[next_row][next_col] == 'E':
                            queue.append((next_row,next_col))

    return board

print(bfs_minesweeper(board1,click1))
print(bfs_minesweeper(board2,click2))
print(bfs_minesweeper(board3,click3))
print(bfs_minesweeper(board4,click4))
print(bfs_minesweeper(board5,click5))
print(bfs_minesweeper(board6,click6))
print(bfs_minesweeper(board7,click7))
print(bfs_minesweeper(board8,click8))
print(bfs_minesweeper(board9,click9))
print(bfs_minesweeper(board10,click10))