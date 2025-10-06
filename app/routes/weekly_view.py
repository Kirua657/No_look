# app/routes/weekly_view.py
from __future__ import annotations
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/weekly_report", tags=["weekly"])

_HTML = """<!doctype html>
<meta charset="utf-8">
<title>NO LOOK / Weekly Report (Server View)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 20px; line-height: 1.5; }
  header { margin-bottom: 16px; }
  label { display:inline-block; min-width: 7em; }
  input { padding: 6px 8px; }
  button { padding: 6px 10px; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  .muted { color: #666; font-size: 0.9em; }
  pre { background: #f7f7f7; padding: 8px; white-space: pre-wrap; }
  .card { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin: 10px 0; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .badge { display:inline-block; padding: 4px 8px; border-radius: 999px; color:#111; font-size: 12px; font-weight: 600; }
  .coach-list { margin: 0; padding-left: 1.2em; }
</style>
<header>
  <h1>週報（サーバ内簡易ビュー）</h1>
  <div class="row">
    <div><label>クラスID</label><input id="classId" value="1-A"></div>
    <div><label>日数(3-31)</label><input id="days" type="number" min="3" max="31" value="7"></div>
    <button id="reload">再取得</button>
  </div>
  <div class="muted">このページは FastAPI が直接返す簡易ビューです（/weekly_report を内部で fetch）。</div>
</header>
<div id="status" class="muted"></div>
<section id="content"></section>
<script>
const EMOTIONS = ["楽しい","悲しい","怒り","不安","しんどい","中立"];

function renderCoach(container, coach) {
  if (!coach) return;
  let html = `<h3 style="margin:0 0 6px;">提案（Coach）</h3>`;
  if (typeof coach === "object") {
    const color = coach.risk_color || "#ddd";
    const label = coach.risk_label || "Info";
    html += `<div style="margin-bottom:8px;">
      <span class="badge" style="background:${color}">${label}</span>
    </div>`;
    if (Array.isArray(coach.suggestions) && coach.suggestions.length) {
      html += `<ul class="coach-list">` + coach.suggestions.map(s=>`<li>${s}</li>`).join("") + `</ul>`;
    }
  } else {
    html += `<div>${coach}</div>`;
  }
  container.innerHTML = html;
}

async function load() {
  const classId = document.getElementById('classId').value.trim();
  const days = Math.max(3, Math.min(31, Number(document.getElementById('days').value || 7)));
  const url = `/weekly_report?class_id=${encodeURIComponent(classId)}&days=${days}&tz=Asia/Tokyo`;
  const status = document.getElementById('status');
  const content = document.getElementById('content');
  status.textContent = "読み込み中…";
  content.innerHTML = "";
  try {
    const res = await fetch(url, { headers: { "X-API-Key": "dev-key" } });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    const head = document.createElement('div');
    head.className = 'card';
    head.innerHTML = `
      <div class="muted">${data.start_date} 〜 ${data.end_date}（${data.range_days}日）</div>
      ${data.headline ? `<h2 style="margin:6px 0;">${data.headline}</h2>` : ""}
    `;
    content.appendChild(head);

    if (data.coach) {
      const coach = document.createElement('div');
      coach.className = 'card';
      renderCoach(coach, data.coach);
      content.appendChild(coach);
    }

    if (data.ascii_pretty) {
      const ascii = document.createElement('div');
      ascii.className = 'card';
      ascii.innerHTML = `<h3 style="margin:0 0 6px;">週の雰囲気（ASCII）</h3><pre>${data.ascii_pretty}</pre>`;
      content.appendChild(ascii);
    }

    // テーブル生成
    const tbl = document.createElement('div');
    let thead = `<tr><th>日付</th>${EMOTIONS.map(e=>`<th>${e}</th>`).join("")}<th>合計</th></tr>`;
    let rows = "";
    const totals = Object.fromEntries(EMOTIONS.map(e=>[e,0]));
    let grand = 0;
    for (const d of data.daily) {
      rows += `<tr><td>${d.date}</td>${EMOTIONS.map(e=>`<td>${d.counts[e] ?? 0}</td>`).join("")}<td>${d.total}</td></tr>`;
      EMOTIONS.forEach(e => totals[e] += (d.counts[e] ?? 0));
      grand += d.total;
    }
    rows += `<tr><th>合計</th>${EMOTIONS.map(e=>`<th>${totals[e]}</th>`).join("")}<th>${grand}</th></tr>`;
    tbl.innerHTML = `<div class="card"><h3 style="margin:0 0 6px;">日別サマリー</h3>
      <table><thead>${thead}</thead><tbody>${rows}</tbody></table></div>`;
    content.appendChild(tbl);

    status.textContent = "OK";
  } catch (e) {
    status.textContent = "エラー: " + (e.message || e);
  }
}
document.getElementById('reload').addEventListener('click', load);
load();
</script>
"""

@router.get("/view", response_class=HTMLResponse)
def weekly_report_view():
    return HTMLResponse(_HTML)
