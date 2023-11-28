import os

def delete_csv(id):
    merge_path = './static/merged_csv'
    file_path = f"{merge_path}/{id}.csv"

    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"File {id}.csv has been deleted.")
        return True
    else:
        print(f"File {id}.csv does not exist.")
        return False