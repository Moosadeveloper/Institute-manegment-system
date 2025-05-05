// Initialize the data structure for storing students
let studentsData = {
    'web-development': {
        'girls': [],
        'boys': []
    },
    'graphic-design': {
        'girls': [],
        'boys': []
    },
    'ms-office': {
        'girls': [],
        'boys': []
    }
};

// DOM elements
let modal;
let closeModalBtn;
let addButtons;
let studentForm;
let studentIdInput;
let studentFieldInput;
let studentShiftInput;
let shiftTabs;
let shiftContents;
let currentField;

// Google Sheets API URL

// Load saved data from localStorage when the page loads
function loadSavedData() {
    const savedData = localStorage.getItem('instituteStudentsData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            // Deep merge saved data with default structure
            for (const field in parsedData) {
                if (!studentsData[field]) {
                    studentsData[field] = {
                        'girls': [],
                        'boys': []
                    };
                }
                for (const shift in parsedData[field]) {
                    if (Array.isArray(parsedData[field][shift])) {
                        studentsData[field][shift] = parsedData[field][shift];
                    }
                }
            }
            console.log('Loaded data:', studentsData);
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('instituteStudentsData', JSON.stringify(studentsData));
        console.log('Saved data:', studentsData);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Initialize the app
function initializeApp() {
    // Initialize DOM elements
    modal = document.getElementById('student-modal');
    closeModalBtn = document.querySelector('.close');
    addButtons = document.querySelectorAll('.add-btn');
    studentForm = document.getElementById('student-form');
    studentIdInput = document.getElementById('student-id');
    studentFieldInput = document.getElementById('student-field');
    studentShiftInput = document.getElementById('student-shift');
    shiftTabs = document.querySelectorAll('.shift-tab');
    shiftContents = document.querySelectorAll('.shift-content');
    
    // Get current field from the page
    currentField = studentFieldInput.value;
    
    // Load saved data
    loadSavedData();
    
    // Render initial data
    renderCurrentFieldStudents();
    
    // Set up event listeners
    setupEventListeners();
    
    // Add print buttons
    addPrintButtons();
}

// Render students for current field
function renderCurrentFieldStudents() {
    renderStudentsTable('girls');
    renderStudentsTable('boys');
}

// Format date to display (YYYY-MM-DD to DD/MM/YYYY)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// Render students for a specific shift
function renderStudentsTable(shift) {
    const tableId = `${currentField}-${shift}-table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';

    if (!studentsData[currentField] || !studentsData[currentField][shift]) {
        return;
    }

    studentsData[currentField][shift].forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.className = 'student-row';
        
        // Create dropdown button
        const dropdownTd = document.createElement('td');
        dropdownTd.colSpan = 5;
        
        const dropdownBtn = document.createElement('button');
        dropdownBtn.className = 'dropdown-btn';
        dropdownBtn.innerHTML = `
            <div class="student-header">
                <div class="student-info">
                    <span class="student-name">${student.name}</span>
                    <span class="student-status ${student.courseStatus === 'Complete' ? 'status-complete' : 'status-incomplete'}">
                        ${student.courseStatus || 'Incomplete'}
                    </span>
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
        `;
        dropdownBtn.onclick = function() {
            toggleStudentDetails(this);
        };
        dropdownTd.appendChild(dropdownBtn);
        
        // Create details row
        const detailsTr = document.createElement('tr');
        detailsTr.className = 'student-details';
        detailsTr.style.display = 'none';
        
        const detailsTd = document.createElement('td');
        detailsTd.colSpan = 5;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'details-content';
        
        // Add student details
        detailsDiv.innerHTML = `
            <div class="details-grid">
                <div class="detail-group">
                    <h3>Personal Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Father's Name:</span>
                        <span class="detail-value">${student.fatherName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${student.age || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Admission Date:</span>
                        <span class="detail-value">${formatDate(student.admissionDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${student.contact}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${student.email || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <h3>Course Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Course Status:</span>
                        <span class="detail-value">
                            <select class="status-select" onchange="updateCourseStatus('${currentField}', '${shift}', ${index}, this.value)">
                                <option value="Incomplete" ${student.courseStatus === 'Incomplete' ? 'selected' : ''}>Incomplete</option>
                                <option value="Complete" ${student.courseStatus === 'Complete' ? 'selected' : ''}>Complete</option>
                            </select>
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        // Add action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'details-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Student';
        editBtn.onclick = function() {
            editStudent(currentField, shift, index);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Student';
        deleteBtn.onclick = function() {
            deleteStudent(currentField, shift, index);
        };
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        detailsDiv.appendChild(actionsDiv);
        
        detailsTd.appendChild(detailsDiv);
        detailsTr.appendChild(detailsTd);
        
        tr.appendChild(dropdownTd);
        tbody.appendChild(tr);
        tbody.appendChild(detailsTr);
    });
}

// Toggle student details visibility
function toggleStudentDetails(button) {
    const row = button.closest('tr');
    const detailsRow = row.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row';
        icon.className = 'fas fa-chevron-up';
        row.classList.add('active');
    } else {
        detailsRow.style.display = 'none';
        icon.className = 'fas fa-chevron-down';
        row.classList.remove('active');
    }
}

// Update course status
function updateCourseStatus(field, shift, index, status) {
    if (!studentsData[field][shift][index]) {
        return;
    }
    
    studentsData[field][shift][index].courseStatus = status;
    saveData();
    
    // Update the status display
    const statusSpan = document.querySelector(`#${field}-${shift}-table tr:nth-child(${index * 2 + 1}) .student-status`);
    if (statusSpan) {
        statusSpan.textContent = status;
        statusSpan.className = `student-status ${status === 'Complete' ? 'status-complete' : 'status-incomplete'}`;
    }
}

// Add a new student
function addStudent(field, shift, studentData) {
    // Initialize the field and shift if they don't exist yet
    if (!studentsData[field]) {
        studentsData[field] = {};
    }
    
    if (!studentsData[field][shift]) {
        studentsData[field][shift] = [];
    }
    
    studentsData[field][shift].push(studentData);
    saveData();
    renderStudentsTable(shift);
}

// Update an existing student
function updateStudent(field, shift, index, studentData) {
    studentsData[field][shift][index] = studentData;
    saveData();
    renderStudentsTable(shift);
}

// Delete a student
function deleteStudent(field, shift, index) {
    if (confirm('Are you sure you want to delete this student?')) {
        studentsData[field][shift].splice(index, 1);
        saveData();
        renderStudentsTable(shift);
    }
}

// Edit a student (populate form for editing)
function editStudent(field, shift, index) {
    const student = studentsData[field][shift][index];
    
    studentIdInput.value = index;
    studentFieldInput.value = field;
    studentShiftInput.value = shift;
    
    document.getElementById('student-name').value = student.name;
    document.getElementById('father-name').value = student.fatherName;
    document.getElementById('admission-date').value = student.admissionDate;
    document.getElementById('student-contact').value = student.contact;
    document.getElementById('student-address').value = student.address;
    document.getElementById('student-email').value = student.email || '';
    document.getElementById('student-age').value = student.age;
    
    // Change modal title
    document.querySelector('.modal-header h2').textContent = 'Edit Student';
    document.querySelector('.submit-btn').textContent = 'Update Student';
    
    // Show modal
    modal.style.display = 'block';
}

// Clear form and prepare for new student
function prepareFormForNewStudent() {
    studentForm.reset();
    studentIdInput.value = '';
    document.querySelector('.modal-header h2').textContent = 'Add Student';
    document.querySelector('.submit-btn').textContent = 'Save Student';
}

// Set up all event listeners
function setupEventListeners() {
    // Add student button click handlers
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            const shift = this.getAttribute('data-shift');
            
            studentFieldInput.value = field;
            studentShiftInput.value = shift;
            
            prepareFormForNewStudent();
            modal.style.display = 'block';
        });
    });

    // Close modal button
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form submission handler
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const studentId = studentIdInput.value;
        const field = studentFieldInput.value;
        const shift = studentShiftInput.value;
        
        const studentData = {
            name: document.getElementById('student-name').value,
            fatherName: document.getElementById('father-name').value,
            admissionDate: document.getElementById('admission-date').value,
            contact: document.getElementById('student-contact').value,
            address: document.getElementById('student-address').value,
            email: document.getElementById('student-email').value,
            age: document.getElementById('student-age').value
        };
        
        if (studentId === '') {
            // Add new student
            addStudent(field, shift, studentData);
        } else {
            // Update existing student
            updateStudent(field, shift, parseInt(studentId), studentData);
        }
        
        modal.style.display = 'none';
    });

    // Shift tab switching
    shiftTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const shift = this.getAttribute('data-shift');
            
            // Update active tab
            shiftTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            shiftContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${shift}-shift`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Add print buttons to each shift section
function addPrintButtons() {
    const shiftContents = document.querySelectorAll('.shift-content');
    shiftContents.forEach(content => {
        const shiftHeader = content.querySelector('.shift-header');
        if (shiftHeader) {
            const printBtn = document.createElement('button');
            printBtn.className = 'print-btn';
            printBtn.innerHTML = '<i class="fas fa-print"></i> Print List';
            printBtn.onclick = function() {
                const shift = content.id.split('-')[0];
                generatePDF(currentField, shift);
            };
            shiftHeader.appendChild(printBtn);
        }
    });
}

// Generate PDF for a specific shift
function generatePDF(field, shift) {
    const students = studentsData[field][shift];
    if (!students || students.length === 0) {
        alert('No students found in this section.');
        return;
    }

    // Create a new jsPDF instance using window.jspdf
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l'); // Landscape orientation for better width
    
    // Set default font
    doc.setFont('helvetica');
    
    // Add title with styling
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text(`${field.charAt(0).toUpperCase() + field.slice(1)} - ${shift.charAt(0).toUpperCase() + shift.slice(1)} Section`, 148, 20, { align: 'center' });
    
    // Add date with styling
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 148, 30, { align: 'center' });
    
    // Add table headers
    const headers = ['Name', 'Father\'s Name', 'Age', 'Contact', 'Email', 'Status'];
    const columnWidths = [70, 70, 25, 45, 80, 30]; // Optimized column widths
    let y = 45;
    
    // Draw table header background
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 256, 10, 'F');
    
    // Add table headers with styling
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 40);
    let x = 20;
    headers.forEach((header, i) => {
        doc.text(header, x + 5, y);
        x += columnWidths[i];
    });
    
    // Add student data
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    y += 10;
    
    // Draw horizontal line after header
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y - 2, 276, y - 2);
    
    students.forEach((student, index) => {
        if (y > 190) { // Add new page if needed (adjusted for landscape)
            doc.addPage('l');
            y = 20;
            
            // Add headers on new page
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(40, 40, 40);
            x = 20;
            headers.forEach((header, i) => {
                doc.text(header, x + 5, y);
                x += columnWidths[i];
            });
            
            // Draw table header background on new page
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 5, 256, 10, 'F');
            
            y += 10;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            
            // Draw horizontal line after header
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y - 2, 276, y - 2);
        }
        
        // Set row background color based on completion status
        const isComplete = student.courseStatus === 'Complete';
        if (isComplete) {
            doc.setFillColor(232, 245, 233); // Light green background
        } else {
            doc.setFillColor(255, 243, 224); // Light orange background
        }
        doc.rect(20, y - 5, 256, 10, 'F');
        
        x = 20;
        const rowData = [
            student.name,
            student.fatherName,
            student.age || 'N/A',
            student.contact,
            student.email || 'N/A',
            student.courseStatus || 'Incomplete'
        ];
        
        rowData.forEach((data, i) => {
            // Set text color based on status
            if (isComplete) {
                doc.setTextColor(46, 125, 50); // Green text for complete
            } else {
                doc.setTextColor(230, 81, 0); // Orange text for incomplete
            }
            
            // Calculate text width and adjust if needed
            const maxWidth = columnWidths[i] - 10;
            let text = data;
            const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            
            if (textWidth > maxWidth) {
                // Try to fit the text by reducing font size
                const originalFontSize = doc.internal.getFontSize();
                let fontSize = originalFontSize;
                
                while (fontSize > 8 && textWidth > maxWidth) {
                    fontSize -= 0.5;
                    doc.setFontSize(fontSize);
                    const newWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
                    if (newWidth <= maxWidth) break;
                }
                
                doc.text(text, x + 5, y);
                doc.setFontSize(originalFontSize); // Reset font size
            } else {
                doc.text(text, x + 5, y);
            }
            
            x += columnWidths[i];
        });
        
        // Draw horizontal line between rows
        doc.setDrawColor(230, 230, 230);
        doc.line(20, y + 3, 276, y + 3);
        
        y += 10;
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 148, 200, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`${field}-${shift}-students-list.pdf`);
}

// Function to load students from Google Sheets
async function loadStudents(shift) {
    try {
        console.log('Loading students for shift:', shift); // Debug log
        
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('Loaded data:', data); // Debug log
        
        if (data.success) {
            const students = data.data.filter(student => 
                student.Shift === shift && 
                student.Field === document.getElementById('student-field').value
            );
            
            const tableBody = document.querySelector(`#${document.getElementById('student-field').value}-${shift}-table tbody`);
            tableBody.innerHTML = '';
            
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student['Student ID']}</td>
                    <td>${student['Student Name']}</td>
                    <td>${student["Father's Name"]}</td>
                    <td>${student['Date of Admission']}</td>
                    <td>${student['Contact Number']}</td>
                    <td>${student['Address']}</td>
                    <td>${student['Email']}</td>
                    <td>${student['Date of Birth']}</td>
                    <td>${student['Field']}</td>
                    <td>${student['Shift']}</td>
                    <td>${student['Timing']}</td>
                    <td>${student['Instructor Name']}</td>
                    <td>${student['Status']}</td>
                    <td>${student['Last Updated']}</td>
                    <td>${student['Created At']}</td>
                    <td>${student['Notes']}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        alert('Error loading students: ' + error.message);
    }
}

// Function to save student to Google Sheets
async function saveStudent(studentData) {
    try {
        console.log('Sending data:', studentData); // Debug log
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });
        
        const data = await response.json();
        console.log('Response:', data); // Debug log
        
        if (data.success) {
            // Reload the students list after successful save
            loadStudents(studentData.shift);
            alert('Student added successfully!');
            return true;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student: ' + error.message);
        return false;
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp); 