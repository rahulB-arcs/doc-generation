import pandas as pd
import glob

def merge_csv(id):
    
    csv_files = glob.glob(f'./static/uploads/{id}/*.csv')

    first_file = pd.read_csv(csv_files[0], encoding='latin-1')
    common_headers = set(first_file.columns)

    for file in csv_files[1:]:
        data = pd.read_csv(file, encoding='latin-1')
        common_headers = common_headers.intersection(set(data.columns))

    if common_headers:
        common_header = common_headers.pop()
        merged_data = pd.read_csv(csv_files[0], encoding='latin-1')
        for file in csv_files[1:]:
            data_to_merge = pd.read_csv(file, encoding='latin-1')
            merged_data = pd.merge(merged_data, data_to_merge, on=common_header, how='outer')

        merged_data.to_csv(f"./static/uploads/{id}/merged_file.csv", index=False)