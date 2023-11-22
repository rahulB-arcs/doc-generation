from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from utils.generateFile import generate_file
from utils.readFile import allowed_file, extract_placeholders, extract_columns ,match_columns, match_placeholders

app = Flask(__name__)
CORS(app)

HOST_NAME = 'http://127.0.0.1:5000/'
UPLOAD_FOLDER = 'static/uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    files = request.files.getlist('file')
    folder_name = str(uuid.uuid4())
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder_name)
    os.makedirs(folder_path, exist_ok=True)

    csv_data = []
    doc_data = {'matched_placeholders': [], 'unmatched_placeholders': []}
    all_columns = []
    placeholders = []

    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'}, 400)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            file_path = os.path.join(folder_path, filename)
            file.save(file_path)

            if file_extension == 'docx':
                placeholders = extract_placeholders(file_path)
        else:
            return jsonify({'error': 'File extension not allowed'}, 400)
    
    for file in files:
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        file_path = os.path.join(folder_path, filename)
        if file_extension == 'csv':
            columns = extract_columns(file_path)
            all_columns += columns
            data = match_columns(filename, columns, placeholders)
            csv_data.append(data)

    doc_data = match_placeholders(all_columns, placeholders)

    merge_csv()

    return jsonify({
        'csv': csv_data,
        'doc': doc_data,
        'id': folder_name
    })

@app.route('/generate-document', methods=['POST'])
def generate_doc():
    """
    Here we generate the output file in .docx format from .csv and .docx file template
    """
    body = request.get_json()

    doc_path = body['docPath']
    csv_paths = body['csvPath']
    doc_name = body['docName']

    new_doc_path = generate_file(doc_path, csv_paths, doc_name)

    print(new_doc_path)

    if new_doc_path:
        file_path = HOST_NAME + new_doc_path
        return jsonify({'success': True, 'newDocPath': file_path})
    else:
         return jsonify({'error': 'No selected file'}, 400)

def merge_csv():
    return

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="5000")
