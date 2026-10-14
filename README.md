# CourseClear — Course Grade Tracker

**Tagline:** Manage multiple courses, import syllabus weights instantly, and track your live percentage & letter grade.

CourseClear is a custom single-page web application built to solve the MyCourses grade-visibility gap at RIT. It provides a home dashboard displaying all your enrolled courses, color-coded themes, automatic syllabus parsing, and real-time weighted grade calculations.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

### 1. Data Layer (Information Storage)
* **Multi-Course State Object:** Stores an overall application state containing an array of course objects (`id`, `name`, `theme`, `categories`, `assignments`).
* **Persistence Layer:** Uses browser `localStorage` to save and load all user records formatted in JSON (`courseclear_data`).
* **State Preservation:** Ensures all courses, assigned themes, categories, and assignment grades persist across reloads without needing an external database.

### 2. Processing Layer (Business Logic)
* **Regex Syllabus Importer:** Automatically extracts category names and percentage weights from raw text using regex pattern matching (`/([a-zA-Z\s/]+)[:\s]+(\d{1,2}(?:\.\d+)?)\s*%/g`).
* **Weighted Average Engine:** Sums earned vs. possible assignment points per category and applies syllabus weights:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **RIT Letter Grade Mapping:** Converts live course percentages into standard letter grades (`A` through `F`).

### 3. User Interface Layer (Presentation)
* **Home Course Dashboard:** Grid layout showcasing all enrolled course tiles with real-time percentage badges.
* **Custom Theme Engine:** Dynamic CSS class switching supporting distinct color palettes (Pink, Purple, Teal, Yellow, Indigo) for each course.
* **Single-Page Navigation:** Smooth view toggling between the main course grid and individual course workspaces.

---

## 🚀 Key Features

* 🏠 **Home Course Dashboard:** View all enrolled courses at a glance with live percentages and letter grades.
* 🎨 **Distinct Color Themes:** Customize each course with its own aesthetic color theme (Pink, Purple, Teal, Yellow, Indigo).
* ⚡ **Syllabus Importer:** Paste syllabus breakdown text to auto-fill category weights instantly.
* 📝 **Weighted Assignment Tracking:** Log points earned and possible under specific categories.
* 💾 **Local Storage Persistence:** All data saves automatically in the browser.

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
