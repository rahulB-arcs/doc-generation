import csv
import docx2txt

ALLOWED_EXTENSIONS = {'csv', 'docx'}

def read_doc(doc_path):
    """
    Extract text from Doc files
    """
    try:
        text = docx2txt.process(doc_path)
        return text
    except Exception as e:
        return {'error' : str(e)}


def read_csv(csv_path):
    """
    Extract Data from csv file
    """
    try:
        csv_data = []
        with open(csv_path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                csv_data.append(row)
        return csv_data
        
    except Exception as e:
        return {'error':str(e)}
    

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


