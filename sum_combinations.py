input_1A = [2,3,6,7]
input_1B = 7
output_1 =  [[2,2,3],[7]]

def create_combinations(options, target, current_combination, combinations, index=0):
    current_sum = 0
    for number in current_combination:
        current_sum += number
    if current_sum == target:
        combinations.append(current_combination[:])
        return
    if current_sum > target:
        return
    for i in range(index, len(options)):
        current_combination.append(options[i])
        create_combinations(options, target, current_combination, combinations, i)
        current_combination.pop()
    return

def sum_combinations(options, target):
    combinations = []
    create_combinations(options, target, [], combinations)
    return combinations
    

print(sum_combinations(input_1A, input_1B))
print(sum_combinations(input_1A, input_1B)==output_1)