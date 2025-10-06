# app/routes/summary_view.py
from __future__ import annotations
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/summary", tags=["summary"])

_HTML = """<!doctype html>
<meta charset="utf-8">
<title>NO LOOK / Summary (Server View)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 20px; line-height: 1.5; }
  header { margin-bottom: 16px; }
  label { display:inline-block; min-width: 7em; }
  input, select { padding: 6px 8px; }
  button { padding: 6px 10px; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
  th:first-child, td:first-child { text-align: left; }
  .muted { color: #666; font-size: 0.9em; }
  pre { background: #f7f7f7; padding: 10px; white-space: pre; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; border: 1px solid #eee; border-radius: 8px;}
  .card { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin: 10px 0; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .badge { display:inline-block; padding: 4px 8px; border-radius: 999px; color:#111; font-size: 12px; font-weight: 600; }
  .coach-list { margin: 0; padding-left: 1.2em; }
</style>
<header>
  <h1>サマリー（サーバ内簡易ビュー）</h1>
  <div class="row">
    <div><label>クラスID</label><input id="classId" value="1-A"></div>
    <div><label>日数(1-31)</label><input id="days" type="number" min="1" max="31" value="7"></div>
    <div><label>TZ</label><input id="tz" value="Asia/Tokyo"></div>
    <button id="reload">再取得</button>
  </div>
  <div class="muted">このページは FastAPI が返す簡易ビューです（/summary?view=full を内部で fetch）。</div>
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
  const days = Math.max(1, Math.min(31, Number(document.getElementById('days').value || 7)));
  const tz = document.getElementById('tz').value.trim() || "Asia/Tokyo";
  const url = `/summary?class_id=${encodeURIComponent(classId)}&days=${days}&tz=${encodeURIComponent(tz)}&view=full`;

  const status = document.getElementById('status');
  const content = document.getElementById('content');
  status.textContent = "読み込み中…";
  content.innerHTML = "";

  try {
    const res = await fetch(url, { headers: { "X-API-Key": "dev-key" } });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    // ヘッダ
    const head = document.createElement('div');
    head.className = 'card';
    head.innerHTML = `
      <div class="muted">${data.start_local} 〜 ${data.end_local}（${data.days}日, TZ=${data.tz}）</div>
      ${data.headline ? `<h2 style="margin:6px 0;">${data.headline}</h2>` : ""}
      ${data.text_short ? `<div class="muted">${data.text_short}</div>` : ""}
      ${Array.isArray(data.highlights) && data.highlights.length ? `<div style="margin-top:6px;">・${data.highlights.join("　・")}</div>` : ""}
    `;
    content.appendChild(head);

    // Coach
    if (data.coach) {
      const coach = document.createElement('div');
      coach.className = 'card';
      renderCoach(coach, data.coach);
      content.appendChild(coach);
    }

    // ASCII（等幅）
    if (data.ascii_pretty) {
      const ascii = document.createElement('div');
      ascii.className = 'card';
      ascii.innerHTML = `<h3 style="margin:0 0 6px;">週の雰囲気（ASCII）</h3>
        <div class="muted" style="margin-bottom:6px;">最大値基準の相対バー / 左=件数・%・バー</div>
        <pre>${data.ascii_pretty}</pre>`;
      content.appendChild(ascii);
    }

    // 日別サマリー（表）
    if (Array.isArray(data.daily)) {
      const tbl = document.createElement('div');
      let thead = `<tr><th>日付</th>${EMOTIONS.map(e=>`<th>${e}</th>`).join("")}<th>合計</th></tr>`;
      let rows = "";
      const totals = Object.fromEntries(EMOTIONS.map(e=>[e,0]));
      let grand = 0;
      for (const d of data.daily) {
        const total = EMOTIONS.reduce((acc, e) => acc + (d.counts?.[e] ?? 0), 0);
        rows += `<tr><td>${d.date}</td>${EMOTIONS.map(e=>`<td>${d.counts?.[e] ?? 0}</td>`).join("")}<td>${total}</td></tr>`;
        EMOTIONS.forEach(e => totals[e] += (d.counts?.[e] ?? 0));
        grand += total;
      }
      rows += `<tr><th>合計</th>${EMOTIONS.map(e=>`<th>${totals[e]}</th>`).join("")}<th>${grand}</th></tr>`;
      tbl.innerHTML = `<div class="card"><h3 style="margin:0 0 6px;">日別サマリー</h3>
        <table><thead>${thead}</thead><tbody>${rows}</tbody></table></div>`;
      content.appendChild(tbl);
    }

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
def summary_view():
    return HTMLResponse(_HTML)

