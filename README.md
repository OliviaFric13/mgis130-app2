# CourseClear — Course Grade & Goal Tracker

**Tagline:** Upload your syllabus PDF, manage multiple courses, and track your live percentage & letter grade in real-time.

CourseClear is a custom single-page web application designed to solve the grade-visibility gap for university coursework. Built with a **guided onboarding flow**, **client-side PDF syllabus parsing**, and a **progressive disclosure architecture**, the app guides students through setting up course syllabus structures, configuring semester GPA goals, and logging assignments—all while offering instant feedback through an AI **Study Buddy Advisor** and a **Target Score Needed Calculator**.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Comprehensive State Model:** Maintains a unified application state object holding user profile info, target semester GPA goals, active view tabs, and detailed course objects (`id`, `name`, `credits`, `targetGrade`, `theme`, `categories`, `assignments`).
* **Persistence Layer:** Uses browser `localStorage` to save and restore all user records, course target percentages, custom color themes, and goal settings automatically without requiring a backend database.

### 2. Processing Layer (Business Logic)
* **PDF.js Syllabus Extractor:** Leverages Mozilla's `PDF.js` library directly in the browser to extract raw text from uploaded MyCourses PDF syllabi and parse category names and percentage weights automatically using regular expressions.
* **Weighted Grade Formula:** Calculates live cumulative percentage grades by grouping assignments by category, calculating points earned vs. possible, and weighting them against rubric requirements:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **Reactive Study Buddy Engine:** Compares live course percentages against target goals after every score entry, highlights lowest-scoring deliverables, and provides tailored academic study tips.
* **Target Score Needed Calculator:** Calculates the exact average score required on remaining deliverables to help students reach their target course grade.
* **What-If Simulation Engine:** Calculates hypothetical future assignment scores on the fly to preview their impact on overall course percentage before official grades are posted.
* **GPA Goal Engine:** Computes estimated semester GPA using course credit weights and evaluates progress against target GPA goals.

### 3. User Interface Layer (Presentation)
* **Guided PDF Onboarding Modal:** Automatically prompts users to upload their syllabus PDF upon creating or opening a new course to populate category weights before logging grades.
* **Visual Target Gap Progress Bar:** Displays real-time progress bars with embedded target marker lines for at-a-glance grade tracking.
* **Printable Academic Report Card:** Generates a formatted academic summary view with browser print/PDF export support.
* **Progressive Disclosure Architecture:** Keeps daily actions front and center while tucking secondary course settings and simulators into clean collapsible drawers.
* **Dynamic Theme Engine & Confetti:** Features customizable color palettes (Pink, Purple, Teal, Yellow, Indigo) and celebratory confetti particle animations.

---

## 🚀 Key Features

* 📄 **Client-Side PDF Syllabus Uploader:** Drop or select a syllabus PDF downloaded directly from MyCourses to automatically parse grading categories and weights.
* 🎯 **Interactive GPA Target Setup:** Define your overall semester GPA goal and track your estimated GPA in real time.
* 📊 **Visual Target Progress Bars:** Dual-color progress bars showing live percentage achievement against a target goal marker.
* 🤖 **Compact Study Buddy Advisor:** Evaluates new score entries against your target grade and highlights specific focus areas.
* 🔮 **Target Score Needed Calculator & What-If Simulator:** Dynamically estimate required future scores or test hypothetical deliverable grades.
* 📜 **Printable Academic Report Card:** View and print a clean semester summary or save it as a PDF report card.

---

## 🛠️ Built With

* **HTML5** – Application Layout, Dropzones & Modals
* **CSS3** – Custom Properties, Responsive Grids, and Color Themes
* **JavaScript (ES6+)** – DOM Manipulation, State Management & Calculations
* **PDF.js (Mozilla)** – Client-Side PDF Text Extraction
* **Canvas Confetti Library** – Particle Animations
* **GitHub Pages** – Web Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`
