import csv
import docx2txt

def read_doc(file_path_doc):

    """
    Extract text from Doc files
    """
    try:
        text = docx2txt.process(file_path_doc)
        return text
    except Exception as e:
        return {'error':str(e)}


def read_csv(file_path_csv):
    """
    Extract Data from csv file
    """
    try:
        data = []
        with open(file_path_csv, 'r') as csvfile:
            csvreader = csv.reader(csvfile)
            for row in csvreader:
                data.append(row)
        return data
        
    except Exception as e:
        return {'error':str(e)}
    

ALLOWED_EXTENSIONS = {'csv', 'docx'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


