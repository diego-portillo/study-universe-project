def validate_segments(index, current_string, results_lists, current_segments):
    # if is the end of the sequence add the ip to the result list
    if index == len(current_string) and len(current_segments)==4:
        results_lists.append(".".join(current_segments))
        return
    # if any of these is false, go back    
    elif index == len(current_string) or len(current_segments)==4:
        return
    #if is not the end, keep looking    
    elif  index != len(current_string) and len(current_segments)!=4:
        # each number can have only 3 digits
        for char_indexes in range(3):
            # we form each of the three digit posibilities
            string_segment = current_string[index:index+char_indexes+1]
            int_segment = int(string_segment)
            #if the segment does mach the limits then we add to the segments list
            is_in_rage = 0<= int_segment <= 255
            # if there is only one digit it can be 0
            # if there are 2 or 3 digits, the first cannot be 0
            is_zero_valid = True if len(string_segment)==1 else string_segment[0]!='0'
            if is_in_rage  and is_zero_valid:
                current_segments.append(string_segment)
                validate_segments(index+char_indexes+1, current_string, results_lists, current_segments)
                # here we assume that the last segment was added to the result if is correct
                # and if is not we apply the backtrack
                current_segments.pop()

def find_ips(ip_string):
    results = []
    validate_segments(0, ip_string, results, [])
    return results

print(find_ips("25525511135")==["255.255.11.135", "255.255.111.35"])