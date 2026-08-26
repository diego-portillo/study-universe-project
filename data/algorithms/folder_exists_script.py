def folder_exists(folder: dict, folder_name: str) -> bool:
    if folder == []:
        return False
    print(f"Folder file: {folder['name']}")
    if folder['name'] == folder_name:
        return True
    for child_folder in folder['children']:
        folder_found = folder_exists(child_folder, folder_name)
        if folder_found:
            return folder_found
    return False


root_folder = {
    "name": "root",
    "children": [
        {
            "name": "user1",
            "children": [
                {"name": "documents", "children": []},
                {"name": "images", "children": []},
                {"name": "downloads", "children": [{"name": "virus2", "children": []}]},
            ],
        },
        {
            "name": "user2",
            "children": [
                {"name": "documents", "children": []},
                {"name": "images", "children": []},
                {"name": "downloads", "children": []},
            ],
        },
    ],
}

folder_to_find = "virus"
print(f"Folder {folder_to_find} exists? {folder_exists(root_folder, folder_to_find)}")
