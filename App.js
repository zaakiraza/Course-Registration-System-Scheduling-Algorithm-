let currentStudentName = null; // Variable to hold the current student's name

// Arrays to track courses
const coursesSelected = [];
const registeredCourses = [];
const students = [];
const sectionCapacity = 3; // Maximum students per section per course

// Object to track section assignments for each course
const sectionTracker = {
    "AM": {},
    "BM": {},
    "CM": {},
    "DM": {}
};

const ADMIN_PASSWORD = "123"; // Set a password for admin access

// Function to get the next available section for a course
function getAvailableSection(courseName) {
    for (const section in sectionTracker) {
        if (!sectionTracker[section][courseName]) {
            sectionTracker[section][courseName] = 0;
        }

        if (sectionTracker[section][courseName] < sectionCapacity) {
            return section;
        }
    }
    return null; // No section available
}

// Function to ask for the student's name before proceeding
function askStudentName() {
    currentStudentName = prompt("Please enter your name:");
    if (!currentStudentName) {
        alert("Name is required to register courses.");
        askStudentName(); // Ask again if no name is entered
    }
    console.log("Student Name: " + currentStudentName); // Display the name for debugging
}

// Function to handle the registration process
function registerCourses() {
    // Ask for the student's name again if it's not set
    if (!currentStudentName) {
        alert("Please enter your name to proceed.");
        askStudentName();
        return;
    }

    const registeredCoursesTable = document.getElementById("registered-courses").getElementsByTagName("tbody")[0];
    const availableCoursesTable = document.getElementById("available-courses").getElementsByTagName("tbody")[0];

    const registeredRows = registeredCoursesTable.getElementsByTagName("tr");
    let totalCredits = 0;

    // Prepare the student's registration details
    const studentId = `person${students.length + 1}`;
    const student = {
        id: studentId,
        name: currentStudentName || "Anonymous",
        courses: [],
        totalCredits: 0,
        section: {}, // Object to track sections for each course
    };

    // Process each selected course
    for (let row of registeredRows) {
        const courseName = row.cells[0].innerText;
        const creditHrs = parseInt(row.cells[1].innerText);

        // Check for available section
        const section = getAvailableSection(courseName);
        if (!section) {
            alert(`No seats available for ${courseName}. Registration skipped.`);
            continue;
        }

        // Register the course for the student
        coursesSelected.push({ courseName, creditHrs, section });
        student.courses.push({ courseName, creditHrs, section });
        student.section[courseName] = section;
        student.totalCredits += creditHrs;

        // Update the section tracker
        sectionTracker[section][courseName]++;
    }

    // Check total credits
    if (student.totalCredits < 6) {
        alert("Credit Hrs is less than the requirement. Registration failed.");
        return;
    }
    if (student.totalCredits > 15) {
        alert("Credit Hrs is more than the requirement. Registration failed.");
        return;
    }

    // Add the student to the students list
    students.push(student);

    // Move all registered courses back to the available courses table
    const registeredRowsArray = Array.from(registeredRows);
    for (let row of registeredRowsArray) {
        availableCoursesTable.appendChild(row);
        row.classList.remove("selected");
    }

    // Update registeredCourses array
    registeredCourses.push(...coursesSelected);
    coursesSelected.length = 0;

    // Clear and deselect all rows in the tables
    deselectAllRows(registeredCoursesTable);
    deselectAllRows(availableCoursesTable);
    registeredCoursesTable.innerHTML = '';

    // Show success message
    alert(
        `${student.name} (${studentId}) has been successfully registered! Assigned Sections:\n` +
        student.courses.map(c => `${c.courseName} - ${c.section}`).join("\n")
    );

    // Console log the student object
    console.log("Registered Student Object:", student);

    // Reset current student for the next registration
    currentStudentName = null;
    setTimeout(() => {
        askStudentName(); // Prompt for the next student's name
    }, 2000);
}

// Function to handle moving courses between tables
function moveCourse(action) {
    const availableCoursesTable = document.getElementById("available-courses").getElementsByTagName("tbody")[0];
    const registeredCoursesTable = document.getElementById("registered-courses").getElementsByTagName("tbody")[0];

    // Get selected row from the available courses table
    const selectedAvailableRow = getSelectedRow(availableCoursesTable);
    const selectedRegisteredRow = getSelectedRow(registeredCoursesTable);

    // Check if a row is selected and perform the action
    if (action === 'add') {
        if (selectedAvailableRow) {
            // Move the selected row to the registered courses table
            registeredCoursesTable.appendChild(selectedAvailableRow);
            deselectAllRows(availableCoursesTable);
            selectedAvailableRow.classList.remove("selected");
        } else {
            // Alert if no row is selected
            alert("Please select a course to add.");
        }
    } 
    else if (action === 'remove') {
        if (selectedRegisteredRow) {
            // Move the selected row to the available courses table
            availableCoursesTable.appendChild(selectedRegisteredRow);
            deselectAllRows(registeredCoursesTable);
            selectedRegisteredRow.classList.remove("selected");
        } else {
            // Alert if no row is selected
            alert("Please select a course to remove.");
        }
    }
}

