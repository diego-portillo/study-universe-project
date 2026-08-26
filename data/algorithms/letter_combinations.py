input_1 = "a1b2"
output_1 = ["a1b2","a1B2","A1b2","A1B2"]
input_2 = "3z4"
output_2 = ["3z4", "3Z4"]


def generate_combinations_recursively(
    base_string: str, combination: str, combinations: list[str], index: int = 0
) -> list[str]:
    if len(combination) == len(base_string) and combination not in combinations:
        combinations.append(combination[:])
        return
    for i in range(index, len(base_string)):
        if base_string[i].isalpha():
            combination += base_string[i].lower()
            generate_combinations_recursively(base_string, combination, combinations, i+1)
            combination = combination[:-1]
            combination += base_string[i].upper()
            generate_combinations_recursively(base_string, combination, combinations, i+1)
            combination = combination[:-1]
        elif base_string[i].isdigit():
            combination += base_string[i]
            generate_combinations_recursively(base_string, combination, combinations, i+1)
            combination = combination[:-1]
    return combinations

def get_letter_combinations(string: str) -> list[str]:
    letter_combinations = []
    generate_combinations_recursively(string, "", letter_combinations)
    return letter_combinations

print(get_letter_combinations(input_2))
print(get_letter_combinations(input_1))
print(get_letter_combinations(input_1)==output_1)
print(get_letter_combinations(input_2)==output_2)