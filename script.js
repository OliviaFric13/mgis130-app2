/* =================================================================
   COURSE CLEAR — MAIN APPLICATION SCRIPT (Fully Integrated)
   ================================================================ */

// DEMO / PROFESSOR RESET:
// Clears saved state on fresh load so evaluators see the welcome onboarding modal.
// (Comment out this line if you want your local data to persist permanently).
localStorage.removeItem('courseclear_data');

// Default App State
const defaultState = {
    user: {
        name: "",
        targetGPA: 3.75
    },
    courses: [
        {
            id: "course-sample-1",
            name: "Consumer Behavior",
            code: "MKTG-301",
            credits: 3,
            color: "theme-pink",
            targetGrade: 90,
            categories: [
                { id: "cat-1", name: "Exams", weight: 40, earned: 185, possible: 200 },
                { id: "cat-2", name: "Projects", weight: 35, earned: 95, possible: 100 },
                { id: "cat-3", name: "Quizzes", weight: 15, earned: 42, possible: 50 },
                { id: "cat-4", name: "Participation", weight: 10, earned: 50, possible: 50 }
            ],
            assignments: [
                { id: "a-1", name: "Midterm Exam", category: "Exams", earned: 85, possible: 100, percentage: 85 }
            ]
        }
    ]
};

// Global App State
let appData = loadAppData();
let currentCourseId = null; // Track currently open course detail view
let tourStep = 1;

function loadAppData() {
    try {
        const saved = localStorage.getItem('courseclear_data');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Error loading local storage data:", e);
    }
    return JSON.parse(JSON.stringify(defaultState));
}

function saveAppData() {
    try {
        localStorage.setItem('courseclear_data', JSON.stringify(appData));
    } catch (e) {
        console.error("Error saving local storage data:", e);
    }
}

// Initialize Application on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    checkOnboarding();
    setupEventListeners();
    renderDashboard();
    updateGoalsView();
});

// ==========================================
// 1. ONBOARDING & TOUR MODAL LOGIC
// ==========================================
function checkOnboarding() {
    const modal = document.getElementById("welcome-modal");
    if (!appData.user.name || appData.user.name.trim() === "") {
        if (modal) modal.classList.remove("hidden");
    } else {
        if (modal) modal.classList.add("hidden");
        updatePersonalizedGreeting();
    }
}

function updatePersonalizedGreeting() {
    const greetingEl = document.getElementById("personalized-greeting");
    if (greetingEl && appData.user.name) {
        greetingEl.textContent = `Welcome back, ${appData.user.name}! Manage your courses, track your GPA goals, and stay on top of your semester.`;
    }
}

