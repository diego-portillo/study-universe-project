# This is for trees

def folder_exists(folder, folder_name):
    if folder == []:
        return False
    print(f"Folder file: {folder['name']}")
    if folder['name'] == folder_name:
        return True
    for child_folder in folder['childs']:
        folder_found = folder_exists(child_folder, folder_name)
        if folder_found == True:
            return folder_found
    return False


root_folder = {
    "name": "root",
    "childs": [
        {
            "name": "user1",
            "childs": [
                {"name": "documents", "childs": []},
                {"name": "images", "childs": []},
                {"name": "downloads", "childs": [{"name": "virus2", "childs": []}]},
            ],
        },
        {
            "name": "user2",
            "childs": [
                {"name": "documents", "childs": []},
                {"name": "images", "childs": []},
                {"name": "downloads", "childs": []},
            ],
        },
    ],
}

folder_to_find = "virus"
print(f"Folder {folder_to_find} exists? {folder_exists(root_folder, folder_to_find)}")
