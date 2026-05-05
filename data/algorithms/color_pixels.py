image = [
    [1,1,1],
    [1,1,0],
    [1,0,1]
]

expected_result = [
    [2,2,2],
    [2,2,0],
    [2,0,1]
]

expected_result_2 = [
    [0,0,0],
    [0,0,0]
]

def paint_image(image, sr, sc, new_color):
    start_color = image[sr][sc]
    if start_color == new_color:
        return image
    
    def dfs(i, j):
        # avoid out of limit error
        if not (0 <= i <len(image) and 0 <= j < len(image[i])):
            return  
        
        # avoid repainting
        if image[i][j] != start_color:
            return
        
        image[i][j] = new_color

        dfs(i+1,j)
        dfs(i-1,j)
        dfs(i,j+1)
        dfs(i,j-1)
        
    dfs(sr, sc)
    return image

print(paint_image(image, 0, 0, 2) == expected_result)
print(paint_image(expected_result_2,0,0,2) == expected_result_2)