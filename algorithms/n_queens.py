input_1 = 4
output_1 =  [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]

def position_queens(n, current_list, boards):
    if len(current_list) == n:
        base_string = "." * n
        board = []
        for column_index in current_list:
            board.append(base_string[:column_index] + 'Q' + base_string[column_index+1:])
        boards.append(board)
        return
    for index in range(n):
        row = len(current_list)
        column = index
        has_diagonal = False
        for prev_row, prev_column in enumerate(current_list):
            if abs(row - prev_row) == abs(column - prev_column):
                has_diagonal = True
        if column not in current_list and has_diagonal is False:
            current_list.append(column)
            position_queens(n, current_list, boards)
            current_list.remove(column)

def n_queens(n):
    boards = []
    position_queens(n,[],boards)
    return boards
        
print(n_queens(input_1))
print(n_queens(input_1) == output_1)