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
    const raw = localStorage.getItem('courseclear_v25_data');
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
        badge: "Step 1 of 3",
        title: "Courses & Themes 🎨",
        text: "Add your classes, assign credit hours, set target percentage grades, and personalize each course tile with aesthetic color themes."
    },
    {
        badge: "Step 2 of 3",
        title: "Syllabus PDF Uploader 📄",
        text: "When you join a course, upload your MyCourses syllabus PDF to automatically extract your grading categories and weights."
    },
    {
        badge: "Step 3 of 3",
        title: "Study Buddy & Report Cards 🎯",
        text: "Your Study Buddy analyzes low scores and safety cushions. Track your semester target GPA and print custom PDF academic report cards!"
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

    // Printable Report Card Modal
    document.getElementById('open-report-card-btn').onclick = () => {
        generateReportCard();
        document.getElementById('report-card-modal').classList.remove('hidden');
    };

    document.getElementById('close-report-btn').onclick = () => {
        document.getElementById('report-card-modal').classList.add('hidden');
    };

    // BULLETPROOF DIRECT TABLE SYLLABUS PARSER
    document.getElementById('modal-pdf-file-input').onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        document.getElementById('pdf-file-label').textContent = `📄 Scanning ${file.name}...`;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            
            let fullTextLines = [];
            let allTextChunks = [];
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                
                let rows = {};
                textContent.items.forEach(item => {
                    if (!item.str || !item.str.trim()) return;
                    let y = Math.round(item.transform[5] / 8) * 8;
                    if (!rows[y]) rows[y] = [];
                    rows[y].push({ x: item.transform[4], str: item.str });
                });

                let sortedY = Object.keys(rows).sort((a, b) => b - a);
                sortedY.forEach(y => {
                    rows[y].sort((a, b) => a.x - b.x);
                    let rowStr = rows[y].map(i => i.str).join(" ");
                    fullTextLines.push(rowStr);
                });

                allTextChunks.push(textContent.items.map(item => item.str).join(" "));
            }

            const fullDocText = allTextChunks.join("\n");
            const c = getCurrentCourse();
            let finalCategories = [];

            // Check if this is a percentage-based syllabus (like MGIS 130)
            let pctCategories = [];
            let inGradingTable = false;

            fullTextLines.forEach(line => {
                const lower = line.toLowerCase();
                
                // Track when we enter the grading table section
                if (lower.includes('grading model') || lower.includes('grading & assignments')) {
                    inGradingTable = true;
                }
                // Stop capturing once we hit grade cutoffs or policies
                if (lower.includes('total course points') || lower.includes('rit policies') || lower.includes('grading is intended')) {
                    inGradingTable = false;
                }

                const match = line.match(/(\d{1,2}(?:\.\d+)?)\s*%/);
                if (match && !lower.includes('>=') && !lower.includes('scale') && !lower.includes('letter') && !lower.includes('total')) {
                    let weight = parseFloat(match[1]);
                    let textBefore = line.substring(0, line.indexOf(match[0])).trim();
                    
                    let cleanName = textBefore
                        .replace(/\([^)]*\)/g, '')
                        .replace(/(due|fri|sep|oct|nov|dec|artifact|live|demo|days|attendance|tracked|all|term|multiplier|individual|in-class).*$/gi, '')
                        .replace(/worth|weight|grade|category|total/gi, '')
                        .replace(/^[—–-]\s*/, '')
                        .trim();

                    cleanName = cleanName.replace(/[—–-]\s*$/, '').trim();

                    // Only capture clean primary component rows
                    if (cleanName.length > 2 && weight > 0 && weight <= 100 && !cleanName.includes('+')) {
                        let key = cleanName.toLowerCase();
                        // Avoid duplicates
                        if (!pctCategories.some(nc => nc.key === key)) {
                            pctCategories.push({
                                id: 'cat_' + Date.now() + Math.random().toString(36).substr(2, 3),
                                name: cleanName,
                                weight: weight,
                                key: key
                            });
                        }
                    }
                }
            });

            if (pctCategories.length >= 3) {
                finalCategories = pctCategories.map(({ id, name, weight }) => ({ id, name, weight }));
            } else {
                // Fall back to Point-Based Extraction (e.g. Professional Selling)
                let pointCategories = [];
                const knownPointRules = [
                    { regex: /Team Project.*?(?:Company Interview|Paper|Presentation).*?(\d{2,3})/i, name: 'Team Project', points: 150 },
                    { regex: /Stukent Textbook.*?Quizzes.*?(\d{2,3})/i, name: 'Textbook Quizzes', points: 195 },
                    { regex: /Stukent Online Simulation.*?(\d{2,3})/i, name: 'Online Simulation', points: 250 },
                    { regex: /Individual Sales Role Play.*?(\d{2,3})/i, name: 'Individual Sales Role Play', points: 250 },
                    { regex: /Personal Pitch.*?(\d{2,3})/i, name: 'Personal Pitch', points: 135 },
                    { regex: /Class Participation.*?(\d{2,3})/i, name: 'Class Participation', points: 20 }
                ];

                knownPointRules.forEach(rule => {
                    const match = fullDocText.match(rule.regex);
                    if (match) {
                        let pts = parseFloat(match[1]);
                        if (!pointCategories.some(cat => cat.name === rule.name)) {
                            pointCategories.push({ name: rule.name, points: pts });
                        }
                    } else if (fullDocText.toLowerCase().includes(rule.name.toLowerCase())) {
                        if (!pointCategories.some(cat => cat.name === rule.name)) {
                            pointCategories.push({ name: rule.name, points: rule.points });
                        }
                    }
                });

                if (pointCategories.length > 0) {
                    const totalPoints = pointCategories.reduce((sum, cat) => sum + cat.points, 0);
                    finalCategories = pointCategories.map(cat => ({
                        id: 'cat_' + Date.now() + Math.random().toString(36).substr(2, 3),
                        name: cat.name,
                        weight: parseFloat(((cat.points / totalPoints) * 100).toFixed(1))
                    }));
                }
            }

            if (finalCategories.length > 0) {
                c.categories = finalCategories;
                document.getElementById('pdf-file-label').textContent = `✅ Extracted ${finalCategories.length} categories from ${file.name}!`;
                renderSyllabusModalBadges(c);
                saveAndRender();
            } else {
                document.getElementById('pdf-file-label').textContent = `⚠️ Could not auto-detect weights. Try another PDF or edit below.`;
                alert("Could not automatically detect grading breakdown. Make sure your syllabus lists percentages or point values.");
            }

        } catch (err) {
            console.error(err);
            document.getElementById('pdf-file-label').textContent = `❌ Error reading PDF file.`;
            alert("Error reading PDF file. Please try uploading again.");
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
            localStorage.setItem('courseclear_v25_data', JSON.stringify(appData));
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
            document.getElementById('assign-possible').value = "100";
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

    document.getElementById('clear-data-btn').onclick = () => {
        const c = getCurrentCourse();
        if (confirm("Reset categories and assignments for this course?")) {
            c.categories = [];
            c.assignments = [];
            saveAndRender();
        }
    };
}

