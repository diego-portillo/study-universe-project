def minimum_knight_moves(x_start, y_start, x_end, y_end):
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
        for coordinates in range(len(queue)):
            # important: here we use FIFO to follow the order in which elements are added
            x, y = queue.pop(0)
            print(x, y)
            for option in options:
                x_add, y_add = option
                queue.append((x+x_add, y+y_add))
        moves += 1
    return moves

print(minimum_knight_moves(0,0,5,5) == 4)