def minimum_knight_moves(x_start: int, y_start: int, x_end: int, y_end: int) -> int:
    moves = 0
    options = [
        (1,2), (2,1),
        (-1,2), (-2,1),
        (1,-2), (2,-1),
        (-1,-2), (-2,-1)
    ]
    queue = [(x_start, y_start)]
    while queue:
        if (x_end, y_end) in queue:
            break
        for _ in range(len(queue)):
            # important: here we use FIFO to follow the order in which elements are added
            row, col = queue.pop(0)
            print(row, col)
            for option in options:
                row_delta, col_delta = option
                queue.append((row+row_delta, col+col_delta))
        moves += 1
    return moves

print(minimum_knight_moves(0,0,5,5) == 4)