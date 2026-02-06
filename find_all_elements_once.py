graph = {
    'A': ['B', 'C'],
    'B': ['D', 'E'],
    'C': ['F'],
    'D': [],
    'E': ['F'],
    'F': []
}

def recursive_dfs(graph, start_node, visited=None):
    if visited is None:
        visited = set()

    # Mark the current node as visited and print it
    if start_node not in visited:
        print(start_node, end=' ')
        visited.add(start_node)

        # Recurse on all unvisited neighbors
        for neighbor in graph[start_node]:
            if neighbor not in visited:
                recursive_dfs(graph, neighbor, visited)
    
    return visited

# Example usage:
print("Recursive DFS:")
recursive_dfs(graph, 'A')
# Expected output (order may vary based on adjacency list order): A B D E F C 
def iterative_dfs(graph, start_node):
    # Use a list as a stack
    stack = [start_node]
    visited = set()

    while stack:
        # Pop a vertex from the stack
        current_node = stack.pop()

        # If the node has not been visited yet
        if current_node not in visited:
            print(current_node, end=' ')
            visited.add(current_node)

            # Push all unvisited neighbors onto the stack
            # Pushing in reverse order of desired traversal can ensure a consistent order
            for neighbor in reversed(graph[current_node]): 
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return visited

# Example usage:
print("\nIterative DFS:")
iterative_dfs(graph, 'A')
# Expected output (order may vary based on implementation specifics): A C F B E D 
