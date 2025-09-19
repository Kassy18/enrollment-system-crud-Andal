document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const tabs = {
        students: document.getElementById('studentsbtn'),
        programs: document.getElementById('programsbtn'),
        years: document.getElementById('yearsbtn'),
        subjects: document.getElementById('subjectbtn'),
        enrollments: document.getElementById('enrollmentsbtn'),
    };

    // Automatically load the Students tab when the page loads
    setActiveTab('students');

    // Add click event listeners for all tab buttons
    Object.entries(tabs).forEach(([tabName, button]) => {
        if (button) {
            button.addEventListener('click', () => setActiveTab(tabName));
        }
    });

    async function setActiveTab(tabName) {
        Object.values(tabs).forEach(btn => btn?.classList.remove('active'));
        tabs[tabName]?.classList.add('active');

        // Load corresponding content
        switch (tabName) {
            case 'students': await loadStudents(); break;
            case 'programs': await loadPrograms(); break;
            case 'years': await loadYearsAndSemesters(); break;
            case 'subjects': await loadSubjects(); break;
            case 'enrollments': await loadEnrollments(); break;
        }
    }


    // --- Students Section ---
    async function loadStudents() {
        content.innerHTML = `
            <h2>Students</h2>
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Program</th>
                        <th>Allowance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="students-tbody"></tbody>

            </table>
                <button id="btn-add-student" class="add-btn">Add Student</button>
            `;

        document.getElementById('btn-add-student').onclick = () => renderStudentForm();

        await populateStudentsTable();
    }

    async function populateStudentsTable() {
        const tbody = document.getElementById('students-tbody');
        try {
            const res = await fetch('api/Students/getStudents.php');
            const data = await res.json();
            if (data.success) {
                tbody.innerHTML = '';
                data.data.forEach(s => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${s.stud_id}</td>
                        <td>${s.name}</td>
                        <td>${s.program_name || ''}</td>
                        <td>${s.allowance || 0}</td>
                        <td>
                            <button class="action-btn edit-btn" data-id="${s.stud_id}">Edit</button>
                            <button class="action-btn delete-btn" data-id="${s.stud_id}">Delete</button>
                        </td>`;
                    tbody.appendChild(tr);
                });

                tbody.onclick = async function (e) {
                    const editBtn = e.target.closest('.edit-btn');
                    const deleteBtn = e.target.closest('.delete-btn');
                    if (editBtn) await editStudent(parseInt(editBtn.dataset.id));
                    else if (deleteBtn) await deleteStudent(parseInt(deleteBtn.dataset.id));
                };
            } else {
                tbody.innerHTML = `<tr><td colspan="5">${data.message}</td></tr>`;
            }
        } catch {
            tbody.innerHTML = `<tr><td colspan="5">Error loading students.</td></tr>`;
        }
    }

    async function renderStudentForm(editData) {
        let programsRes, programsData;
        try {
            programsRes = await fetch('api/Programs/getPrograms.php');
            programsData = await programsRes.json();
        } catch {
            alert('Failed to load programs.');
            return;
        }

        if (!programsData.success) {
            alert('Failed to load programs.');
            return;
        }

        let html = `
        <form id="student-form">
            <h3>${editData ? 'Edit Student' : 'Add Student'}</h3>
            <div id="student-error" class="error-message" style="display: none;"></div>
            <div id="student-success" class="success-message" style="display: none;"></div>
            <label>Student ID</label>
            <input type="number" id="student-id" value="${editData ? editData.stud_id : ''}" ${editData ? 'readonly' : 'required'} />
            <label>First Name</label>
            <input type="text" id="student-first-name" value="${editData ? editData.first_name : ''}" required />
            <label>Middle Name</label>
            <input type="text" id="student-middle-name" value="${editData ? editData.middle_name : ''}" />
            <label>Last Name</label>
            <input type="text" id="student-last-name" value="${editData ? editData.last_name : ''}" required />
            <label>Program</label>
            <select id="student-program" required>
                <option value="">Select Program</option>
                ${programsData.data.map(p =>
            `<option value="${p.program_id}" ${editData && editData.program_id == p.program_id ? 'selected' : ''}>${p.program_name}</option>`).join('')}
            </select>
            <label>Allowance</label>
            <input type="number" id="student-allowance" value="${editData ? editData.allowance || 0 : ''}" />
            <button type="submit">${editData ? 'Update' : 'Add'}</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </form>`;

        showFormModal(html);

        document.getElementById('cancel-btn').onclick = () => closeFormModal();

        document.getElementById('student-form').onsubmit = async e => {
            e.preventDefault();
            const stud_id = document.getElementById('student-id').value;
            const first_name = document.getElementById('student-first-name').value.trim();
            const middle_name = document.getElementById('student-middle-name').value.trim();
            const last_name = document.getElementById('student-last-name').value.trim();
            const program_id = document.getElementById('student-program').value;
            const allowance = document.getElementById('student-allowance').value;

            if (!stud_id || !first_name || !last_name || !program_id) {
                alert('Student ID, First Name, Last Name and Program are required');
                return;
            }

            try {
                let url = 'api/Students/addStudents.php';
                let body = { stud_id, first_name, middle_name, last_name, program_id, allowance };
                if (editData) {
                    url = 'api/Students/updateStudents.php';
                    body.old_stud_id = editData.stud_id;
                }

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                const data = await res.json();
                if (data.success) {
                    alert(data.message);
                    closeFormModal();
                    await loadStudents();  // Refresh student table
                } else {
                    alert(data.message);
                }
            } catch {
                alert('Error submitting form');
            }
        };
    }

    async function editStudent(id) {
        try {
            const res = await fetch('api/Students/getStudents.php');
            const data = await res.json();
            if (!data.success) {
                alert('Unable to fetch student for editing');
                return;
            }
            const student = data.data.find(s => s.stud_id === id);
            if (!student) {
                alert('Student not found');
                return;
            }
            renderStudentForm(student);
        } catch {
            alert('Error loading student for edit');
        }
    }

    async function deleteStudent(id) {
        if (!confirm('Are you sure you want to delete this student?')) return;
        try {
            const res = await fetch('api/Students/deleteStudents.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stud_id: id }),
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                await loadStudents();  // Refresh the table
            } else {
                alert(data.message || 'Cannot delete student with active enrollment');
            }
        } catch {
            alert('Error deleting student');
        }
    }

    function showFormModal(innerHTML) {
    const modalContainer = document.getElementById('form-modal-container');
    modalContainer.innerHTML = `
        <div class="form-modal-overlay" onclick="closeFormModal(event)">
            <div class="form-modal" onclick="event.stopPropagation()">
                ${innerHTML}
            </div>
        </div>
    `;
    modalContainer.style.display = 'block';
   }

   function closeFormModal(event) {
     const modalContainer = document.getElementById('form-modal-container');
     if (!event || event.target.classList.contains('form-modal-overlay')) {
        modalContainer.innerHTML = '';
        modalContainer.style.display = 'none';
     }
   }


    


   












// --- Programs Section ---
async function loadPrograms() {
    content.innerHTML = `
        <h2>Programs</h2>
        <table>
            <thead>
                <tr>
                    <th>Program ID</th>
                    <th>Program Name</th>
                    <th>Institute</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="programs-tbody"></tbody>
        </table>
        <button id="btn-add-program" class="add-btn">Add Program</button>
    `;

    document.getElementById('btn-add-program').onclick = () => renderProgramForm();
    await ProgramsTable();
}

async function ProgramsTable() {
    const tbody = document.getElementById('programs-tbody');

    try {
        const res = await fetch("api/Programs/getPrograms.php");
        const data = await res.json();

        if (data.success) {
            tbody.innerHTML = '';
            data.data.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.program_id}</td>
                    <td>${p.program_name}</td>
                    <td>${p.ins_name || ''}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${p.program_id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${p.program_id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.onclick = async function (e) {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');

                if (editBtn) await editProgram(parseInt(editBtn.dataset.id));
                else if (deleteBtn) await deleteProgram(parseInt(deleteBtn.dataset.id));
            };
        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error fetching programs.</td></tr>`;
    }
}

async function renderProgramForm(editData = null) {
    let institutesRes, institutesData;
    try {
        institutesRes = await fetch('api/Programs/getInstitutes.php');
        institutesData = await institutesRes.json();
    } catch {
        alert('Failed to load institutes.');
        return;
    }

    if (!institutesData.success) {
        alert('Failed to load institutes.');
        return;
    }

    const html = `
        <form id="program-form">
            <h3>${editData ? 'Edit Program' : 'Add Program'}</h3>
            <div class="error-message" style="display: none;"></div>
            <div class="success-message" style="display: none;"></div>
            
            <label>Program ID</label>
            <input type="text" id="program-id" value="${editData ? editData.program_id : ''}" ${editData ? 'readonly' : 'required'} />

            <label>Program Name</label>
            <input type="text" id="program-name" value="${editData ? editData.program_name : ''}" required />

            <label>Institute</label>
            <select id="program-institute" required>
                <option value="">Select Institute</option>
                ${institutesData.data.map(i =>
                    `<option value="${i.ins_id}" ${editData && editData.ins_id == i.ins_id ? 'selected' : ''}>
                        ${i.ins_name}
                    </option>`).join('')}
            </select>

            <button type="submit">${editData ? 'Update' : 'Add'}</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </form>
    `;

    showFormModal(html);

    document.getElementById('cancel-btn').onclick = () => closeFormModal();

    document.getElementById('program-form').onsubmit = async e => {
        e.preventDefault();
        const program_id = document.getElementById('program-id').value;
        const program_name = document.getElementById('program-name').value.trim();
        const ins_id = document.getElementById('program-institute').value;

        if (!program_id || !program_name || !ins_id) {
            alert("All fields are required.");
            return;
        }

        try {
            const url = editData ? 'api/Programs/updatePrograms.php' : 'api/Programs/addPrograms.php';
            const body = { program_id, program_name, ins_id };

            if (editData) body.old_program_id = editData.program_id;

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.success) {
                alert(data.message);
                closeFormModal();
                await loadPrograms();
            } else {
                alert(data.message);
            }

        } catch {
            alert("Error submitting form.");
        }
    };
}

async function editProgram(id) {
    try {
        const res = await fetch("api/Programs/getPrograms.php");
        const data = await res.json();
        if (!data.success) {
            alert("Failed to load program.");
            return;
        }

        const program = data.data.find(p => p.program_id == id);
        if (!program) {
            alert("Program not found.");
            return;
        }

        renderProgramForm(program);
    } catch {
        alert("Error loading program.");
    }
}

async function deleteProgram(id) {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
        const res = await fetch("api/Programs/deletePrograms.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ program_id: id })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message);
            await loadPrograms();
        } else {
            alert(data.message || "Error deleting program.");
        }
    } catch {
        alert("Failed to delete program.");
    }
}













   async function loadYearsAndSemesters() {
    content.innerHTML = `
        <h2>Academic Years & Semesters</h2>

        <h3>Years</h3>
        <table>
            <thead>
                <tr>
                    <th>Year ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="years-tbody"></tbody>
        </table>
        <button id="btn-add-year" class="add-btn">Add Year</button>

        <h3>Semesters</h3>
        <table>
            <thead>
                <tr>
                    <th>Semester ID</th>
                    <th>Semester Name</th>
                    <th>Year ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="semesters-tbody"></tbody>
        </table>
        <button id="btn-add-semester" class="add-btn">Add Semester</button>
    `;

    document.getElementById('btn-add-year').onclick = () => renderYearForm();
    document.getElementById('btn-add-semester').onclick = () => renderSemesterForm();

    await Promise.all([
        YearsTable(),
        SemestersTable()
    ]);
}

