const defaultState = {
    userName: "",
    hasSetGpaGoal: false,
    activeCourseId: null,
    targetGpa: 3.75,
    activeTab: 'courses',
    courses: [
        {
            id: "course_1",
            name: "Untitled Course",
            credits: 3,
            targetGrade: 90,
            theme: "theme-pink",
            categories: [],
            assignments: []
        }
    ]
};

let appData;
try {
    const raw = localStorage.getItem('courseclear_v10_data');
    appData = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultState));
    if (!appData.courses || !Array.isArray(appData.courses)) throw new Error("Invalid structure");
} catch (e) {
    appData = JSON.parse(JSON.stringify(defaultState));
}

const availableThemes = ["theme-pink", "theme-purple", "theme-teal", "theme-yellow", "theme-indigo"];
const quotes = [
    "✨ 'Consistency is the DNA of academic success.'",
    "🚀 'Small daily improvements lead to stunning results.'",
    "💡 'Your future is created by what you do today, not tomorrow.'",
    "🎯 'Focus on progress, not perfection.'"
];

const tourSteps = [
    {
        badge: "Step 1 of 4",
        title: "Courses & Themes 🎨",
        text: "Add your classes, assign credit hours, set target percentage grades, and customize each course tile with aesthetic color themes."
    },
    {
        badge: "Step 2 of 4",
        title: "Guided Syllabus Setup ⚡",
        text: "When you join a course, a popup guides you to paste your syllabus breakdown or add weighted categories before logging grades."
    },
    {
        badge: "Step 3 of 4",
        title: "Study Buddy & What-If Simulator 🤖",
        text: "Whenever you log a grade, your reactive Study Buddy instantly analyzes your work and gives tailored advice. Use the simulator drawer to test future scores!"
    },
    {
        badge: "Step 4 of 4",
        title: "GPA Goals & Data Backup 🎯",
        text: "Track your overall semester target GPA under the 'GPA & Goals' tab and export/import JSON backup files anytime."
    }
];

let currentTourIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('daily-quote').textContent = quotes[Math.floor(Math.random() * quotes.length)];
    
    if (!appData.userName) {
        document.getElementById('welcome-modal').classList.remove('hidden');
        showModalStep('modal-step-name');
    }

    bindEvents();
    renderApp();
});

function showModalStep(stepId) {
    document.getElementById('modal-step-name').classList.add('hidden');
    document.getElementById('modal-step-intro').classList.add('hidden');
    document.getElementById('modal-step-tour').classList.add('hidden');
    document.getElementById(stepId).classList.remove('hidden');
}