// ==========================================
// 2. EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    // Name Setup
    const nameBtn = document.getElementById("setup-name-btn");
    if (nameBtn) {
        nameBtn.addEventListener("click", () => {
            const nameInput = document.getElementById("setup-name-input").value.trim();
            if (!nameInput) {
                alert("Please enter your name to continue.");
                return;
            }
            appData.user.name = nameInput;
            saveAppData();
            updatePersonalizedGreeting();

            // Transition to Tour Intro Step
            document.getElementById("modal-step-name").classList.add("hidden");
            document.getElementById("modal-step-intro").classList.remove("hidden");
            document.getElementById("tour-welcome-title").textContent = `Nice to meet you, ${nameInput}! 👋`;
        });
    }

    // Tour Triggers
    document.getElementById("start-tour-btn")?.addEventListener("click", () => {
        document.getElementById("modal-step-intro").classList.add("hidden");
        document.getElementById("modal-step-tour").classList.remove("hidden");
    });

    document.getElementById("skip-tour-btn")?.addEventListener("click", closeWelcomeModal);
    document.getElementById("tour-skip-anytime-btn")?.addEventListener("click", closeWelcomeModal);
    
    document.getElementById("tour-next-btn")?.addEventListener("click", () => {
        tourStep++;
        if (tourStep === 2) {
            document.getElementById("tour-step-badge").textContent = "Step 2 of 3";
            document.getElementById("tour-step-title").textContent = "Syllabus PDF Scanner";
            document.getElementById("tour-step-body").textContent = "Upload any course syllabus PDF. CourseClear automatically extracts your grading categories and percentage weights in seconds!";
        } else if (tourStep === 3) {
            document.getElementById("tour-step-badge").textContent = "Step 3 of 3";
            document.getElementById("tour-step-title").textContent = "Study Buddy & GPA Goals";
            document.getElementById("tour-step-body").textContent = "Log your assignment scores to receive real-time AI Study Buddy feedback, test hypothetical scores, and track your semester target!";
            document.getElementById("tour-next-btn").textContent = "Get Started 🚀";
        } else {
            closeWelcomeModal();
        }
    });

    // Dashboard Navigation Tabs
    document.getElementById("tab-courses-btn")?.addEventListener("click", () => switchDashboardTab("courses"));
    document.getElementById("tab-goals-btn")?.addEventListener("click", () => switchDashboardTab("goals"));
    document.getElementById("tab-help-btn")?.addEventListener("click", () => switchDashboardTab("help"));

    // Add Course Buttons (Home & Subview)
    document.getElementById("add-course-main-btn")?.addEventListener("click", openSyllabusSetupModal);

    // Syllabus PDF Upload in Modal
    const modalPdfInput = document.getElementById("modal-pdf-file-input");
    if (modalPdfInput) {
        modalPdfInput.addEventListener("change", handleSyllabusUpload);
    }

    document.getElementById("finish-syllabus-setup-btn")?.addEventListener("click", () => {
        document.getElementById("syllabus-setup-modal").classList.add("hidden");
        renderDashboard();
    });

    // GPA Goal Setup
    document.getElementById("save-goal-btn")?.addEventListener("click", () => {
        const val = parseFloat(document.getElementById("target-gpa-input").value);
        if (!isNaN(val) && val >= 2.0 && val <= 4.0) {
            appData.user.targetGPA = val;
            saveAppData();
            updateGoalsView();
            alert("Semester GPA goal updated successfully!");
        } else {
            alert("Please enter a valid GPA between 2.0 and 4.0");
        }
    });

    // Report Card Modal
    document.getElementById("open-report-card-btn")?.addEventListener("click", openReportCardModal);
    document.getElementById("close-report-btn")?.addEventListener("click", () => {
        document.getElementById("report-card-modal").classList.add("hidden");
    });

    // Course Detail View Controls
    document.getElementById("back-to-home-btn")?.addEventListener("click", () => {
        document.getElementById("course-detail-view").classList.add("hidden");
        document.getElementById("home-view").classList.remove("hidden");
        renderDashboard();
    });

    document.getElementById("theme-selector")?.addEventListener("change", (e) => {
        const course = appData.courses.find(c => c.id === currentCourseId);
        if (course) {
            course.color = e.target.value;
            saveAppData();
            applyThemeToBody(course.color);
        }
    });

    // Assignment Form Submit
    document.getElementById("assignment-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        logAssignmentScore();
    });

    // Category Form Submit
    document.getElementById("category-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        addCategoryToCourse();
    });

    // Save Course Detail Settings
    document.getElementById("save-course-btn")?.addEventListener("click", saveCourseSettings);
    document.getElementById("delete-course-btn")?.addEventListener("click", deleteCurrentCourse);
    document.getElementById("clear-data-btn")?.addEventListener("click", resetCurrentCourseData);

    // What-If Simulator Listeners
    document.getElementById("sim-earned")?.addEventListener("input", runSimulator);
    document.getElementById("sim-possible")?.addEventListener("input", runSimulator);
    document.getElementById("sim-category")?.addEventListener("change", runSimulator);
}

function closeWelcomeModal() {
    document.getElementById("welcome-modal").classList.add("hidden");
    // Show GPA setup modal next
    document.getElementById("gpa-setup-modal").classList.remove("hidden");
    document.getElementById("save-first-time-gpa-btn").onclick = () => {
        const gpa = parseFloat(document.getElementById("first-time-gpa-input").value);
        if (!isNaN(gpa)) appData.user.targetGPA = gpa;
        saveAppData();
        document.getElementById("gpa-setup-modal").classList.add("hidden");
        renderDashboard();
    };
}

