example_1 = [1,2,3,4]
example_2 = [1,2,3,None,4]
output_1 = "1(2(4))(3)"
output_2 = "1(2()(4))(3)"

def parentheses_concat(array):

    def depth_first_search_recursive(index):
        # this is to limit the recursion to the number of elements in the array
        if index >= len(array) or array[index] is None:
            return ""
        
        # this is to follow the nodes in the order of the array input
        left_index = 2*index + 1
        right_index = 2*index + 2

        left = depth_first_search_recursive(left_index)
        right = depth_first_search_recursive(right_index)

        # if this is a leaf, return the value only
        if left == ''  and right  =='':
            return str(array[index])
        
        # if left doesn't exists we have to keep an empty pair of parentheses
        if left == '':
            return str(array[index]) + "()" + "(" + right + ")"
        
        # if only left exists is not necessary to have the empty parentheses
        if right == '':
            return str(array[index]) + "(" + left + ")"
        
        # if both exists put the parent node with each child in parenthesis
        return str(array[index]) + "(" + left + ")(" + right + ")"
    
    # go throught the input array starting from the index 0
    return depth_first_search_recursive(0)

print(parentheses_concat(example_1) == output_1)
print(parentheses_concat(example_2) == output_2)