// Function to get the selected row
function getSelectedRow(table) {
    const rows = table.getElementsByTagName("tr");
    for (let row of rows) {
        if (row.classList.contains("selected")) {
            return row;
        }
    }
    return null;
}

// Add event listeners to rows for selecting
document.querySelectorAll("#available-courses tr, #registered-courses tr").forEach(row => {
    row.addEventListener("click", function () {
        // Ensure only one row is selected at a time across both tables
        if (row.closest('#available-courses')) {
            deselectAllRows(document.querySelector('#registered-courses tbody')); // Deselect registered table rows
        } else {
            deselectAllRows(document.querySelector('#available-courses tbody')); // Deselect available table rows
        }
        deselectAllRows(row.parentElement);
        row.classList.add("selected");
    });
});

// Deselect all rows in a table
function deselectAllRows(table) {
    const rows = table.getElementsByTagName("tr");
    for (let row of rows) {
        row.classList.remove("selected");
    }
}

// Function to view registered student data (admin access)
// Function to view registered student data (admin access)
function viewData() {
    const password = prompt("Enter admin password to view registered data:");
    if (password !== ADMIN_PASSWORD) {
        alert("Wrong password!");
        return;
    }

    if (students.length === 0) {
        alert("No students have registered yet.");
        return;
    }

    // Create a new table to display the student data
    const dataTableContainer = document.createElement("div");
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    // Create the table header
    const headerRow = document.createElement("tr");
    const headers = ["Serial No.", "Student Name", "Courses", "Credit Hours", "Sections"];
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        th.style.border = "1px solid #ddd";
        th.style.padding = "8px";
        th.style.backgroundColor = "#007BFF";
        th.style.color = "white";
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add student data to the table
    students.forEach((student, index) => {
        const row = document.createElement("tr");

        // Serial Number
        const serialNoCell = document.createElement("td");
        serialNoCell.textContent = index + 1;
        serialNoCell.style.border = "1px solid #ddd";
        serialNoCell.style.padding = "8px";
        row.appendChild(serialNoCell);

        // Student Name
        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;
        nameCell.style.border = "1px solid #ddd";
        nameCell.style.padding = "8px";
        row.appendChild(nameCell);

        // Courses
        const coursesCell = document.createElement("td");
        student.courses.forEach(course => {
            const courseParagraph = document.createElement("p");
            courseParagraph.textContent = course.courseName;
            coursesCell.appendChild(courseParagraph);
        });
        coursesCell.style.border = "1px solid #ddd";
        coursesCell.style.padding = "8px";
        row.appendChild(coursesCell);

        // Credit Hours
        const creditsCell = document.createElement("td");
        student.courses.forEach(course => {
            const creditParagraph = document.createElement("p");
            creditParagraph.textContent = course.creditHrs;
            creditsCell.appendChild(creditParagraph);
        });
        creditsCell.style.border = "1px solid #ddd";
        creditsCell.style.padding = "8px";
        row.appendChild(creditsCell);

        // Sections
        const sectionsCell = document.createElement("td");
        student.courses.forEach(course => {
            const sectionParagraph = document.createElement("p");
            sectionParagraph.textContent = course.section;
            sectionsCell.appendChild(sectionParagraph);
        });
        sectionsCell.style.border = "1px solid #ddd";
        sectionsCell.style.padding = "8px";
        row.appendChild(sectionsCell);

        table.appendChild(row);
    });

    // Append the table to the body or a specific container
    dataTableContainer.appendChild(table);
    document.body.appendChild(dataTableContainer); // You can also append it to a specific element if needed

    // Optionally, you can add a button to close or hide the table after viewing.
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.marginTop = "20px";
    closeButton.style.padding = "10px";
    closeButton.style.backgroundColor = "#007BFF";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.addEventListener("click", () => {
        dataTableContainer.remove(); // Removes the table when close is clicked
    });
    dataTableContainer.appendChild(closeButton);
}


// Event listener for register button
document.querySelector(".register-button button").addEventListener("click", registerCourses);

// Event listener for add/remove buttons
document.querySelectorAll(".buttons button").forEach(button => {
    button.addEventListener("click", function () {
        moveCourse(button.textContent.trim().toLowerCase());
    });
});

let viewDataButton = document.getElementById('viewData');
viewDataButton.addEventListener("click", viewData);

// Ask for the first student's name on page load
askStudentName();