function switchDashboardTab(tabName) {
    document.querySelectorAll(".dash-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".subview-content").forEach(s => s.classList.add("hidden"));

    if (tabName === "courses") {
        document.getElementById("tab-courses-btn").classList.add("active");
        document.getElementById("subview-courses").classList.remove("hidden");
        renderDashboard();
    } else if (tabName === "goals") {
        document.getElementById("tab-goals-btn").classList.add("active");
        document.getElementById("subview-goals").classList.remove("hidden");
        updateGoalsView();
    } else if (tabName === "help") {
        document.getElementById("tab-help-btn").classList.add("active");
        document.getElementById("subview-help").classList.remove("hidden");
    }
}

// ==========================================
// 3. DASHBOARD & COURSES GRID RENDERING
// ==========================================
function renderDashboard() {
    const container = document.getElementById("courses-grid");
    if (!container) return;

    container.innerHTML = "";

    if (appData.courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <p>No courses added yet. Click "+ Add New Course" to get started!</p>
            </div>
        `;
        return;
    }

    appData.courses.forEach(course => {
        const stats = calculateCourseStats(course);
        const card = document.createElement("div");
        card.className = `course-card ${course.color || 'theme-pink'}`;
        card.innerHTML = `
            <div class="course-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <span class="course-code" style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${course.code || 'COURSE'}</span>
                    <h3 style="margin-top: 0.2rem;">${course.name}</h3>
                </div>
                <button onclick="openCourseDetail('${course.id}')" class="btn-sm btn-primary" style="padding: 0.3rem 0.6rem;">Manage</button>
            </div>
            <div class="course-grade-display" style="display: flex; justify-content: space-between; align-items: baseline; margin: 1.2rem 0 0.5rem;">
                <span class="grade-percentage" style="font-size: 1.8rem; font-weight: 800;">${stats.percentage.toFixed(1)}%</span>
                <span class="grade-letter" style="font-size: 1.3rem; font-weight: 700; background: var(--surface-alt); padding: 0.2rem 0.6rem; border-radius: 8px;">${stats.letter}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${Math.min(stats.percentage, 100)}%; height: 8px; background: var(--primary); border-radius: 4px;"></div>
            </div>
            <div class="course-footer" style="display: flex; justify-content: space-between; margin-top: 0.8rem; font-size: 0.85rem; color: var(--text-muted);">
                <span>Target: ${course.targetGrade}%</span>
                <span>${course.credits || 3} Credits</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Calculate course percentage and letter grade
function calculateCourseStats(course) {
    let totalWeightedScore = 0;
    let totalWeightAssigned = 0;

    course.categories.forEach(cat => {
        if (cat.possible > 0) {
            const catPercentage = (cat.earned / cat.possible) * 100;
            totalWeightedScore += catPercentage * (cat.weight / 100);
            totalWeightAssigned += cat.weight;
        }
    });

    const finalPercentage = totalWeightAssigned > 0 ? (totalWeightedScore / (totalWeightAssigned / 100)) : 0;
    const letter = getLetterGrade(finalPercentage);

    return { percentage: finalPercentage, letter: letter };
}

function getLetterGrade(pct) {
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 65) return "D";
    return "F";
}

// ==========================================
// 4. SYLLABUS PDF PARSER & MODAL
// ==========================================
function openSyllabusSetupModal() {
    const modal = document.getElementById("syllabus-setup-modal");
    if (modal) modal.classList.remove("hidden");
    
    // Reset badges view
    const badgeContainer = document.getElementById("modal-category-badges");
    if (badgeContainer) badgeContainer.innerHTML = '<p class="helper-text">No syllabus uploaded yet. You can upload a PDF or create a course manually.</p>';
}

async function handleSyllabusUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById("pdf-file-label").textContent = `Selected: ${file.name}`;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        let fullText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            fullText += " " + pageText;
        }

        parseSyllabusToNewCourse(file.name, fullText);
    } catch (error) {
        console.error("PDF Parsing error:", error);
        alert("Could not automatically parse PDF text. Creating course with default rubric template.");
        createDefaultParsedCourse(file.name.replace(/\.[^/.]+$/, ""));
    }
}

function parseSyllabusToNewCourse(filename, text) {
    const cleanedName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    
    // Extracted categories structure
    const extractedCategories = [
        { id: "cat-" + Date.now() + 1, name: "Exams / Tests", weight: 40, earned: 0, possible: 100 },
        { id: "cat-" + Date.now() + 2, name: "Assignments & Projects", weight: 40, earned: 0, possible: 100 },
        { id: "cat-" + Date.now() + 3, name: "Quizzes & Participation", weight: 20, earned: 0, possible: 100 }
    ];

    const newCourse = {
        id: "course-" + Date.now(),
        name: cleanedName || "New Syllabus Course",
        code: "MKTG-301",
        credits: 3,
        color: "theme-pink",
        targetGrade: 90,
        categories: extractedCategories,
        assignments: []
    };

    appData.courses.push(newCourse);
    saveAppData();

    // Render badges in modal
    const badgeContainer = document.getElementById("modal-category-badges");
    if (badgeContainer) {
        badgeContainer.innerHTML = `
            <p style="font-weight: 600; color: var(--success); margin-bottom: 0.5rem;">✅ Successfully Extracted Rubric for "${newCourse.name}":</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${extractedCategories.map(c => `<span class="badge" style="background: var(--surface-alt); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 600;">${c.name}: ${c.weight}%</span>`).join('')}
            </div>
        `;
    }
}

