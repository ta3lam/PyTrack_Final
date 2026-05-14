/* PyTrack - App Logic v5
   Sidebar navigation, quiz, progress, and in-browser Python playground */

// ─── THEME ───────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('pytrack_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  _updateThemeBtn(saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pytrack_theme', next);
  _updateThemeBtn(next);
}
function _updateThemeBtn(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
initTheme();
document.addEventListener('DOMContentLoaded', () => updateNavBadge());
// ─────────────────────────────────────────────────────────

const TOTAL_UNITS = 10;
const LESSONS_EACH = 10;
const TOTAL_LESSONS = 100;
const PYODIDE_VERSION = '0.25.1';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let currentLesson = 0;
let unitData = null;
let quizState = {};
let pyodideReady = null;
let pyodideRuntime = null;

function getProgress() {
  try { return JSON.parse(localStorage.getItem('pytrack_v3') || '{}'); }
  catch { return {}; }
}

function saveProgress(p) {
  try { localStorage.setItem('pytrack_v3', JSON.stringify(p)); }
  catch {}
}

function markDone(unitId, lessonIdx) {
  const p = getProgress();
  if (!p[unitId]) p[unitId] = {};
  p[unitId][lessonIdx] = true;
  saveProgress(p);
}

function isDone(unitId, lessonIdx) {
  const p = getProgress();
  return !!(p[unitId] && p[unitId][lessonIdx]);
}

function unitDoneCount(unitId) {
  const p = getProgress();
  return p[unitId] ? Object.keys(p[unitId]).filter(k => !k.startsWith('q')).length : 0;
}

function totalDone() {
  const p = getProgress();
  return Object.values(p).reduce((sum, unit) =>
    sum + Object.keys(unit).filter(k => !k.startsWith('q')).length, 0);
}

function updateNavBadge() {
  const el = document.getElementById('nav-progress');
  if (el) el.textContent = `${totalDone()} / ${TOTAL_LESSONS} lessons`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function codeTextFromElement(codeEl) {
  return codeEl?.dataset.rawCode || codeEl?.textContent || '';
}

function copyCode(btn) {
  const codeEl = btn.closest('.code-block')?.querySelector('.code-body');
  const code = codeTextFromElement(codeEl);
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'copied!';
    setTimeout(() => { btn.textContent = 'copy'; }, 2000);
  });
}

function toggleSolution(btn) {
  const sol = btn.nextElementSibling;
  if (!sol) return;
  const visible = sol.style.display !== 'none';
  sol.style.display = visible ? 'none' : 'block';
  btn.textContent = visible ? 'Show Solution' : 'Hide Solution';
}

function initUnit(data) {
  unitData = data;
  currentLesson = 0;
  updateNavBadge();
  addSidebarToggle();
  addPlaygroundBtn();
  showLesson(0);
  updateSidebarDone();
  enhanceScopedCodeBlocks();
  addReadTimes();

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = () => copyCode(btn);
  });
  document.querySelectorAll('.sidebar-lesson').forEach(link => {
    link.addEventListener('click', () => closeSidebar());
  });
}

function addReadTimes() {
  document.querySelectorAll('.lesson-panel').forEach((panel, idx) => {
    const words = (panel.innerText || '').trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    const link = document.getElementById(`slink-${unitData.id}-${idx}`);
    if (link && !link.querySelector('.read-time')) {
      const badge = document.createElement('span');
      badge.className = 'read-time';
      badge.textContent = `${mins}m`;
      link.appendChild(badge);
    }
  });
}

function highlightPythonSegment(segment) {
  const tokenPattern = /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|return|import|from|in|is|and|or|not|True|False|None)\b|\b(print|input|int|float|str|bool|len|range|type|round|enumerate|list|dict|set|tuple)\b(?=\s*\()|\b(\d+(?:\.\d+)?)\b/g;
  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(segment)) !== null) {
    html += escapeHtml(segment.slice(lastIndex, match.index));
    if (match[1]) {
      html += `<span class="tok-keyword">${escapeHtml(match[1])}</span>`;
    } else if (match[2]) {
      html += `<span class="tok-builtin">${escapeHtml(match[2])}</span>`;
    } else {
      html += `<span class="tok-number">${escapeHtml(match[3])}</span>`;
    }
    lastIndex = tokenPattern.lastIndex;
  }

  html += escapeHtml(segment.slice(lastIndex));
  return html;
}

