input_1 = [
    ["X",".", "X"],
    ["X",".", "X"],
    ["X",".", "X"]
]
output_1 = 2
input_2 = [["."]]
output_2 = 0

def count_ships(table: list[list[str]]) -> int:
    count = 0
    for i in range(len(table)):
        for j in range(len(table[i])):
            if table[i][j] == 'X':
                count += 1
                stack = [(i, j)]
                while stack:
                    row, col = stack.pop()
                    if 0 <= row < len(table) and 0 <= col < len(table[row]) and table[row][col] == 'X':
                        table[row][col] = 'o'
                        stack.append((row+1,col))
                        stack.append((row, col+1))

    return count

print(count_ships(input_1) == output_1)
print(count_ships(input_2) == output_2)