function bindEvents() {
    // Welcome Onboarding
    document.getElementById('setup-name-btn').onclick = () => {
        const name = document.getElementById('setup-name-input').value.trim();
        if (name) {
            appData.userName = name;
            saveAndRender();
            document.getElementById('tour-welcome-title').textContent = `Nice to meet you, ${name}! 👋`;
            showModalStep('modal-step-intro');
        } else {
            alert("Please enter your name.");
        }
    };

    document.getElementById('start-tour-btn').onclick = () => {
        currentTourIndex = 0;
        renderTourStep();
        showModalStep('modal-step-tour');
    };

    document.getElementById('skip-tour-btn').onclick = () => {
        document.getElementById('welcome-modal').classList.add('hidden');
    };

    document.getElementById('tour-skip-anytime-btn').onclick = () => {
        document.getElementById('welcome-modal').classList.add('hidden');
    };

    document.getElementById('tour-next-btn').onclick = () => {
        currentTourIndex++;
        if (currentTourIndex < tourSteps.length) {
            renderTourStep();
        } else {
            document.getElementById('welcome-modal').classList.add('hidden');
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
    };

    // First-Time GPA Goal Setup
    document.getElementById('save-first-time-gpa-btn').onclick = () => {
        const val = parseFloat(document.getElementById('first-time-gpa-input').value);
        if (!isNaN(val) && val >= 2.0 && val <= 4.0) {
            appData.targetGpa = val;
            appData.hasSetGpaGoal = true;
            document.getElementById('gpa-setup-modal').classList.add('hidden');
            saveAndRender();
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } else {
            alert("Please enter a valid GPA between 2.0 and 4.0");
        }
    };

    // Syllabus Modal Setup Tabs
    document.getElementById('setup-tab-parse-btn').onclick = () => {
        document.getElementById('setup-tab-parse-btn').className = 'dash-tab active';
        document.getElementById('setup-tab-manual-btn').className = 'dash-tab';
        document.getElementById('setup-subview-parse').classList.remove('hidden');
        document.getElementById('setup-subview-manual').classList.add('hidden');
    };

    document.getElementById('setup-tab-manual-btn').onclick = () => {
        document.getElementById('setup-tab-parse-btn').className = 'dash-tab';
        document.getElementById('setup-tab-manual-btn').className = 'dash-tab active';
        document.getElementById('setup-subview-parse').classList.add('hidden');
        document.getElementById('setup-subview-manual').classList.remove('hidden');
    };

    document.getElementById('modal-parse-btn').onclick = () => {
        const text = document.getElementById('modal-syllabus-text').value.trim();
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
            document.getElementById('modal-syllabus-text').value = '';
            renderSyllabusModalBadges(c);
            saveAndRender();
        } else {
            alert("Could not detect categories. Include format like 'Exams 40%'.");
        }
    };

    document.getElementById('modal-category-form').onsubmit = (e) => {
        e.preventDefault();
        const c = getCurrentCourse();
        const name = document.getElementById('modal-cat-name').value.trim();
        const weight = parseFloat(document.getElementById('modal-cat-weight').value);
        if (name && !isNaN(weight)) {
            c.categories.push({ id: 'cat_' + Date.now(), name, weight });
            document.getElementById('modal-cat-name').value = '';
            document.getElementById('modal-cat-weight').value = '';
            renderSyllabusModalBadges(c);
            saveAndRender();
        }
    };

    document.getElementById('finish-syllabus-setup-btn').onclick = () => {
        document.getElementById('syllabus-setup-modal').classList.add('hidden');
    };

    // Navigation
    document.getElementById('tab-courses-btn').onclick = () => { appData.activeTab = 'courses'; saveAndRender(); };
    document.getElementById('tab-goals-btn').onclick = () => { 
        appData.activeTab = 'goals'; 
        if (!appData.hasSetGpaGoal) {
            document.getElementById('gpa-setup-modal').classList.remove('hidden');
        } else {
            saveAndRender(); 
        }
    };
    document.getElementById('tab-help-btn').onclick = () => { appData.activeTab = 'help'; saveAndRender(); };
    document.getElementById('back-to-home-btn').onclick = () => { appData.activeCourseId = null; document.body.className = 'theme-pink'; saveAndRender(); };
    
    document.getElementById('add-course-main-btn').onclick = () => {
        const newId = 'course_' + Date.now();
        const newCourse = {
            id: newId,
            name: "Untitled Course " + (appData.courses.length + 1),
            credits: 3,
            targetGrade: 90,
            theme: availableThemes[appData.courses.length % availableThemes.length],
            categories: [],
            assignments: []
        };
        appData.courses.push(newCourse);
        appData.activeCourseId = newId;
        saveAndRender();
        openSyllabusModal(newCourse);
    };

    document.getElementById('course-name-input').oninput = (e) => {
        const c = getCurrentCourse();
        if (c) {
            c.name = e.target.value.trim() || "Untitled Course";
            localStorage.setItem('courseclear_v10_data', JSON.stringify(appData));
        }
    };

    document.getElementById('save-course-btn').onclick = () => {
        const c = getCurrentCourse();
        if (!c) return;
        c.credits = parseInt(document.getElementById('course-credits-input').value) || 3;
        c.targetGrade = parseFloat(document.getElementById('course-target-input').value) || 90;
        saveAndRender();
        alert("Course settings saved!");
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

    document.getElementById('save-goal-btn').onclick = () => {
        const val = parseFloat(document.getElementById('target-gpa-input').value);
        if (!isNaN(val) && val >= 2.0 && val <= 4.0) {
            appData.targetGpa = val;
            saveAndRender();
            alert("Target GPA saved!");
        }
    };

    document.getElementById('export-json-btn').onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "courseclear_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    document.getElementById('import-json-file').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                if (parsed.courses && Array.isArray(parsed.courses)) {
                    appData = parsed;
                    saveAndRender();
                    alert("Backup restored successfully!");
                } else {
                    alert("Invalid backup file format.");
                }
            } catch (err) {
                alert("Error reading JSON file.");
            }
        };
        reader.readAsText(file);
    };

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

            if ((earned / possible) >= 1) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        }
    };

    const simCategory = document.getElementById('sim-category');
    const simEarned = document.getElementById('sim-earned');
    const simPossible = document.getElementById('sim-possible');

    [simCategory, simEarned, simPossible].forEach(el => {
        el.oninput = updateSimulator;
    });

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

function openSyllabusModal(course) {
    document.getElementById('syllabus-modal-course-title').textContent = `Configure Syllabus: ${course.name}`;
    renderSyllabusModalBadges(course);
    document.getElementById('syllabus-setup-modal').classList.remove('hidden');
}