function highlightPythonLine(line) {
  const commentAt = line.indexOf('#');
  const codePart = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const commentPart = commentAt >= 0 ? line.slice(commentAt) : '';
  const stringPattern = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  let html = '';
  let lastIndex = 0;
  let match;

  while ((match = stringPattern.exec(codePart)) !== null) {
    html += highlightPythonSegment(codePart.slice(lastIndex, match.index));
    html += `<span class="tok-string">${escapeHtml(match[0])}</span>`;
    lastIndex = stringPattern.lastIndex;
  }

  html += highlightPythonSegment(codePart.slice(lastIndex));
  if (commentPart) html += `<span class="tok-comment">${escapeHtml(commentPart)}</span>`;
  return html || ' ';
}

function enhanceScopedCodeBlocks() {

  document.querySelectorAll('.code-block').forEach(block => {
    const codeBody = block.querySelector('.code-body');
    if (!codeBody || codeBody.classList.contains('code-body-enhanced')) return;

    const rawCode = codeTextFromElement(codeBody).replace(/\r\n/g, '\n').replace(/\s+$/, '');
    codeBody.dataset.rawCode = rawCode;
    block.classList.add('code-card-v2');
    block.querySelector('.code-header')?.classList.add('code-header-v2');
    block.querySelector('.code-header span')?.classList.add('code-lang-badge');
    block.querySelector('.copy-btn')?.setAttribute('aria-label', 'Copy code');

    codeBody.classList.add('code-body-enhanced');
    codeBody.innerHTML = '';

    rawCode.split('\n').forEach((line, index, lines) => {
      const row = document.createElement('span');
      row.className = 'code-line';

      const content = document.createElement('span');
      content.className = 'code-line-content';
      content.innerHTML = highlightPythonLine(line);

      row.appendChild(content);
      codeBody.appendChild(row);
      if (index < lines.length - 1) codeBody.appendChild(document.createTextNode('\n'));
    });
  });
}

function showLesson(idx) {
  currentLesson = Math.max(0, Math.min(idx, LESSONS_EACH - 1));

  document.querySelectorAll('.lesson-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === currentLesson);
  });

  const markBtn = document.getElementById('btn-mark');
  if (markBtn) {
    const done = isDone(unitData.id, currentLesson);
    markBtn.textContent = done ? 'Done' : 'Mark Done & Next';
    markBtn.className = done ? 'btn-mark marked' : 'btn-mark';
  }

  const prev = document.getElementById('btn-prev');
  if (prev) prev.disabled = currentLesson === 0;

  const btnNext = document.getElementById('btn-next');
  const btnNextUnit = document.getElementById('btn-next-unit');
  const isLast = currentLesson >= LESSONS_EACH - 1;
  if (btnNext) btnNext.style.display = isLast ? 'none' : 'inline-flex';
  if (btnNextUnit) btnNextUnit.style.display = isLast ? 'inline-flex' : 'none';

  const p = getProgress();
  const quizDone = p[unitData.id] && p[unitData.id][`q${currentLesson}`];
  const badge = document.getElementById('quiz-done-global');
  if (badge) badge.style.display = quizDone ? 'inline-flex' : 'none';

  const quizBtn = document.getElementById('quiz-btn');
  if (quizBtn) quizBtn.textContent = quizDone ? 'Quiz done' : 'Lesson Quiz - 5 Questions';

  updateSidebar(currentLesson);
  closeSidebar();
  window.scrollTo({ top: 60, behavior: 'smooth' });
}

function prevLesson() {
  if (currentLesson > 0) showLesson(currentLesson - 1);
}

function markAndNext() {
  markDone(unitData.id, currentLesson);
  updateNavBadge();
  updateSidebarDone();

  const markBtn = document.getElementById('btn-mark');
  if (markBtn) {
    markBtn.textContent = 'Done';
    markBtn.className = 'btn-mark marked';
  }

  if (currentLesson < LESSONS_EACH - 1) {
    setTimeout(() => showLesson(currentLesson + 1), 180);
  }
}

function openCurrentQuiz() {
  openQuiz(currentLesson);
}

function openQuiz(lessonIdx) {
  if (!unitData) return;
  const lesson = unitData.lessons[lessonIdx];
  quizState = {
    lessonIdx,
    idx: 0,
    score: 0,
    answered: false,
    selected: null,
    questions: lesson.quizzes,
  };
  document.getElementById('quiz-title').textContent = `Quiz - ${lesson.title}`;
  document.getElementById('quiz-modal').classList.add('open');
  renderQuestion();
}

