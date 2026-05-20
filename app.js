/* Офтальмо-справочник — клиентский роутер, поиск, рендер */
(function(){
'use strict';

const $ = sel => document.querySelector(sel);
const view = $('#view');
const titleEl = $('#title');
const backBtn = $('#backBtn');
const searchInp = $('#search');
const clearBtn = $('#clearBtn');

// ─── persistent state ───────────────────────────────────────────
const ls = window.localStorage;
const getJSON = (k, d) => { try { return JSON.parse(ls.getItem(k)) ?? d; } catch(e) { return d; } };
const setJSON = (k, v) => { try { ls.setItem(k, JSON.stringify(v)); } catch(e){} };

let state = {
  age: ls.getItem('age') || 'adult', // adult | child | preg
  theme: ls.getItem('theme') || 'light',
  fav: getJSON('fav', { dx: [], rx: [] }),
  hist: getJSON('hist', [])
};
document.body.dataset.theme = state.theme;

// ─── helpers ────────────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lower = s => String(s||'').toLowerCase();
const ru2en = s => s.replace(/[а-яё]/gi, c => {
  const m = {'й':'q','ц':'w','у':'e','к':'r','е':'t','н':'y','г':'u','ш':'i','щ':'o','з':'p','х':'[','ъ':']','ф':'a','ы':'s','в':'d','а':'f','п':'g','р':'h','о':'j','л':'k','д':'l','ж':';','э':"'",'я':'z','ч':'x','с':'c','м':'v','и':'b','т':'n','ь':'m','б':',','ю':'.'};
  return m[c.toLowerCase()] || c;
});
const norm = s => lower(s).replace(/ё/g,'е').replace(/[^a-zа-я0-9 ]/g,' ').replace(/\s+/g,' ').trim();

function recordHistory(type, id){
  state.hist = state.hist.filter(h => !(h.t===type && h.id===id));
  state.hist.unshift({t:type, id:id, ts:Date.now()});
  state.hist = state.hist.slice(0,30);
  setJSON('hist', state.hist);
}

function toggleFav(type, id){
  const arr = state.fav[type];
  const idx = arr.indexOf(id);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(id);
  setJSON('fav', state.fav);
}
function isFav(type, id){ return state.fav[type].includes(id); }

function copyText(s){
  if (navigator.clipboard) navigator.clipboard.writeText(s).catch(()=>{});
  else {
    const ta = document.createElement('textarea'); ta.value = s;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
}

// ─── routing ────────────────────────────────────────────────────
function parseHash(){
  const h = location.hash.slice(1) || 'diagnoses';
  const [route, ...args] = h.split('/');
  return { route, args };
}
function go(hash){ location.hash = hash; }
window.addEventListener('hashchange', render);

backBtn.addEventListener('click', () => history.length > 1 ? history.back() : go('diagnoses'));

// ─── theme ──────────────────────────────────────────────────────
$('#themeBtn').addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.body.dataset.theme = state.theme;
  ls.setItem('theme', state.theme);
});

// ─── search ─────────────────────────────────────────────────────
let searchTimer = null;
searchInp.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    searchInp.value = '';
    clearBtn.style.display = 'none';
    if (parseHash().route === 'search') go('home');
    searchInp.blur();
  }
});
searchInp.addEventListener('input', () => {
  clearTimeout(searchTimer);
  clearBtn.style.display = searchInp.value ? '' : 'none';
  searchTimer = setTimeout(() => {
    if (searchInp.value.trim().length >= 2) go('search/' + encodeURIComponent(searchInp.value));
    else if (!searchInp.value) {
      if (parseHash().route === 'search') history.back();
    }
  }, 180);
});
clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  searchInp.value = '';
  clearBtn.style.display = 'none';
  if (parseHash().route === 'search') go('home');
  // Возвращаем фокус для удобства повторного ввода — но не показываем клавиатуру если пустое поле на мобильном
  setTimeout(() => searchInp.focus(), 0);
});
// Также реагируем на touchend для надёжности на iOS
clearBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  searchInp.value = '';
  clearBtn.style.display = 'none';
  if (parseHash().route === 'search') go('home');
  searchInp.focus();
});

// ─── bottom nav ─────────────────────────────────────────────────
document.querySelectorAll('.bn-btn').forEach(b => {
  b.addEventListener('click', () => go(b.dataset.nav));
});

// ─── install prompt (Android Chrome) ────────────────────────────
let deferredPrompt = null;
const installBtn = $('#installBtn');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = '';
});
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});
window.addEventListener('appinstalled', () => { installBtn.style.display = 'none'; });

