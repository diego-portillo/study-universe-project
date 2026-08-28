input_1 = [1,2,3]
output_1 = [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
input_2 = [0,1]
output_2 = [[0,1],[1,0]]

def generate_permutations_recursively(
    numbers: list[int], permutation: list[int], permutations: list[list[int]]
) -> list[list[int]]:
    if len(permutation) == len(numbers) and permutation not in permutations:
        permutations.append(permutation[:])
        return
    for number in numbers:
        if number not in permutation:
            permutation.append(number)
            generate_permutations_recursively(numbers, permutation, permutations)
            permutation.pop()
    return permutations

def get_permutations(numbers: list[int]) -> list[list[int]]:
    permutations = []
    generate_permutations_recursively(numbers, [], permutations)
    return permutations

print(get_permutations(input_1))
print(get_permutations(input_2))
print(get_permutations(input_1)==output_1)
print(get_permutations(input_2)==output_2)