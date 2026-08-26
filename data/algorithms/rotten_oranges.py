from collections import deque
from concurrent.futures import ThreadPoolExecutor

input_1 = [
    [2,1,1],
    [1,1,0],
    [0,1,1]
]
output_1 = 4

def days_for_rot(crop: list[list[int]]) -> int:
    flat_crop = [cell for row in crop for cell in row]
    # better than a python list because
    # it doesn't shift the position of all elements
    # when calling .pop() method.
    queue = deque()
    for i in range(len(flat_crop)):
        if flat_crop[i] == 2:
            queue.append((i, 0))
    visited = set()
    days_array = []
    rows = len(crop)
    cols = len(crop[0])
    while queue:
        i, day = queue.popleft()
        print(i,day)
        if i not in visited:
            visited.add(i)
            days_array.append(day)
            row = i // cols
            col = i % cols
            down = (row+1) * cols + col
            up = (row-1) * cols + col
            right = row * cols + (col+1)
            left = row * cols + (col-1)

            if rows > row+1 and flat_crop[down] == 1:
                flat_crop[down] = 2
                queue.append((down, day+1))
            if row-1 >= 0 and flat_crop[up] == 1:
                flat_crop[up] = 2
                queue.append((up, day+1))
            if cols > col+1 and flat_crop[right] == 1:
                flat_crop[right] = 2
                queue.append((right, day+1))
            if col-1 >= 0 and flat_crop[left] == 1:
                flat_crop[left] = 2
                queue.append((left, day+1))

    if 1 in flat_crop:
        return -1
    days = max(days_array)
    print('days', days)
    print(flat_crop)
    return days

# Si la configuración de naranjas inicial es inédita, ¿cómo podrías prever la posición inicial óptima para la propagación?
# Meaning if no orange is rotten, initial position will propagate the plague faster?

def find_optimal_propagation(crop: list[list[int]]) -> list[tuple[int, int]]:
    clean_crop = [[1 if cell == 2 else cell for cell in row] for row in crop]
    positions = []
    for i in range(len(crop)):
        for j in range(len(crop[i])):
            if clean_crop[i][j] == 1:
                positions.append(((i, j), 0))
    max_steps = []
    with ThreadPoolExecutor() as executor:
        max_steps = list(executor.map(count_max_days, [(position, crop) for position in positions]))
    print('max steps', max_steps)
    min_element = min(item[1] for item in max_steps if item[1] > 0)
    print('min_element', min_element)
    optimal_positions_with_steps = [item for item in max_steps if item[1] == min_element]
    print('optimal_positions_with_steps',optimal_positions_with_steps)
    return optimal_positions_with_steps

input_2 = [
    [1,1,0],
    [0,1,0],
    [0,1,1]
]

def count_max_days(args: tuple[tuple[int, int], list[list[int]]]) -> tuple[int, int]:
    (position, crop) = args
    queue = [position]
    visited = set()
    while queue:
        (row, col), step = queue.pop(0)
        print(row,col,step)
        if (row,col) not in visited:
            visited.add((row,col))
            if len(crop) > row+1 and crop[row+1][col] == 1:
                queue.append(((row+1,col),step+1))
            if crop[row-1][col] == 1 and row -1 >= 0:
                queue.append(((row-1,col), step+1))
            if len(crop[row]) > col+1 and crop[row][col+1] == 1:
                queue.append(((row,col+1), step+1))
            if crop[row][col-1] == 1 and col-1 >= 0:
                queue.append(((row,col-1), step+1))
    return (position[0], step)
find_optimal_propagation(input_2)