function closeQuiz() {
  document.getElementById('quiz-modal')?.classList.remove('open');
}

function renderQuestion() {
  const { idx, questions } = quizState;
  if (idx >= questions.length) {
    renderScore();
    return;
  }

  const q = questions[idx];
  const optionsHtml = q.opts.map((option, i) => `
    <button class="quiz-option" type="button" data-option="${i}">${escapeHtml(option)}</button>
  `).join('');

  const body = document.getElementById('quiz-body');
  body.innerHTML = `
    <div class="quiz-num">Question ${idx + 1} of ${questions.length}</div>
    <div class="quiz-q">${escapeHtml(q.q)}</div>
    <div class="quiz-options">${optionsHtml}</div>
    <div class="quiz-feedback" id="qfb"></div>
    <div class="quiz-actions">
      <button class="btn-check" id="btn-check" type="button" disabled>Check Answer</button>
    </div>`;

  quizState.answered = false;
  quizState.selected = null;

  body.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', () => selectOpt(Number(option.dataset.option)));
  });
  body.querySelector('#btn-check').addEventListener('click', checkAnswer);
}

function selectOpt(i) {
  if (quizState.answered) return;
  quizState.selected = i;
  document.querySelectorAll('.quiz-option').forEach((el, j) => {
    el.classList.toggle('selected', j === i);
  });
  const checkBtn = document.getElementById('btn-check');
  if (checkBtn) checkBtn.disabled = false;
}

function checkAnswer() {
  if (quizState.answered || quizState.selected === null) return;

  quizState.answered = true;
  const q = quizState.questions[quizState.idx];
  const correct = quizState.selected === q.ans;
  if (correct) quizState.score++;

  const options = document.querySelectorAll('.quiz-option');
  if (options[q.ans]) options[q.ans].classList.add('correct');
  if (!correct && options[quizState.selected]) options[quizState.selected].classList.add('wrong');

  const fb = document.getElementById('qfb');
  fb.className = `quiz-feedback show ${correct ? 'correct' : 'wrong'}`;
  fb.textContent = `${correct ? 'Correct. ' : 'Wrong. '}${q.exp}`;

  const btn = document.getElementById('btn-check');
  btn.textContent = quizState.idx < quizState.questions.length - 1 ? 'Next Question' : 'See Results';
  btn.onclick = () => {
    quizState.idx++;
    renderQuestion();
  };
}

function renderScore() {
  const { score, questions, lessonIdx } = quizState;
  const total = questions.length;
  const pct = Math.round(score / total * 100);
  const msg = pct === 100 ? 'Perfect!' : pct >= 80 ? 'Great job!' : pct >= 60 ? 'Good effort!' : 'Keep practicing.';

  const p = getProgress();
  if (!p[unitData.id]) p[unitData.id] = {};
  p[unitData.id][`q${lessonIdx}`] = { score, total, pct };
  saveProgress(p);

  if (pct >= 60) {
    markDone(unitData.id, lessonIdx);
    updateNavBadge();
    updateSidebarDone();
    setTimeout(() => checkUnitComplete(unitData.id), 600);
  }

  const quizBtn = document.getElementById('quiz-btn');
  if (quizBtn) quizBtn.textContent = 'Quiz done';

  document.getElementById('quiz-body').innerHTML = `
    <div class="quiz-score">
      <div class="score-circle">
        <div class="score-num">${score}/${total}</div>
        <div class="score-total">${pct}%</div>
      </div>
      <p class="score-msg">${escapeHtml(msg)}</p>
      <p class="score-sub">${pct >= 60 ? 'Lesson marked as complete.' : 'Score 60% or more to mark this lesson complete.'}</p>
      <div class="score-btns">
        <button class="btn-nav" type="button" onclick="closeQuiz()">Close</button>
        <button class="btn-quiz" type="button" onclick="openQuiz(${lessonIdx})">Retry Quiz</button>
      </div>
    </div>`;
}