// ─── shared renderers ───────────────────────────────────────────
function tag(cls, txt){ return `<span class="tag ${cls||''}">${esc(txt)}</span>`; }
function diagnosisListItem(d){
  const urgent = d.urgent ? tag('urgent','срочно') : '';
  const amb = d.amb ? tag('amb','амбулаторно') : '';
  return `<a class="list-item" href="#dx/${esc(d.id)}">
    <div class="lt">${esc(d.name)}</div>
    ${d.syn && d.syn.length ? `<div class="ls">${esc(d.syn.join(', '))}</div>` : ''}
    <div class="lm">${tag('icd', d.icd)} ${urgent} ${amb}</div>
  </a>`;
}
function drugListItem(d){
  return `<a class="list-item" href="#rx/${esc(d.id)}">
    <div class="lt">${esc(d.inn)} ${d.conc ? '<span style="color:var(--muted);font-weight:normal">'+esc(d.conc)+'</span>' : ''}</div>
    ${d.brand && d.brand.length ? `<div class="ls">${esc(d.brand.slice(0,4).join(', '))}${d.brand.length>4?'…':''}</div>` : ''}
    <div class="lm">${d.atc ? tag('atc', d.atc) : ''} ${d.group ? tag('', d.group) : ''} ${d.rx ? tag('rx', 'Rx') : ''}</div>
  </a>`;
}

// ─── sections data (built from window.DIAGNOSES groupings) ─────
const SECTIONS = [
  { id: 'eyelids',   title: 'Веки и ресницы', icon: '👁️', icd: 'H00-H02' },
  { id: 'lacrimal',  title: 'Слёзные органы', icon: '💧', icd: 'H04' },
  { id: 'orbit',     title: 'Орбита',         icon: '🦴', icd: 'H05' },
  { id: 'conj',      title: 'Конъюнктива',    icon: '🌸', icd: 'H10-H11' },
  { id: 'sclera',    title: 'Склера и эписклера', icon: '⚪', icd: 'H15' },
  { id: 'cornea',    title: 'Роговица',       icon: '⚙️', icd: 'H16-H18' },
  { id: 'iris',      title: 'Радужка и увеа', icon: '🌀', icd: 'H20-H22' },
  { id: 'lens',      title: 'Хрусталик / катаракта', icon: '🔘', icd: 'H25-H28' },
  { id: 'glaucoma',  title: 'Глаукома',       icon: '🔺', icd: 'H40-H42' },
  { id: 'retina',    title: 'Сетчатка и сосудистая', icon: '🕸️', icd: 'H30-H36' },
  { id: 'vitreous',  title: 'Стекловидное тело', icon: '💎', icd: 'H43' },
  { id: 'optic',     title: 'Зрительный нерв', icon: '🧠', icd: 'H46-H48' },
  { id: 'refr',      title: 'Рефракция / аккомодация', icon: '👓', icd: 'H49-H52' },
  { id: 'strab',     title: 'Косоглазие / амблиопия', icon: '↔️', icd: 'H49-H53' },
  { id: 'trauma',    title: 'Травмы и ожоги', icon: '🩹', icd: 'S05/T26' },
  { id: 'pediatric', title: 'Детская офтальмология', icon: '👶', icd: 'H35.1/Q' },
  { id: 'systemic',  title: 'Системные заболевания', icon: '🩺', icd: 'разн.' },
  { id: 'urgent',    title: 'Неотложные состояния', icon: '🚨', icd: 'разн.', urgent: true }
];

function sectionOf(d){
  if (d.urgent) return 'urgent';
  return d.section || 'other';
}

// ─── views ──────────────────────────────────────────────────────

function renderHomeDiagnoses(){
  const counts = {};
  DIAGNOSES.forEach(d => { const s = sectionOf(d); counts[s] = (counts[s]||0)+1; });
  view.innerHTML = `
    <div class="amb-banner">📋 Амбулаторный справочник офтальмолога. ${DIAGNOSES.length} нозологий, ${DRUGS.length} препаратов.</div>
    <div class="section-title">Разделы</div>
    <div class="tile-grid">
      ${SECTIONS.map(s => `
        <a class="tile ${s.urgent?'urgent':''}" href="#sec/${s.id}">
          <div class="t">${s.icon} ${esc(s.title)}</div>
          <div class="s">${esc(s.icd)} · ${counts[s.id]||0}</div>
        </a>`).join('')}
    </div>
    ${state.fav.dx.length ? `
      <div class="section-title">⭐ Избранные диагнозы</div>
      ${state.fav.dx.map(id => DIAGNOSES.find(d=>d.id===id)).filter(Boolean).map(diagnosisListItem).join('')}
    ` : ''}
    ${state.hist.length ? `
      <div class="section-title">🕒 Недавно просмотренные</div>
      ${state.hist.slice(0,8).map(h => {
        if (h.t === 'dx') { const d = DIAGNOSES.find(x=>x.id===h.id); return d ? diagnosisListItem(d) : ''; }
        if (h.t === 'rx') { const d = DRUGS.find(x=>x.id===h.id); return d ? drugListItem(d) : ''; }
        return '';
      }).join('')}
    ` : ''}
    ${footer()}
  `;
}

function renderSection(id){
  const s = SECTIONS.find(x => x.id === id);
  if (!s) return renderHomeDiagnoses();
  titleEl.textContent = s.title;
  backBtn.style.display = '';
  const list = DIAGNOSES.filter(d => sectionOf(d) === id);
  view.innerHTML = `
    <div class="section-title">${esc(s.title)} (${list.length})</div>
    ${list.length ? list.map(diagnosisListItem).join('') : '<div class="empty"><span class="em">∅</span>Раздел пуст</div>'}
    ${footer()}
  `;
}

