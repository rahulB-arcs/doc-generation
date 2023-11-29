import os
import pandas as pd
import glob

def merge_csv(id, columns_to_save, renamed_columns):

    merge_path = './static/merged_csv'

    if not os.path.exists(merge_path):
        os.makedirs(merge_path)
    
    csv_files = glob.glob(f'./static/uploads/{id}/csv/*.csv')

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
            merged_data = pd.merge(merged_data, data_to_merge, on=common_header, how='inner')

        if columns_to_save and renamed_columns and len(columns_to_save) == len(renamed_columns):
            merged_data = merged_data[columns_to_save]
            merged_data.columns = renamed_columns

        merged_data.to_csv(f"{merge_path}/{id}.csv", index=False)