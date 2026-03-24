<div align="center">

```
██████╗ ██╗   ██╗████████╗██████╗  █████╗  ██████╗██╗  ██╗
██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
██████╔╝ ╚████╔╝    ██║   ██████╔╝███████║██║     █████╔╝ 
██╔═══╝   ╚██╔╝     ██║   ██╔══██╗██╔══██║██║     ██╔═██╗ 
██║        ██║      ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗
╚═╝        ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

**Python for Data Analysis — Full Track Course**

[![Units](https://img.shields.io/badge/Units-9-3b82f6?style=flat-square)](#units)
[![Lessons](https://img.shields.io/badge/Lessons-90-06b6d4?style=flat-square)](#units)
[![Quiz Questions](https://img.shields.io/badge/Quiz%20Questions-450-f59e0b?style=flat-square)](#units)
[![Projects](https://img.shields.io/badge/Capstone%20Projects-3-10b981?style=flat-square)](#capstone)
[![No Framework](https://img.shields.io/badge/No%20Framework-Vanilla%20JS-ef4444?style=flat-square)](#tech-stack)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square)](LICENSE)

*From absolute zero to professional data analyst — free, no signup, runs in the browser.*

[**🚀 Live Demo**](https://yourusername.github.io/pytrack) · [**📖 Curriculum**](#units) · [**⚡ Features**](#features)

</div>

---

## What is PyTrack?

PyTrack is a **complete, self-contained Python for Data Analysis course** that runs entirely in the browser — no server, no signup, no cost. It covers the full journey from writing your first `print()` to training machine learning models and building interactive dashboards.

Everything is stored in `localStorage` so progress persists across sessions. The built-in **Code Playground** runs real Python directly in the browser using Pyodide — no installation required.

---

## Features

| Feature | Description |
|---|---|
| ⚡ **Code Playground** | Run Python in the browser via Pyodide. numpy & pandas included. |
| 📝 **Per-lesson Quizzes** | 5 questions per lesson, 450 total. Instant feedback with explanations. |
| 🎯 **Practice Tasks** | Every lesson has a hands-on task with starter code + solution. |
| 📊 **Progress Tracking** | Persistent progress via localStorage. Sidebar + nav badge. |
| 🏆 **Capstone Projects** | 3 real-world projects with public datasets and starter code. |
| 📱 **Responsive** | Works on desktop and mobile. |
| 🔌 **Zero Dependencies** | Pure HTML/CSS/JS — no build step, no npm, no framework. |

---

## Units

| # | Unit | Topics | Lessons |
|---|---|---|---|
| 01 | 🚀 **Getting Started** | Environment setup, Anaconda, Jupyter, first code | 10 |
| 02 | 🐍 **Python Fundamentals** | Variables, strings, lists, dicts, regex, exceptions | 10 |
| 03 | 🔄 **Control Flow** | Conditions, loops, functions, OOP, comprehensions | 10 |
| 04 | 🔢 **NumPy Arrays** | Arrays, broadcasting, linear algebra, statistics | 10 |
| 05 | 🐼 **Pandas Basics** | DataFrames, filtering, apply, groupby, dates | 10 |
| 06 | 🧹 **Data Cleaning** | Missing values, outliers, encoding, full pipeline | 10 |
| 07 | 📊 **Data Analysis** | GroupBy, merge, pivot tables, time series, regression | 10 |
| 08 | 📈 **Data Visualization** | Matplotlib, Seaborn, Plotly, dashboards, export | 10 |
| 09 | 🤖 **ML, SQL & APIs** | Scikit-learn, regression, classification, SQL, REST APIs, scraping | 10 |

**Total: 90 lessons · 90 tasks · 450 quiz questions**

---

## Capstone Projects

Three real-world projects that cover the full data pipeline:

```
🏠 House Price Analysis      → EDA + regression + visualization
📱 Customer Churn Prediction → Classification + feature engineering + model comparison  
📊 Sales Dashboard           → SQL + time series + interactive Plotly dashboard
```

Each project includes step-by-step instructions, links to real public datasets, and starter code.

---

## Tech Stack

```
Frontend    Vanilla HTML5 / CSS3 / JavaScript (ES2020)
Runtime     Pyodide v0.25.1 — WebAssembly Python in the browser
Storage     localStorage (progress tracking, no backend needed)
Hosting     GitHub Pages (static files, no server required)
```

No React, no Vue, no build step. Open `index.html` and it works.

---

## Getting Started

### Run locally

```bash
git clone https://github.com/yourusername/pytrack.git
cd pytrack

