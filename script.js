// Clean Default Initial State
const defaultState = {
    activeCourseId: null,
    targetGpa: 3.75,
    activeTab: 'courses',
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

// Safe Load & Corrupted Data Handler
let appData;
try {
    const raw = localStorage.getItem('courseclear_v3_data');
    appData = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultState));
    if (!appData.courses || !Array.isArray(appData.courses)) throw new Error("Invalid structure");
} catch (e) {
    appData = JSON.parse(JSON.stringify(defaultState));
}

const availableThemes = ["theme-pink", "theme-purple", "theme-teal", "theme-yellow", "theme-indigo"];

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    renderApp();
});

function bindEvents() {
    // Navigation
    document.getElementById('tab-courses-btn').onclick = () => { appData.activeTab = 'courses'; saveAndRender(); };
    document.getElementById('tab-goals-btn').onclick = () => { appData.activeTab = 'goals'; saveAndRender(); };
    document.getElementById('back-to-home-btn').onclick = () => { appData.activeCourseId = null; document.body.className = 'theme-pink'; saveAndRender(); };
    
    // Course Actions
    document.getElementById('add-course-main-btn').onclick = () => {
        const newId = 'course_' + Date.now();
        appData.courses.push({
            id: newId,
            name: "New Course " + (appData.courses.length + 1),
            credits: 3,
            theme: availableThemes[appData.courses.length % availableThemes.length],
            categories: [],
            assignments: []
        });
        appData.activeCourseId = newId;
        saveAndRender();
    };

    document.getElementById('save-course-btn').onclick = () => {
        const c = getCurrentCourse();
        if (!c) return;
        c.name = document.getElementById('course-name-input').value.trim() || c.name;
        c.credits = parseInt(document.getElementById('course-credits-input').value) || 3;
        saveAndRender();
    };

    document.getElementById('delete-course-btn').onclick = () => {
        if (confirm("Delete this course?")) {
            appData.courses = appData.courses.filter(c => c.id !== appData.activeCourseId);
            appData.activeCourseId = null;
            document.body.className = "theme-pink";
            saveAndRender();
        }
    };

    document.getElementById('theme-selector').onchange = (e) => {
        const c = getCurrentCourse();
        if (c) {
            c.theme = e.target.value;
            document.body.className = c.theme;
            saveAndRender();
        }
    };

    // Goal Actions
    document.getElementById('save-goal-btn').onclick = () => {
        const val = parseFloat(document.getElementById('target-gpa-input').value);
        if (!isNaN(val) && val >= 2.0 && val <= 4.0) {
            appData.targetGpa = val;
            saveAndRender();
            alert("Target GPA saved!");
        }
    };

    // Category Form
    document.getElementById('category-form').onsubmit = (e) => {
        e.preventDefault();
        const c = getCurrentCourse();
        const name = document.getElementById('cat-name').value.trim();
        const weight = parseFloat(document.getElementById('cat-weight').value);
        if (name && !isNaN(weight)) {
            c.categories.push({ id: 'cat_' + Date.now(), name, weight });
            document.getElementById('cat-name').value = '';
            document.getElementById('cat-weight').value = '';
            saveAndRender();
        }
    };

    // Assignment Form
    document.getElementById('assignment-form').onsubmit = (e) => {
        e.preventDefault();
        const c = getCurrentCourse();
        const name = document.getElementById('assign-name').value.trim();
        const categoryId = document.getElementById('assign-category').value;
        const earned = parseFloat(document.getElementById('assign-earned').value);
        const possible = parseFloat(document.getElementById('assign-possible').value);

        if (name && categoryId && !isNaN(earned) && !isNaN(possible) && possible > 0) {
            c.assignments.push({ id: 'assign_' + Date.now(), name, categoryId, earned, possible });
            document.getElementById('assignment-form').reset();
            saveAndRender();
        }
    };

    // Syllabus Parse
    document.getElementById('parse-syllabus-btn').onclick = () => {
        const text = document.getElementById('syllabus-text-input').value.trim();
        if (!text) return alert("Paste syllabus text first!");

        const c = getCurrentCourse();
        const regex = /([a-zA-Z\s/]+)[:\s]+(\d{1,2}(?:\.\d+)?)\s*%/g;
        let match, newCats = [];

        while ((match = regex.exec(text)) !== null) {
            let catName = match[1].trim().replace(/worth|weight|grade/gi, '').trim();
            let catWeight = parseFloat(match[2]);
            if (catName && !isNaN(catWeight)) {
                newCats.push({ id: 'cat_' + Date.now() + Math.random().toString(36).substr(2, 3), name: catName, weight: catWeight });
            }
        }

        if (newCats.length > 0) {
            c.categories = newCats;
            document.getElementById('syllabus-text-input').value = '';
            saveAndRender();
            alert("Parsed syllabus categories successfully!");
        } else {
            alert("Could not detect categories. Include format like 'Exams 40%'.");
        }
    };

    document.getElementById('clear-data-btn').onclick = () => {
        const c = getCurrentCourse();
        if (confirm("Reset categories and assignments for this course?")) {
            c.categories = [];
            c.assignments = [];
            saveAndRender();
        }
    };
}