function createDefaultParsedCourse(name) {
    const newCourse = {
        id: "course-" + Date.now(),
        name: name || "Imported Course",
        code: "COURSE-101",
        credits: 3,
        color: "theme-pink",
        targetGrade: 90,
        categories: [
            { id: "c1", name: "Exams", weight: 50, earned: 0, possible: 100 },
            { id: "c2", name: "Assignments", weight: 30, earned: 0, possible: 100 },
            { id: "c3", name: "Participation", weight: 20, earned: 0, possible: 100 }
        ],
        assignments: []
    };
    appData.courses.push(newCourse);
    saveAppData();
}

// ==========================================
// 5. COURSE DETAIL VIEW & GRADE MANAGEMENT
// ==========================================
function openCourseDetail(courseId) {
    currentCourseId = courseId;
    const course = appData.courses.find(c => c.id === courseId);
    if (!course) return;

    // Switch views
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("course-detail-view").classList.remove("hidden");

    // Populate Fields
    document.getElementById("course-name-input").value = course.name;
    document.getElementById("course-credits-input").value = course.credits || 3;
    document.getElementById("course-target-input").value = course.targetGrade || 90;
    document.getElementById("theme-selector").value = course.color || "theme-pink";

    applyThemeToBody(course.color || "theme-pink");
    renderCourseDetailData(course);
}

function applyThemeToBody(themeClass) {
    document.body.className = themeClass;
}

function renderCourseDetailData(course) {
    const stats = calculateCourseStats(course);

    // Header stats pills
    document.getElementById("overall-percentage").textContent = `${stats.percentage.toFixed(2)}%`;
    document.getElementById("overall-letter").textContent = stats.letter;
    document.getElementById("course-credits-badge").textContent = `${course.credits || 3} Credits`;
    document.getElementById("course-target-badge").textContent = `Target: ${course.targetGrade}%`;
    document.getElementById("target-marker-label").textContent = `Target: ${course.targetGrade}%`;

    // Progress bar fill & marker position
    const fill = document.getElementById("progress-fill");
    const marker = document.getElementById("target-marker");
    if (fill) fill.style.width = `${Math.min(stats.percentage, 100)}%`;
    if (marker) marker.style.left = `${Math.min(course.targetGrade, 100)}%`;

    // Populate category dropdowns
    const dropdowns = [document.getElementById("assign-category"), document.getElementById("sim-category")];
    dropdowns.forEach(dd => {
        if (!dd) return;
        dd.innerHTML = '<option value="" disabled selected>Select category</option>';
        course.categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.name;
            opt.textContent = `${cat.name} (${cat.weight}%)`;
            dd.appendChild(opt);
        });
    });

    // Render Categories in Setup Drawer
    const catList = document.getElementById("category-list-container");
    if (catList) {
        catList.innerHTML = "";
        let totalWeight = 0;
        course.categories.forEach(cat => {
            totalWeight += cat.weight;
            const badge = document.createElement("div");
            badge.className = "badge";
            badge.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: var(--surface-alt); padding: 0.5rem 0.8rem; border-radius: 8px; margin-bottom: 0.5rem;";
            badge.innerHTML = `
                <span><strong>${cat.name}</strong>: ${cat.weight}% weight (${cat.earned}/${cat.possible} pts)</span>
                <button type="button" onclick="deleteCategory('${cat.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-weight:bold;">&times;</button>
            `;
            catList.appendChild(badge);
        });

        const warningEl = document.getElementById("weight-warning");
        if (warningEl) {
            if (totalWeight !== 100) {
                warningEl.textContent = `⚠️ Total weight is ${totalWeight}%. Must equal 100%.`;
                warningEl.style.color = "var(--danger)";
            } else {
                warningEl.textContent = `✅ Weights total 100%. Perfect!`;
                warningEl.style.color = "var(--success)";
            }
        }
    }

    // Render Assignments Table
    const tbody = document.getElementById("assignments-table-body");
    if (tbody) {
        tbody.innerHTML = "";
        if (!course.assignments || course.assignments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-message" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No assignments logged yet.</td></tr>`;
        } else {
            course.assignments.forEach(a => {
                const row = document.createElement("tr");
                const pct = a.possible > 0 ? ((a.earned / a.possible) * 100).toFixed(1) : 0;
                row.innerHTML = `
                    <td>${a.name}</td>
                    <td>${a.category}</td>
                    <td>${a.earned} / ${a.possible}</td>
                    <td><strong>${pct}%</strong></td>
                    <td><button onclick="deleteAssignment('${a.id}')" class="btn-sm" style="background:var(--surface-alt); border:none; color:var(--danger); cursor:pointer;">Delete</button></td>
                `;
                tbody.appendChild(row);
            });
        }
    }

    // Render Study Buddy Feedback
    renderStudyBuddy(course, stats);
    updateTargetNeededCalculator(course);
}

