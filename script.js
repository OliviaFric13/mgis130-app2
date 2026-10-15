// LocalStorage State Management
let appData = JSON.parse(localStorage.getItem('courseclear_goals_data')) || {
    activeCourseId: null,
    targetGpa: 3.75,
    activeTab: 'courses', // 'courses' or 'goals'
    courses: [
        {
            id: "course_1",
            name: "MGIS 130",
            credits: 3,
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
            credits: 3,
            theme: "theme-purple",
            categories: [
                { id: "cat1", name: "Deliverables", weight: 50 },
                { id: "cat2", name: "Exams", weight: 50 }
            ],
            assignments: []
        }
    ]
};

const availableThemes = ["theme-pink", "theme-purple", "theme-teal", "theme-yellow", "theme-indigo"];

// DOM Elements
const homeView = document.getElementById('home-view');
const courseDetailView = document.getElementById('course-detail-view');
const coursesGrid = document.getElementById('courses-grid');
const addCourseMainBtn = document.getElementById('add-course-main-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');
const themeSelector = document.getElementById('theme-selector');

const tabCoursesBtn = document.getElementById('tab-courses-btn');
const tabGoalsBtn = document.getElementById('tab-goals-btn');
const subviewCourses = document.getElementById('subview-courses');
const subviewGoals = document.getElementById('subview-goals');
const targetGpaInput = document.getElementById('target-gpa-input');
const saveGoalBtn = document.getElementById('save-goal-btn');
const currentEstGpaEl = document.getElementById('current-est-gpa');
const goalStatusText = document.getElementById('goal-status-text');
const goalStatusMetric = document.getElementById('goal-status-metric');
const insightsContainer = document.getElementById('insights-container');

const courseNameInput = document.getElementById('course-name-input');
const courseCreditsInput = document.getElementById('course-credits-input');
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
    targetGpaInput.value = appData.targetGpa;
    renderApp();
});

// Tab Navigation Switching
tabCoursesBtn.addEventListener('click', () => {
    appData.activeTab = 'courses';
    saveAndRender();
});

tabGoalsBtn.addEventListener('click', () => {
    appData.activeTab = 'goals';
    saveAndRender();
});

// Save Target GPA
saveGoalBtn.addEventListener('click', () => {
    const val = parseFloat(targetGpaInput.value);
    if (!isNaN(val) && val >= 2.0 && val <= 4.0) {
        appData.targetGpa = val;
        saveAndRender();
        alert("Target semester GPA saved successfully!");
    } else {
        alert("Please enter a valid GPA between 2.0 and 4.0.");
    }
});

// View Navigation: Open Home
backToHomeBtn.addEventListener('click', () => {
    appData.activeCourseId = null;
    document.body.className = "theme-pink";
    saveAndRender();
});

// Add Course
addCourseMainBtn.addEventListener('click', () => {
    const newId = 'course_' + Date.now();
    const assignedTheme = availableThemes[appData.courses.length % availableThemes.length];
    
    const newCourse = {
        id: newId,
        name: "New Course " + (appData.courses.length + 1),
        credits: 3,
        theme: assignedTheme,
        categories: [],
        assignments: []
    };
    appData.courses.push(newCourse);
    appData.activeCourseId = newId;
    saveAndRender();
});

window.openCourseDetail = function(courseId) {
    appData.activeCourseId = courseId;
    saveAndRender();
};

themeSelector.addEventListener('change', (e) => {
    const currentCourse = getCurrentCourse();
    if (currentCourse) {
        currentCourse.theme = e.target.value;
        document.body.className = currentCourse.theme;
        saveAndRender();
    }
});

saveCourseBtn.addEventListener('click', () => {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;
    const name = courseNameInput.value.trim();
    const credits = parseInt(courseCreditsInput.value);
    if (name) {
        currentCourse.name = name;
        currentCourse.credits = credits;
        saveAndRender();
    }
});

deleteCourseBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete this course?")) {
        appData.courses = appData.courses.filter(c => c.id !== appData.activeCourseId);
        appData.activeCourseId = null;
        document.body.className = "theme-pink";
        saveAndRender();
    }
});

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

window.deleteCategory = function(id) {
    const currentCourse = getCurrentCourse();
    currentCourse.categories = currentCourse.categories.filter(c => c.id !== id);
    currentCourse.assignments = currentCourse.assignments.filter(a => a.categoryId !== id);
    saveAndRender();
};

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

