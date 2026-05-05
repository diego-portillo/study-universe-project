from collections import deque
import math
n = 4
vuelos = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]
src = 0
dst = 3
k = 1 
output_1 = 700

def cheapest_travel(cities, flights, origin, destiny, stops):
    max_steps = stops + 1 #because here we count intermediate steps as stops, not the final stop as part of stops
    queue = deque()
    queue.append((origin,0,0))
    cost = math.inf
    while queue:
        (current_city, current_step, current_spend) = queue.popleft()
        for flight in flights:
            flight_origin, flight_destiny, price = flight
            if flight_origin == current_city and current_step < max_steps:
                new_spend = current_spend + price
                new_step = current_step + 1
                queue.append((flight_destiny, new_step, new_spend))
        if current_spend < cost and current_city == destiny:
            cost= current_spend
    if cost == math.inf:
        return -1
    return cost

print(cheapest_travel(n, vuelos, src, dst, k) == output_1)