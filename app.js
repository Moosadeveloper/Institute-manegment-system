document.getElementById('student-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('student-name').value,
        fatherName: document.getElementById('father-name').value,
        admissionDate: document.getElementById('admission-date').value,
        contactNumber: document.getElementById('student-contact').value,
        address: document.getElementById('student-address').value,
        email: document.getElementById('student-email').value,
        age: document.getElementById('student-age').value,
        shift: document.getElementById('student-shift').value
    };

    fetch('https://script.google.com/macros/s/AKfycbxdGn8i7Uo8yVq_uLuPKldcpR_qQvYgBpWf03_EiCSXavkIxQcQ8bMaHUfwweZy0hoROw/exec', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'no-cors'  // Use no-cors mode
    })
    .then(response => {
        if (response.ok) {
            alert('Student added successfully!');
            document.getElementById('student-form').reset();
            document.getElementById('student-modal').style.display = 'none';
        } 
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error while submitting the form.');
    });
});