function addSidebarToggle() {
  if (!document.querySelector('.sidebar') || document.getElementById('sidebar-toggle')) return;

  const nav = document.querySelector('nav');
  const toggle = document.createElement('button');
  toggle.id = 'sidebar-toggle';
  toggle.className = 'sidebar-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', 'lesson-sidebar');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open lesson menu');
  toggle.textContent = 'Lessons';
  toggle.addEventListener('click', toggleSidebar);

  const sidebar = document.querySelector('.sidebar');
  sidebar.id = 'lesson-sidebar';

  const backdrop = document.createElement('div');
  backdrop.id = 'sidebar-backdrop';
  backdrop.className = 'sidebar-backdrop';
  backdrop.addEventListener('click', closeSidebar);

  nav?.insertBefore(toggle, nav.querySelector('.nav-right'));
  document.body.appendChild(backdrop);
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const toggle = document.getElementById('sidebar-toggle');
  const willOpen = !sidebar?.classList.contains('open');

  sidebar?.classList.toggle('open', willOpen);
  backdrop?.classList.toggle('open', willOpen);
  toggle?.setAttribute('aria-expanded', String(willOpen));
  toggle?.setAttribute('aria-label', willOpen ? 'Close lesson menu' : 'Open lesson menu');
  document.body.classList.toggle('sidebar-is-open', willOpen);
}

function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.getElementById('sidebar-backdrop')?.classList.remove('open');
  document.getElementById('sidebar-toggle')?.setAttribute('aria-expanded', 'false');
  document.getElementById('sidebar-toggle')?.setAttribute('aria-label', 'Open lesson menu');
  document.body.classList.remove('sidebar-is-open');
}

function toggleUnit(header) {
  const lessons = header.nextElementSibling;
  const isOpen = lessons.classList.contains('open');
  document.querySelectorAll('.sidebar-lessons').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.sidebar-unit-header').forEach(el => el.classList.remove('open'));
  if (!isOpen) {
    lessons.classList.add('open');
    header.classList.add('open');
  }
}

function updateSidebar(lessonIdx) {
  document.querySelectorAll('.sidebar-lesson').forEach(el => el.classList.remove('active'));
  const active = document.getElementById(`slink-${unitData.id}-${lessonIdx}`);
  if (active) active.classList.add('active');
}

function updateSidebarDone() {
  if (!unitData) return;
  for (let i = 0; i < LESSONS_EACH; i++) {
    const link = document.getElementById(`slink-${unitData.id}-${i}`);
    const chk = document.getElementById(`chk-${unitData.id}-${i}`);
    if (isDone(unitData.id, i)) {
      if (link) link.classList.add('done-lesson');
      if (chk) chk.textContent = '✓';
    }
  }
}

function addPlaygroundBtn() {
  if (document.getElementById('playground-fab')) return;

  const btn = document.createElement('button');
  btn.id = 'playground-fab';
  btn.className = 'playground-fab';
  btn.type = 'button';
  btn.textContent = '⚡ Code Playground';
  btn.addEventListener('click', () => openPlayground());
  document.body.appendChild(btn);

  ensurePlaygroundModal();
}

function getCurrentStarterCode() {
  const panel = document.querySelector('.lesson-panel.active');
  const codeEl = panel?.querySelector('.task-section .code-body');
  return codeEl ? codeTextFromElement(codeEl).trim() : 'print("Hello from PyTrack!")';
}

function ensurePlaygroundModal() {
  if (document.getElementById('playground-modal')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'playground-modal';
  modal.innerHTML = `
    <div class="modal playground-modal-inner" role="dialog" aria-modal="true" aria-labelledby="playground-title">
      <div class="modal-header">
        <h3 id="playground-title">Code Playground</h3>
        <button class="modal-close" type="button" id="pg-close" aria-label="Close playground">×</button>
      </div>
      <div class="pg-status" id="pg-status">
        <span class="pg-spinner" aria-hidden="true" style="display:none"></span>
        <span id="pg-status-text">Ready. Run Python code directly in the browser.</span>
      </div>
      <div class="pg-editor-wrap">
        <div class="pg-toolbar">
          <span class="pg-lang">python</span>
          <div class="pg-toolbar-right">
            <button class="pg-btn-clear" type="button" id="pg-reset">starter</button>
            <button class="pg-btn-clear" type="button" id="pg-clear">clear</button>
            <button class="pg-btn-run" type="button" id="pg-run">⚡ Run</button>
          </div>
        </div>
        <textarea class="pg-editor" id="pg-editor" spellcheck="false"></textarea>
      </div>
      <div class="pg-output-wrap">
        <div class="pg-output-header">
          <span>output</span>
          <button class="pg-btn-copy-output" type="button" id="pg-copy-output">copy</button>
        </div>
        <pre class="pg-output" id="pg-output"></pre>
      </div>
      <div class="pg-tip">Supported packages include <code>numpy</code>, <code>pandas</code>, <code>matplotlib</code>, <code>scipy</code>, <code>scikit-learn</code>, <code>requests</code>, and <code>beautifulsoup4</code>. First run may take a few seconds.</div>
    </div>`;

  document.body.appendChild(modal);
  document.getElementById('pg-close').addEventListener('click', closePlayground);
  document.getElementById('pg-run').addEventListener('click', runPlaygroundCode);
  document.getElementById('pg-reset').addEventListener('click', () => {
    document.getElementById('pg-editor').value = getCurrentStarterCode();
  });
  document.getElementById('pg-clear').addEventListener('click', () => {
    document.getElementById('pg-editor').value = '';
    setPlaygroundOutput('');
  });
  document.getElementById('pg-copy-output').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('pg-output').textContent || '');
  });
}