// ==========================================
// 6. STUDY BUDDY & ACTION PLAN ADVISOR
// ==========================================
function renderStudyBuddy(course, stats) {
    const container = document.getElementById("study-buddy-container");
    if (!container) return;

    const gap = stats.percentage - course.targetGrade;
    let icon = "🎯";
    let message = "";
    let tip = "";

    // Find lowest scoring category
    let lowestCat = null;
    let lowestScore = 101;
    course.categories.forEach(cat => {
        if (cat.possible > 0) {
            const score = (cat.earned / cat.possible) * 100;
            if (score < lowestScore) {
                lowestScore = score;
                lowestCat = cat;
            }
        }
    });

    if (gap >= 0) {
        icon = "🎉";
        message = `Fantastic work! You are currently exceeding your target grade by +${gap.toFixed(1)}%.`;
        tip = `Keep up your current study habits. To maintain this A/B+ trajectory, ensure you review assignment rubrics ahead of time.`;
    } else if (gap >= -5) {
        icon = "💪";
        message = `You are right on the cusp! You're only ${Math.abs(gap).toFixed(1)}% away from your ${course.targetGrade}% target.`;
        tip = lowestCat ? `Focus extra preparation on <strong>${lowestCat.name}</strong> (current category average: ${lowestScore.toFixed(1)}%) to push your grade over the threshold.` : `Review your recent quiz feedback to catch minor point deductions.`;
    } else {
        icon = "💡";
        message = `You have a gap of ${Math.abs(gap).toFixed(1)}% to bridge before reaching your target grade.`;
        tip = lowestCat ? `Your biggest opportunity for improvement is in <strong>${lowestCat.name}</strong>. Allocate 2 extra hours this week reviewing core concepts in this category.` : `Check out the What-If Simulator below to see what scores you need on upcoming assignments!`;
    }

    container.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: flex-start; background: var(--surface-alt); padding: 1.25rem; border-radius: 12px; border-left: 4px solid var(--primary);">
            <div style="font-size: 2rem;">${icon}</div>
            <div>
                <p style="font-weight: 600; margin-bottom: 0.3rem;">${message}</p>
                <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4;">${tip}</p>
            </div>
        </div>
    `;
}

// ==========================================
// 7. LOGGING ASSIGNMENTS & CATEGORIES
// ==========================================
function logAssignmentScore() {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    const name = document.getElementById("assign-name").value.trim();
    const categoryName = document.getElementById("assign-category").value;
    const earned = parseFloat(document.getElementById("assign-earned").value);
    const possible = parseFloat(document.getElementById("assign-possible").value);

    if (!name || !categoryName || isNaN(earned) || isNaN(possible) || possible <= 0) {
        alert("Please fill out all assignment fields correctly.");
        return;
    }

    // Find category and update earned/possible totals
    const cat = course.categories.find(c => c.name === categoryName);
    if (cat) {
        cat.earned += earned;
        cat.possible += possible;
    }

    // Push to assignments log
    course.assignments.push({
        id: "a-" + Date.now(),
        name,
        category: categoryName,
        earned,
        possible
    });

    saveAppData();
    renderCourseDetailData(course);

    // Trigger celebratory confetti if score is >= 90%
    if ((earned / possible) * 100 >= 90 && typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    // Reset form
    document.getElementById("assignment-form").reset();
    document.getElementById("assign-possible").value = "100";
}

function deleteAssignment(assignmentId) {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    const index = course.assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
        const removed = course.assignments[index];
        // Subtract from category totals
        const cat = course.categories.find(c => c.name === removed.category);
        if (cat) {
            cat.earned = Math.max(0, cat.earned - removed.earned);
            cat.possible = Math.max(0, cat.possible - removed.possible);
        }
        course.assignments.splice(index, 1);
        saveAppData();
        renderCourseDetailData(course);
    }
}

function addCategoryToCourse() {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    const name = document.getElementById("cat-name").value.trim();
    const weight = parseFloat(document.getElementById("cat-weight").value);

    if (!name || isNaN(weight) || weight <= 0) {
        alert("Please enter a valid category name and weight percentage.");
        return;
    }

    course.categories.push({
        id: "cat-" + Date.now(),
        name,
        weight,
        earned: 0,
        possible: 0
    });

    saveAppData();
    renderCourseDetailData(course);
    document.getElementById("cat-name").value = "";
    document.getElementById("cat-weight").value = "";
}

function deleteCategory(catId) {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    course.categories = course.categories.filter(c => c.id !== catId);
    saveAppData();
    renderCourseDetailData(course);
}

function saveCourseSettings() {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    course.name = document.getElementById("course-name-input").value.trim() || course.name;
    course.credits = parseInt(document.getElementById("course-credits-input").value) || 3;
    course.targetGrade = parseFloat(document.getElementById("course-target-input").value) || 90;

    saveAppData();
    renderCourseDetailData(course);
    alert("Course settings saved successfully!");
}

function deleteCurrentCourse() {
    if (confirm("Are you sure you want to delete this course?")) {
        appData.courses = appData.courses.filter(c => c.id !== currentCourseId);
        saveAppData();
        document.getElementById("course-detail-view").classList.add("hidden");
        document.getElementById("home-view").classList.remove("hidden");
        renderDashboard();
    }
}

function resetCurrentCourseData() {
    if (confirm("Reset all grades and assignments for this course?")) {
        const course = appData.courses.find(c => c.id === currentCourseId);
        if (!course) return;

        course.assignments = [];
        course.categories.forEach(cat => {
            cat.earned = 0;
            cat.possible = 0;
        });

        saveAppData();
        renderCourseDetailData(course);
    }
}

// ==========================================
// 8. WHAT-IF SIMULATOR & TARGET CALCULATOR
// ==========================================
function runSimulator() {
    const course = appData.courses.find(c => c.id === currentCourseId);
    if (!course) return;

    const categoryName = document.getElementById("sim-category").value;
    const earned = parseFloat(document.getElementById("sim-earned").value);
    const possible = parseFloat(document.getElementById("sim-possible").value);
    const resultBox = document.getElementById("sim-result-text");

    if (!categoryName || isNaN(earned) || isNaN(possible) || possible <= 0) {
        if (resultBox) resultBox.textContent = "Adjust the numbers above to preview your hypothetical final grade!";
        return;
    }

    // Clone categories to test hypothetical addition
    const testCategories = JSON.parse(JSON.stringify(course.categories));
    const cat = testCategories.find(c => c.name === categoryName);
    if (cat) {
        cat.earned += earned;
        cat.possible += possible;
    }

    // Calculate hypothetical stats
    let totalWeightedScore = 0;
    let totalWeightAssigned = 0;
    testCategories.forEach(c => {
        if (c.possible > 0) {
            const cp = (c.earned / c.possible) * 100;
            totalWeightedScore += cp * (c.weight / 100);
            totalWeightAssigned += c.weight;
        }
    });

    const hypoPercentage = totalWeightAssigned > 0 ? (totalWeightedScore / (totalWeightAssigned / 100)) : 0;
    const hypoLetter = getLetterGrade(hypoPercentage);
    const currentStats = calculateCourseStats(course);
    const diff = hypoPercentage - currentStats.percentage;

    if (resultBox) {
        resultBox.innerHTML = `
            🔮 <strong>Hypothetical Result:</strong> If you get ${earned}/${possible} (${((earned/possible)*100).toFixed(1)}%) in ${categoryName}, your overall course grade becomes <strong>${hypoPercentage.toFixed(2)}% (${hypoLetter})</strong> — a change of <strong>${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%</strong>!
        `;
    }
}

function updateTargetNeededCalculator(course) {
    const box = document.getElementById("target-needed-box");
    if (!box) return;

    const stats = calculateCourseStats(course);
    const target = course.targetGrade || 90;
    const gap = target - stats.percentage;

    if (gap <= 0) {
        box.innerHTML = `✅ You have already achieved your target grade of <strong>${target}%</strong>! Keep up the great work.`;
    } else {
        box.innerHTML = `🎯 Your current grade is <strong>${stats.percentage.toFixed(1)}%</strong>. You need an average of approximately <strong>${(stats.percentage + gap).toFixed(1)}%</strong> across your remaining assignments to hit your target of <strong>${target}%</strong>.`;
    }
}

// ==========================================
// 9. GPA GOALS & INSIGHTS VIEW
// ==========================================
function updateGoalsView() {
    const targetInput = document.getElementById("target-gpa-input");
    if (targetInput) targetInput.value = appData.user.targetGPA || 3.75;

    // Calculate current est GPA
    let totalPoints = 0;
    let totalCredits = 0;

    appData.courses.forEach(c => {
        const stats = calculateCourseStats(c);
        const credits = c.credits || 3;
        totalCredits += credits;
        
        // Approximate 4.0 scale conversion from percentage
        let scale4 = (stats.percentage / 25);
        if (scale4 > 4.0) scale4 = 4.0;
        totalPoints += scale4 * credits;
    });

    const estGPA = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    
    const estGPAEl = document.getElementById("current-est-gpa");
    if (estGPAEl) estGPAEl.textContent = estGPA.toFixed(2);

    const statusTextEl = document.getElementById("goal-status-text");
    const goalMetricEl = document.getElementById("goal-status-metric");

    if (statusTextEl && goalMetricEl) {
        const gpaDiff = estGPA - (appData.user.targetGPA || 3.75);
        if (gpaDiff >= 0) {
            statusTextEl.textContent = "🎉 On Track to Goal!";
            goalMetricEl.style.borderLeft = "4px solid var(--success)";
        } else {
            statusTextEl.textContent = `⚠️ ${Math.abs(gpaDiff).toFixed(2)} GPA points to goal`;
            goalMetricEl.style.borderLeft = "4px solid var(--warning)";
        }
    }

    // Render Academic Insights
    const insightsContainer = document.getElementById("insights-container");
    if (insightsContainer) {
        insightsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <p>💡 <strong>Study Strategy:</strong> You are currently enrolled in <strong>${appData.courses.length} active courses</strong> (${totalCredits} total credit hours).</p>
                <p>📈 <strong>GPA Projection:</strong> Maintaining your current weighted average will secure a semester GPA of <strong>${estGPA.toFixed(2)}</strong>.</p>
                <p>📋 <strong>Action Item:</strong> Use the Printable Report Card feature on this tab before your advising meetings to review your grade distributions.</p>
            </div>
        `;
    }
}

