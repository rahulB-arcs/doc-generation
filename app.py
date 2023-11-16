
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
from utils.generatefile import *
from utils.readfiles import allowed_file

app = Flask(__name__)
CORS(app)

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
    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'},400)

        if file and allowed_file(file.filename):
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], file_extension)

            if not os.path.exists(save_path):
                os.makedirs(save_path)

            file.save(os.path.join(save_path, file.filename))
            paths.append(os.path.join(save_path, file.filename))
    return jsonify({'success': True, 'path': paths})

    return jsonify({'error': 'File extension not allowed'},400)


@app.route('/generate-document', methods=['POST'])
def generatedoc():
    """
    Here we generate the output file in .docx format from .csv and .docx file template
    """



    body = request.get_json()
    file_path_doc=body['docxpath']
    file_path_csv=body['csvpath']

    new_docx_file_name=body['newdocname']+'.docx'
    newdocpaths=genratefile(file_path_doc,file_path_csv,new_docx_file_name)
    if newdocpaths:
        newdoc=['http://127.0.0.1:5000/'+newdocpath for newdocpath in newdocpaths]
        return jsonify({'success': True,'newdocpath':newdoc})
    else:
         return jsonify({'error': 'No selected file'},400)



@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="5000")
