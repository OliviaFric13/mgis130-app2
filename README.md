# MyCourses Multi-Course Grade Tracker

A responsive single-page web application designed to solve the MyCourses grade-visibility gap at RIT. This tool allows students to manage multiple courses simultaneously using tabbed navigation, paste and parse syllabus breakdown text, log individual assignment scores, and instantly view their real-time percentage and estimated letter grade.

This project demonstrates the **Three-Layer Architecture** of information systems.

---

## 🏗️ Three-Layer Architecture Breakdown

This application strictly separates concerns into three distinct layers:

### 1. Data Layer (Information Storage)
* **Hierarchical Data Model:** Stores an application state object containing multiple course objects, each holding its own list of syllabus categories and assignment scores.
* **User Inputs:** Captures active course tabs, course names, syllabus percentage weights, and assignment scores (earned points vs. possible points).
* **Local Persistence:** Utilizes browser `localStorage` to retain all course records across browser sessions in JSON format without requiring an external backend database.

### 2. Processing Layer (Business Logic)
* **Regex Syllabus Importer:** Automatically scans pasted text for percentage patterns (e.g., `"Exams 40%"`, `"Homework: 30%"`) and parses them into structured category objects.
* **Category Score Aggregation:** Group assignments by category to calculate individual category earned and possible point totals.
* **Weighted Grade Formula:** Calculates the overall live percentage by multiplying each category's score by its syllabus weight and dividing by active weights:
  $$\text{Overall Grade \%} = \frac{\sum (\text{Category \%} \times \text{Category Weight})}{\sum \text{Active Weights}}$$
* **Letter Grade Conversion:** Translates cumulative percentages into standard RIT letter grades (`A` down to `F`).
* **Validation Guards:** Alerts users if total category weights do not sum to 100%.

### 3. User Interface Layer (Presentation)
* **Tabbed Course Navigation:** Clean interactive tabs allowing users to switch between multiple RIT courses seamlessly.
* **Semantic HTML5 & Modern CSS:** Styled using custom CSS variables, flexbox/grid layouts, responsive containers, and a polished pink color palette.
* **Interactive Dynamic Rendering:** Updates calculations, assignment tables, and category badge lists instantly upon input without needing a page refresh.

---

## 🚀 Key Features

* 📚 **Multi-Course Management:** Create, switch between, and manage separate tabs for all your classes (e.g., MGMT 150, MGIS 130).
* ⚡ **Quick Syllabus Importer:** Paste syllabus text directly into the app to auto-detect and populate category weights.
* 📊 **Weighted Category Setup:** Configure custom grade percentages with real-time 100% total validation.
* 📝 **Assignment Logging:** Track individual assignment scores under their corresponding categories.
* 📈 **Live Results Summary:** View real-time cumulative percentage updates and calculated letter grades instantly.
* 💾 **Automatic Storage:** All data is saved automatically in your browser's local storage.

---

## 🛠️ Built With

* **HTML5** – Structure & Forms
* **CSS3** – Responsive Styling & Variables
* **JavaScript (ES6+)** – Application Logic & State Management
* **Google Gemini AI** – Architecture Planning & Development Assistance
* **GitHub Pages** – Hosting & Deployment

---

## 🌐 Live Demo

Access the deployed application here:
👉 `https://oliviafric13.github.io/mgis-130-grade-calculator/`

---

## 📖 How to Run Locally

1. Clone this repository:
   ```bash
   git clone [https://github.com/oliviafric13/mgis-130-grade-calculator.git](https://github.com/oliviafric13/mgis-130-grade-calculator.git)