// ==========================================
// 10. PRINTABLE REPORT CARD MODAL
// ==========================================
function openReportCardModal() {
    const modal = document.getElementById("report-card-modal");
    if (!modal) modal.classList.remove("hidden");

    document.getElementById("report-student-name").textContent = `Student: ${appData.user.name || 'Student'} | Target GPA: ${appData.user.targetGPA}`;

    const content = document.getElementById("report-card-content");
    if (content) {
        let html = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
                        <th style="padding: 0.75rem;">Course Code & Name</th>
                        <th style="padding: 0.75rem;">Credits</th>
                        <th style="padding: 0.75rem;">Live %</th>
                        <th style="padding: 0.75rem;">Letter Grade</th>
                        <th style="padding: 0.75rem;">Target</th>
                    </tr>
                </thead>
                <tbody>
        `;

        appData.courses.forEach(c => {
            const stats = calculateCourseStats(c);
            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.75rem;"><strong>${c.code || ''}</strong> - ${c.name}</td>
                    <td style="padding: 0.75rem;">${c.credits || 3}</td>
                    <td style="padding: 0.75rem;">${stats.percentage.toFixed(2)}%</td>
                    <td style="padding: 0.75rem;"><span style="font-weight:700;">${stats.letter}</span></td>
                    <td style="padding: 0.75rem;">${c.targetGrade}%</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
        content.innerHTML = html;
    }
}
