# CourseClear — Course Grade & Goal Tracker

**Tagline:** Manage multiple courses, import syllabus weights instantly, and track your live percentage & letter grade.

CourseClear is a custom single-page web application built to solve the MyCourses grade-visibility gap at RIT. Featuring a streamlined, progressive-disclosure interface designed on professor feedback, the app hides setup complexity behind clean collapsible drawers while putting daily grade logging and the reactive **Study Buddy Feedback Coach** front and center.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Comprehensive State Model:** Stores an overarching application object (`courseclear_v9_data`) holding user profiles, target semester GPA goals, active view tabs, and a collection of course objects (`id`, `name`, `credits`, `targetGrade`, `theme`, `categories`, `assignments`).
* **Persistence Layer:** Utilizes browser `localStorage` to securely save and load all user records, individual course target percentages, custom themes, and goal settings in JSON format.
* **Backup & Restore System:** Supports complete JSON file export and import, allowing users to download local backups of their semester data or restore previous records seamlessly.

### 2. Processing Layer (Business Logic)
* **Regex Syllabus Importer:** Automatically scans pasted syllabus text for grading breakdown percentages (e.g., `"Exams 40%"`, `"Homework: 30%"`) using regular expression pattern matching and populates structured categories.
* **Weighted Grade Formula:** Calculates live cumulative percentages by grouping assignments by category, summing points earned vs. possible, and weighting them against syllabus requirements:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **Reactive Study Buddy Feedback Engine:** Compares live course percentages against individual target grade goals immediately upon score entry, identifies lowest-scoring assignments, and generates tailored study action plans.
* **What-If Simulation Engine:** Dynamically calculates hypothetical future assignment scores on the fly to preview how they impact overall course percentages before official grades are posted.
* **GPA & Goal Engine:** Computes current semester GPA using credit hour weights and contrasts it against target GPA goals to generate automated on-track status alerts and catch-up insights.

### 3. User Interface Layer (Presentation)
* **Progressive Disclosure Architecture:** Streamlines the course workspace by placing daily actions (logging assignments and viewing feedback) at the top and tucking secondary setup tools (syllabus importer, category weights) and simulators into clean collapsible drawers.
* **Interactive Onboarding Tour Modal:** Greets first-time users, captures their name, and guides them through a step-by-step product walkthrough with full skip functionality.
* **Interactive Home Dashboard:** Switch effortlessly between your **Enrolled Courses** grid (displaying live grades vs. individual targets), **GPA & Goals Hub**, and **Help & Guide** documentation tab.
* **Dynamic Theme Engine:** Applies distinct color palettes (Pink, Purple, Teal, Yellow, Indigo) customized per course tile and workspace view.
* **Confetti Delighters:** Triggers celebratory particle animations via `canvas-confetti` whenever an assignment score of 100% or an `A` grade is achieved.

---

## 🚀 Key Features

* 🗂️ **Simplified Course Layout:** Collapsible setup drawers and prominent daily action cards eliminate cognitive overload and reduce visual clutter.
* 🤖 **Reactive Study Buddy Feedback Coach:** Instantly evaluates new score entries against your target grade and highlights focus areas.
* 🗺️ **Interactive Onboarding Tour:** Step-by-step guided walkthrough for first-time visitors with an option to skip anytime.
* 🎯 **Individual Course Target Grades:** Set a specific target percentage for each class and view live grade vs. target indicators directly on your course cards.
* 🎉 **Confetti Celebrations:** Automated celebratory effects when logging top-tier assignment scores.
* 🔮 **What-If Grade Simulator:** Expandable drawer to test hypothetical scores for upcoming assignments.
* 📥 **JSON Data Backup & Export:** Easily download your semester data as a backup file or restore from a previous save.

---

## 🛠️ Built With

* **HTML5** – Application Layout, Modals & Collapsible Drawers
* **CSS3** – Custom Variables, Grids, and Color Themes
* **JavaScript (ES6+)** – DOM Manipulation, State Management & Parsing
* **Canvas Confetti Library** – Celebration Animations
* **Google Gemini AI** – Architecture Planning & Development Assistance
* **GitHub Pages** – Web Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`
