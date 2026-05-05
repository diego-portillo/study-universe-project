input_1 =  [
    ["X",".", "X"],
    ["X",".", "X"],
    ["X",".", "X"]
]
output_1 = 2
input_2 = [["."]]
output_2 = 0

def count_ships(table):
    count = 0
    for i in range(len(table)):
        for j in range(len(table[i])):
            if table[i][j] == 'X':
                count += 1
                stack = [(i, j)]
                while stack:
                    r, c = stack.pop()
                    if 0 <= r < len(table) and 0 <= c < len(table[r]) and table[r][c] == 'X':
                        table[r][c] = 'o'
                        stack.append((r+1,c))
                        stack.append((r, c+1))
                        
    return count

print(count_ships(input_1) == output_1)
print(count_ships(input_2) == output_2)