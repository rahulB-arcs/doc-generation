let isGeneratedDocuments = false;
let id
let generateBtn = document.querySelector('#generateBtn')
let downloadBtn = document.querySelector('#downloadBtn')
let uploadContainer = document.querySelector('#uploadContainer')
let clearBtn = document.querySelector('#clearBtn')
let cancelBtn = document.querySelector('#cancelBtn')
let closeBtn = document.querySelector('#closeBtn')
let docName = document.getElementById('docName')

let generateRequest = [];

function PreviewWordDoc() {
    var doc = document.getElementById("docFile").files[0];

    if (doc != null) {
        var docxOptions = Object.assign(docx.defaultOptions, {
            useMathMLPolyfill: true
        });
        var container = document.querySelector("#docContent");
        docName.innerHTML = doc.name;
        docx.renderAsync(doc, container, null, docxOptions);
        showActionsButton();
    }
}

function PreviewDownloaddDoc(doc) {
    if (doc != null) {
        var docxOptions = Object.assign(docx.defaultOptions, {
            useMathMLPolyfill: true
        });
        var container = document.querySelector("#downloadedDoc");

        docx.renderAsync(doc, container, null, docxOptions);
        showActionsButton();
    }
}



function showCsvPreviews(files) {
    const csvContent = document.getElementById('csvContent');
    // csvContent.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            preview.innerHTML = `<p class="mb-0">${file.name}</p> 
            <i class="fa-solid fa-xmark" onclick="removePreview(this, ${index})"></i>`;
            csvContent.appendChild(preview);
        };

        reader.readAsDataURL(file);
    });
}


function removePreview(button, index) {
    var fileInput = document.getElementById('csvFile');

    // Get the files
    var files = fileInput.files;


    if (index >= 0 && index < files.length) {
        // Convert the FileList to an array
        var filesArray = Array.from(files);

        // Remove the file at the specified index
        filesArray.splice(index, 1);

        // Convert the array back to a FileList
        var newFileList = new DataTransfer();

        filesArray.forEach(function (file) {
            newFileList.items.add(file);
        });
        // Assign the new FileList back to the file input
        fileInput.files = newFileList.files;
    }
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
        showCsvPreviews(fileList);
        showActionsButton();
    } else {
        span.textContent = '';
        hideDocPreview();
        hideActionsButton();
    }
}


clearBtn.addEventListener('click', function () {
    const docContent = document.getElementById('docContent');
    const csvContent = document.getElementById('csvContent');
    docContent.innerHTML = '';
    csvContent.innerHTML = '';
    docName.innerHTML = "Document Name"
    const docFileInput = document.getElementById('docFile');
    const csvFileInput = document.getElementById('csvFile');
    docFileInput.value = '';
    csvFileInput.value = '';

    var docAccordionItem = document.getElementById('documentAccordionItem');
    // var accordionExample2 = document.getElementById('accordionExample2');
    docAccordionItem.innerHTML = ''
    // accordionExample2.innerHTML = ''


    hideActionsButton();
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
    showLoader()
    isGeneratedDocuments = false;
    var formData = new FormData();

    var docFiles = document.getElementById('docFile').files;
    var csvFiles = document.getElementById('csvFile').files;

    if (docFiles.length === 1 && csvFiles.length >= 1) {
        const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
        modal.show()
        for (var x = 0; x < docFiles.length; x++) {
            formData.append('file', docFiles[x]);
        }

        for (var i = 0; i < csvFiles.length; i++) {
            formData.append('file', csvFiles[i]);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    hideLoader()
                    handleUploadResponse(data)
                } else {
                    hideLoader()
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

    generateMappingContent(data)

    id = data.id

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

    const hasNullMapping = checkNullMapping(generateRequest);

    if (hasNullMapping) {
        toast("Not all parameters are mapped yet");
        return
    }

    showLoader();

    fetch('/generate-file/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(generateRequest)
    })
        .then(response => response.json())
        .then(async (data) => {
            if (data.success) {
                downloadLink = data.downloadPath;
                generateBtn.style.display = 'none';
                uploadContainer.style.display = 'none';
                generateRequest = []

                const res = await fetch(data.downloadPath);
                const doc = res.blob();
                PreviewDownloaddDoc(doc)
                downloadBtn.style.display = 'block';
                hideLoader();
                isGeneratedDocuments = true;
            } else {
                hideLoader();
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


cancelBtn.addEventListener('click', cancelModal);

closeBtn.addEventListener('click', cancelModal);

function cancelModal() {
    const downloadDoc = document.querySelector("#downloadedDoc");
    downloadDoc.innerHTML = '';
    downloadBtn.style.display = 'none';
    generateBtn.style.display = 'block';
    uploadContainer.style.display = 'block'

    var docAccordionItem = document.getElementById('documentAccordionItem');
    docAccordionItem.innerHTML = ''

    generateRequest = []
    id = 0

}

function showActionsButton() {
    const actionsBtn = document.querySelector('.action-buttons');
    actionsBtn.style.display = 'inline-block';
}


function hideActionsButton() {
    const actionsBtn = document.querySelector('.action-buttons');
    actionsBtn.style.display = 'none';
}


function showLoader() {
    const loader = document.querySelector('#loader');
    loader.style.display = 'block';
}


function hideLoader() {
    const loader = document.querySelector('#loader');
    loader.style.display = 'none';
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


function generateMappingContent(jsonData) {
    var docAccordionItem = document.getElementById('documentAccordionItem');

    jsonData.doc.forEach(function (file) {
        var fileName = Object.keys(file)[0];
        var matched_placeholders = file[fileName].matched_placeholders;
        var unmatched_placeholders = file[fileName].unmatched_placeholders;
        var docContent = '';

        var optGroups = '';

        jsonData.csv.forEach(function (csv) {
            var csvFileName = Object.keys(csv)[0];
            var fields = csv[csvFileName];
            var optionsText = '';

            fields.forEach(function (option) {
                optionsText += `<option value="${option}">${option}</option>`;
            });

            optGroups += `<optgroup label="${csvFileName}">
                ${optionsText}
            </optgroup>`;
        });

        matched_placeholders.forEach(function (matched) {
            var selectedColumn = findMatchingColumn(matched, jsonData.csv);

            var selectOptions = optGroups.replace(
                new RegExp(`"${selectedColumn.file}"`, 'g'),
                `"${selectedColumn.file}" selected`
            );

            selectOptions = selectOptions.replace(
                new RegExp(`"${selectedColumn.column}"`, 'g'),
                `"${selectedColumn.column}" selected`
            );

            docContent += `
                <li class="matched">
                    <span>${matched}</span>
                    <select onchange="onSelectChange(this, '${matched}')">
                        <option value="" selected disabled hidden>Choose here</option>
                        ${selectOptions}
                    </select>
                </li>
            `;
        });

        unmatched_placeholders.forEach(function (unmatched) {
            generateRequest.push({
                doc_placeholder: unmatched, 
                csv_column: null,
            })
            docContent += `
                <li class="unmatched">
                    <span>${unmatched}</span>
                    <select onchange="onSelectChange(this, '${unmatched}')">
                        <option value="" selected disabled hidden>Choose here</option>
                        ${optGroups}
                    </select>
                </li>
            `;

        });

        docAccordionItem.innerHTML = `
            <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    ${fileName}
                </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne"
                data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <ul class="list-unstyled" id="placeholderList">
                        ${docContent}
                    </ul>
                </div>
            </div>
        `;

    });
}

function findMatchingColumn(placeholder, csvData) {
    for (const csv of csvData) {
        const fileName = Object.keys(csv)[0];
        const fields = csv[fileName];

        for (const field of fields) {
            if (field.includes(placeholder)) {
                generateRequest.push({
                    doc_placeholder: placeholder, 
                    csv_column: field,
                })
                return { file: fileName, column: field };   
            }
        }
    }

    return { file: '', column: '' };
}


function onSelectChange (event, placeholder){
    // Take reference of Object.
    const objectToReplace = generateRequest.find(item => item.doc_placeholder == placeholder);
    //Replace the refrence Object.
    if (objectToReplace) {
        objectToReplace.csv_column = event.value;
    }
}

function checkNullMapping(data) {
    console.log(data)
    for (let i = 0; i < data.length; i++) {
        if (data[i].csv_column === null || data[i].csv_column === undefined) {
            return true;
        }
    }
    return false;
}