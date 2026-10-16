# CourseClear — Course Grade & Goal Tracker

**Tagline:** Manage multiple courses, import syllabus weights instantly, and track your live percentage & letter grade.

CourseClear is a custom single-page web application built to solve the MyCourses grade-visibility gap at RIT. It features a personalized home dashboard with tabbed navigation between **My Courses**, the **GPA & Goals Hub**, and a **Help & Guide**, along with custom aesthetic color themes, automatic syllabus text parsing, a What-If grade simulator, confetti celebrations, and JSON backup/restore capabilities.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Comprehensive State Model:** Stores an overarching application object (`courseclear_v4_data`) holding user profiles (name), target semester GPA goals, active view tabs, and a collection of course objects (`id`, `name`, `credits`, `theme`, `categories`, `assignments`).
* **Persistence Layer:** Utilizes browser `localStorage` to securely save and load all user records, custom themes, and goal settings in JSON format.
* **Backup & Restore System:** Supports complete JSON file export and import, allowing users to download local backups of their semester data or restore previous records seamlessly.

### 2. Processing Layer (Business Logic)
* **Regex Syllabus Importer:** Automatically scans pasted syllabus text for grading breakdown percentages (e.g., `"Exams 40%"`, `"Homework: 30%"`) using regular expression pattern matching and populates structured categories.
* **Weighted Grade Formula:** Calculates live cumulative percentages by grouping assignments by category, summing points earned vs. possible, and weighting them against syllabus requirements:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **What-If Simulation Engine:** Dynamically calculates hypothetical future assignment scores on the fly to preview how they impact overall course percentages before official grades are posted.
* **GPA & Goal Engine:** Computes current semester GPA using credit hour weights and contrasts it against target GPA goals to generate automated on-track status alerts and catch-up insights.

### 3. User Interface Layer (Presentation)
* **Personalized Onboarding Modal:** Greets first-time users and stores their name to power a customized greeting banner and rotating daily academic motivation quotes.
* **Interactive Home Dashboard:** Switch effortlessly between your **Enrolled Courses** grid, **GPA & Goals Hub**, and **Help & Guide** documentation tab.
* **Dynamic Theme Engine:** Applies distinct color palettes (Pink, Purple, Teal, Yellow, Indigo) customized per course tile and workspace view.
* **Confetti Delighters:** Triggers celebratory particle animations via `canvas-confetti` whenever an assignment score of 100% or an `A` grade is achieved.

---

## 🚀 Key Features

* ✨ **Personalized Greeting & Motivation:** Custom welcome banner powered by user onboarding and daily academic quotes.
* 🎉 **Confetti Celebrations:** Automated celebratory effects when logging top-tier assignment scores.
* 🔮 **What-If Grade Simulator:** Test hypothetical scores for upcoming assignments to see your projected final grade instantly.
* 📥 **JSON Data Backup & Export:** Easily download your semester data as a backup file or restore from a previous save.
* 📖 **Built-in Help & Guide:** Comprehensive instructions tab explaining app navigation and features.
* 🏠 **Home Course Dashboard:** View all enrolled courses at a glance with live percentage and letter grade badges.
* 🎯 **GPA Goals Hub:** Set a target semester GPA (e.g., 3.75), track progress, and get actionable coaching insights.
* 🎨 **Distinct Color Themes:** Personalize each course with custom aesthetic color themes (Pink, Purple, Teal, Yellow, Indigo).
* ⚡ **Quick Syllabus Importer:** Paste syllabus text to auto-fill category weights instantly.

---

## 🛠️ Built With

* **HTML5** – Application Layout, Modals & View Sections
* **CSS3** – Custom Variables, Grids, and Color Themes
* **JavaScript (ES6+)** – DOM Manipulation, State Management & Parsing
* **Canvas Confetti Library** – Celebration Animations
* **Google Gemini AI** – Architecture Planning & Development Assistance
* **GitHub Pages** – Web Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`