function openPlayground(codeText) {
  ensurePlaygroundModal();
  const editor = document.getElementById('pg-editor');
  editor.value = typeof codeText === 'string' && codeText.trim()
    ? codeText.trim()
    : getCurrentStarterCode();
  setPlaygroundOutput('');
  document.getElementById('playground-modal').classList.add('open');
  editor.focus();
}

function closePlayground() {
  document.getElementById('playground-modal')?.classList.remove('open');
}

function setPlaygroundStatus(text, loading = false) {
  const spinner = document.querySelector('#pg-status .pg-spinner');
  const label = document.getElementById('pg-status-text');
  if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
  if (label) label.textContent = text;
}

function setPlaygroundOutput(text, isError = false) {
  const output = document.getElementById('pg-output');
  output.textContent = text;
  output.classList.toggle('pg-error', isError);
}

function loadPyodideScript() {
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${PYODIDE_BASE_URL}pyodide.js`;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load Pyodide. Check your internet connection.'));
    document.head.appendChild(script);
  });
}

function packagesForCode(code) {
  const packages = new Set();
  const checks = [
    [/^\s*(import|from)\s+numpy\b/m, 'numpy'],
    [/^\s*(import|from)\s+pandas\b/m, 'pandas'],
    [/^\s*(import|from)\s+matplotlib\b/m, 'matplotlib'],
    [/^\s*(import|from)\s+seaborn\b/m, 'seaborn'],
    [/^\s*(import|from)\s+scipy\b/m, 'scipy'],
    [/^\s*(import|from)\s+sklearn\b/m, 'scikit-learn'],
    [/^\s*(import|from)\s+requests\b/m, 'requests'],
    [/^\s*(import|from)\s+bs4\b/m, 'beautifulsoup4'],
  ];
  checks.forEach(([pattern, pkg]) => {
    if (pattern.test(code)) packages.add(pkg);
  });
  return Array.from(packages);
}

async function getPyodideRuntime() {
  if (pyodideRuntime) return pyodideRuntime;
  if (!pyodideReady) {
    pyodideReady = (async () => {
      setPlaygroundStatus('Loading Python runtime...', true);
      await loadPyodideScript();
      pyodideRuntime = await window.loadPyodide({ indexURL: PYODIDE_BASE_URL });
      return pyodideRuntime;
    })().catch(err => {
      pyodideReady = null; // allow retry next time
      pyodideRuntime = null;
      throw err;
    });
  }
  return pyodideReady;
}

async function runPlaygroundCode() {
  const code = document.getElementById('pg-editor').value;
  const runBtn = document.getElementById('pg-run');
  runBtn.disabled = true;
  setPlaygroundOutput('');

  try {
    const pyodide = await getPyodideRuntime();
    const packages = packagesForCode(code);
    if (packages.length) {
      setPlaygroundStatus(`Loading packages: ${packages.join(', ')}...`, true);
      await pyodide.loadPackage(packages);
    }

    let stdout = '';
    let stderr = '';
    pyodide.setStdout({ batched: text => { stdout += `${text}\n`; } });
    pyodide.setStderr({ batched: text => { stderr += `${text}\n`; } });

    setPlaygroundStatus('Running code...', true);
    const result = await pyodide.runPythonAsync(code);
    let output = stdout;
    if (result !== undefined && result !== null) output += String(result);
    if (stderr) output += stderr;
    setPlaygroundOutput(output || '(no output)');
    setPlaygroundStatus('Ready.');
  } catch (error) {
    const msg = error.message || String(error);
    const isLoadError = msg.includes('loadPyodide') || msg.includes('Could not load') || msg.includes('fetch');
    setPlaygroundOutput(msg, true);
    if (isLoadError) {
      setPlaygroundStatus('Failed to load Python runtime. Check your internet connection.');
      const retryBtn = document.createElement('button');
      retryBtn.className = 'pg-btn-clear';
      retryBtn.type = 'button';
      retryBtn.textContent = '↺ Retry';
      retryBtn.style.marginLeft = '.5rem';
      retryBtn.addEventListener('click', () => {
        retryBtn.remove();
        runPlaygroundCode();
      });
      document.querySelector('#pg-status')?.appendChild(retryBtn);
    } else {
      setPlaygroundStatus('Execution failed.');
    }
  } finally {
    runBtn.disabled = false;
  }
}

function tryCode(codeText) {
  openPlayground(codeText);
}

// ─── PROGRESS EXPORT / IMPORT ────────────────────────────
function exportProgress() {
  const data = { version: 'pytrack_v3', exported: new Date().toISOString(), progress: getProgress() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pytrack-progress-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const progress = data.progress || data; // support both wrapped and raw
      saveProgress(progress);
      alert('Progress imported successfully! The page will now reload.');
      location.reload();
    } catch {
      alert('Invalid file. Please use a progress file exported from PyTrack.');
    }
  };
  reader.readAsText(file);
}
// ─────────────────────────────────────────────────────────

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeQuiz();
    closePlayground();
    closeSidebar();
    closeUnitComplete();
  }
});

// ─── UNIT COMPLETION CELEBRATION ─────────────────────────
function checkUnitComplete(unitId) {
  const done = unitDoneCount(unitId);
  if (done < LESSONS_EACH) return;
  // Only show once per unit
  const shown = JSON.parse(localStorage.getItem('pytrack_celebrate') || '{}');
  if (shown[unitId]) return;
  shown[unitId] = true;
  localStorage.setItem('pytrack_celebrate', JSON.stringify(shown));
  showUnitComplete(unitId);
}

function showUnitComplete(unitId) {
  ensureUnitCompleteModal();
  const unitNames = {
    1:'Getting Started', 2:'Python Fundamentals', 3:'Control Flow',
    4:'NumPy Arrays', 5:'Pandas Basics', 6:'Data Cleaning',
    7:'Data Analysis', 8:'Data Visualization', 9:'ML, SQL & APIs',
    10:'Git & Portfolio Workflow'
  };
  const isLast = unitId === TOTAL_UNITS;
  document.getElementById('uc-title').textContent = isLast ? '🏆 Course Complete!' : '🎉 Unit Complete!';
  document.getElementById('uc-body').innerHTML = isLast
    ? `<p>You finished all <strong>${TOTAL_UNITS} units</strong> and <strong>${TOTAL_LESSONS} lessons</strong>! Time to build your capstone project.</p>`
    : `<p>You completed <strong>Unit ${unitId}: ${unitNames[unitId]}</strong>! All 10 lessons done.</p><p style="color:var(--muted);font-size:.88rem;margin-top:.5rem">Keep the momentum — Unit ${unitId + 1} is next.</p>`;
  document.getElementById('uc-next').style.display = isLast ? 'none' : 'inline-flex';
  if (!isLast) {
    document.getElementById('uc-next').onclick = () => {
      closeUnitComplete();
      location.href = `unit-${unitId + 1}.html`;
    };
  }
  document.getElementById('unit-complete-modal').classList.add('open');
}

function closeUnitComplete() {
  document.getElementById('unit-complete-modal')?.classList.remove('open');
}

function ensureUnitCompleteModal() {
  if (document.getElementById('unit-complete-modal')) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'unit-complete-modal';
  modal.innerHTML = `
    <div class="modal uc-modal" role="dialog" aria-modal="true">
      <div class="uc-confetti" aria-hidden="true">🎊</div>
      <h2 class="uc-title" id="uc-title"></h2>
      <div class="uc-body" id="uc-body"></div>
      <div class="score-btns" style="margin-top:1.4rem">
        <button class="btn-nav" type="button" onclick="closeUnitComplete()">Close</button>
        <button class="btn-quiz" type="button" id="uc-next">Next Unit →</button>
        <a class="btn-quiz" href="../capstone.html">View Capstone</a>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeUnitComplete(); });
}
// ─────────────────────────────────────────────────────────
