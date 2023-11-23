let isGeneratedDocuments = false;
let id
let generateBtn = document.querySelector('#generateBtn')
let downloadBtn = document.querySelector('#downloadBtn')
let clearBtn = document.querySelector('#clearBtn')

function PreviewWordDoc() {
    var doc = document.getElementById("docFile").files[0];

    if (doc != null) {
        var docxOptions = Object.assign(docx.defaultOptions, {
            useMathMLPolyfill: true
        });
        var container = document.querySelector("#docContent");

        docx.renderAsync(doc, container, null, docxOptions);
        showUploadButton();
    }
}

function showCsvPreviews(files) {
    const csvContent = document.getElementById('csvContent');
    // csvContent.innerHTML = '';

    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.innerHTML = `<p class="mb-0">${file.name}</p> 
            <i class="fa-solid fa-xmark" onclick="removePreview(this)"></i>`;
            csvContent.appendChild(preview);
        };

        reader.readAsDataURL(file);
    });
}


function removePreview(button) {
    const preview = button.parentNode;
    const docContent = document.getElementById('csvContent');
    docContent.removeChild(preview);
}


function updateFileName(inputId, spanId) {

    isGeneratedDocuments = false
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);

    if (input.files.length > 0) {
        const fileList = Array.from(input.files);
        // span.textContent = fileList.map(file => file.name).join(', ');
        showCsvPreviews(fileList);
        showUploadButton();
    } else {
        span.textContent = '';
        hideDocPreview();
        hideUploadButton();
    }
}


clearBtn.addEventListener('click', function () {
    const docContent = document.getElementById('docContent');
    const csvContent = document.getElementById('csvContent');
    docContent.innerHTML = '';
    csvContent.innerHTML = '';

    const docFileInput = document.getElementById('docFile');
    const csvFileInput = document.getElementById('csvFile');
    docFileInput.value = '';
    csvFileInput.value = '';

    hideUploadButton();
    hideDocPreview();

    isGeneratedDocuments = false;
    newDocslink = '';
    id = null;
});


function hideDocPreview() {
    const docContent = document.getElementById('docContent');
    docContent.innerHTML = '';
}


function uploadDocuments() {
    isGeneratedDocuments = false;
    var formData = new FormData();

    var docFiles = document.getElementById('docFile').files;
    var csvFiles = document.getElementById('csvFile').files;

    if (docFiles.length === 1 && csvFiles.length >= 1) {
        for (var x = 0; x < docFiles.length; x++) {
            formData.append('file', docFiles[x]);
        }

        for (var i = 0; i < csvFiles.length; i++) {
            formData.append('file', csvFiles[i]);
        }

        fetch('http://127.0.0.1:5000/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    handleUploadResponse(data)
                } else {
                    toast(data.error)
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        toast("Please select one DOCX file and one CSV file")
    }
}


function handleUploadResponse(data) {
    var resultHTML = '<h3>Matched and Unmatched Columns</h3>';

    resultHTML += '<h4>CSV Files</h4>';
    data.csv.forEach(file => {
        var fileName = Object.keys(file)[0];
        var matchedColumns = file[fileName].matched_columns.join(', ');
        var unmatchedColumns = file[fileName].unmatched_columns.join(', ');

        resultHTML += `<p>File: ${fileName}</p>`;
        resultHTML += `<p>Matched Columns: ${matchedColumns}</p>`;
        resultHTML += `<p>Unmatched Columns: ${unmatchedColumns}</p>`;
    });

    resultHTML += '<h4>Document</h4>';
    var matchedPlaceholders = data.doc.matched_placeholders.join(', ');
    var unmatchedPlaceholders = data.doc.unmatched_placeholders.join(', ');

    resultHTML += `<p>Matched Placeholders: ${matchedPlaceholders}</p>`;
    resultHTML += `<p>Unmatched Placeholders: ${unmatchedPlaceholders}</p>`;

    id = data.id

    document.getElementById('result').innerHTML = resultHTML;
}


generateBtn.addEventListener('click', function () {
    if (id) {
        generateDocument(id);
    } else {
        console.error('ID is missing');
    }
});


function generateDocument(id) {
    if (isGeneratedDocuments == true) {
        return
    }
    fetch('http://127.0.0.1:5000/generate-file/' + id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                downloadLink = data.downloadPath;
                downloadBtn.style.display = 'block';
                isGeneratedDocuments = true;
            } else {
                toast(data.error)
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


downloadBtn.addEventListener('click', function () {
    if (downloadLink) {
        downloadDocument(downloadLink);
    } else {
        console.error('downloadLink is missing');
    }
});


function downloadDocument(downloadLink) {
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = "result.docx";
    link.click();
}


function showUploadButton() {
    const uploadBtn = document.querySelectorAll('.upload-btn');
    for (let btn of uploadBtn) {
        btn.style.display = 'block';
    }
}


function hideUploadButton() {
    const uploadBtn = document.querySelectorAll('.upload-btn');
    for (let btn of uploadBtn) {
        btn.style.display = 'none';
    }
}

function toast(error) {
    Swal.fire({
        position: "center",
        icon: "error",
        title: error,
        showConfirmButton: false,
        timer: 2000
      });
}