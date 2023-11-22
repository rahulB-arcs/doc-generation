from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import csv
from utils.generateFile import generate_file
from utils.readFile import allowed_file

app = Flask(__name__)
CORS(app)

HOST_NAME = 'http://127.0.0.1:5000/'
UPLOAD_FOLDER = 'static/uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/upload', methods=['POST'])
def upload_file():
    """
    Here we upload the .csv and .docx file to get the path
    """
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    files = request.files.getlist('file')
    paths = []
    column_values = {}

    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'}, 400)

        if file and allowed_file(file.filename):
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], file_extension)

            if not os.path.exists(save_path):
                os.makedirs(save_path)

            file.save(os.path.join(save_path, file.filename))
            paths.append(os.path.join(save_path, file.filename))

            if file_extension == 'csv':
                with open(os.path.join(save_path, file.filename), 'r') as csvfile:
                    csvreader = csv.reader(csvfile)
                    key_row = next(csvreader)
                    value_row = next(csvreader)
                    column_values.update(dict(zip(key_row, value_row)))

        else: 
            return jsonify({'error': 'File extension not allowed'},400)

    return jsonify({'success': True, 'path': paths, 'column_values': column_values})


@app.route('/generate-document', methods=['POST'])
def generate_doc():
    """
    Here we generate the output file in .docx format from .csv and .docx file template
    """
    body = request.get_json()

    doc_path = body['docPath']
    csv_path = body['csvPath']
    doc_name = body['docName']

    new_doc_path = generate_file(doc_path, csv_path, doc_name)

    if new_doc_path:
        file_path = HOST_NAME + new_doc_path
        return jsonify({'success': True, 'newDocPath': file_path})
    else:
         return jsonify({'error': 'No selected file'},400)


@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="5000")