function renderDiagnosis(id){
  const d = DIAGNOSES.find(x => x.id === id);
  if (!d) { view.innerHTML = '<div class="empty">Не найдено</div>' + footer(); return; }
  recordHistory('dx', id);
  titleEl.textContent = d.name;
  backBtn.style.display = '';
  const age = state.age;
  const ageLabel = age === 'child' ? 'ребёнка' : age === 'preg' ? 'беременной' : 'взрослого';
  // Возрастные/беременностные противопоказания препарата
  const drugWarn = (drug) => {
    if (!drug) return null;
    if (age === 'preg') {
      const p = String(drug.preg||'').toUpperCase();
      if (p.includes('X') || /противопоказ/i.test(drug.preg||'')) return {level:'contra', text:'противопоказан при беременности'};
      if (p.includes('D')) return {level:'caution', text:'категория D — только по жизненным показаниям'};
      if (p.includes('C')) return {level:'caution', text:'категория C — польза/риск'};
    }
    if (age === 'child') {
      const a = String(drug.age||'').toLowerCase();
      if (/с 18|с осторожностью у детей|формально с 18/.test(a)) return {level:'caution', text:'у детей — с осторожностью / формально с 18 лет'};
      if (/противопоказ/.test(a)) return {level:'contra', text:'противопоказан у детей'};
    }
    return null;
  };
  const rxBlock = (arr) => arr && arr.length ? `<ul>${arr.map(x => {
    if (typeof x === 'string') return `<li>${esc(x)}</li>`;
    if (x.drug) {
      const drug = DRUGS.find(dr => dr.id === x.drug);
      const inn = drug ? drug.inn : x.drug;
      const conc = drug && drug.conc ? ' ' + drug.conc : '';
      const w = drugWarn(drug);
      const cls = w ? ` class="rx-${w.level}"` : '';
      const wTag = w ? ` <span class="rx-warn">⚠ ${esc(w.text)}</span>` : '';
      return `<li${cls}><a href="#rx/${esc(x.drug)}"><b>${esc(inn)}${esc(conc)}</b></a>${x.dose?' — '+esc(x.dose):''}${x.note?' <span style="color:var(--muted)">('+esc(x.note)+')</span>':''}${wTag}</li>`;
    }
    return '';
  }).join('')}</ul>` : '<p style="color:var(--muted)">—</p>';
  const tx = d.tx || {};
  const hasAgeBlock = (age === 'child' && d.tx_child) || (age === 'preg' && d.tx_preg);
  const txByAge = (age === 'child' && d.tx_child) ? d.tx_child : (age === 'preg' && d.tx_preg) ? d.tx_preg : tx;
  const ageBanner = age === 'adult'
    ? ''
    : (hasAgeBlock
        ? `<div class="age-note age-note--ok">✓ Тактика адаптирована для ${ageLabel}.</div>`
        : `<div class="age-note age-note--warn">⚠ Отдельная тактика для ${ageLabel} в справочнике не описана — показано взрослое лечение. Сверьтесь с противопоказаниями каждого препарата (категория беременности / возрастные ограничения подсвечены ниже).</div>`);
  view.innerHTML = `
    <article class="card">
      ${d.urgent ? `<div class="urgent-banner">🚨 ${esc(d.urgent)}</div>` : ''}
      ${d.amb ? `<div class="amb-banner">🏥 Тактика: ${esc(d.amb)}</div>` : ''}
      <h2>${esc(d.name)}</h2>
      ${d.syn && d.syn.length ? `<div class="syn">${esc(d.syn.join(' · '))}</div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">
        ${tag('icd', d.icd)}
        <button class="btn ghost" style="padding:2px 10px;min-height:auto;font-size:12px" onclick="navigator.clipboard&&navigator.clipboard.writeText('${esc(d.icd)}')">Скопировать МКБ</button>
        <button class="btn ghost" style="padding:2px 10px;min-height:auto;font-size:12px" onclick="window.__toggleFav('dx','${esc(d.id)}')">${isFav('dx',d.id)?'★ в избранном':'☆ в избранное'}</button>
      </div>
      <div class="age-toggle">
        <button data-age="adult" class="${age==='adult'?'active':''}">Взрослый</button>
        <button data-age="child" class="${age==='child'?'active':''}">Ребёнок</button>
        <button data-age="preg" class="${age==='preg'?'active':''}">Беременная</button>
      </div>
      ${ageBanner}
      ${d.desc ? `<details open><summary>📖 Описание</summary><p>${esc(d.desc)}</p>${d.etiol?`<p><b>Этиология:</b> ${esc(d.etiol)}</p>`:''}${d.classes?`<p><b>Классификация:</b> ${esc(d.classes)}</p>`:''}</details>` : ''}
      ${d.sx && d.sx.length ? `<details open><summary>🔎 Симптомы (жалобы)</summary><ul>${d.sx.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.dx && d.dx.length ? `<details open><summary>🔬 Диагностика</summary><ul>${d.dx.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.ddx && d.ddx.length ? `<details><summary>⚖️ Дифференциальный диагноз</summary><ul>${d.ddx.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${txByAge.tactics && txByAge.tactics.length ? `<details open><summary>🎯 Лечение — тактика</summary><ul>${txByAge.tactics.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${txByAge.rx && txByAge.rx.length ? `<details open><summary>💊 Лечение — препараты</summary>${rxBlock(txByAge.rx)}</details>` : ''}
      ${d.route ? `<details open><summary>🧭 Маршрутизация</summary><p>${esc(d.route)}</p></details>` : ''}
      ${d.prog ? `<details><summary>📈 Прогноз и осложнения</summary><p>${esc(d.prog)}</p></details>` : ''}
      ${d.note ? `<details><summary>💡 Заметки</summary><p>${esc(d.note)}</p></details>` : ''}
      <div class="meta">
        <span class="tag icd">${esc(d.icd)}</span>
        ${d.src ? `<div class="src">Источник: ${esc(d.src)}</div>` : ''}
      </div>
    </article>
    ${footer()}
  `;
  view.querySelectorAll('.age-toggle button').forEach(b => {
    b.addEventListener('click', () => {
      state.age = b.dataset.age; ls.setItem('age', state.age);
      renderDiagnosis(id);
    });
  });
}

// ─── drugs ─────────────────────────────────────────────────────
const ATC_TREE = [
  { code: 'S01A', title: 'Противомикробные', sub: [
    { code: 'S01AA', title: 'Антибиотики' },
    { code: 'S01AB', title: 'Сульфаниламиды' },
    { code: 'S01AD', title: 'Противовирусные' },
    { code: 'S01AX', title: 'Антисептики и прочие' }
  ]},
  { code: 'S01B', title: 'Противовоспалительные', sub: [
    { code: 'S01BA', title: 'Кортикостероиды' },
    { code: 'S01BC', title: 'НПВП' }
  ]},
  { code: 'S01C', title: 'ГКС + АБ комбинации' },
  { code: 'S01E', title: 'Противоглаукомные', sub: [
    { code: 'S01EA', title: 'α-агонисты' },
    { code: 'S01EB', title: 'Миотики' },
    { code: 'S01EC', title: 'Ингибиторы карбоангидразы' },
    { code: 'S01ED', title: 'β-блокаторы' },
    { code: 'S01EE', title: 'Простагландины' },
    { code: 'S01EX', title: 'Прочие, комбинации' }
  ]},
  { code: 'S01F', title: 'Мидриатики, циклоплегики' },
  { code: 'S01G', title: 'Противоаллергические' },
  { code: 'S01H', title: 'Местные анестетики' },
  { code: 'S01K', title: 'Хирургические вспомогательные' },
  { code: 'S01L', title: 'Анти-VEGF' },
  { code: 'S01X', title: 'Кератопротекторы, метаболики, прочие' },
  { code: 'SYST', title: 'Системные препараты (для офтальмолога)', sub: [
    { code: 'KFG_NOOT',   title: 'Ноотропные и нейропротекторы' },
    { code: 'KFG_REGEN',  title: 'Стимуляторы регенерации тканей' },
    { code: 'KFG_VASC',   title: 'Препараты, улучшающие мозговое и глазное кровообращение' },
    { code: 'KFG_METAB',  title: 'Метаболики и энергопротекторы' },
    { code: 'KFG_ANTIOX', title: 'Антиоксидантные средства' },
    { code: 'KFG_IMMUNO', title: 'Иммуносупрессоры системные' },
    { code: 'KFG_ANTIB',  title: 'Антибиотики системные' },
    { code: 'KFG_ANTIVIR',title: 'Противовирусные системные' },
    { code: 'KFG_ANTIFUN',title: 'Противогрибковые системные' },
    { code: 'KFG_GCS',    title: 'ГКС системные' },
    { code: 'KFG_NSAID',  title: 'НПВП и анальгетики системные' },
    { code: 'KFG_ANTIHIST',title:'Антигистаминные системные' },
    { code: 'KFG_DIUR',   title: 'Диуретики и осмотики' },
    { code: 'KFG_ENZYME', title: 'Ферменты и гемостатики' }
  ]},
  { code: 'SIDE', title: 'Препараты с глазными побочными эффектами' }
];

function renderDrugsHome(){
  titleEl.textContent = 'Препараты';
  backBtn.style.display = 'none';
  const counts = {};
  DRUGS.forEach(d => { (d.atc?d.atc.slice(0,4):'??'); counts[d.atc] = (counts[d.atc]||0)+1; });
  view.innerHTML = `
    <div class="amb-banner">💊 ${DRUGS.length} МНН по классификации ATC S01 + системные. Дозировки сверены с инструкциями Видаль 2023.</div>
    <div class="section-title">Группы (ATC)</div>
    <div class="tile-grid">
      ${ATC_TREE.map(g => {
        const c = (g.code === 'SYST' || g.code === 'SIDE')
          ? DRUGS.filter(d => d.cat === g.code).length
          : DRUGS.filter(d => d.atc && (d.atc===g.code || d.atc.startsWith(g.code))).length;
        return `<a class="tile" href="#atc/${g.code}"><div class="t">${esc(g.title)}</div><div class="s">${g.code} · ${c}</div></a>`;
      }).join('')}
    </div>
    <div class="section-title">Все препараты (А-Я)</div>
    <a class="list-item" href="#alldrugs"><div class="lt">📜 Список МНН по алфавиту</div><div class="ls">${DRUGS.length} записей</div></a>
    ${state.fav.rx.length ? `
      <div class="section-title">⭐ Избранные препараты</div>
      ${state.fav.rx.map(id => DRUGS.find(d=>d.id===id)).filter(Boolean).map(drugListItem).join('')}
    ` : ''}
    ${footer()}
  `;
}

function renderATC(code){
  titleEl.textContent = 'ATC ' + code;
  backBtn.style.display = '';
  const matches = d => {
    if (code === 'SYST' || code === 'SIDE') return d.cat === code;
    if (code.startsWith('KFG_')) {
      const kfg = Array.isArray(d.kfg) ? d.kfg : (d.kfg ? [d.kfg] : []);
      return kfg.includes(code);
    }
    return d.atc && (d.atc === code || d.atc.startsWith(code));
  };
  const list = DRUGS.filter(matches).sort((a,b)=>a.inn.localeCompare(b.inn,'ru'));
  const node = ATC_TREE.find(g => g.code===code);
  const subs = node && node.sub ? `
    <div class="section-title">Подгруппы</div>
    <div class="tile-grid">
      ${node.sub.map(s => {
        const c = s.code.startsWith('KFG_')
          ? DRUGS.filter(d => { const k = Array.isArray(d.kfg) ? d.kfg : (d.kfg ? [d.kfg] : []); return k.includes(s.code); }).length
          : DRUGS.filter(d => d.atc && d.atc.startsWith(s.code)).length;
        return `<a class="tile" href="#atc/${s.code}"><div class="t">${esc(s.title)}</div><div class="s">${s.code} · ${c}</div></a>`;
      }).join('')}
    </div>` : '';
  view.innerHTML = `
    ${subs}
    <div class="section-title">Препараты в группе (${list.length})</div>
    ${list.length ? list.map(drugListItem).join('') : '<div class="empty"><span class="em">∅</span>В этой подгруппе пока нет препаратов</div>'}
    ${footer()}
  `;
}

function renderAllDrugs(){
  titleEl.textContent = 'Все препараты';
  backBtn.style.display = '';
  const groups = {};
  DRUGS.forEach(d => {
    const ch = (d.inn || '?')[0].toUpperCase();
    (groups[ch] = groups[ch] || []).push(d);
  });
  const letters = Object.keys(groups).sort((a,b)=>a.localeCompare(b,'ru'));
  view.innerHTML = letters.map(L => `
    <div class="section-title">${L}</div>
    ${groups[L].sort((a,b)=>a.inn.localeCompare(b.inn,'ru')).map(drugListItem).join('')}
  `).join('') + footer();
}

function renderDrug(id){
  const d = DRUGS.find(x => x.id === id);
  if (!d) { view.innerHTML = '<div class="empty">Не найдено</div>' + footer(); return; }
  recordHistory('rx', id);
  titleEl.textContent = d.inn;
  backBtn.style.display = '';
  const pills = [];
  if (d.preg) pills.push('<span class="warn-pill preg">🤰 беременность: '+esc(d.preg)+'</span>');
  if (d.age) pills.push('<span class="warn-pill kids">👶 возраст: '+esc(d.age)+'</span>');
  if (d.glaWarn) pills.push('<span class="warn-pill gla">⚠️ ЗУГ</span>');
  if (d.cl) pills.push('<span class="warn-pill cl">КЛ</span>');
  // find diagnoses that reference this drug
  const usedIn = DIAGNOSES.filter(dx => {
    const all = [];
    if (dx.tx && dx.tx.rx) all.push(...dx.tx.rx);
    if (dx.tx_child && dx.tx_child.rx) all.push(...dx.tx_child.rx);
    if (dx.tx_preg && dx.tx_preg.rx) all.push(...dx.tx_preg.rx);
    return all.some(r => r && r.drug === id);
  });
  view.innerHTML = `
    <article class="card">
      <h2>${esc(d.inn)} ${d.conc ? '<span style="color:var(--muted);font-weight:normal;font-size:18px">'+esc(d.conc)+'</span>' : ''}</h2>
      ${d.brand && d.brand.length ? `<div class="syn">Торговые: ${esc(d.brand.join(', '))}</div>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">
        ${d.atc ? tag('atc', d.atc) : ''}
        ${d.group ? tag('', d.group) : ''}
        ${d.rx ? tag('rx', 'по рецепту') : ''}
        <button class="btn ghost" style="padding:2px 10px;min-height:auto;font-size:12px" onclick="window.__toggleFav('rx','${esc(d.id)}')">${isFav('rx',d.id)?'★':'☆'}</button>
      </div>
      ${pills.length ? `<div style="margin:8px 0">${pills.join(' ')}</div>` : ''}
      ${d.kfg_full && d.kfg_full.length ? `<details><summary>📋 Клинико-фармакологические группы (КФГ/ФТГ)</summary><ul>${d.kfg_full.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.manufacturers && d.manufacturers.length ? `<details><summary>🏭 Производители</summary><p>${esc(d.manufacturers.join(', '))}</p></details>` : ''}
      ${d.mech ? `<details open><summary>🔬 Механизм действия</summary><p>${esc(d.mech)}</p></details>` : ''}
      ${d.ind && d.ind.length ? `<details open><summary>✅ Показания</summary><ul>${d.ind.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.dose ? `<details open><summary>💉 Дозировка (офтальмология)</summary>${typeof d.dose==='string'?`<p>${esc(d.dose)}</p>`:`<ul>${d.dose.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`}</details>` : ''}
      ${d.contra && d.contra.length ? `<details><summary>⛔ Противопоказания</summary><ul>${d.contra.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.adv && d.adv.length ? `<details><summary>⚠️ Побочные эффекты</summary><ul>${d.adv.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.inter && d.inter.length ? `<details><summary>🔁 Взаимодействия</summary><ul>${d.inter.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${d.note ? `<details><summary>💡 Заметки</summary><p>${esc(d.note)}</p></details>` : ''}
      ${d.forms && d.forms.length ? `<details><summary>📦 Формы выпуска</summary><ul>${d.forms.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
      ${usedIn.length ? `<details><summary>🔗 Используется при (${usedIn.length} диагн.)</summary>${usedIn.slice(0,12).map(diagnosisListItem).join('')}</details>` : ''}
      <div class="meta">
        ${d.src ? `<div class="src">Источник: ${esc(d.src)}</div>` : '<div class="src">Источник: Видаль 2023 / ГРЛС РФ / инструкция производителя</div>'}
      </div>
    </article>
    ${footer()}
  `;
}

// ─── algorithms ─────────────────────────────────────────────────
function renderAlgorithms(){
  titleEl.textContent = 'Алгоритмы';
  backBtn.style.display = 'none';
  view.innerHTML = `
    <div class="section-title">Пошаговые алгоритмы (${ALGORITHMS.length})</div>
    ${ALGORITHMS.map(a => `<a class="list-item" href="#algo/${esc(a.id)}">
      <div class="lt">${a.urgent?'🚨 ':''}${esc(a.title)}</div>
      <div class="ls">${esc(a.subtitle||'')}</div>
    </a>`).join('')}
    ${footer()}
  `;
}
function renderAlgo(id){
  const a = ALGORITHMS.find(x => x.id === id);
  if (!a) { view.innerHTML = '<div class="empty">Не найдено</div>' + footer(); return; }
  titleEl.textContent = a.title;
  backBtn.style.display = '';
  view.innerHTML = `
    <article class="card">
      <h2>${a.urgent?'🚨 ':''}${esc(a.title)}</h2>
      ${a.subtitle ? `<div class="syn">${esc(a.subtitle)}</div>` : ''}
      ${a.intro ? `<p>${esc(a.intro)}</p>` : ''}
      <div style="margin-top:12px">
        ${a.steps.map((s, i) => `<div class="algo-step"><div class="n">${i+1}</div><div class="t">${typeof s==='string'?esc(s):`<b>${esc(s.title||'')}</b>${s.body?'<br>'+esc(s.body):''}${s.list?'<ul>'+s.list.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}`}</div></div>`).join('')}
      </div>
      ${a.note ? `<div class="meta"><div class="src">${esc(a.note)}</div></div>` : ''}
    </article>
    ${footer()}
  `;
}

// ─── scales ────────────────────────────────────────────────────
function renderScales(){
  titleEl.textContent = 'Шкалы и нормы';
  backBtn.style.display = 'none';
  view.innerHTML = `
    <div class="section-title">Классификации и нормы (${SCALES.length})</div>
    ${SCALES.map(s => `<a class="list-item" href="#scale/${esc(s.id)}">
      <div class="lt">${esc(s.title)}</div>
      <div class="ls">${esc(s.subtitle||'')}</div>
    </a>`).join('')}
    ${footer()}
  `;
}
function renderScale(id){
  const s = SCALES.find(x => x.id === id);
  if (!s) { view.innerHTML = '<div class="empty">Не найдено</div>' + footer(); return; }
  titleEl.textContent = s.title;
  backBtn.style.display = '';
  view.innerHTML = `
    <article class="card">
      <h2>${esc(s.title)}</h2>
      ${s.subtitle ? `<div class="syn">${esc(s.subtitle)}</div>` : ''}
      ${s.body ? `<div>${s.body}</div>` : ''}
      ${s.src ? `<div class="meta"><div class="src">Источник: ${esc(s.src)}</div></div>` : ''}
    </article>
    ${footer()}
  `;
}

// ─── misc (abbr, settings, about) ──────────────────────────────
function renderMisc(){
  titleEl.textContent = 'Ещё';
  backBtn.style.display = 'none';
  view.innerHTML = `
    <div class="tile-grid">
      <a class="tile" href="#abbr"><div class="t">🔤 Сокращения</div><div class="s">${ABBR.length} аббревиатур</div></a>
      <a class="tile" href="#icd"><div class="t">📂 МКБ-10 H00-H59</div><div class="s">Дерево кодов</div></a>
      <a class="tile" href="#favs"><div class="t">⭐ Избранное</div><div class="s">${state.fav.dx.length+state.fav.rx.length} записей</div></a>
      <a class="tile" href="#about"><div class="t">ℹ️ О приложении</div><div class="s">Версия, источники</div></a>
    </div>
    ${footer()}
  `;
}
function renderAbbr(){
  titleEl.textContent = 'Сокращения';
  backBtn.style.display = '';
  const groups = {};
  ABBR.forEach(a => { (groups[a.cat||'Прочее'] = groups[a.cat||'Прочее']||[]).push(a); });
  view.innerHTML = Object.keys(groups).sort().map(cat => `
    <div class="section-title">${esc(cat)}</div>
    <div class="card"><dl class="abbr-grid">
      ${groups[cat].sort((a,b)=>a.k.localeCompare(b.k,'ru')).map(a => `<dt>${esc(a.k)}</dt><dd>${esc(a.v)}${a.en?' <span style="color:var(--muted);font-size:12px">('+esc(a.en)+')</span>':''}</dd>`).join('')}
    </dl></div>
  `).join('') + footer();
}
function renderICD(){
  titleEl.textContent = 'МКБ-10 H00-H59';
  backBtn.style.display = '';
  view.innerHTML = ICD10.map(block => `
    <div class="section-title">${esc(block.range)} — ${esc(block.title)}</div>
    ${block.items.map(it => `<div class="list-item">
      <div class="lt"><span class="tag icd">${esc(it.code)}</span> ${esc(it.title)}</div>
      ${it.sub ? `<div class="ls" style="margin-top:6px">${it.sub.map(s => `<div>${esc(s.code)} — ${esc(s.title)}</div>`).join('')}</div>` : ''}
    </div>`).join('')}
  `).join('') + footer();
}
function renderFavs(){
  titleEl.textContent = 'Избранное';
  backBtn.style.display = '';
  view.innerHTML = `
    <div class="section-title">Диагнозы (${state.fav.dx.length})</div>
    ${state.fav.dx.length ? state.fav.dx.map(id => DIAGNOSES.find(d=>d.id===id)).filter(Boolean).map(diagnosisListItem).join('') : '<div class="empty">Пусто</div>'}
    <div class="section-title">Препараты (${state.fav.rx.length})</div>
    ${state.fav.rx.length ? state.fav.rx.map(id => DRUGS.find(d=>d.id===id)).filter(Boolean).map(drugListItem).join('') : '<div class="empty">Пусто</div>'}
    ${footer()}
  `;
}
function renderAbout(){
  titleEl.textContent = 'О приложении';
  backBtn.style.display = '';
  view.innerHTML = `
    <article class="card">
      <h2>Офтальмо — амбулаторный справочник</h2>
      <p>PWA-приложение для практикующего офтальмолога. Работает офлайн после первой загрузки.</p>
      <h3>Контент</h3>
      <ul>
        <li>${DIAGNOSES.length} нозологий с разбором: описание / симптомы / диагностика / диф.диагноз / тактика / препараты / маршрутизация / МКБ-10</li>
        <li>${DRUGS.length} препаратов (ATC S01 + системные + ЛС с глазными побочными эффектами)</li>
        <li>${ALGORITHMS.length} пошаговых алгоритмов (неотложка, скрининги)</li>
        <li>${SCALES.length} шкал и норм</li>
        <li>${ABBR.length} сокращений</li>
      </ul>
      <h3>Источники</h3>
      <ul>
        <li>Национальное руководство «Офтальмология» под ред. Аветисова С.Э. и др., 2024</li>
        <li>Кански Дж. «Клиническая офтальмология: систематизированный подход», 2006/2024</li>
        <li>«Неотложная офтальмология» под ред. Е.А. Егорова</li>
        <li>«Клинические лекции по офтальмологии» Басинский С.Н., Егоров Е.А.</li>
        <li>«Детская офтальмология» Тейлор Д., Хойт К.</li>
        <li>Электронный справочник ВИДАЛЬ 2023</li>
        <li>Клинические рекомендации Минздрава РФ 2023–2025</li>
        <li>Государственный реестр ЛС РФ (ГРЛС)</li>
        <li>Список ЛС с дозами для курса «Красный глаз», Никитина А.А., 2023</li>
      </ul>
      <p class="src" style="color:var(--warn);font-weight:600;margin-top:12px">⚠️ Справочник предназначен для специалистов и не заменяет осмотр пациента. Дозировки проверяйте по актуальной инструкции и клиническим рекомендациям МЗ РФ.</p>
    </article>
    ${footer()}
  `;
}

// ─── search ────────────────────────────────────────────────────
function renderSearch(q){
  q = decodeURIComponent(q||'');
  titleEl.textContent = 'Поиск';
  backBtn.style.display = '';
  searchInp.value = q;
  clearBtn.style.display = q ? '' : 'none';
  const nq = norm(q);
  const nqEn = norm(ru2en(q));
  if (!nq && !nqEn) { view.innerHTML = '<div class="empty">Введите запрос ≥ 2 символов</div>' + footer(); return; }
  const dx = DIAGNOSES.filter(d => {
    const hay = norm([d.name, (d.syn||[]).join(' '), d.icd, (d.sx||[]).join(' '), d.desc||''].join(' '));
    return hay.includes(nq) || (nqEn && hay.includes(nqEn));
  }).slice(0, 50);
  const rx = DRUGS.filter(d => {
    const hay = norm([d.inn, (d.brand||[]).join(' '), d.group||'', d.atc||'', (d.ind||[]).join(' ')].join(' '));
    return hay.includes(nq) || (nqEn && hay.includes(nqEn));
  }).slice(0, 50);
  const algo = ALGORITHMS.filter(a => norm(a.title+' '+(a.subtitle||'')).includes(nq)).slice(0,10);
  const abbr = ABBR.filter(a => norm(a.k+' '+a.v).includes(nq)).slice(0,30);
  view.innerHTML = `
    <div class="section-title">Результаты: «${esc(q)}»</div>
    ${dx.length ? `<div class="section-title">🩺 Диагнозы (${dx.length})</div>${dx.map(diagnosisListItem).join('')}` : ''}
    ${rx.length ? `<div class="section-title">💊 Препараты (${rx.length})</div>${rx.map(drugListItem).join('')}` : ''}
    ${algo.length ? `<div class="section-title">⚡ Алгоритмы (${algo.length})</div>${algo.map(a => `<a class="list-item" href="#algo/${esc(a.id)}"><div class="lt">${esc(a.title)}</div></a>`).join('')}` : ''}
    ${abbr.length ? `<div class="section-title">🔤 Сокращения (${abbr.length})</div><div class="card"><dl class="abbr-grid">${abbr.map(a => `<dt>${esc(a.k)}</dt><dd>${esc(a.v)}</dd>`).join('')}</dl></div>` : ''}
    ${!dx.length && !rx.length && !algo.length && !abbr.length ? '<div class="empty"><span class="em">∅</span>Ничего не найдено</div>' : ''}
    ${footer()}
  `;
}

// ─── footer ────────────────────────────────────────────────────
function footer(){
  return `<div class="app-footer">
    <div>Дозировки сверены с инструкциями производителей (Видаль 2023) и КР МЗ РФ. Список препаратов курса «Красный глаз»: Никитина А.А.</div>
    <div class="dis">⚠️ Не заменяет очный осмотр пациента и решение лечащего врача.</div>
  </div>`;
}

// ─── main render ──────────────────────────────────────────────
function render(){
  // close any open <details> behavior reset
  window.scrollTo({top:0});
  const { route, args } = parseHash();
  // nav active state
  document.querySelectorAll('.bn-btn').forEach(b => {
    const id = b.dataset.nav;
    const active = (route===id) || (id==='diagnoses' && (route==='dx' || route==='sec'))
      || (id==='drugs' && (route==='rx' || route==='atc' || route==='alldrugs'))
      || (id==='algorithms' && route==='algo')
      || (id==='scales' && route==='scale')
      || (id==='misc' && ['abbr','icd','favs','about'].includes(route));
    b.classList.toggle('active', active);
  });
  if (route !== 'search') { searchInp.value = ''; clearBtn.style.display = 'none'; }
  titleEl.textContent = 'Офтальмо';
  backBtn.style.display = 'none';
  switch (route) {
    case 'diagnoses': renderHomeDiagnoses(); break;
    case 'sec':       renderSection(args[0]); break;
    case 'dx':        renderDiagnosis(args[0]); break;
    case 'drugs':     renderDrugsHome(); break;
    case 'atc':       renderATC(args[0]); break;
    case 'alldrugs':  renderAllDrugs(); break;
    case 'rx':        renderDrug(args[0]); break;
    case 'algorithms':renderAlgorithms(); break;
    case 'algo':      renderAlgo(args[0]); break;
    case 'scales':    renderScales(); break;
    case 'scale':     renderScale(args[0]); break;
    case 'misc':      renderMisc(); break;
    case 'abbr':      renderAbbr(); break;
    case 'icd':       renderICD(); break;
    case 'favs':      renderFavs(); break;
    case 'about':     renderAbout(); break;
    case 'search':    renderSearch(args.join('/')); break;
    default:          renderHomeDiagnoses();
  }
}

// expose for inline handlers
window.__toggleFav = (t, id) => { toggleFav(t, id); render(); };

render();
})();