window.deleteAssignment = function(id) {
    const currentCourse = getCurrentCourse();
    currentCourse.assignments = currentCourse.assignments.filter(a => a.id !== id);
    saveAndRender();
});

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
    localStorage.setItem('courseclear_goals_data', JSON.stringify(appData));
    renderApp();
}

function renderApp() {
    if (!appData.activeCourseId) {
        homeView.classList.remove('hidden');
        courseDetailView.classList.add('hidden');
        
        // Toggle Subviews
        if (appData.activeTab === 'courses') {
            tabCoursesBtn.className = 'dash-tab active';
            tabGoalsBtn.className = 'dash-tab';
            subviewCourses.classList.remove('hidden');
            subviewGoals.classList.add('hidden');
            renderHomeDashboard();
        } else {
            tabCoursesBtn.className = 'dash-tab';
            tabGoalsBtn.className = 'dash-tab active';
            subviewCourses.classList.add('hidden');
            subviewGoals.classList.remove('hidden');
            renderGoalsHub();
        }
    } else {
        homeView.classList.add('hidden');
        courseDetailView.classList.remove('hidden');
        renderCourseDetail();
    }
}

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
            <div>
                <div class="course-card-title">${escapeHtml(course.name)}</div>
                <div class="course-card-credits">${course.credits} Credit Hours</div>
            </div>
            <div class="course-card-grade">
                <span class="course-card-pct">${stats.pct}%</span>
                <span class="course-card-letter">(${stats.letter})</span>
            </div>
        `;
        coursesGrid.appendChild(tile);
    });
}

function renderGoalsHub() {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    let gradedCoursesCount = 0;

    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        if (course.assignments.length > 0) {
            gradedCoursesCount++;
            const gpaValue = getGpaPoints(stats.letter);
            totalQualityPoints += gpaValue * course.credits;
            totalCredits += course.credits;
        }
    });

    const currentGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
    currentEstGpaEl.textContent = currentGpa;

    if (gradedCoursesCount === 0) {
        goalStatusText.textContent = 'No Grades Logged';
        goalStatusMetric.style.background = '#f1f5f9';
    } else if (parseFloat(currentGpa) >= appData.targetGpa) {
        goalStatusText.textContent = '🎯 On Track!';
        goalStatusMetric.style.background = '#f0fdf4';
        goalStatusMetric.style.color = '#38a169';
    } else {
        goalStatusText.textContent = '⚠️ Needs Attention';
        goalStatusMetric.style.background = '#fefce8';
        goalStatusMetric.style.color = '#d69e2e';
    }

    // Generate Actionable Insights
    insightsContainer.innerHTML = '';
    
    if (gradedCoursesCount === 0) {
        insightsContainer.innerHTML = `
            <div class="insight-item">
                <div class="insight-title">Get Started Logging Scores</div>
                <div class="insight-desc">Add assignments to your course tabs to start tracking your cumulative semester GPA against your target of ${appData.targetGpa}.</div>
            </div>
        `;
        return;
    }

    let insightsHtml = '';
    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        if (course.assignments.length > 0) {
            const courseGpa = getGpaPoints(stats.letter);
            if (courseGpa < appData.targetGpa) {
                insightsHtml += `
                    <div class="insight-item warning">
                        <div class="insight-title">Catch-Up Opportunity: ${escapeHtml(course.name)} (${stats.pct}%)</div>
                        <div class="insight-desc">You are currently at a <strong>${stats.letter}</strong> (${stats.pct}%). To pull this closer to your ${appData.targetGpa} GPA goal, focus heavily on upcoming weighted exams and high-point deliverables.</div>
                    </div>
                `;
            } else {
                insightsHtml += `
                    <div class="insight-item success">
                        <div class="insight-title">Exceeding Goal: ${escapeHtml(course.name)} (${stats.pct}%)</div>
                        <div class="insight-desc">Great work! Your <strong>${stats.letter}</strong> is supporting or exceeding your semester GPA target. Keep up the consistency!</div>
                    </div>
                `;
            }
        }
    });

    insightsContainer.innerHTML = insightsHtml;
}

function renderCourseDetail() {
    const currentCourse = getCurrentCourse();
    if (!currentCourse) return;

    document.body.className = currentCourse.theme || 'theme-pink';
    themeSelector.value = currentCourse.theme || 'theme-pink';
    courseNameInput.value = currentCourse.name;
    courseCreditsInput.value = currentCourse.credits || 3;

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

function getGpaPoints(letter) {
    const map = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
    return map[letter] || 0.0;
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
