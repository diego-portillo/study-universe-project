from collections import deque 
from concurrent.futures import ThreadPoolExecutor

input_1 = [
    [2,1,1],
    [1,1,0],
    [0,1,1]
]
output_1 = 4

def days_for_rot(crop):
    flat_crop = [cell for row in crop for cell in row]
    # better than python list because
    # it doesnt shift the position of all elements
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
            x = i // cols
            y = i % cols
            down  = (x+1) * cols + y
            up    = (x-1) * cols + y
            right = x * cols + (y+1)
            left  = x * cols + (y-1)

            if rows > x+1 and flat_crop[down] == 1:
                flat_crop[down] = 2
                queue.append((down, day+1))
            if x-1 >= 0 and flat_crop[up] == 1:
                flat_crop[up] = 2
                queue.append((up, day+1))
            if cols > y+1 and flat_crop[right] == 1:
                flat_crop[right] = 2
                queue.append((right, day+1))
            if y-1 >= 0 and flat_crop[left] == 1:
                flat_crop[left] = 2
                queue.append((left, day+1))

    if 1 in flat_crop:
        return -1
    days = max(days_array)
    print('days', days)
    print(flat_crop)
    return days

# print(days_for_rot(input_1)==output_1)

# Si la configuración de naranjas inicial es inédita, ¿cómo podrías prever la posición inicial óptima para la propagación?
# Meaning if no orange is rotten, initial position will propage the plague faster?

def find_optimal_propagation(crop):
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

def count_max_days(args):
    (position, crop) = args
    queue = [position]
    visited = set()
    while queue:
        (x, y), step = queue.pop(0)
        print(x,y,step)
        if (x,y) not in visited:
            visited.add((x,y))
            if len(crop) > x+1 and crop[x+1][y] == 1:
                queue.append(((x+1,y),step+1))
            if crop[x-1][y] == 1 and x -1 >= 0:
                queue.append(((x-1,y), step+1))
            if len(crop[x]) > y+1 and crop[x][y+1] == 1:
                queue.append(((x,y+1), step+1))
            if crop[x][y-1] == 1 and y-1 >= 0:
                queue.append(((x,y-1), step+1))
    return (position[0], step)
find_optimal_propagation(input_2)