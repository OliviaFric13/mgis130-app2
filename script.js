// Multi-Course State Management stored in localStorage
let appData = JSON.parse(localStorage.getItem('mycourses_multicourse_tracker')) || {
    activeCourseId: "course_1",
    courses: [
        {
            id: "course_1",
            name: "MGIS 130",
            categories: [
                { id: "cat1", name: "Homework", weight: 30 },
                { id: "cat2", name: "Quizzes", weight: 30 },
                { id: "cat3", name: "Exams", weight: 40 }
            ],
            assignments: []
        }
    ]
};

// DOM Elements
const courseTabsContainer = document.getElementById('course-tabs');
const newCourseBtn = document.getElementById('new-course-btn');
const courseNameInput = document.getElementById('course-name-input');
const saveCourseBtn = document.getElementById('save-course-btn');
const deleteCourseBtn = document.getElementById('delete-course-btn');
const syllabusTextInput = document.getElementById('syllabus-text-input');
const parseSyllabusBtn = document.getElementById('parse-syllabus-btn');
const categoryForm = document.getElementById('category-form');
const catNameInput = document.getElementById('cat-name');
const catWeightInput = document.getElementById('cat-weight');
const categoryListContainer = document.getElementById('category-list-container');
const weightWarning = document.getElementById('weight-warning');
const assignmentForm = document.getElementById('assignment-form');
const assignCategorySelect = document.getElementById('assign-category');
const assignmentsTableBody = document.getElementById('assignments-table-body');
const overallPercentageEl = document.getElementById('overall-percentage');
const overallLetterEl = document.getElementById('overall-letter');
const clearDataBtn = document.getElementById('clear-data-btn');

document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});

// Switch Active Course Tab
window.switchCourse = function(courseId) {
    appData.activeCourseId = courseId;
    saveAndRender();
};

// Add New Course
newCourseBtn.addEventListener('click', () => {
    const newId = 'course_' + Date.now();
    const newCourse = {
        id: newId,
        name: "New Course " + (appData.courses.length + 1),
        categories: [],
        assignments: []
    };
    appData.courses.push(newCourse);
    appData.activeCourseId = newId;
    saveAndRender();
});

// Update Current Course Name
saveCourseBtn.addEventListener('click', () => {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;
    const name = courseNameInput.value.trim();
    if (name) {
        currentCourse.name = name;
        saveAndRender();
    }
});

// Delete Current Course
deleteCourseBtn.addEventListener('click', () => {
    if (appData.courses.length <= 1) {
        alert("You must keep at least one course!");
        return;
    }
    if (confirm("Are you sure you want to delete this course and all its data?")) {
        appData.courses = appData.courses.filter(c => c.id !== appData.activeCourseId);
        appData.activeCourseId = appData.courses[0].id;
        saveAndRender();
    }
});

// Quick Syllabus Importer (Parses text looking for percentages)
parseSyllabusBtn.addEventListener('click', () => {
    const text = syllabusTextInput.value.trim();
    if (!text) {
        alert("Please paste syllabus text first!");
        return;
    }

    const currentCourse = getCurrentCourse();
    // Regex to find patterns like "Exams: 40%" or "Homework 30"
    const regex = /([a-zA-Z\s/]+)[:\s]+(\d{1,2}(?:\.\d+)?)\s*%/g;
    let match;
    let newCategories = [];

    while ((match = regex.exec(text)) !== null) {
        let catName = match[1].trim();
        // Clean up common trailing words
        catName = catName.replace(/worth|weight|grade/gi, '').trim();
        let catWeight = parseFloat(match[2]);
        if (catName && !isNaN(catWeight)) {
            newCategories.push({
                id: 'cat_' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: catName,
                weight: catWeight
            });
        }
    }

    if (newCategories.length > 0) {
        currentCourse.categories = newCategories;
        syllabusTextInput.value = '';
        saveAndRender();
        alert("Successfully parsed and updated syllabus categories!");
    } else {
        alert("Could not automatically detect categories and percentages. Make sure your text includes percentages like 'Exams 40%' or 'Homework: 30%'.");
    }
});

// Add Category
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentCourse = getCurrentCourse();
    const name = catNameInput.value.trim();
    const weight = parseFloat(catWeightInput.value);

    if (!name || isNaN(weight)) return;

    currentCourse.categories.push({
        id: 'cat_' + Date.now(),
        name,
        weight
    });

    catNameInput.value = '';
    catWeightInput.value = '';
    saveAndRender();
});

// Delete Category
window.deleteCategory = function(id) {
    const currentCourse = getCurrentCourse();
    currentCourse.categories = currentCourse.categories.filter(c => c.id !== id);
    currentCourse.assignments = currentCourse.assignments.filter(a => a.categoryId !== id);
    saveAndRender();
};

