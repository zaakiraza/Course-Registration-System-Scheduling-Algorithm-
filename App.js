// index.html

// Predefined credentials
const adminPassword = "123";

const studentCredentials = {
    "FA22-BSCS-0144": "111",
    "FA22-BSCS-0145": "222",
    "FA22-BSCS-0146": "333",
    "FA22-BSCS-0147": "444",
    "FA22-BSCS-0148": "555",
    "FA22-BSCS-0149": "666"
};

// Validate Student Login
let studentId;
function validateStudentLogin() {
    studentId = (document.getElementById("student-id").value).toUpperCase();
    const studentPassword = document.getElementById("student-password").value;

    if (studentCredentials[studentId] === studentPassword) {
        // Store the student ID in localStorage
        localStorage.setItem('loggedInStudentId', studentId);
        alert("Login Successful!");
        window.location.href = "UserPanel.html";
        return false;
    } else {
        alert("Invalid Student ID or Password!");
        return false;
    }
}

// Validate Admin Login
function validateAdminLogin() {
    const adminInputPassword = document.getElementById("admin-password").value;

    if (adminInputPassword === adminPassword) {
        alert("Admin Login Successful!");
        return true;
    } else {
        alert("Invalid Admin Password!");
        return false;
    }
}

// Show Student Panel
function showStudentPanel() {
    document.getElementById("student-form").classList.add("active");
    document.getElementById("admin-form").classList.remove("active");

    document.getElementById("student-btn").classList.add("active");
    document.getElementById("admin-btn").classList.remove("active");
}

// Show Admin Panel
function showAdminPanel() {
    document.getElementById("admin-form").classList.add("active");
    document.getElementById("student-form").classList.remove("active");

    document.getElementById("admin-btn").classList.add("active");
    document.getElementById("student-btn").classList.remove("active");
}

// index.html END