# Option 1: Python (simplest)
python -m http.server 8000

# Option 2: Node
npx serve .

# Option 3: Just open index.html directly
open index.html
```

> **Note:** The Code Playground requires internet access to load Pyodide from CDN the first time. After that it's cached by the browser.

### Deploy to GitHub Pages

```bash
# 1. Fork or clone this repo
# 2. Push to your GitHub
git push origin main

# 3. Enable GitHub Pages
# Settings → Pages → Branch: main → / (root) → Save

# 4. Your site will be live at:
# https://yourusername.github.io/pytrack
```

Takes about 2 minutes after the first push.

---

## Project Structure

```
pytrack/
│
├── index.html          ← Homepage — unit cards + overall progress
│
├── unit-1.html         ← Getting Started
├── unit-2.html         ← Python Fundamentals
├── unit-3.html         ← Control Flow
├── unit-4.html         ← NumPy Arrays
├── unit-5.html         ← Pandas Basics
├── unit-6.html         ← Data Cleaning
├── unit-7.html         ← Data Analysis
├── unit-8.html         ← Data Visualization
├── unit-9.html         ← ML, SQL & APIs
│
├── capstone.html       ← Capstone Projects
│
├── app.js              ← All JS: quiz logic, progress, sidebar, playground
├── style.css           ← All styles: dark theme, components, playground
│
└── README.md
```

All files are flat in the root — no subdirectories, no build output.

---

## Code Playground

The playground uses **[Pyodide](https://pyodide.org)** — a full CPython runtime compiled to WebAssembly. 

```python
# This runs in the browser — no installation needed
import pandas as pd
import numpy as np

df = pd.DataFrame({
    'city':  ['Cairo', 'Alex', 'Giza'],
    'sales': [120000, 85000, 63000]
})
print(df.sort_values('sales', ascending=False))
```

**Supported packages out of the box:** `numpy`, `pandas`, `math`, `statistics`, `datetime`, `json`, `re`, `collections`, `itertools`

**First load:** ~10-15 seconds (downloads ~10MB WebAssembly runtime). Subsequent loads are instant (cached).

---

## Adding Content

Each unit's lesson data is a single `initUnit({...})` call in a `<script>` tag at the bottom of the HTML file. The structure is:

```javascript
initUnit({
  id: 1,
  lessons: [
    {
      title: "Lesson Title",
      quizzes: [
        {
          q: "Question text?",
          opts: ["Option A", "Option B", "Option C", "Option D"],
          ans: 2,        // 0-indexed correct answer
          exp: "Explanation shown after answering."
        }
        // ... 4 more questions
      ]
    }
    // ... 9 more lessons
  ]
});
```

The HTML above the script contains the visual lesson content (headings, code blocks, task sections). No database or API needed.

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Safari 15+ | ✅ Full support |
| Edge 90+ | ✅ Full support |

Pyodide requires **SharedArrayBuffer**, which needs HTTPS or localhost. GitHub Pages serves over HTTPS so it works automatically.

---

## Contributing

Contributions welcome — especially:

- 🐛 Bug fixes in quiz questions or code examples
- 📝 Additional lessons or units (Deep Learning, Data Engineering, etc.)
- 🌍 Arabic translation of lesson content
- 📱 Mobile UX improvements

```bash
# Fork the repo, make changes, then open a PR
git checkout -b feature/unit-10-deep-learning
# edit files...
git commit -m "Add Unit 10: Deep Learning with TensorFlow"
git push origin feature/unit-10-deep-learning
```

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ☕ and a lot of `print()` statements.

**[⭐ Star this repo](https://github.com/yourusername/pytrack)** if PyTrack helped you learn Python!

</div>