// Add Assignment
assignmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentCourse = getCurrentCourse();
    const name = document.getElementById('assign-name').value.trim();
    const categoryId = assignCategorySelect.value;
    const earned = parseFloat(document.getElementById('assign-earned').value);
    const possible = parseFloat(document.getElementById('assign-possible').value);

    if (!name || !categoryId || isNaN(earned) || isNaN(possible) || possible <= 0) return;

    currentCourse.assignments.push({
        id: 'assign_' + Date.now(),
        name,
        categoryId,
        earned,
        possible
    });

    assignmentForm.reset();
    saveAndRender();
});

// Delete Assignment
window.deleteAssignment = function(id) {
    const currentCourse = getCurrentCourse();
    currentCourse.assignments = currentCourse.assignments.filter(a => a.id !== id);
    saveAndRender();
};

// Reset Current Course Data
clearDataBtn.addEventListener('click', () => {
    const currentCourse = getCurrentCourse();
    if (confirm("Are you sure you want to reset categories and assignments for this course?")) {
        currentCourse.categories = [];
        currentCourse.assignments = [];
        saveAndRender();
    }
});

// Helper to get active course object
function getCurrentCourse() {
    let course = appData.courses.find(c => c.id === appData.activeCourseId);
    if (!course && appData.courses.length > 0) {
        appData.activeCourseId = appData.courses[0].id;
        course = appData.courses[0];
    }
    return course;
}

// Save and Render Pipeline
function saveAndRender() {
    localStorage.setItem('mycourses_multicourse_tracker', JSON.stringify(appData));
    renderApp();
}

// Main Render & Calculation Logic
function renderApp() {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;

    // 1. Render Tabs
    courseTabsContainer.innerHTML = '';
    const tabsList = document.createElement('div');
    tabsList.className = 'tabs-list';
    appData.courses.forEach(course => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${course.id === appData.activeCourseId ? 'active' : ''}`;
        btn.textContent = course.name;
        btn.onclick = () => switchCourse(course.id);
        tabsList.appendChild(btn);
    });
    courseTabsContainer.appendChild(tabsList);
    courseTabsContainer.appendChild(newCourseBtn);

    // Set input value for course name
    courseNameInput.value = currentCourse.name;

    // 2. Render Categories & Check Total Weight
    categoryListContainer.innerHTML = '';
    assignCategorySelect.innerHTML = '<option value="" disabled selected>Select category</option>';

    let totalWeight = 0;
    currentCourse.categories.forEach(cat => {
        totalWeight += cat.weight;

        const badge = document.createElement('div');
        badge.className = 'category-badge';
        badge.innerHTML = `<span><strong>${escapeHtml(cat.name)}</strong>: ${cat.weight}%</span> <button onclick="deleteCategory('${cat.id}')">&times;</button>`;
        categoryListContainer.appendChild(badge);

        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.name} (${cat.weight}%)`;
        assignCategorySelect.appendChild(opt);
    });

    if (totalWeight !== 100) {
        weightWarning.textContent = `⚠️ Total category weight is ${totalWeight}%. It should equal 100% for accurate calculations!`;
    } else {
        weightWarning.textContent = '';
    }

    // 3. Render Assignments Table & Calculate Grades
    assignmentsTableBody.innerHTML = '';
    if (currentCourse.assignments.length === 0) {
        assignmentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">No assignments logged yet. Add your scores above!</td>
            </tr>
        `;
        overallPercentageEl.textContent = '0.00%';
        overallLetterEl.textContent = '-';
        return;
    }

    let categoryScores = {};
    currentCourse.categories.forEach(cat => {
        categoryScores[cat.id] = { earned: 0, possible: 0, weight: cat.weight };
    });

    currentCourse.assignments.forEach(assign => {
        const cat = currentCourse.categories.find(c => c.id === assign.categoryId);
        const catName = cat ? cat.name : 'Unassigned';
        const assignPct = (assign.earned / assign.possible) * 100;

        if (categoryScores[assign.categoryId]) {
            categoryScores[assign.categoryId].earned += assign.earned;
            categoryScores[assign.categoryId].possible += assign.possible;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(assign.name)}</strong></td>
            <td>${escapeHtml(catName)}</td>
            <td>${assign.earned} / ${assign.possible}</td>
            <td>${assignPct.toFixed(2)}%</td>
            <td><button class="btn-secondary-outline" style="padding: 0.2rem 0.5rem; height: auto;" onclick="deleteAssignment('${assign.id}')">Delete</button></td>
        `;
        assignmentsTableBody.appendChild(tr);
    });

    let finalWeightedSum = 0;
    let activeWeightsTotal = 0;

    Object.keys(categoryScores).forEach(catId => {
        let catData = categoryScores[catId];
        if (catData.possible > 0) {
            let catPercentage = (catData.earned / catData.possible);
            finalWeightedSum += catPercentage * catData.weight;
            activeWeightsTotal += catData.weight;
        }
    });

    let overallPercentage = activeWeightsTotal > 0 ? (finalWeightedSum / (activeWeightsTotal / 100)) : 0;

    overallPercentageEl.textContent = overallPercentage.toFixed(2) + '%';
    overallLetterEl.textContent = getLetterGrade(overallPercentage);
}

function getLetterGrade(pct) {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 65) return 'D';
    return 'F';
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