function renderSyllabusModalBadges(course) {
    const container = document.getElementById('modal-category-badges');
    container.innerHTML = '';
    let totalWeight = 0;
    course.categories.forEach(cat => {
        totalWeight += cat.weight;
        const badge = document.createElement('div');
        badge.className = 'category-badge';
        badge.innerHTML = `<span><strong>${escapeHtml(cat.name)}</strong>: ${cat.weight}%</span> <button onclick="deleteCategoryModal('${cat.id}')">&times;</button>`;
        container.appendChild(badge);
    });
    document.getElementById('modal-weight-warning').textContent = totalWeight !== 100 ? `⚠️ Total weight is ${totalWeight}%. Must total 100%!` : '✅ Total weight is 100%! Ready to go.';
}

window.deleteCategoryModal = function(id) {
    const c = getCurrentCourse();
    c.categories = c.categories.filter(cat => cat.id !== id);
    c.assignments = c.assignments.filter(a => a.categoryId !== id);
    renderSyllabusModalBadges(c);
    saveAndRender();
};

function renderTourStep() {
    const step = tourSteps[currentTourIndex];
    document.getElementById('tour-step-badge').textContent = step.badge;
    document.getElementById('tour-step-title').textContent = step.title;
    document.getElementById('tour-step-body').textContent = step.text;
    document.getElementById('tour-next-btn').textContent = currentTourIndex === tourSteps.length - 1 ? "Finish Tour 🎉" : "Next →";
}

function getCurrentCourse() {
    return appData.courses.find(c => c.id === appData.activeCourseId);
}

function saveAndRender() {
    localStorage.setItem('courseclear_v10_data', JSON.stringify(appData));
    renderApp();
}

