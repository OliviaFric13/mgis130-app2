# CourseClear — Course Grade & Goal Tracker

**Tagline:** Manage multiple courses, import syllabus weights instantly, and track your live percentage & letter grade.

CourseClear is a custom single-page web application built to solve the MyCourses grade-visibility gap at RIT. It features a clean home dashboard with navigation between **My Courses** and the **GPA & Goals Hub**, custom aesthetic color themes for each class, automatic syllabus text parsing, and real-time academic coaching insights.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Comprehensive State Model:** Stores an overarching application object (`courseclear_v3_data`) holding target semester GPA goals, active view tabs, and a collection of course objects (`id`, `name`, `credits`, `theme`, `categories`, `assignments`).
* **Persistence Layer:** Utilizes browser `localStorage` to save and load all user records and goal settings in JSON format.
* **State Preservation:** Retains all course data, assignment grades, and customized themes across browser sessions without needing an external database.

### 2. Processing Layer (Business Logic)
* **Regex Syllabus Importer:** Automatically scans pasted syllabus text for grading breakdown percentages (e.g., `"Exams 40%"`, `"Homework: 30%"`) using regular expression matching and populates structured categories.
* **Weighted Grade Formula:** Calculates live cumulative percentages by grouping assignments by category, summing points earned vs. possible, and weighting them against syllabus requirements:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **GPA & Goal Engine:** Computes current semester GPA using credit hour weights and contrasts it against your target GPA goal to generate automated on-track status alerts and catch-up insights.
* **Letter Grade Mapping:** Converts percentages and grades into standard letter values and 4.0 scale quality points.

### 3. User Interface Layer (Presentation)
* **Interactive Home Dashboard:** Switch effortlessly between your **Enrolled Courses** grid and the **GPA & Goals Hub**.
* **Dynamic Theme Engine:** Applies distinct color palettes (Pink, Purple, Teal, Yellow, Indigo) customized per course tile and workspace view.
* **Single-Page Navigation:** Smooth transitions between dashboard views and individual course detail pages without requiring page reloads.

---

## 🚀 Key Features

* 🏠 **Home Course Dashboard:** View all enrolled courses at a glance with live percentage and letter grade badges.
* 🎯 **GPA Goals & Insights Hub:** Set a target semester GPA (e.g., 3.75), track your progress, and get actionable coaching insights on courses that need attention.
* 🎨 **Distinct Color Themes:** Personalize each course with custom aesthetic color themes (Pink, Purple, Teal, Yellow, Indigo).
* ⚡ **Quick Syllabus Importer:** Paste syllabus text to auto-fill category weights instantly.
* 📝 **Weighted Assignment Tracking:** Log points earned and possible under specific grading categories.
* 💾 **Local Storage Persistence:** All data saves automatically in your browser.

---

## 🛠️ Built With

* **HTML5** – Application Layout & View Sections
* **CSS3** – Custom Variables, Grids, and Color Themes
* **JavaScript (ES6+)** – DOM Manipulation, State Management & Parsing
* **Google Gemini AI** – Architecture Planning & Development Assistance
* **GitHub Pages** – Web Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`