function getCurrentCourse() {
    return appData.courses.find(c => c.id === appData.activeCourseId);
}

function saveAndRender() {
    localStorage.setItem('courseclear_v3_data', JSON.stringify(appData));
    renderApp();
}

function renderApp() {
    const homeView = document.getElementById('home-view');
    const courseDetailView = document.getElementById('course-detail-view');

    if (!appData.activeCourseId) {
        homeView.classList.remove('hidden');
        courseDetailView.classList.add('hidden');
        
        if (appData.activeTab === 'courses') {
            document.getElementById('tab-courses-btn').className = 'dash-tab active';
            document.getElementById('tab-goals-btn').className = 'dash-tab';
            document.getElementById('subview-courses').classList.remove('hidden');
            document.getElementById('subview-goals').classList.add('hidden');
            renderHomeDashboard();
        } else {
            document.getElementById('tab-courses-btn').className = 'dash-tab';
            document.getElementById('tab-goals-btn').className = 'dash-tab active';
            document.getElementById('subview-courses').classList.add('hidden');
            document.getElementById('subview-goals').classList.remove('hidden');
            renderGoalsHub();
        }
    } else {
        homeView.classList.add('hidden');
        courseDetailView.classList.remove('hidden');
        renderCourseDetail();
    }
}

function renderHomeDashboard() {
    const grid = document.getElementById('courses-grid');
    grid.innerHTML = '';

    const themeColors = { 'theme-pink': '#d63384', 'theme-purple': '#8a2be2', 'theme-teal': '#0d9488', 'theme-yellow': '#d97706', 'theme-indigo': '#4f46e5' };

    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        const tile = document.createElement('div');
        tile.className = `course-card-tile ${course.theme || 'theme-pink'}`;
        tile.style.setProperty('--card-accent', themeColors[course.theme] || '#d63384');
        tile.onclick = () => { appData.activeCourseId = course.id; saveAndRender(); };

        tile.innerHTML = `
            <div>
                <div class="course-card-title">${escapeHtml(course.name)}</div>
                <div class="course-card-credits">${course.credits} Credits</div>
            </div>
            <div class="course-card-grade">
                <span class="course-card-pct">${stats.pct}%</span>
                <span class="course-card-letter">(${stats.letter})</span>
            </div>
        `;
        grid.appendChild(tile);
    });
}

function renderGoalsHub() {
    let totalQualityPoints = 0, totalCredits = 0, gradedCount = 0;

    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        if (course.assignments.length > 0) {
            gradedCount++;
            totalQualityPoints += getGpaPoints(stats.letter) * course.credits;
            totalCredits += course.credits;
        }
    });

    const currentGpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
    document.getElementById('current-est-gpa').textContent = currentGpa;
    document.getElementById('target-gpa-input').value = appData.targetGpa;

    const statusText = document.getElementById('goal-status-text');
    const statusMetric = document.getElementById('goal-status-metric');

    if (gradedCount === 0) {
        statusText.textContent = 'No Grades Logged';
        statusMetric.style.background = '#f1f5f9';
    } else if (parseFloat(currentGpa) >= appData.targetGpa) {
        statusText.textContent = '🎯 On Track!';
        statusMetric.style.background = '#f0fdf4';
        statusMetric.style.color = '#38a169';
    } else {
        statusText.textContent = '⚠️ Needs Attention';
        statusMetric.style.background = '#fefce8';
        statusMetric.style.color = '#d69e2e';
    }

    const container = document.getElementById('insights-container');
    container.innerHTML = '';

    if (gradedCount === 0) {
        container.innerHTML = `<div class="insight-item"><div class="insight-title">Start Logging Scores</div><div class="insight-desc">Add scores to your course tabs to track your GPA toward your target of ${appData.targetGpa}.</div></div>`;
        return;
    }

    appData.courses.forEach(course => {
        const stats = calculateCourseGrade(course);
        if (course.assignments.length > 0) {
            const courseGpa = getGpaPoints(stats.letter);
            const isBehind = courseGpa < appData.targetGpa;
            const div = document.createElement('div');
            div.className = `insight-item ${isBehind ? 'warning' : 'success'}`;
            div.innerHTML = `
                <div class="insight-title">${isBehind ? 'Catch-Up Opportunity' : 'Exceeding Goal'}: ${escapeHtml(course.name)} (${stats.pct}%)</div>
                <div class="insight-desc">${isBehind ? `Currently at a <strong>${stats.letter}</strong>. Focus on upcoming weighted deliverables to pull this grade toward your ${appData.targetGpa} goal.` : `Great job! Your <strong>${stats.letter}</strong> is supporting your${appData.targetGpa} GPA target.`}</div>
            `;
            container.appendChild(div);
        }
    });
}