async function YearsTable() {
    const tbody = document.getElementById('years-tbody');

    try {
        const res = await fetch('api/Years&Semesters/getYears.php');
        const data = await res.json();

        if (data.success) {
            tbody.innerHTML = '';
            data.data.forEach(y => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${y.year_id}</td>
                    <td>${y.year_from}</td>
                    <td>${y.year_to}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${y.year_id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${y.year_id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.onclick = async function (e) {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');

                if (editBtn) await editYear(parseInt(editBtn.dataset.id));
                else if (deleteBtn) await deleteYear(parseInt(deleteBtn.dataset.id));
            };

        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error fetching years.</td></tr>`;
    }
}

async function SemestersTable() {
    const tbody = document.getElementById('semesters-tbody');

    try {
        const res = await fetch('api/Years&Semesters/getSemesters.php');
        const data = await res.json();

        if (data.success) {
            tbody.innerHTML = '';
            data.data.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.sem_id}</td>
                    <td>${s.sem_name}</td>
                    <td>${s.year_id}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${s.sem_id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${s.sem_id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.onclick = async function (e) {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');

                if (editBtn) await editSemester(parseInt(editBtn.dataset.id));
                else if (deleteBtn) await deleteSemester(parseInt(deleteBtn.dataset.id));
            };

        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error fetching semesters.</td></tr>`;
    }
}

function renderYearForm(editData) {
    const html = `
        <form id="year-form">
            <h3>${editData ? 'Edit Year' : 'Add Year'}</h3>
            <label>Year ID</label>
            <input type="number" id="year-id" value="${editData ? editData.year_id : ''}" required />
           <label>From</label>
            <input type="number" id="year-from" value="${editData ? editData.year_from : ''}" required />
            <label>To</label>
            <input type="number" id="year-to" value="${editData ? editData.year_to : ''}" required />
            <button type="submit">${editData ? 'Update' : 'Add'}</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </form>
    `;

    showFormModal(html);

    document.getElementById('cancel-btn').onclick = () => closeFormModal();

    document.getElementById('year-form').onsubmit = async (e) => {
        e.preventDefault();
        const year_from = document.getElementById('year-from').value;
        const year_to = document.getElementById('year-to').value;

        const url = editData ? 'api/Years&Semesters/updateYears.php' : 'api/Years&Semesters/addYears.php';
        const payload = editData ? { year_id: editData.year_id, year_from, year_to } : { year_from, year_to };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            alert(data.message);
            if (data.success) {
                closeFormModal();
                await YearsTable();
            }
        } catch (err) {
            alert('Error submitting year form');
        }
    };
}


function renderSemesterForm(editData) {
    const html = `
        <form id="semester-form">
            <h3>${editData ? 'Edit Semester' : 'Add Semester'}</h3>
            <label>Semester ID</label>
            <input type="number" id="sem-id" value="${editData ? editData.sem_id : ''}" required />
            <label>Semester Name</label>
            <input type="text" id="sem-name" value="${editData ? editData.sem_name : ''}" required />
            <label>Year ID</label>
            <input type="number" id="sem-year-id" value="${editData ? editData.year_id : ''}" required />
            <button type="submit">${editData ? 'Update' : 'Add'}</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </form>
    `;

    showFormModal(html);

    document.getElementById('cancel-btn').onclick = () => closeFormModal();

    document.getElementById('semester-form').onsubmit = async (e) => {
        e.preventDefault();
        const sem_name = document.getElementById('sem-name').value;
        const year_id = document.getElementById('sem-year-id').value;

        const url = editData ? 'api/Years&Semesters/updateSemesters.php' : 'api/Years&Semesters/addSemesters.php';
        const payload = editData ? { sem_id: editData.sem_id, sem_name, year_id } : { sem_name, year_id };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            alert(data.message);
            if (data.success) {
                closeFormModal();
                await SemestersTable();
            }
        } catch (err) {
            alert('Error submitting semester form');
        }
    };
}


async function editYear(id) {
    try {
        const res = await fetch('api/Years&Semesters/getYears.php');
        const data = await res.json();
        if (!data.success) return alert('Failed to fetch year');

        const year = data.data.find(y => y.year_id == id);
        if (!year) return alert('Year not found');

        renderYearForm(year);
    } catch {
        alert('Error editing year');
    }
}

async function deleteYear(id) {
    if (!confirm("Are you sure you want to delete this year?")) return;

    try {
        const res = await fetch('api/Years&Semesters/deleteYears.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year_id: id })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message);
            await YearsTable();
        } else {
            alert(data.message);
        }
    } catch {
        alert("Error deleting year.");
    }
}

async function editSemester(id) {
    try {
        const res = await fetch('api/Years&Semesters/getSemesters.php');
        const data = await res.json();
        if (!data.success) return alert('Failed to fetch semester');

        const semester = data.data.find(s => s.sem_id == id);
        if (!semester) return alert('Semester not found');

        renderSemesterForm(semester);
    } catch {
        alert('Error editing semester');
    }
}

async function deleteSemester(id) {
    if (!confirm("Are you sure you want to delete this semester?")) return;

    try {
        const res = await fetch('api/Years&Semesters/deleteSemester.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sem_id: id })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message);
            await SemestersTable();
        } else {
            alert(data.message);
        }
    } catch {
        alert("Error deleting semester.");
    }
}

function showFormModal(html) {
    const container = document.getElementById('form-modal-container');
    container.innerHTML = `
        <div class="modal">
            <div class="modal-content">
                ${html}
            </div>
        </div>
    `;
    container.style.display = 'block';
}

function closeFormModal() {
    const container = document.getElementById('form-modal-container');
    container.innerHTML = '';
    container.style.display = 'none';
}

















async function loadSubjects() {
    content.innerHTML = `
        <h2>Subjects</h2>

        <table>
            <thead>
                <tr>
                    <th>Subject ID</th>
                    <th>Subject Name</th>
                    <th>Semester ID</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="subjects-tbody"></tbody>
        </table>

        <button id="btn-add-subject" class="add-btn">Add Subject</button>
    `;

    document.getElementById('btn-add-subject').onclick = () => renderSubjectForm();

    await populateSubjectsTable();
}

async function renderSubjectForm(editData = null) {
    let semesterData = [];
    try {
        const res = await fetch('api/Years&Semesters/getSemesters.php');
        const json = await res.json();
        if (json.success) {
            semesterData = json.data;
        } else {
            alert('Failed to fetch semesters.');
            return;
        }
    } catch {
        alert('Error loading semesters.');
        return;
    }

    const html = `
        <form id="subject-form">
            <h3>${editData ? 'Edit Subject' : 'Add Subject'}</h3>
            <label>Subject ID</label>
            <input type="number" id="subject-id" value="${editData ? editData.subject_id : ''}" ${editData ? 'readonly' : 'required'} />

            <label>Subject Name</label>
            <input type="text" id="subject-name" value="${editData ? editData.subject_name : ''}" required />

            <label>Semester</label>
            <select id="subject-semester" required>
                <option value="">Select Semester</option>
                ${semesterData.map(s => `
                    <option value="${s.sem_id}" ${editData && s.sem_id == editData.sem_id ? 'selected' : ''}>
                        ${s.sem_name} (${s.year_id})
                    </option>
                `).join('')}
            </select>

            <button type="submit">${editData ? 'Update' : 'Add'}</button>
            <button type="button" id="cancel-btn">Cancel</button>
        </form>
    `;

    showFormModal(html);

    document.getElementById('cancel-btn').onclick = () => closeFormModal();

    document.getElementById('subject-form').onsubmit = async (e) => {
        e.preventDefault();
        const subject_id = document.getElementById('subject-id').value.trim();
        const subject_name = document.getElementById('subject-name').value.trim();
        const sem_id = document.getElementById('subject-semester').value;

        if (!subject_id || !subject_name || !sem_id) {
            alert('All fields are required.');
            return;
        }

        const url = editData
            ? 'api/Subjects/updateSubjects.php'
            : 'api/Subjects/addSubjects.php';

        const payload = editData
            ? { subject_id, subject_name, sem_id }
            : { subject_id, subject_name, sem_id };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            alert(result.message);
            if (result.success) {
                closeFormModal();
                await populateSubjectsTable();
            }
        } catch {
            alert('Error submitting subject form.');
        }
    };
}

async function populateSubjectsTable() {
    const tbody = document.getElementById('subjects-tbody');

    try {
        const res = await fetch('api/Subjects/getSubjects.php');
        const data = await res.json();
        console.log("Subjects Data:", data);

        if (data.success) {
            tbody.innerHTML = '';
            data.data.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${s.subject_id}</td>
                    <td>${s.subject_name}</td>
                    <td>${s.sem_id}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${s.subject_id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${s.subject_id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            tbody.onclick = async function (e) {
                const editBtn = e.target.closest('.edit-btn');
                const deleteBtn = e.target.closest('.delete-btn');
                if (editBtn) await editSubject(editBtn.dataset.id);
                else if (deleteBtn) await deleteSubject(deleteBtn.dataset.id);
            };
        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        console.error("Error fetching subjects:", error);
        tbody.innerHTML = `<tr><td colspan="4">Error fetching subjects.</td></tr>`;
    }
}

async function editSubject(subject_id) {
    try {
        const res = await fetch('api/Subjects/getSubjects.php');
        const data = await res.json();

        if (!data.success) {
            alert('Unable to fetch subject for editing');
            return;
        }

        const subject = data.data.find(s => s.subject_id === subject_id);
        if (!subject) {
            alert('Subject not found');
            return;
        }

        renderSubjectForm(subject);
    } catch {
        alert('Error loading subject for edit');
    }
}

async function deleteSubject(subject_id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
        const res = await fetch('api/Subjects/deleteSubjects.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject_id }),
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message);
            await populateSubjectsTable();
        } else {
            alert(data.message || 'Unable to delete subject.');
        }
    } catch {
        alert('Error deleting subject');
    }
}

function showFormModal(innerHTML) {
    const modalContainer = document.getElementById('form-modal-container');
    modalContainer.innerHTML = `
        <div class="form-modal-overlay" onclick="closeFormModal(event)">
            <div class="form-modal" onclick="event.stopPropagation()">
                ${innerHTML}
            </div>
        </div>
    `;
    modalContainer.style.display = 'block';
}

function closeFormModal(event) {
    const modalContainer = document.getElementById('form-modal-container');
    if (!event || event.target.classList.contains('form-modal-overlay')) {
        modalContainer.innerHTML = '';
        modalContainer.style.display = 'none';
    }
}





 


//ENROLLMENT


async function loadEnrollments() {
    content.innerHTML = `
        <h2>Enrollments</h2>

        <table>
            <thead>
                <tr>
                    <th>Enrollment ID</th>
                    <th>Student Name</th>
                    <th>Subject Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="enrollments-tbody"></tbody>
        </table>

        <button id="btn-add-enrollment" class="add-btn">Add Enrollment</button>
    `;

    document.getElementById('btn-add-enrollment').onclick = () => openAddEnrollmentModal();

    await enrollmentsTable();
}

async function enrollmentsTable() {
    const tbody = document.getElementById('enrollments-tbody');

    try {
        const res = await fetch('api/Enrollment/getEnrollments.php');
        const text = await res.text(); // Log raw response for debugging
        console.log("Raw enrollments response:", text);
        const data = JSON.parse(text);

        if (data.success) {
            tbody.innerHTML = '';
            data.data.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.load_id}</td>
                    <td>${e.student_name}</td>
                    <td>${e.subject_name}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${e.load_id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${e.load_id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error fetching enrollments.</td></tr>`;
    }
}






    










});