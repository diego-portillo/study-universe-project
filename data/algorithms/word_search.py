word = "ABCCED"
matrix = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"]
]

def find_word_in_matrix(word: str, matrix: list[list[str]]) -> bool:
    for row in range(len(matrix)):
        for col in range(len(matrix[row])):
            if recursive_search((row, col), word, matrix, "", set()):
                return True
    return False

def recursive_search(
    location: tuple[int, int],
    word: str,
    matrix: list[list[str]],
    sequence: str,
    visited: set,
) -> bool | None:
    row, col = location
    if row < 0 or row == len(matrix) or col < 0 or col == len(matrix[row]):
        return False

    print("current sequence", sequence)
    print("current location", row, col)
    if sequence == word:
        return True
    # avoid exceeding the matrix limits
    next_letter_index = len(sequence)
    print("current letter", matrix[row][col])
    print("next letter", word[next_letter_index])
    if matrix[row][col] == word[next_letter_index] and location not in visited:
        visited.add(location)
        sequence += matrix[row][col]
        print("new sequence", sequence)
        directions = [(-1,0),(1,0),(0,-1),(0,1)]
        for direction in directions:
            row_delta, col_delta = direction
            if recursive_search((row+row_delta, col+col_delta), word, matrix, sequence, visited):
                return True
        # this is the most important part, where the actual backtracking occurs
        visited.remove(location)
    

print(find_word_in_matrix(word, matrix))