// UserPanel
function onLoadUserPanel() {
    const loggedInStudentId = localStorage.getItem('loggedInStudentId');
    if (!loggedInStudentId) {
        alert("You must log in first!");
        window.location.href = "index.html"; // Redirect to login if not logged in
        return;
    }

    const addButton = document.getElementById('add-button');
    const removeButton = document.getElementById('remove-button');
    const registerButton = document.getElementById('register-btn');
    const leftTable = document.getElementById('courses-table').getElementsByTagName('tbody')[0];
    const rightTable = document.getElementById('registered-courses').getElementsByTagName('tbody')[0];

    let selectedRowLeft = null;
    let selectedRowRight = null;
    let totalCredits = 0;
    const selectedCourses = [];

    const sections = {
        AM: 0,
        BM: 0,
        CM: 0,
        DM: 0
    };

    const studentCourseSections = {}; // To store which courses have been assigned which sections

    // Retrieve serial number from localStorage or initialize it to 1 if not available
    let serialNo = localStorage.getItem('serialNo') || 1;

    // Row selection handler for left table (course list)
    leftTable.addEventListener('click', function (e) {
        const row = e.target.closest('tr');
        if (row) {
            deselectAllRows();
            selectedRowLeft = row;
            row.classList.add('selected');
            selectedRowRight = null; // Clear any selection in the right table
        }
    });

    // Row selection handler for right table (registered courses)
    rightTable.addEventListener('click', function (e) {
        const row = e.target.closest('tr');
        if (row) {
            deselectAllRows();
            selectedRowRight = row;
            row.classList.add('selected');
            selectedRowLeft = null; // Clear any selection in the left table
        }
    });

    // Deselect all rows in both tables
    function deselectAllRows() {
        const rows = [leftTable, rightTable];
        rows.forEach((table) => {
            const rows = table.getElementsByTagName('tr');
            for (let row of rows) {
                row.classList.remove('selected');
            }
        });
    }

    // Add course to the registered courses table
    addButton.addEventListener('click', function () {
        if (!selectedRowLeft) {
            alert("Please select a row from the left table before clicking the Add button.");
            return;
        }

        const courseName = selectedRowLeft.cells[0].innerText;
        const creditHrs = parseInt(selectedRowLeft.dataset.credit);
        totalCredits += creditHrs;
        selectedCourses.push({ courseName, creditHrs, section: null });

        const newRow = selectedRowLeft.cloneNode(true);
        rightTable.appendChild(newRow);
        selectedRowLeft.remove();
        deselectAllRows();
    });

    // Remove course from the registered courses table
    removeButton.addEventListener('click', function () {
        if (!selectedRowRight) {
            alert("Please select a row from the right table before clicking the Remove button.");
            return;
        }

        const courseName = selectedRowRight.cells[0].innerText;
        const creditHrs = parseInt(selectedRowRight.dataset.credit);
        totalCredits -= creditHrs;
        const index = selectedCourses.findIndex(course => course.courseName === courseName);
        if (index > -1) selectedCourses.splice(index, 1);

        const newRow = selectedRowRight.cloneNode(true);
        leftTable.appendChild(newRow);
        selectedRowRight.remove();
        deselectAllRows();
    });

    // Register courses when button clicked
    registerButton.addEventListener('click', function () {
        if (totalCredits < 6 || totalCredits > 15) {
            alert("Total credit hours should be between 6 and 15 to register.");
            return;
        }
    
        const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
        const existingRegistration = registrations.find(reg => reg.Student_Id === loggedInStudentId);
    
        if (existingRegistration) {
            alert("You have already registered. You cannot register again.");
            window.location = `index.html`;
            return;
        }
    
        // Track section allocations for each course
        const courseSections = {}; // Example: { "Discrete Structures (3)": { "AM": 3, "BM": 1 } }
    
        // Initialize courseSections from previous registrations
        registrations.forEach(registration => {
            registration.courses.forEach(course => {
                if (!courseSections[course.courseName]) {
                    courseSections[course.courseName] = { AM: 0, BM: 0, CM: 0, DM: 0 };
                }
                courseSections[course.courseName][course.section]++;
            });
        });
    
        // Assign sections based on course selection
        selectedCourses.forEach(course => {
            if (!courseSections[course.courseName]) {
                courseSections[course.courseName] = { AM: 0, BM: 0, CM: 0, DM: 0 };
            }
    
            let sectionAssigned = null;
    
            // Find the first available section for the course
            for (const section in courseSections[course.courseName]) {
                if (courseSections[course.courseName][section] < 3) { // Check if the section has space
                    courseSections[course.courseName][section]++;
                    sectionAssigned = section;
                    break;
                }
            }
    
            if (sectionAssigned) {
                course.section = sectionAssigned;
            } else {
                alert(`Seats are full for all sections of ${course.courseName}. Registration is closed.`);
                return;
            }
        });
    
        const registrationObject = {
            serial_No: serialNo++, // Increment serial number after registration
            Student_Id: loggedInStudentId,
            courses: selectedCourses,
            CreditHrs: totalCredits
        };
    
        registrations.push(registrationObject);
        localStorage.setItem('registrations', JSON.stringify(registrations));
    
        // Update serial number in localStorage
        localStorage.setItem('serialNo', serialNo);
    
        // Create a string summarizing the registered courses and their sections
        let registrationSummary = "Registration successful! Here are your courses and assigned sections:\n\n";
        selectedCourses.forEach(course => {
            registrationSummary += `Course: ${course.courseName}, Section: ${course.section}\n`;
        });
    
        // Show the summary alert
        alert(registrationSummary);
    
        // Redirect to index.html after alert
        window.location.href = "index.html";
    });
    
    
}

// UserPanel END


// adminPanel.html

const OnHome = () => {
    window.location = `index.html`;
}

document.getElementById('view-data-btn').addEventListener('click', function () {
    // Retrieve registration data from localStorage
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];

    // Get the table body element where we will append the rows
    const dataBody = document.getElementById('data-body');
    const registrationTable = document.getElementById('registration-data-table');

    // Clear the table before inserting new rows
    dataBody.innerHTML = '';

    // Check if there is any registration data
    if (registrations.length === 0) {
        alert("No registration data found.");
        return;
    }

    // Loop through the registration data and create rows
    registrations.forEach((reg) => {
        // Start a new row for the first course
        let rowHTML = `<tr>`;

        // Add Serial No cell and Student ID cell (both span for the number of courses)
        rowHTML += `
            <td rowspan="${reg.courses.length}">${reg.serial_No}</td>
            <td rowspan="${reg.courses.length}">${reg.Student_Id}</td>
        `;

        // Loop through courses for each student
        reg.courses.forEach((course, index) => {
            // If it's not the first course, we need to create a new row
            if (index > 0) {
                rowHTML += `</tr><tr>`;
            }

            // Add course details for the current row
            rowHTML += `
                <td>${course.courseName}</td>
                <td>${course.creditHrs}</td>
                <td>${course.section}</td>
            `;
        });

        // Close the last row
        rowHTML += `</tr>`;

        // Insert the row into the table body
        dataBody.innerHTML += rowHTML;
    });

    // Display the table
    registrationTable.style.display = 'table';
});

// adminPanel.html END