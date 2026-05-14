# PyTrack Lesson Audit

Date: 2026-05-14

## Scope Reviewed

- 10 units
- 100 lessons
- 100 hands-on tasks
- 100 solution blocks
- 500 quiz questions

This audit reviewed lesson sequencing, task clarity, quiz coverage, project-readiness, UI/UX friction, and remaining gaps between beginner-level learning and professional data analysis practice.

## Immediate Fixes Applied

1. Replaced the repeated task title `Practice Exercise` across Units 1-8 with lesson-specific task titles.
2. Updated Unit 1's virtual environment task starter so the Playground prints terminal commands instead of trying to execute `conda` and `pip` commands as Python.
3. Removed duplicate quiz prompts:
   - Unit 5 duplicate `df.apply(func, axis=1)` question.
   - Unit 9 duplicate `Label Encoding assigns` question.
4. Confirmed every unit still has 10 lessons, 10 tasks, 10 solution blocks, and 50 quiz questions.

## Executive Assessment

The track is now structurally complete and covers the full beginner-to-first-portfolio path: Python basics, NumPy, pandas, cleaning, analysis, visualization, introductory ML, SQL/APIs, Git, and capstone projects.

The main remaining issue is not missing quantity. It is depth distribution: Units 1-8 are strong as a guided course, Unit 9 is very dense, and the professional layer after core pandas/EDA still needs deeper treatment in future units.

## Unit-by-Unit Findings

| Unit | Status | Strength | Main Risk | Recommended Next Improvement |
|---|---|---|---|---|
| Unit 1: Getting Started | Good | Strong onboarding, tools, errors, scripts, style | Some local-tool lessons can feel different from browser Playground tasks | Add a small "terminal vs Playground" note to setup lessons |
| Unit 2: Python Fundamentals | Good | Covers the key Python data structures learners need | Regex and exception handling are slightly advanced for this early point | Mark regex as a data-cleaning preview or add simpler regex examples |
| Unit 3: Control Flow | Good | Builds logic, functions, comprehensions, files, OOP | OOP/inheritance is less central for a data analyst than functions and reusable scripts | Reframe OOP lessons as optional reusable-code patterns |
| Unit 4: NumPy Arrays | Good | Solid numerical foundation before pandas | Linear algebra may feel abstract for learners focused on analysis | Add more analytics-focused examples for broadcasting and linear algebra |
| Unit 5: Pandas Basics | Strong | Practical table workflow with CSV/Excel, filtering, dates | Missing common pandas pitfalls like views/copies and chained assignment | Add a short warning box about `SettingWithCopyWarning` |
| Unit 6: Data Cleaning | Strong | Covers missing data, duplicates, outliers, validation, encoding | Needs more professional context around data leakage and train/test cleaning | Add leakage-safe cleaning notes before ML |
| Unit 7: Data Analysis | Good | Covers groupby, joins, pivots, time series, reports | Statistics and hypothesis testing are too compressed for professional depth | Expand later into a dedicated EDA/statistics unit |
| Unit 8: Visualization | Good | Covers matplotlib, seaborn, Plotly, dashboards, export | Needs more chart-choice, accessibility, annotation, and misleading-chart guidance | Add a chart decision guide and color/accessibility rules |
| Unit 9: ML, SQL & APIs | Useful but dense | Gives learners first exposure to ML, SQL, APIs, scraping | Too many professional topics in one unit; each deserves deeper practice | Split future depth into separate ML, SQL, and API/project units |
| Unit 10: Git & Portfolio Workflow | Strong | Adds reproducibility, GitHub, README, requirements, release checklist | Git concepts are simulated through Python tasks, not actual terminal practice | Add a downloadable terminal checklist or local practice script later |

## Cross-Course Findings

### Coverage

The current track covers the core path well:

- Python basics
- Data structures
- Control flow and functions
- NumPy
- pandas
- Data cleaning
- Analysis workflows
- Visualization
- Intro ML
- SQL/APIs/scraping intro
- Git/GitHub/project workflow
- Capstone projects

Remaining professional depth gaps:

- Deep EDA and applied statistics
- SQL beyond intro queries
- ML pipelines, model selection, and leakage prevention
- Dashboard/deployment workflow
- Portfolio review, storytelling, and case-study writing

### Tasks

Task structure is now consistent across all units. The biggest previous UX issue was generic task naming in Units 1-8, which has been fixed.

Remaining task improvements:

- Add mini-capstones after Units 5, 7, and 9.
- Add difficulty labels: Beginner, Core, Stretch.
- Add expected output snippets for more tasks.
- Separate "run in Playground" tasks from "run in Terminal" tasks more clearly.

### Quizzes

The quiz bank is structurally strong:

- 500 total quiz questions
- 0 duplicate question prompts after cleanup
- 5 questions per lesson
- Explanations exist for every question

Remaining quiz improvements:

- Add more scenario-based questions in early units.
- Add more debugging questions in Units 2-5.
- Add more business interpretation questions in Units 7-9.
- Add review quizzes at the end of each unit.

### UI/UX

Current strengths:

- Sidebar supports the full 10-unit path.
- Mobile sidebar works.
- Progress count is now aligned with 100 lessons.
- Playground gives the course a hands-on feel.

Remaining UX improvements:

- Add a unit search/filter in the sidebar when the course grows beyond 10 units.
- Add visible difficulty tags on lesson cards/tasks.
- Add a "What you will be able to do" section at the start of each unit.
- Add clearer labels for code blocks that are Python vs terminal vs markdown.

## Priority Backlog

### P1

1. Add Unit 11: EDA and Applied Statistics.
2. Add professional notes to Unit 6 about data leakage and cleaning before ML.
3. Add chart-choice and accessibility guidance to Unit 8.
4. Add mini-capstone checkpoints after Units 5, 7, and 9.

### P2

1. Add difficulty badges to lessons and tasks.
2. Add review quizzes at the end of each unit.
3. Add expected output examples to more tasks.
4. Add a sidebar search/filter.

### P3

1. Split Unit 9 into deeper future units for ML, SQL, and APIs.
2. Add dashboard/deployment lessons after the current Git workflow unit.
3. Add portfolio case-study templates.

## Verdict

The course is ready as a complete core learning path. The next stage should focus on professional depth, not more beginner topics. The most valuable next build is Unit 11: EDA and Applied Statistics, followed by improvements to Unit 6 and Unit 8.
