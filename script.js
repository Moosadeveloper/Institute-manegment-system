// Initialize the data structure for storing students
let studentsData = {
    'web-development': [],
    'graphic-design': [],
    'ms-office': []
};

// Google Apps Script endpoint configuration
// To get your deployment URL:
// 1. Open your Google Sheet
// 2. Click Extensions > Apps Script
// 3. Click Deploy > New deployment
// 4. Choose "Web app"
// 5. Set "Execute as" to your account
// 6. Set "Who has access" to "Anyone"
// 7. Click Deploy
// 8. Copy the URL and paste it below
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdGn8i7Uo8yVq_uLuPKldcpR_qQvYgBpWf03_EiCSXavkIxQcQ8bMaHUfwweZy0hoROw/exec';

// Show loading state
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading data...</p>
        </div>
    `;
    document.body.appendChild(loadingElement);
}

// Hide loading state
function hideLoading() {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Load data from Google Sheet
async function loadDataFromSheets() {
    showLoading();
    try {
        console.log('Loading data from sheet...');
        const response = await fetch(SCRIPT_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded successfully:', data);
        
        if (data && data.values) {
            // Clear existing data
            studentsData = {
                'web-development': [],
                'graphic-design': [],
                'ms-office': []
            };
            
            // Process the data from sheet
            data.values.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const [name, fatherName, admissionDate, contactNumber, address, email, age, shift, timestamp] = row;
                if (name && shift) {
                    const shiftKey = shift.toLowerCase().replace(/\s+/g, '-');
                    if (studentsData[shiftKey]) {
                        studentsData[shiftKey].push({
                            name: name,
                            fatherName: fatherName,
                            admissionDate: admissionDate,
                            contactNumber: contactNumber,
                            address: address,
                            email: email,
                            age: age,
                            timestamp: timestamp
                        });
                    }
                }
            });
            
            console.log('Students data processed:', studentsData);
            renderCurrentFieldStudents();
        } else {
            console.log('No data found in sheet');
            alert('No data found in the sheet. Please try again later.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please try again later.');
    } finally {
        hideLoading();
    }
}

// Save data to Google Sheet
async function saveDataToSheets(studentData) {
    showLoading();
    try {
        console.log('Saving student data:', studentData);
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save data');
        }
        
        const result = await response.json();
        console.log('Data saved successfully:', result);
        
        // Reload data after saving
        await loadDataFromSheets();
        alert('Student added successfully!');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    } finally {
        hideLoading();
    }
}

// Render students for the current field
function renderCurrentFieldStudents() {
    const currentPage = window.location.pathname.split('/').pop();
    let currentField = '';
    
    if (currentPage === 'ms-office.html') {
        currentField = 'ms-office';
    } else if (currentPage === 'web-development.html') {
        currentField = 'web-development';
    } else if (currentPage === 'graphic-design.html') {
        currentField = 'graphic-design';
    }
    
    if (currentField) {
        const table = document.querySelector('.student-table');
        if (table) {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.innerHTML = ''; // Clear existing rows
                
                // Add header row
                const thead = table.querySelector('thead');
                if (thead) {
                    thead.innerHTML = `
                        <tr>
                            <th>Name</th>
                            <th>Father's Name</th>
                            <th>Admission Date</th>
                            <th>Contact Number</th>
                            <th>Address</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Actions</th>
                        </tr>
                    `;
                }
                
                // Add student rows
                const students = studentsData[currentField] || [];
                console.log(`Rendering ${students.length} students for ${currentField}`);
                
                students.forEach((student, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.name || ''}</td>
                        <td>${student.fatherName || ''}</td>
                        <td>${student.admissionDate || ''}</td>
                        <td>${student.contactNumber || ''}</td>
                        <td>${student.address || ''}</td>
                        <td>${student.email || ''}</td>
                        <td>${student.age || ''}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteStudent('${currentField}', ${index})">
                                Delete
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    }
}

// Add a new student
async function addStudent(field, name, biodata) {
    const studentData = {
        name: name,
        fatherName: biodata,
        admissionDate: new Date().toISOString().split('T')[0],
        contactNumber: '',
        address: '',
        email: '',
        age: '',
        shift: field
    };
    
    await saveDataToSheets(studentData);
}

// Delete a student
async function deleteStudent(field, index) {
    if (confirm('Are you sure you want to delete this student?')) {
        showLoading();
        try {
            // Note: You'll need to implement delete functionality in your Apps Script
            alert('Delete functionality needs to be implemented in the Apps Script');
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Error deleting student. Please try again.');
        } finally {
            hideLoading();
        }
    }
}

// Event Listeners
const modal = document.getElementById('add-student-modal');
const closeModalBtn = document.querySelector('.close');
const addButtons = document.querySelectorAll('.add-btn');
const studentForm = document.getElementById('student-form');
const selectedFieldInput = document.getElementById('selected-field');
const studentNameInput = document.getElementById('student-name');
const studentBiodataInput = document.getElementById('student-biodata');

addButtons.forEach(button => {
    button.addEventListener('click', function() {
        const field = this.getAttribute('data-field');
        selectedFieldInput.value = field;
        modal.style.display = 'block';
    });
});

closeModalBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    studentForm.reset();
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        studentForm.reset();
    }
});

studentForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const field = selectedFieldInput.value;
    const name = studentNameInput.value;
    const biodata = studentBiodataInput.value;
    
    await addStudent(field, name, biodata);
    
    modal.style.display = 'none';
    studentForm.reset();
});

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadDataFromSheets();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading the application. Please try again later.');
    }
});
