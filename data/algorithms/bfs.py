tree = {
    "value": 1,
    "children": [
        {"value": 2, "children": []},
        {
            "value": 3,
            "children": [
                {"value": 5, "children": []},
                {
                    "value": 6,
                    "children": [
                        {"value": 8, "children": []},
                        {"value": 9, "children": []},
                    ],
                },
            ],
        },
        {
            "value": 4,
            "children": [
                {"value": 7, "children": []},
            ],
        },
    ],
}


def traverse_breadth_first(root: dict) -> list:
    if not root:
        return []
    response = []
    queue = [root]
    level = 1
    while queue:
        for node in range(len(queue)):
            current_node = queue.pop(0)
            print(current_node["value"])
            response.append(current_node["value"])
            # n-ary tree
            # on each repetition we add the children to the queue
            # so in that order we visit the neighbor nodes first
            # instead of child nodes first
            for child in current_node["children"]:
                queue.append(child)
        level += 1
        # now that the neighbor nodes in this level were visited
        # the while loop moves to the child nodes of these level
    print(response)
    return response

print(traverse_breadth_first(tree) == [1,2,3,4,5,6,7,8,9])