function renderCourseDetail() {
    const c = getCurrentCourse();
    if (!c) return;

    document.body.className = c.theme || 'theme-pink';
    document.getElementById('theme-selector').value = c.theme || 'theme-pink';
    document.getElementById('course-name-input').value = c.name;
    document.getElementById('course-credits-input').value = c.credits || 3;

    // Categories
    const catContainer = document.getElementById('category-list-container');
    const catSelect = document.getElementById('assign-category');
    catContainer.innerHTML = '';
    catSelect.innerHTML = '<option value="" disabled selected>Select category</option>';

    let totalWeight = 0;
    c.categories.forEach(cat => {
        totalWeight += cat.weight;
        const badge = document.createElement('div');
        badge.className = 'category-badge';
        badge.innerHTML = `<span><strong>${escapeHtml(cat.name)}</strong>: ${cat.weight}%</span> <button onclick="deleteCategory('${cat.id}')">&times;</button>`;
        catContainer.appendChild(badge);

        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.name} (${cat.weight}%)`;
        catSelect.appendChild(opt);
    });

    document.getElementById('weight-warning').textContent = totalWeight !== 100 ? `⚠️ Total category weight is ${totalWeight}%. Must total 100%!` : '';

    // Assignments
    const tbody = document.getElementById('assignments-table-body');
    tbody.innerHTML = '';

    if (c.assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No assignments logged yet.</td></tr>';
        document.getElementById('overall-percentage').textContent = '0.00%';
        document.getElementById('overall-letter').textContent = '-';
        return;
    }

    const stats = calculateCourseGrade(c);

    c.assignments.forEach(assign => {
        const cat = c.categories.find(cat => cat.id === assign.categoryId);
        const assignPct = (assign.earned / assign.possible) * 100;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${escapeHtml(assign.name)}</strong></td>
            <td>${escapeHtml(cat ? cat.name : 'Unassigned')}</td>
            <td>${assign.earned} / ${assign.possible}</td>
            <td>${assignPct.toFixed(2)}%</td>
            <td><button class="btn-secondary-outline" style="padding: 0.2rem 0.5rem; height: auto;" onclick="deleteAssignment('${assign.id}')">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('overall-percentage').textContent = stats.pct + '%';
    document.getElementById('overall-letter').textContent = stats.letter;
}

window.deleteCategory = function(id) {
    const c = getCurrentCourse();
    c.categories = c.categories.filter(cat => cat.id !== id);
    c.assignments = c.assignments.filter(a => a.categoryId !== id);
    saveAndRender();
};

window.deleteAssignment = function(id) {
    const c = getCurrentCourse();
    c.assignments = c.assignments.filter(a => a.id !== id);
    saveAndRender();
};

function calculateCourseGrade(course) {
    if (!course.assignments || course.assignments.length === 0) return { pct: '0.00', letter: '-' };

    let categoryScores = {};
    course.categories.forEach(cat => { categoryScores[cat.id] = { earned: 0, possible: 0, weight: cat.weight }; });

    course.assignments.forEach(assign => {
        if (categoryScores[assign.categoryId]) {
            categoryScores[assign.categoryId].earned += assign.earned;
            categoryScores[assign.categoryId].possible += assign.possible;
        }
    });

    let finalWeightedSum = 0, activeWeightsTotal = 0;
    Object.keys(categoryScores).forEach(catId => {
        let catData = categoryScores[catId];
        if (catData.possible > 0) {
            finalWeightedSum += (catData.earned / catData.possible) * catData.weight;
            activeWeightsTotal += catData.weight;
        }
    });

    let overallPercentage = activeWeightsTotal > 0 ? (finalWeightedSum / (activeWeightsTotal / 100)) : 0;
    return { pct: overallPercentage.toFixed(2), letter: getLetterGrade(overallPercentage) };
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
