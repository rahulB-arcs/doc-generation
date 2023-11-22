import os
from utils.readFile import read_doc, read_csv
from docx import Document
from docx.enum.text import WD_BREAK

def generate_file(doc_path, csv_paths, doc_name):
    """
    generate .docx file  with CSV data
    """

    output = []
    doc = Document()
    save_path = './static/uploads/generated_docs'

    if not os.path.exists(save_path):
        os.makedirs(save_path)
    
    text = read_doc(doc_path)

    all_headers = set()
    all_placeholders = set()

    for csv_path in csv_paths:
        csv_data = read_csv(csv_path)
        headers = csv_data[0]

        all_headers.update(headers)
        placeholders = set(headers)
        all_placeholders.update(placeholders)

    # missing_placeholders = all_placeholders - set(re.findall(r'{(.*?)}', text))
    # if missing_placeholders:
    #     print(f"Missing placeholders: {missing_placeholders}")
    #     return None
    rows_to_merge = min(5, len(csv_data) - 1)
    
    for row in range(1, rows_to_merge + 1):
        for csv_path in csv_paths:
            csv_data = read_csv(csv_path)
            headers = csv_data[0]

            all_headers.update(headers)

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