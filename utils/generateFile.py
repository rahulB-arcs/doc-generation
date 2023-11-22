import os
from utils.readFile import read_doc, read_csv
from docx import Document
from docx.enum.text import WD_BREAK

def generate_file(doc_path, csv_path, doc_name):

    """
    generate .docx file  with CSV data
    """

    output = []
    doc = Document()
    save_path = './static/uploads/generated_docs'

    if not os.path.exists(save_path):
        os.makedirs(save_path)
    
    text = read_doc(doc_path)
    csv_data = read_csv(csv_path)
    headers = csv_data[0]

    rows_to_merge = min(5, len(csv_data) - 1)

    for row in range(1, rows_to_merge + 1):
        values = csv_data[row]

        placeholders = { header: value for header, value in zip(headers, values) }
        filled_template = text.format(**placeholders)

        para = doc.add_paragraph(filled_template)
        output.append(para)

        doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

    file_path = os.path.join(save_path, f'{doc_name}.docx')
    doc.save(file_path)
    download_path = f'static/uploads/generated_docs/{doc_name}.docx'

    return download_path