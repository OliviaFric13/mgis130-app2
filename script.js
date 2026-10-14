// LocalStorage State Management
let appData = JSON.parse(localStorage.getItem('courseclear_data')) || {
    activeCourseId: null,
    courses: [
        {
            id: "course_1",
            name: "MGIS 130",
            theme: "theme-pink",
            categories: [
                { id: "cat1", name: "Homework", weight: 30 },
                { id: "cat2", name: "Quizzes", weight: 30 },
                { id: "cat3", name: "Exams", weight: 40 }
            ],
            assignments: []
        },
        {
            id: "course_2",
            name: "MGMT 340",
            theme: "theme-purple",
            categories: [
                { id: "cat1", name: "Deliverables", weight: 50 },
                { id: "cat2", name: "Exams", weight: 50 }
            ],
            assignments: []
        }
    ]
};

// Available Themes Palette List
const availableThemes = ["theme-pink", "theme-purple", "theme-teal", "theme-yellow", "theme-indigo"];

// DOM Elements
const homeView = document.getElementById('home-view');
const courseDetailView = document.getElementById('course-detail-view');
const coursesGrid = document.getElementById('courses-grid');
const addCourseMainBtn = document.getElementById('add-course-main-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const themeSelector = document.getElementById('theme-selector');

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

// View Navigation: Open Home
backToHomeBtn.addEventListener('click', () => {
    appData.activeCourseId = null;
    document.body.className = "theme-pink"; // Reset home view to default pink
    saveAndRender();
});

// Add Course
addCourseMainBtn.addEventListener('click', () => {
    const newId = 'course_' + Date.now();
    const assignedTheme = availableThemes[appData.courses.length % availableThemes.length];
    
    const newCourse = {
        id: newId,
        name: "New Course " + (appData.courses.length + 1),
        theme: assignedTheme,
        categories: [],
        assignments: []
    };
    appData.courses.push(newCourse);
    appData.activeCourseId = newId;
    saveAndRender();
});

// Select Course Detail View
window.openCourseDetail = function(courseId) {
    appData.activeCourseId = courseId;
    saveAndRender();
};

// Theme Selector Changed
themeSelector.addEventListener('change', (e) => {
    const currentCourse = getCurrentCourse();
    if (currentCourse) {
        currentCourse.theme = e.target.value;
        document.body.className = currentCourse.theme;
        saveAndRender();
    }
});

// Update Course Name
saveCourseBtn.addEventListener('click', () => {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;
    const name = courseNameInput.value.trim();
    if (name) {
        currentCourse.name = name;
        saveAndRender();
    }
});

// Delete Course
deleteCourseBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete this course?")) {
        appData.courses = appData.courses.filter(c => c.id !== appData.activeCourseId);
        appData.activeCourseId = null;
        document.body.className = "theme-pink";
        saveAndRender();
    }
});

// Quick Syllabus Importer
parseSyllabusBtn.addEventListener('click', () => {
    const text = syllabusTextInput.value.trim();
    if (!text) {
        alert("Please paste syllabus text first!");
        return;
    }

    const currentCourse = getCurrentCourse();
    const regex = /([a-zA-Z\s/]+)[:\s]+(\d{1,2}(?:\.\d+)?)\s*%/g;
    let match;
    let newCategories = [];

    while ((match = regex.exec(text)) !== null) {
        let catName = match[1].trim().replace(/worth|weight|grade/gi, '').trim();
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
        alert("Successfully parsed syllabus categories!");
    } else {
        alert("Could not detect categories. Include percentages like 'Exams 40%' or 'Homework: 30%'.");
    }
});

// Add Category
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentCourse = getCurrentCourse();
    const name = catNameInput.value.trim();
    const weight = parseFloat(catWeightInput.value);

    if (!name || isNaN(weight)) return;

    currentCourse.categories.push({ id: 'cat_' + Date.now(), name, weight });
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

    currentCourse.assignments.push({ id: 'assign_' + Date.now(), name, categoryId, earned, possible });
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
    if (confirm("Reset categories and assignments for this course?")) {
        currentCourse.categories = [];
        currentCourse.assignments = [];
        saveAndRender();
    }
});

function getCurrentCourse() {
    return appData.courses.find(c => c.id === appData.activeCourseId);
}

function saveAndRender() {
    localStorage.setItem('courseclear_data', JSON.stringify(appData));
    renderApp();
}

// Main Render Logic
function renderApp() {
    if (!appData.activeCourseId) {
        // VIEW 1: HOME GRID
        homeView.classList.remove('hidden');
        courseDetailView.classList.add('hidden');
        renderHomeDashboard();
    } else {
        // VIEW 2: COURSE DETAIL
        homeView.classList.add('hidden');
        courseDetailView.classList.remove('hidden');
        renderCourseDetail();
    }
}

// Render Home View
function renderHomeDashboard() {
    coursesGrid.innerHTML = '';
    
    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        const tile = document.createElement('div');
        tile.className = `course-card-tile ${course.theme || 'theme-pink'}`;
        
        const themeColors = {
            'theme-pink': '#d63384',
            'theme-purple': '#8a2be2',
            'theme-teal': '#0d9488',
            'theme-yellow': '#d97706',
            'theme-indigo': '#4f46e5'
        };
        tile.style.setProperty('--card-accent', themeColors[course.theme] || '#d63384');

        tile.onclick = () => openCourseDetail(course.id);
        tile.innerHTML = `
            <div class="course-card-title">${escapeHtml(course.name)}</div>
            <div class="course-card-grade">
                <span class="course-card-pct">${stats.pct}%</span>
                <span class="course-card-letter">(${stats.letter})</span>
            </div>
        `;
        coursesGrid.appendChild(tile);
    });
}

// Render Course Detail View
function renderCourseDetail() {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;

    document.body.className = currentCourse.theme || 'theme-pink';
    themeSelector.value = currentCourse.theme || 'theme-pink';
    courseNameInput.value = currentCourse.name;

    // Render Categories
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

    weightWarning.textContent = totalWeight !== 100 ? `⚠️ Total category weight is ${totalWeight}%. It should equal 100% for accurate calculations!` : '';

    // Render Assignments & Calculate Grade
    assignmentsTableBody.innerHTML = '';
    if (currentCourse.assignments.length === 0) {
        assignmentsTableBody.innerHTML = `<tr><td colspan="5" class="empty-message">No assignments logged yet. Add your scores above!</td></tr>`;
        overallPercentageEl.textContent = '0.00%';
        overallLetterEl.textContent = '-';
        return;
    }

    const stats = calculateCourseGrade(currentCourse);
    
    currentCourse.assignments.forEach(assign => {
        const cat = currentCourse.categories.find(c => c.id === assign.categoryId);
        const catName = cat ? cat.name : 'Unassigned';
        const assignPct = (assign.earned / assign.possible) * 100;

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

    overallPercentageEl.textContent = stats.pct + '%';
    overallLetterEl.textContent = stats.letter;
}

function calculateCourseGrade(course) {
    if (course.assignments.length === 0) return { pct: '0.00', letter: '-' };

    let categoryScores = {};
    course.categories.forEach(cat => {
        categoryScores[cat.id] = { earned: 0, possible: 0, weight: cat.weight };
    });

    course.assignments.forEach(assign => {
        if (categoryScores[assign.categoryId]) {
            categoryScores[assign.categoryId].earned += assign.earned;
            categoryScores[assign.categoryId].possible += assign.possible;
        }
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
    return {
        pct: overallPercentage.toFixed(2),
        letter: getLetterGrade(overallPercentage)
    };
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
