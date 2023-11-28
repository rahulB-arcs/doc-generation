let isGeneratedDocuments = false;
let id
let generateBtn = document.querySelector('#generateBtn')
let downloadBtn = document.querySelector('#downloadBtn')
let uploadContainer = document.querySelector('#uploadContainer')
let clearBtn = document.querySelector('#clearBtn')
let cancelBtn = document.querySelector('#cancelBtn')

function PreviewWordDoc() {
    var doc = document.getElementById("docFile").files[0];
    let docName = document.getElementById('docName')

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

    const docFileInput = document.getElementById('docFile');
    const csvFileInput = document.getElementById('csvFile');
    docFileInput.value = '';
    csvFileInput.value = '';

    var docAccordionItem = document.getElementById('documentAccordionItem');
    var accordionExample2 = document.getElementById('accordionExample2');
    docAccordionItem.innerHTML = ''
    accordionExample2.innerHTML = ''


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

    generateDocumentContent(data)
    // generateCSVFilesContent(data) 

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
    showLoader();

    const selectedColumns = {};

    const placeholderList = document.getElementById('placeholderList');
    const optgroups = placeholderList.querySelectorAll('optgroup');

    optgroups.forEach((optgroup) => {
        const fileName = optgroup.getAttribute('label');
        const selectedOptions = optgroup.querySelectorAll('option:checked');

        // const selectedOptions = Array.from(options).filter((option) => option.selected);

        if(selectedColumns.fileName === undefined) {
            selectedColumns[fileName.toString()] = []
        }

        const obj = {}

        if (fileName && (selectedOptions.length > 0)) {
            selectedOptions.forEach((option) => {
                const placeholder = option.textContent.trim();
                const selectedValue = option.value;
                obj[placeholder] = selectedValue
                selectedColumns[fileName.toString()].push(obj)
            });
        }
    });

    console.log(selectedColumns)
    fetch('/generate-file/' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedColumns)
    })
        .then(response => response.json())
        .then(async (data) => {
            if (data.success) {
                downloadLink = data.downloadPath;
                generateBtn.style.display = 'none';
                uploadContainer.style.display = 'none';

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


cancelBtn.addEventListener('click', function () {

    var docAccordionItem = document.getElementById('documentAccordionItem');
    var accordionExample2 = document.getElementById('accordionExample2');
    docAccordionItem.innerHTML = ''
    accordionExample2.innerHTML = ''

    id = 0

});


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


function generateDocumentContent(jsonData) {
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
                    <select>
                        <option value="" selected disabled hidden>Choose here</option>
                        ${selectOptions}
                    </select>
                </li>
            `;
        });

        unmatched_placeholders.forEach(function (unmatched) {
            docContent += `
                <li class="unmatched">
                    <span>${unmatched}</span>
                    <select>
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
                return { file: fileName, column: field };
            }
        }
    }

    return { file: '', column: '' };
}


// /* Deprecated Beacuse of Sir Demands  */
// function generateCSVFilesContent(jsonData) {
//     var accordionExample2 = document.getElementById('accordionExample2');
//     var csvContent = '';
//     var count = 0;
//     var collapsed = '';
//     var show = ''


//     jsonData.csv.forEach(function (file) {
//         var fileName = Object.keys(file)[0];
//         var matchedColumns = file[fileName].matched_columns;
//         var unmatchedColumns = file[fileName].unmatched_columns;

//         if (count == 0) {
//             index =true
//             collapsed = ''
//             show = 'show'
//         } else {
//             index = false
//             collapsed = 'collapsed'
//             show = ''
//         }

//         var fileContent = '';
//         matchedColumns.forEach(function (matched) {
//             fileContent += `
//                 <li class="matched">${matched}</li>
//             `;
//         });

//         unmatchedColumns.forEach(function (unmatched) {
//             fileContent += `
//                 <li class="unmatched">${unmatched}</li>
//             `;
//         });

//         csvContent += `
//             <div class="accordion-item">
//                 <h2 class="accordion-header" id="heading${count}">
//                     <button class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse"
//                         data-bs-target="#collapse${count}" aria-expanded="${index}" aria-controls="collapse${count}">
//                         File: ${fileName}
//                     </button>
//                 </h2>
//                 <div id="collapse${count}" class="accordion-collapse collapse ${show}" aria-labelledby="heading${count}"
//                     data-bs-parent="#accordionExample2">
//                     <div class="accordion-body">
//                         <ul class="list-unstyled">
//                             ${fileContent}
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         `;

//         count++
//     });

//     console.log(csvContent)

//     accordionExample2.innerHTML = csvContent;
// }