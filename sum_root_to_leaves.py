binary_tree_25 = {
    "value": 1,
    "left": 
        {
            "value": 2,
            "left": None,
            "right": None
        },
    "right":    
        {
            "value": 3,
            "left": None,
            "right": None
        }
}
binary_tree_444 = {
    "value": 1,
    "left": 
        {
            "value": 3,
            "left": 
                {
                    "value": 5,
                    "left": None,
                    "right": None
                }
            ,
            "right": 
                {
                    "value": 8,
                    "left": None,
                    "right": None
                }
        }
        ,
    "right": 
        { 
            "value": 7,
             "left": None,
             "right": 
                { 
                    "value": 1,
                    "left": None,
                    "right": None
                }
        }
}

sum = 0
def sum_values(tree, collection= []):
    global sum
    if tree['value']:
        collection.append(tree['value'])
        print(f'value {tree['value']} and collection {collection}')
    if tree['right'] is not None:
        # pass a copy instead of the same list to genetare separate paths
        # that's why we add the [:] symbol
        sum_values(tree['right'], collection[:])
    if tree['left'] is not None:
        # pass a copy instead of the same list to genetare separate paths
        # that's why we add the [:] symbol
        sum_values(tree['left'], collection[:])
    if tree['right'] is None and tree['left'] is None and len(collection) > 0:
        leaf_value = int("".join(map(str, collection)))
        print(f'Leaf {leaf_value}')
        sum += leaf_value
        return
    return

sum_values(binary_tree_444)
print(sum)