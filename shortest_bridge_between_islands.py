from collections import deque

input_1 = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1]
]
directions = [
    (0,1),
    (1,0),
    (0,-1),
    (-1,0)
]
output_1 = 1
# assuming there are only two islands
input_2 = [
  [1,1,0,0,1],
  [1,1,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,1,1],
]
output_2 = 2
def dfs_mark_island(matrix, i, j, queue):
    # if i or j are outside the matrix indexes
    # or if the current cell is not an island (1)
    if i < 0 or i >= len(matrix) or j < 0 or j >= len(matrix[0]) or matrix[i][j] !=1:
        return
    matrix[i][j] = 2
    queue.append((i,j))
    for add_i, add_j in directions: 
        dfs_mark_island(matrix, i + add_i, j + add_j, queue)

def shortest_bridge(matrix):
    queue = deque()
    # here we mark the first island
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            if matrix[i][j] == 1:
                dfs_mark_island(matrix, i, j, queue)
                break
        # this line is made to stop the loop when the first island is all marked
        if queue:
            break
    steps = 0
    # here we explore all the paths from every point of the marked island
    # until we find the second island
    while queue:
        size = len(queue)
        for coordinates in range(size):
            x, y = queue.popleft()
            for add_x, add_y in directions:
                new_x = x + add_x
                new_y = y + add_y
                if 0 <= new_x < len(matrix) and 0 <= new_y < len(matrix[0]):
                    # here we assume that first island is marked with 2s
                    # so when we find a 1 we have found the second island
                    # the number of steps is the bridge length
                    if matrix[new_x][new_y] == 1:
                        return steps
                    elif matrix[new_x][new_y] == 0:
                        matrix[new_x][new_y] = 2
                        queue.append((new_x, new_y))

        steps += 1
    return -1


print(shortest_bridge(input_1) == output_1)
print(shortest_bridge(input_2) == output_2)