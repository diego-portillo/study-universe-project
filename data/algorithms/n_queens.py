input_1 = 4
output_1 = [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]

def position_queens(board_size: int, current_list: list[int], boards: list[list[str]]) -> None:
    if len(current_list) == board_size:
        base_string = "." * board_size
        board = []
        for column_index in current_list:
            board.append(base_string[:column_index] + 'Q' + base_string[column_index+1:])
        boards.append(board)
        return
    for index in range(board_size):
        row = len(current_list)
        column = index
        has_diagonal = False
        for prev_row, prev_column in enumerate(current_list):
            if abs(row - prev_row) == abs(column - prev_column):
                has_diagonal = True
        if column not in current_list and has_diagonal is False:
            current_list.append(column)
            position_queens(board_size, current_list, boards)
            current_list.remove(column)

def n_queens(board_size: int) -> list[list[str]]:
    boards = []
    position_queens(board_size,[],boards)
    return boards

print(n_queens(input_1))
print(n_queens(input_1) == output_1)