function renderApp() {
    const homeView = document.getElementById('home-view');
    const courseDetailView = document.getElementById('course-detail-view');

    const greetingEl = document.getElementById('personalized-greeting');
    if (appData.userName) {
        greetingEl.textContent = `Welcome back, ${appData.userName}! Track your courses, semester goals, and stay on top of your grades.`;
    }

    if (!appData.activeCourseId) {
        homeView.classList.remove('hidden');
        courseDetailView.classList.add('hidden');
        
        document.getElementById('tab-courses-btn').className = appData.activeTab === 'courses' ? 'dash-tab active' : 'dash-tab';
        document.getElementById('tab-goals-btn').className = appData.activeTab === 'goals' ? 'dash-tab active' : 'dash-tab';
        document.getElementById('tab-help-btn').className = appData.activeTab === 'help' ? 'dash-tab active' : 'dash-tab';

        document.getElementById('subview-courses').classList.toggle('hidden', appData.activeTab !== 'courses');
        document.getElementById('subview-goals').classList.toggle('hidden', appData.activeTab !== 'goals');
        document.getElementById('subview-help').classList.toggle('hidden', appData.activeTab !== 'help');

        if (appData.activeTab === 'courses') renderHomeDashboard();
        if (appData.activeTab === 'goals') renderGoalsHub();
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
        const target = course.targetGrade || 90;
        const tile = document.createElement('div');
        tile.className = `course-card-tile ${course.theme || 'theme-pink'}`;
        tile.style.setProperty('--card-accent', themeColors[course.theme] || '#d63384');
        tile.onclick = () => { 
            appData.activeCourseId = course.id; 
            saveAndRender();
            if (!course.categories || course.categories.length === 0) {
                openSyllabusModal(course);
            }
        };

        tile.innerHTML = `
            <div>
                <div class="course-card-title">${escapeHtml(course.name)}</div>
                <div class="course-card-credits">${course.credits} Credits</div>
                <div class="course-card-target-tag">Target: ${target}%</div>
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
        const target = course.targetGrade || 90;
        if (course.assignments.length > 0) {
            const isBehind = parseFloat(stats.pct) < target;
            const div = document.createElement('div');
            div.className = `insight-item ${isBehind ? 'warning' : 'success'}`;
            div.innerHTML = `
                <div class="insight-title">${isBehind ? 'Catch-Up Opportunity' : 'Exceeding Target'}: ${escapeHtml(course.name)} (${stats.pct}% / Target: ${target}%)</div>
                <div class="insight-desc">${isBehind ? `Currently sitting at <strong>${stats.pct}% (${stats.letter})</strong>. Focus on high-weight deliverables in this class to bridge the gap to your target of ${target}%.` : `Awesome job! Your <strong>${stats.pct}%</strong> exceeds your course target of ${target}%.`}</div>
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
    document.getElementById('course-name-input').value = c.name === "Untitled Course" ? "" : c.name;
    document.getElementById('course-credits-input').value = c.credits || 3;
    document.getElementById('course-target-input').value = c.targetGrade || 90;
    
    document.getElementById('course-credits-badge').textContent = `${c.credits} Credits`;
    document.getElementById('course-target-badge').textContent = `Target: ${c.targetGrade || 90}%`;

    renderStudyBuddy(c);

    const catContainer = document.getElementById('category-list-container');
    const catSelect = document.getElementById('assign-category');
    const simCategory = document.getElementById('sim-category');

    catContainer.innerHTML = '';
    catSelect.innerHTML = '<option value="" disabled selected>Select category</option>';
    simCategory.innerHTML = '<option value="" disabled selected>Select category</option>';

    let totalWeight = 0;
    c.categories.forEach(cat => {
        totalWeight += cat.weight;
        const badge = document.createElement('div');
        badge.className = 'category-badge';
        badge.innerHTML = `<span><strong>${escapeHtml(cat.name)}</strong>: ${cat.weight}%</span> <button onclick="deleteCategory('${cat.id}')">&times;</button>`;
        catContainer.appendChild(badge);

        const opt1 = document.createElement('option');
        opt1.value = cat.id;
        opt1.textContent = `${cat.name} (${cat.weight}%)`;
        catSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = cat.id;
        opt2.textContent = `${cat.name} (${cat.weight}%)`;
        simCategory.appendChild(opt2);
    });

    document.getElementById('weight-warning').textContent = totalWeight !== 100 ? `⚠️ Total category weight is ${totalWeight}%. Must total 100%!` : '';

    const tbody = document.getElementById('assignments-table-body');
    tbody.innerHTML = '';

    if (c.assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No assignments logged yet.</td></tr>';
        document.getElementById('overall-percentage').textContent = '0.00%';
        document.getElementById('overall-letter').textContent = '-';
        updateSimulator();
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
    updateSimulator();
}

function renderStudyBuddy(course) {
    const container = document.getElementById('study-buddy-container');
    const stats = calculateCourseGrade(course);
    const target = course.targetGrade || 90;
    const currentPct = parseFloat(stats.pct);

    if (course.assignments.length === 0) {
        container.innerHTML = `
            <div class="study-buddy-box">
                <div class="buddy-status">Status: Waiting for score inputs...</div>
                <div class="buddy-advice">Add your first assignment score above so your Study Buddy can analyze your performance against your <strong>${target}%</strong> course goal!</div>
            </div>
        `;
        return;
    }

    let lowestAssign = null;
    let lowestPct = 101;
    course.assignments.forEach(a => {
        let pct = (a.earned / a.possible) * 100;
        if (pct < lowestPct) {
            lowestPct = pct;
            lowestAssign = a;
        }
    });

    const isMeetingTarget = currentPct >= target;
    const diff = (target - currentPct).toFixed(1);

    let html = `
        <div class="study-buddy-box">
            <div class="buddy-status ${isMeetingTarget ? 'success' : 'warning'}">
                ${isMeetingTarget ? `🟢 On Track! (+${(currentPct - target).toFixed(1)}% above target)` : `🟡 Behind Target (${diff}% needed to reach ${target}%)`}
            </div>
            <div class="buddy-advice">
                ${isMeetingTarget 
                    ? `Great job! Your current grade of <strong>${currentPct}%</strong> is meeting your target of <strong>${target}%</strong>.` 
                    : `Your current grade is <strong>${currentPct}%</strong>. To close the ${diff}% gap to reach your <strong>${target}%</strong> goal, review your lowest-scoring work below.`}
            </div>
    `;

    if (lowestAssign) {
        const cat = course.categories.find(c => c.id === lowestAssign.categoryId);
        html += `
            <div class="buddy-tip">
                🎯 <strong>Focus Area:</strong> Your lowest recorded assignment is <strong>${escapeHtml(lowestAssign.name)}</strong> (${lowestPct.toFixed(1)}% in ${cat ? escapeHtml(cat.name) : 'Category'}). Focus your study time on upcoming deliverables in this category!
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function updateSimulator() {
    const c = getCurrentCourse();
    if (!c) return;

    const catId = document.getElementById('sim-category').value;
    const earned = parseFloat(document.getElementById('sim-earned').value);
    const possible = parseFloat(document.getElementById('sim-possible').value);
    const resultBox = document.getElementById('sim-result-text');

    if (!catId || isNaN(earned) || isNaN(possible) || possible <= 0) {
        resultBox.textContent = "Select a category and enter hypothetical points to preview your grade.";
        return;
    }

    let simAssignments = [...c.assignments, { categoryId: catId, earned, possible }];
    let simCourse = { ...c, assignments: simAssignments };
    let stats = calculateCourseGrade(simCourse);

    resultBox.innerHTML = `🔮 Hypothetical Result: <strong>${stats.pct}% (${stats.letter})</strong>`;
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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&casual;"', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
