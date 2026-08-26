from collections import deque
import math
city_count = 4
flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]
source = 0
destination = 3
max_stops = 1
output_1 = 700

def cheapest_travel(
    city_count: int,
    flights: list[list[int]],
    origin: int,
    destination: int,
    stops: int,
) -> int:
    # intermediate steps count as stops, not the final step
    max_steps = stops + 1
    queue = deque()
    queue.append((origin,0,0))
    cost = math.inf
    while queue:
        (current_city, current_step, current_spend) = queue.popleft()
        for flight in flights:
            flight_origin, flight_destination, price = flight
            if flight_origin == current_city and current_step < max_steps:
                new_spend = current_spend + price
                new_step = current_step + 1
                queue.append((flight_destination, new_step, new_spend))
        if current_spend < cost and current_city == destination:
            cost = current_spend
    if cost == math.inf:
        return -1
    return cost

print(cheapest_travel(city_count, flights, source, destination, max_stops) == output_1)