word = "ABCCED"
matrix = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"]
]

def find_word_in_matrix(word, matrix):
    for x in range(len(matrix)):
        for y in range(len(matrix[x])):
            if recursive_search((x, y), word, matrix, "", set())==True:
                return True
    return False

def recursive_search(location, word, matrix, sequence, visited):
    x, y  = location
    if x < 0 or x == len(matrix) or y < 0 or y == len(matrix[x]):
        return False

    print("current sequence", sequence)
    print("current location", x, y)
    if sequence == word:
        return True
    # avoid exceeding the matrix limits
    next_letter_index = len(sequence)
    print("current letter", matrix[x][y])
    print("next letter", word[next_letter_index])
    if matrix[x][y] == word[next_letter_index] and location not in visited:
        visited.add(location)
        sequence += matrix[x][y]
        print("new sequence", sequence)
        directions = [(-1,0),(1,0),(0,-1),(0,1)]
        for direction in directions:
            i,j = direction
            if recursive_search((x+i, y+j), word, matrix, sequence, visited) == True:
                return True
        # this is the most important part, where the actual backtracking occurs
        visited.remove(location)
    

print(find_word_in_matrix(word, matrix))