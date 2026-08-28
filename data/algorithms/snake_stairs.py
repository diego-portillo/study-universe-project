from collections import deque

board = [
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,17,-1,-1,13,-1],
    [-1,-1,-1,-1,-1,-1],
    [-1,14,-1,-1,-1,-1]
]

output = 4

# the order starts from bottom left corner
# moves to right and when going up the movements go to the left
# switching horizontal direction on each row escalated to the top of the board
def get_position(index: int, board: list[list[int]]) -> tuple[int, int]:
    board_size = len(board)
    row_from_bottom = (index-1) // board_size
    row_index = board_size - row_from_bottom - 1
    column_index = (
        (index-1) % board_size
        if row_from_bottom % 2 == 0
        else board_size - 1 - (index-1) % board_size
    )
    return (row_index, column_index)

print(get_position(7, board))

def min_movements_to_last_cell(board: list[list[int]]) -> int:
    visited = {1}
    # we always start from cell 1 with 0 steps
    queue = deque([(1,0)])
    # assuming is always n x n
    board_size = len(board)
    last_cell = board_size * board_size
    while queue:
        cell, step = queue.popleft()
        if cell == last_cell:
            return step
        row, column = get_position(cell, board)
        # for a dice with 6 sides
        minimum_move = cell+1
        maximum_move = cell+6
        # see that the movement doesn't exceed the board range
        board_limit = min(maximum_move, last_cell)
        # range in python excludes the second value
        # that's why we add +1
        for option in range(minimum_move, board_limit+1):
            new_row, new_column = get_position(option, board)
            new_cell = board[new_row][new_column]
            if new_cell == -1 and option not in visited:
                queue.append((option, step+1))
                visited.add(option)
            elif new_cell != -1 and new_cell not in visited:
                queue.append((new_cell, step+1))
                visited.add(new_cell)

    return -1

print(min_movements_to_last_cell(board)==output)