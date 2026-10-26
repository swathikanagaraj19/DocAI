const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('document');
const fileName = document.getElementById('fileName');
const dropZone = document.getElementById('dropZone');
const errorBox = document.getElementById('errorBox');
const progress = document.getElementById('progress');
const analyzeBtn = document.getElementById('analyzeBtn');
let lastResult = null;
let chart = null;

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files.length ? fileInput.files[0].name : 'No file selected';
  errorBox.classList.add('hidden');
});
['dragenter','dragover'].forEach(evt => dropZone.addEventListener(evt, e => {
  e.preventDefault(); dropZone.classList.add('dragging');
}));
['dragleave','drop'].forEach(evt => dropZone.addEventListener(evt, e => {
  e.preventDefault(); dropZone.classList.remove('dragging');
}));
dropZone.addEventListener('drop', e => {
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    fileName.textContent = fileInput.files[0].name;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('hidden');
  const file = fileInput.files[0];
  if (!file) return showError('Choose a PDF or TXT document first.');
  if (!/\.(pdf|txt)$/i.test(file.name)) return showError('Only PDF and TXT files are supported.');
  if (file.size > 10 * 1024 * 1024) return showError('The file is larger than 10 MB. Choose a smaller file.');
  const data = new FormData(form);
  progress.classList.remove('hidden');
  analyzeBtn.disabled = true;
  try {
    const response = await fetch('/api/analyze', {method:'POST', body:data});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Analysis failed. Try another file.');
    lastResult = result;
    renderResult(result);
  } catch (err) {
    showError(err.message || 'Could not connect to the app. Please try again.');
  } finally {
    progress.classList.add('hidden');
    analyzeBtn.disabled = false;
  }
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}
function safeValue(value) {
  if (value === null || value === undefined || value === '') return 'Not found in document';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not found in document';
  return String(value);
}
function renderResult(data) {
  document.getElementById('resultMeta').textContent = `File: ${data.filename || 'Uploaded document'}`;
  document.getElementById('charCount').textContent = Number(data.source_characters || 0).toLocaleString();
  document.getElementById('completeValue').textContent = `${data.completeness || 0}%`;
  document.getElementById('completeBar').style.width = `${data.completeness || 0}%`;
  document.getElementById('modelUsed').textContent = data.model_used || 'Local demo';
  document.getElementById('summaryText').textContent = data.summary || 'No summary was generated.';
  document.getElementById('reviewNotice').textContent = data.notice || 'Review the results against the source document.';
  const extracted = data.extracted || {};
  const fields = [
    ['Name', extracted.name], ['Email', extracted.email], ['Skills', extracted.skills],
    ['Education', extracted.education], ['Work experience', extracted.work_experience]
  ];
  const grid = document.getElementById('extractedGrid');
  grid.replaceChildren();
  fields.forEach(([label, value]) => {
    const card = document.createElement('div'); card.className = 'extracted-item';
    const title = document.createElement('span'); title.textContent = label;
    const content = document.createElement('p'); content.textContent = safeValue(value);
    card.append(title, content); grid.append(card);
  });
  const findings = document.getElementById('findingsList');
  findings.replaceChildren();
  const items = extracted.key_findings || [];
  if (!items.length) {
    const li = document.createElement('li'); li.textContent = 'No key findings detected.'; findings.append(li);
  } else {
    items.forEach(item => { const li = document.createElement('li'); li.textContent = item; findings.append(li); });
  }
  const skills = Array.isArray(extracted.skills) ? extracted.skills : [];
  document.getElementById('noSkills').classList.toggle('hidden', skills.length > 0);
  if (chart) chart.destroy();
  if (skills.length && window.Chart) {
    chart = new Chart(document.getElementById('skillsChart'), {
      type: 'doughnut',
      data: {labels: skills, datasets: [{data: skills.map(() => 1), backgroundColor: ['#6d5dfc','#19b98a','#3985ff','#f04e91','#f3ad3d','#38b7c8','#a58bfa']}]},
      options: {responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{boxWidth:10, usePointStyle:true}}}}
    });
  }
  const section = document.getElementById('results');
  section.classList.remove('hidden');
  section.scrollIntoView({behavior:'smooth', block:'start'});
}
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!lastResult) return;
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'documind-analysis.json'; a.click();
  URL.revokeObjectURL(url);
});
document.getElementById('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.getElementById('themeBtn').textContent = document.body.classList.contains('dark') ? '☀' : '☾';
});
