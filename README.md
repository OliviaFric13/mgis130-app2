# CourseClear — Course Grade & Goal Tracker

**Tagline:** Manage multiple courses, import syllabus weights instantly, and track your live percentage & letter grade.

CourseClear is a custom single-page web application built to solve the MyCourses grade-visibility gap at RIT. Designed with a **guided, step-by-step onboarding flow** and **progressive disclosure architecture**, the app leads users through setting up course syllabus structures first, configuring semester GPA goals, and logging assignments—all while providing instant, reactive feedback through an AI **Study Buddy Feedback Coach**.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Comprehensive State Model:** Stores an overarching application object (`courseclear_v10_data`) holding user profile info, target semester GPA goals, active view tabs, and a collection of course objects (`id`, `name`, `credits`, `targetGrade`, `theme`, `categories`, `assignments`).
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
* **Guided Course & Syllabus Onboarding:** Automatically launches a dedicated setup modal whenever a user adds or opens a course without categories, prioritizing syllabus input (via auto-parse or manual entry) before unlocking grade entry.
* **Guided Step-by-Step GPA Goal Setup:** Prompts the user with an interactive screen upon opening the GPA & Goals tab for the first time to define their overall semester GPA target before revealing the full analytics hub.
* **Progressive Disclosure Architecture:** Streamlines the main course workspace by placing daily actions (logging assignments and viewing feedback) front and center while tucking secondary settings and simulators into clean collapsible drawers.
* **Dynamic Theme Engine:** Applies distinct color palettes (Pink, Purple, Teal, Yellow, Indigo) customized per course tile and workspace view.
* **Confetti Delighters:** Triggers celebratory particle animations via `canvas-confetti` whenever an assignment score of 100% or an `A` grade is achieved.

---

## 🚀 Key Features

* 📋 **Syllabus-First Guided Setup:** A step-by-step overlay opens when creating or joining a course so users set up their grading structure first before entering grades.
* 🎯 **Interactive GPA Target Setup:** First-time setup screen in the GPA Hub that asks for your semester GPA goal before showing detailed progress insights.
* 🤖 **Reactive Study Buddy Feedback Coach:** Instantly evaluates new score entries against your target grade and highlights focus areas to improve.
* 🗂️ **Simplified Collapsible Workspace:** Keeps syllabus editing and grade simulators neatly tucked away in expandable drawers to eliminate clutter.
* 🗺️ **Interactive Product Tour:** Step-by-step guided walkthrough for first-time visitors with full skip options.
* 🎉 **Confetti Celebrations:** Automated celebratory particle effects when logging top-tier scores or reaching semester milestones.
* 🔮 **What-If Grade Simulator:** Test hypothetical scores for upcoming deliverables to preview final projected grades.
* 📥 **JSON Data Backup & Export:** Download your semester data as a local backup file or restore from a past save anytime.

---

## 🛠️ Built With

* **HTML5** – Application Layout, Modals & Collapsible Drawers
* **CSS3** – Custom Variables, Responsive Grids, and Color Themes
* **JavaScript (ES6+)** – DOM Manipulation, State Management & Regex Parsing
* **Canvas Confetti Library** – Celebration Animations
* **Google Gemini AI** – Architecture Planning & Development Assistance
* **GitHub Pages** – Web Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`
