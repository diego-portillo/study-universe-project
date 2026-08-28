from collections import deque
total_courses = 2
courses_with_prerequired = [[1,0]]
output = True

def check_courses(total_courses: int, courses_with_prerequired: list[list[int]]) -> bool:
    visited = set()
    in_degree = [0] * total_courses
    graph = {}
    queue = deque()
    count = 0
    for course in courses_with_prerequired:
        in_degree[course[0]] += 1
        if course[1] not in graph:
            graph[course[1]] = []
        graph[course[1]].append(course[0])
    for i in range(len(in_degree)):
        if in_degree[i] == 0:
            queue.append(i)
    while queue:
        requirement = queue.popleft()
        if requirement in graph:
            dependents = graph[requirement]
            for dependent in dependents:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    queue.append(dependent)
        count += 1
    return total_courses == count


print(check_courses(total_courses, courses_with_prerequired)==output)