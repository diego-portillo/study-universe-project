three_islands_matrix = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [0,0,1,0,1],
    [1,0,1,1,1],
]

def count_islands(islands_matrix):
    count = 0
    rows_range = len(islands_matrix)
    for row_index in range(rows_range):
        columns_range = len(islands_matrix[row_index])
        for column_index in range(columns_range):
            if islands_matrix[row_index][column_index] == 1:
                recursive_depth_first_search(row_index, column_index, islands_matrix)
                count+=1
    return count

def recursive_depth_first_search(i, j, map):
    if 0 <= i < len(map) and 0 <= j < len(map[0]) and map[i][j] == 1:
        map[i][j] = 2
        recursive_depth_first_search(i+1,j, map)
        recursive_depth_first_search(i-1,j, map)
        recursive_depth_first_search(i,j+1, map)
        recursive_depth_first_search(i,j-1, map)

def count_islands_iterative(islands_map):
    if not islands_map:
        return 0
    count = 0
    rows = len(islands_map)
    cols = len(islands_map[0])
    for i in range(rows):
        for j in range(cols):
            if islands_map[i][j] == 1:        
                count += 1
                stack = [(i, j)]
                while stack:
                    row, col = stack.pop()
                    if 0 <= row < rows and 0 <= col < cols and islands_map[row][col] ==1:
                        islands_map[row][col] = 2
                        stack.append((row + 1, col))
                        stack.append((row - 1, col))
                        stack.append((row, col + 1))
                        stack.append((row, col - 1))
    return count
print(count_islands_iterative(three_islands_matrix))