from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename
from utils.readFile import allowed_file, extract_placeholders, extract_columns ,match_columns, match_placeholders
from utils.mergeFile import merge_csv
from utils.generateFile import generate_file

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file part'})

        files = request.files.getlist('file')
        folder_name = str(uuid.uuid4())
        folder_path = os.path.join(app.config['UPLOAD_FOLDER'], folder_name)
        os.makedirs(folder_path, exist_ok=True)

        csv_data = []
        doc_data = []
        all_columns = []
        placeholders = []

        for file in files:
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No selected file'}, 400)

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_extension = filename.rsplit('.', 1)[1].lower()

                if file_extension == 'docx':
                    doc_filename = filename
                    file_path = os.path.join(folder_path, doc_filename)
                    file.save(file_path)

                    placeholders = extract_placeholders(file_path)
            else:
                return jsonify({'success': False, 'error': 'File extension not allowed'}, 400)
    
        for file in files:
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()

            if file_extension == 'csv':
                file_path = os.path.join(folder_path, filename)
                file.save(file_path)

                columns = extract_columns(file_path)
                all_columns += columns
                data = match_columns(filename, columns, placeholders)
                csv_data.append({filename: columns})

        data = match_placeholders(doc_filename, all_columns, placeholders)
        doc_data.append(data)

        merge_csv(folder_name)

        return jsonify({
            'success': True, 
            'csv': csv_data,
            'doc': doc_data,
            'id': folder_name
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": e
        })

@app.route('/generate-file/<id>', methods=['GET'])
def generate_doc(id, **kwargs):
    try:
        download_path = generate_file(id)

        return jsonify({
            "success": True,
            "downloadPath": f'/{download_path}'
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": e
        })

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="5000")
