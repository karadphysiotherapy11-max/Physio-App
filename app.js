// Database Configuration
let db;
const request = indexedDB.open("VyomPhysioDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("patients")) {
        db.createObjectStore("patients", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    renderPatientList();
    updateStats();
};

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');
}

// Add Patient
document.getElementById('patientForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPatient = {
        name: document.getElementById('pName').value,
        age: document.getElementById('pAge').value,
        gender: document.getElementById('pGender').value,
        contact: document.getElementById('pContact').value,
        diagnosis: document.getElementById('pDiagnosis').value,
        dateAdded: new Date().toLocaleDateString(),
        sessions: []
    };

    const transaction = db.transaction(["patients"], "readwrite");
    transaction.objectStore("patients").add(newPatient);
    
    transaction.oncomplete = () => {
        alert("Patient Added Successfully!");
        e.target.reset();
        showPage('patient-list');
        renderPatientList();
    };
});

// Render Patient List
function renderPatientList() {
    const tbody = document.getElementById('patientTableBody');
    tbody.innerHTML = "";
    
    const store = db.transaction("patients").objectStore("patients");
    store.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const p = cursor.value;
            tbody.innerHTML += `
                <tr>
                    <td>#${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.diagnosis}</td>
                    <td>${p.dateAdded}</td>
                    <td><button onclick="viewPatient(${p.id})">View</button></td>
                </tr>
            `;
            cursor.continue();
        }
    };
}

// Backup Logic
function exportData() {
    const store = db.transaction("patients").objectStore("patients");
    store.getAll().onsuccess = (e) => {
        const data = JSON.stringify(e.target.result);
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vyom_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    };
}

// Dark Mode Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// Chart.js Mock Implementation
const ctx = document.getElementById('recoveryChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
            label: 'Avg. Pain Score (VAS)',
            data: [8, 6, 4, 2],
            borderColor: '#3498db',
            fill: false
        }]
    }
});
