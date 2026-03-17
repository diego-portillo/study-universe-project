numbers = "23"
result = [
    "ad", "ae", "af",
    "bd", "be", "bf",
    "cd", "ce", "cf",
]
numbers_dict = {
    2: "abc",
    3: "def",
    4: "ghi",
    5: "jkl",
    6: "mno",
    7: "pqrs",
    8: "tuv",
    9: "wxyz"
}

def posible_letters_for_number(numbers):
    result = []
    combination = ""
    backtrack(0, combination, numbers_dict, result, numbers)
    return result

def backtrack(index, current_combination, numbers_dict, result, numbers):
    if index == len(numbers):
        result.append(current_combination)
        return result
    for letter in numbers_dict[int(numbers[index])]:
        current_combination += letter
        backtrack(index +1, current_combination, numbers_dict, result, numbers)
        current_combination = current_combination[:-1]

print(posible_letters_for_number(numbers)==result)