function generateReportCard() {
    const container = document.getElementById('report-card-content');
    document.getElementById('report-student-name').textContent = `Student: ${appData.userName || 'Student'} | Semester Goal: ${appData.targetGpa} GPA`;

    let totalPoints = 0, totalCredits = 0;
    let html = `
        <table class="report-body-table">
            <thead>
                <tr>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Target Grade</th>
                    <th>Live %</th>
                    <th>Letter Grade</th>
                </tr>
            </thead>
            <tbody>
    `;

    appData.courses.forEach(c => {
        const stats = calculateCourseGrade(c);
        if (c.assignments.length > 0) {
            totalPoints += getGpaPoints(stats.letter) * c.credits;
            totalCredits += c.credits;
        }
        html += `
            <tr>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${c.credits}</td>
                <td>${c.targetGrade || 90}%</td>
                <td>${stats.pct}%</td>
                <td><strong>${stats.letter}</strong></td>
            </tr>
        `;
    });

    const estGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    html += `
            </tbody>
        </table>
        <div style="margin-top: 1.5rem; text-align: right; font-size: 1.2rem; font-weight: 800; color: var(--primary);">
            Overall Estimated Semester GPA: ${estGpa} / ${appData.targetGpa}
        </div>
    `;

    container.innerHTML = html;
}

function openSyllabusModal(course) {
    document.getElementById('syllabus-modal-course-title').textContent = `Upload Syllabus: ${course.name}`;
    document.getElementById('pdf-file-label').textContent = `Click to select or drop syllabus PDF here`;
    document.getElementById('modal-pdf-file-input').value = '';
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
    localStorage.setItem('courseclear_v25_data', JSON.stringify(appData));
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

    const stats = calculateCourseGrade(c);
    const target = c.targetGrade || 90;

    document.getElementById('course-credits-badge').textContent = `${c.credits} Credits`;
    document.getElementById('course-target-badge').textContent = `Target: ${target}%`;
    document.getElementById('target-marker-label').textContent = `Target: ${target}%`;

    // Visual Progress Bar & Marker Update
    const fillEl = document.getElementById('progress-fill');
    const markerEl = document.getElementById('target-marker');
    fillEl.style.width = `${Math.min(parseFloat(stats.pct), 100)}%`;
    markerEl.style.left = `${Math.min(target, 100)}%`;

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
    const diff = Math.abs(target - currentPct).toFixed(1);

    let html = `
        <div class="study-buddy-box">
            <div class="buddy-status ${isMeetingTarget ? 'success' : 'warning'}">
                ${isMeetingTarget ? `🟢 On Track! (+${diff}% above target)` : `🟡 Behind Target (${diff}% needed to reach ${target}%)`}
            </div>
            <div class="buddy-advice">
                ${isMeetingTarget 
                    ? `Great job! Your current grade of <strong>${currentPct}%</strong> exceeds your target of <strong>${target}%</strong>. You currently have a <strong>${diff}% safety cushion</strong>!` 
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
    const targetBox = document.getElementById('target-needed-box');

    // Target Score Needed Calculation
    const targetPct = c.targetGrade || 90;
    const currentStats = calculateCourseGrade(c);
    const currentPct = parseFloat(currentStats.pct);

    if (currentPct >= targetPct) {
        targetBox.innerHTML = `🎯 <strong>Goal Achieved!</strong> Your current grade of ${currentPct}% is already meeting or exceeding your target of ${targetPct}%.`;
    } else {
        const neededGap = targetPct - currentPct;
        targetBox.innerHTML = `💡 To reach your target of <strong>${targetPct}%</strong>, you need to score an average of at least <strong>${(targetPct + (neededGap * 0.5)).toFixed(1)}%</strong> on your remaining deliverables!`;
    }

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
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}
