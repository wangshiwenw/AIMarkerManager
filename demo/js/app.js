(function () {
  const data = window.DEMO_DATA;
  const UI = window.UI;
  const state = { page: 'home', dashTab: 'current', dashFilter: '全部投放', dashGrain: '按小时', dashMetric: 'multi', dashSelected: 'all', dashBusiness: '全部业务', businessFilter: '全部', businessView: 'grid', pendingPlan: null };

  function $(selector) {
    return document.querySelector(selector);
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }

  function setPage(page) {
    state.page = page;
    $('#pageTitle').textContent = data.nav.find(item => item.id === page).label;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    render();
  }

  function startApp() {
    $('#landingPage')?.classList.add('app-hidden');
    $('#appShell')?.classList.remove('app-hidden');
  }

  function renderNav() {
    $('#nav').innerHTML = data.nav.map(item => `
      <button class="nav-btn ${item.id === state.page ? 'active' : ''}" data-page="${item.id}">
        <span class="nav-icon">${item.icon || '•'}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `).join('');
  }

  function points(values, width, height, pad = 18) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return values.map((value, index) => {
      const x = pad + (index * (width - pad * 2)) / (values.length - 1);
      const y = height - pad - ((value - min) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  function spark(values, color = '#38BDF8') {
    return `
      <svg class="sparkline" viewBox="0 0 120 34" aria-hidden="true">
        <polyline points="${points(values, 120, 34, 4)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${points(values, 120, 34, 4)} 116,34 4,34" fill="${color}" opacity=".12"></polyline>
      </svg>
    `;
  }

  function businessSpark(values, tone = 'good') {
    const color = tone === 'warn' ? '#F59E0B' : tone === 'gray' ? '#2F7BFF' : '#18D39E';
    return `
      <svg class="business-spark" viewBox="0 0 132 52" aria-hidden="true">
        <line x1="0" y1="43" x2="132" y2="43" stroke="${color}" stroke-dasharray="2 4" opacity=".35"></line>
        <polyline points="${points(values, 132, 52, 4)} 128,50 4,50" fill="${color}" opacity=".16"></polyline>
        <polyline points="${points(values, 132, 52, 4)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
    `;
  }

  function lineChart({ days, primary, secondary, target, primaryColor = '#2F7BFF', secondaryColor = '#18D39E' }) {
    const width = 620;
    const height = 230;
    const allValues = secondary ? primary.concat(secondary) : primary.concat(target ? [target] : []);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const span = max - min || 1;
    const y = value => height - 30 - ((value - min) / span) * (height - 58);
    const targetLine = target ? `<line x1="38" y1="${y(target).toFixed(1)}" x2="594" y2="${y(target).toFixed(1)}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6" opacity=".75"></line>` : '';
    return `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
        ${[0, 1, 2, 3].map(i => `<line x1="38" y1="${42 + i * 42}" x2="594" y2="${42 + i * 42}" stroke="rgba(148,163,184,.14)"></line>`).join('')}
        ${targetLine}
        <polyline points="${points(primary, width, height, 38)}" fill="none" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${secondary ? `<polyline points="${points(secondary, width, height, 38)}" fill="none" stroke="${secondaryColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>` : ''}
        ${primary.map((value, index) => {
          const x = 38 + (index * (width - 76)) / (primary.length - 1);
          return `<circle cx="${x.toFixed(1)}" cy="${y(value).toFixed(1)}" r="4.5" fill="${primaryColor}"></circle>`;
        }).join('')}
        ${days.map((day, index) => {
          const x = 38 + (index * (width - 76)) / (days.length - 1);
          return `<text x="${x.toFixed(1)}" y="218" text-anchor="middle" fill="#64748B" font-size="12">${day}</text>`;
        }).join('')}
      </svg>
    `;
  }

  function metricCard(item) {
    const toneClass = item.tone ? `dash-${item.tone}` : '';
    const color = item.tone === 'good' ? '#22C55E' : item.tone === 'bad' ? '#EF4444' : item.tone === 'warn' ? '#F59E0B' : item.tone === 'blue' ? '#38BDF8' : '#8B5CF6';
    return `
      <div class="dash-metric ${toneClass}">
        <div class="list-row">
          <label>${item.label}</label>
          <span class="dash-icon">${item.icon}</span>
        </div>
        <b>${item.value}</b>
        <div class="metric-bottom">
          <span>${item.trend}</span>
          ${item.series ? spark(item.series, color) : ''}
          ${item.bars ? `<div class="mini-bars">${item.bars.map(v => `<i style="height:${v}%"></i>`).join('')}</div>` : ''}
          ${item.progress ? `<div class="bar"><i style="--w:${item.progress}%"></i></div>` : ''}
        </div>
      </div>
    `;
  }

  function donut(items) {
    let start = 0;
    const stops = items.map(item => {
      const end = start + item.value;
      const stop = `${item.color} ${start}% ${end}%`;
      start = end;
      return stop;
    }).join(', ');
    return `
      <div class="donut-wrap">
        <div class="donut" style="background: conic-gradient(${stops})"><span>¥19,860<small>总消耗</small></span></div>
        <div class="donut-legend">${items.map(item => `
          <div><i style="background:${item.color}"></i><b>${item.label}</b><span>${item.value}%</span><em>${item.amount}</em></div>
        `).join('')}</div>
      </div>
    `;
  }

  function sourceBars(items) {
    return `<div class="source-bars">${items.map(item => `
      <div class="source-row">
        <div class="source-name">${item.label}</div>
        <div class="source-track"><i style="width:${item.value}%;background:${item.color}"></i></div>
        <b>${item.value}%</b><span>${item.leads}</span>
      </div>
    `).join('')}</div>`;
  }

  function heatmap(matrix) {
    const slots = ['00-06', '06-09', '09-12', '12-15', '15-18', '18-22'];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return `
      <div class="heatmap">
        <div></div>${days.map(day => `<b>${day}</b>`).join('')}
        ${matrix.map((row, rowIndex) => `
          <span>${slots[rowIndex]}</span>
          ${row.map(value => `<i style="--heat:${value / 100}"></i>`).join('')}
        `).join('')}
      </div>
    `;
  }

  function suggestionList(items) {
    return `<div class="dash-list">${items.map((item, index) => `
      <div class="dash-action">
        <span class="index-badge ${item.tone}">${index + 1}</span>
        <div><b>${item.title}</b><p>${item.text}</p></div>
        <button class="mini-btn" ${item.status === '去处理' ? 'data-page-jump="assets"' : 'data-action="confirm-suggestion"'}>${item.status}</button>
      </div>
    `).join('')}</div>`;
  }

  function riskList(items) {
    return `<div class="dash-list">${items.map(item => `
      <div class="risk-item ${item.tone}">
        <div><b>${item.title}</b><p>${item.text}</p></div>
        ${UI.tag(item.status, item.tone === 'bad' ? 'bad' : 'warn')}
      </div>
    `).join('')}</div>`;
  }

  function rankTable(headers, rows, type) {
    return `
      <table class="rank-table">
        <thead><tr>${headers.map(head => `<th>${head}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(row => type === 'material' ? `
            <tr>
              <td>${row.trophy || row.rank}</td><td>${row.name}</td><td>${row.exposure}</td><td>${row.ctr}</td><td>${row.leads}</td><td>${row.cpa}</td><td>${UI.tag(row.verdict, row.tone)}</td>
            </tr>
          ` : `
            <tr>
              <td>${row.trophy || row.rank}</td><td>${row.name}</td><td>${row.cost}</td><td>${row.leads}</td><td>${row.cpa}</td><td>${UI.tag(row.advice, row.tone)}</td><td><button class="mini-btn" ${row.action === '授权' ? 'data-page-jump="assets"' : `data-action="show-account" data-name="${row.name}"`}>${row.action}</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function toneTag(text, tone = 'blue') {
    const map = { good: 'good', warn: 'warn', bad: 'bad', blue: 'blue' };
    return UI.tag(text, map[tone] || 'blue');
  }

  function businessId(name) {
    return `business-${name}`;
  }

  function moneyNumber(value) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0;
  }

  function businessStats(product, index = 0) {
    const plans = data.plans.filter(plan => plan.business === product.name);
    const materials = data.materials.filter(material => material.product.includes(product.name));
    const spend = plans.reduce((sum, plan) => sum + moneyNumber(plan.cost), 0);
    const leads = plans.reduce((sum, plan) => sum + moneyNumber(plan.leads), 0);
    const cpa = leads ? Math.round(spend / leads) : moneyNumber(product.cpa);
    const active = plans.filter(plan => plan.status === '投放中' || plan.status === '观察中').length;
    const reusable = materials.filter(material => material.deliveryStatus === '可复用' || material.adAudit === '广告审核通过').length;
    const tone = product.status === '测试中' ? 'warn' : product.status === '储备' ? 'gray' : active ? 'good' : 'blue';
    const trendPool = [
      [18, 22, 20, 26, 24, 31, 42, 39, 52, 58],
      [14, 18, 17, 24, 21, 28, 40, 43, 36, 50],
      [12, 14, 16, 20, 24, 22, 28, 34, 30, 38],
      [8, 12, 14, 13, 12, 18, 25, 22, 31, 40],
      [10, 16, 20, 18, 15, 22, 29, 35, 31, 42],
      [16, 18, 21, 20, 19, 30, 28, 41, 37, 46]
    ];
    return {
      id: businessId(product.name),
      spend,
      spendText: spend ? `¥${spend.toLocaleString()}` : '¥0',
      leads,
      leadsText: `${leads}条`,
      cpa,
      cpaText: cpa ? `¥${cpa}` : '-',
      active,
      materialCount: materials.length,
      reusable,
      tone,
      trend: trendPool[index % trendPool.length]
    };
  }

  function cockpitCurrentItems(cockpit) {
    const typeMap = { '按计划': '计划', '按账号': '账号', '按素材': '素材' };
    if (state.dashFilter === '按业务') {
      const products = state.dashBusiness === '全部业务' ? data.products : data.products.filter(product => product.name === state.dashBusiness);
      return products.map((product, index) => {
        const stats = businessStats(product, index);
        return {
          id: stats.id,
          name: `${product.name}业务`,
          type: '业务',
          status: product.status === '储备' ? '待素材' : product.status,
          spend: stats.spendText,
          leads: stats.leadsText,
          cpa: stats.cpaText,
          materials: `${stats.materialCount}条`,
          activePlans: `${stats.active}个`,
          trend: stats.trend,
          ai: product.advice,
          action: '查看',
          tone: stats.tone
        };
      });
    }
    const type = typeMap[state.dashFilter];
    return type ? cockpit.current.filter(item => item.type === type) : cockpit.current;
  }

  function cockpitChart(chart, selectedName, options = {}) {
    const width = 980;
    const height = 330;
    const pad = { left: 54, right: 62, top: 32, bottom: 72 };
    const filterProfiles = {
      '全部投放': { phase: 0, spend: 1, leads: 1, cpa: 0 },
      '按计划': { phase: 7, spend: 1.08, leads: .96, cpa: 14 },
      '按账号': { phase: 15, spend: .82, leads: .78, cpa: 4 },
      '按素材': { phase: 24, spend: .68, leads: 1.12, cpa: -18 },
      '按业务': { phase: 31, spend: .94, leads: 1.22, cpa: -10 }
    };
    const profile = filterProfiles[options.filter] || filterProfiles['全部投放'];
    const sourceN = chart.hours || 157;
    const n = options.grain === '按天' ? 7 : sourceN;
    const spendRaw = Array.from({ length: n }, (_, index) => {
      const t = index / (n - 1);
      const k = index + profile.phase;
      const wave = Math.sin(k * 0.24) * 92 + Math.sin(k * 0.79) * 38 + Math.sin(k * 1.57) * 18;
      const peak = t > .22 && t < .43 ? 178 : t > .72 ? 82 : 0;
      const dip = t > .50 && t < .60 ? -116 : 0;
      return Math.max(180, (500 + wave + peak + dip + ((k * 29) % 76) - 36) * profile.spend);
    });
    const leadsRaw = Array.from({ length: n }, (_, index) => {
      const t = index / (n - 1);
      const k = index + profile.phase;
      const base = 8 + Math.sin(k * 0.15) * 3.1 + Math.sin(k * 0.49) * 1.2;
      const lift = t > .32 ? 2.1 : 0;
      const endLift = t > .78 ? 3.2 : 0;
      return Math.max(3, (base + lift + endLift) * profile.leads);
    });
    const cpaRaw = Array.from({ length: n }, (_, index) => {
      const t = index / (n - 1);
      const k = index + profile.phase;
      const wave = Math.sin((k - 16) * 0.10) * 74 + Math.sin(k * 0.47) * 17 + Math.sin(k * 1.13) * 9;
      const drift = t > .56 ? -66 : t > .30 ? 52 : 0;
      return Math.max(72, 205 + wave + drift + profile.cpa);
    });
    const x = index => pad.left + index * ((width - pad.left - pad.right) / (n - 1));
    const yLeft = value => pad.top + (1200 - value) / 1200 * (height - pad.top - pad.bottom);
    const yRight = value => pad.top + (480 - value) / 480 * (height - pad.top - pad.bottom);
    const spend = spendRaw;
    const leads = leadsRaw.map(v => v * 42);
    const cpa = cpaRaw;
    const makeLine = (values, mapper) => values.map((value, index) => `${x(index).toFixed(1)},${mapper(value).toFixed(1)}`).join(' ');
    const eventColor = tone => tone === 'good' ? '#18D39E' : tone === 'bad' ? '#EF4444' : tone === 'warn' ? '#F59E0B' : '#38BDF8';
    const ticks = [0, 200, 400, 600, 800, 1000, 1200];
    const rightTicks = [0, 80, 160, 240, 320, 400, 480];
    const dateLabels = ['05-27', '05-28', '05-29', '05-30', '05-31', '06-01', '06-02'];
    const tickCount = options.grain === '按天' ? 7 : 14;
    const xTickIndexes = Array.from({ length: tickCount }, (_, tickIndex) => Math.round(tickIndex * (n - 1) / (tickCount - 1)));
    const xTickLabels = xTickIndexes.map((_, tickIndex) => {
      if (options.grain === '按天') return dateLabels[tickIndex] || '';
      const hour = (tickIndex * 12) % 24;
      const day = dateLabels[Math.min(dateLabels.length - 1, Math.floor(tickIndex / 2))];
      return hour === 0 ? `00:00\n${day}` : `${String(hour).padStart(2, '0')}:00`;
    });
    const minorGridIndexes = Array.from({ length: options.grain === '按天' ? 7 : 27 }, (_, tickIndex) => Math.round(tickIndex * (n - 1) / ((options.grain === '按天' ? 7 : 27) - 1)));
    const miniPoints = spendRaw.map((value, index) => `${x(index).toFixed(1)},${(height - 34 - (value - 240) / 780 * 20).toFixed(1)}`).join(' ');
    const showMulti = options.metric !== 'cpa';
    const eventIndex = event => Math.round(event.index / (sourceN - 1) * (n - 1));
    return `
      <svg class="cockpit-chart" viewBox="0 0 ${width} ${height}" aria-label="${selectedName}投放表现">
        <defs>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#2F7BFF" stop-opacity=".18"></stop>
            <stop offset="100%" stop-color="#2F7BFF" stop-opacity="0"></stop>
          </linearGradient>
          <linearGradient id="miniFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#64748B" stop-opacity=".26"></stop>
            <stop offset="100%" stop-color="#64748B" stop-opacity=".08"></stop>
          </linearGradient>
        </defs>
        ${minorGridIndexes.map(index => `<line x1="${x(index).toFixed(1)}" y1="${pad.top}" x2="${x(index).toFixed(1)}" y2="${height - pad.bottom}" stroke="rgba(148,163,184,.045)"></line>`).join('')}
        ${ticks.map(value => `<line x1="${pad.left}" y1="${yLeft(value).toFixed(1)}" x2="${width - pad.right}" y2="${yLeft(value).toFixed(1)}" stroke="rgba(148,163,184,.11)"></line><text x="${pad.left - 12}" y="${yLeft(value).toFixed(1)}" text-anchor="end" dominant-baseline="middle" fill="#64748B" font-size="11">${value}</text>`).join('')}
        ${rightTicks.map(value => `<text x="${width - pad.right + 14}" y="${yRight(value).toFixed(1)}" dominant-baseline="middle" fill="#64748B" font-size="11">${value}</text>`).join('')}
        <text x="${pad.left - 12}" y="${pad.top - 10}" text-anchor="start" fill="#94A3B8" font-size="12" font-weight="700">消耗 / 线索</text>
        <text x="${width - 8}" y="${pad.top - 10}" text-anchor="end" fill="#94A3B8" font-size="12" font-weight="700">CPA(元)</text>
        <line x1="${pad.left}" x2="${width - pad.right}" y1="${yRight(chart.target).toFixed(1)}" y2="${yRight(chart.target).toFixed(1)}" stroke="rgba(226,232,240,.62)" stroke-width="2" stroke-dasharray="5 6"></line>
        ${showMulti ? `<polyline points="${makeLine(spend, yLeft)} ${width - pad.right},${height - pad.bottom} ${pad.left},${height - pad.bottom}" fill="url(#chartFill)" opacity=".55"></polyline>
        <polyline points="${makeLine(spend, yLeft)}" fill="none" stroke="#2F7BFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${makeLine(leads, yLeft)}" fill="none" stroke="#18D39E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>` : ''}
        <polyline points="${makeLine(cpa, yRight)}" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${chart.events.map(event => {
          const index = eventIndex(event);
          const cx = x(index);
          const cy = event.tone === 'warn' ? yLeft(spend[index]) : event.tone === 'good' ? yRight(cpa[index]) : yLeft(leads[index]);
          const color = eventColor(event.tone);
          const boxY = event.index > 37 ? 44 : 28;
          const boxX = Math.max(pad.left + 6, Math.min(width - pad.right - 104, cx - 52));
          return `
            <g>
              <line x1="${cx}" x2="${cx}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="${color}" stroke-dasharray="4 5" opacity=".58"></line>
              <circle cx="${cx}" cy="${cy}" r="5" fill="${color}"></circle>
              <rect x="${boxX}" y="${boxY}" width="104" height="52" rx="5" fill="rgba(2,6,23,.76)" stroke="${color}" opacity=".96"></rect>
              <text x="${boxX + 12}" y="${boxY + 18}" fill="${color}" font-size="12" font-weight="900">${event.label}</text>
              <text x="${boxX + 12}" y="${boxY + 34}" fill="#CBD5E1" font-size="11">${event.time}</text>
              <text x="${boxX + 12}" y="${boxY + 48}" fill="#94A3B8" font-size="10">${event.detail}</text>
            </g>
          `;
        }).join('')}
        ${xTickIndexes.map((index, tickIndex) => {
          const lines = xTickLabels[tickIndex].split('\n');
          return `<text x="${x(index)}" y="${height - 53}" text-anchor="middle" fill="#64748B" font-size="11">${lines.map((line, lineIndex) => `<tspan x="${x(index)}" dy="${lineIndex ? 14 : 0}">${line}</tspan>`).join('')}</text>`;
        }).join('')}
        <polyline points="${miniPoints} ${width - pad.right},${height - 18} ${pad.left},${height - 18}" fill="url(#miniFill)"></polyline>
        <polyline points="${miniPoints}" fill="none" stroke="rgba(148,163,184,.28)" stroke-width="1.5"></polyline>
        <rect x="${x(Math.round(n * .78))}" y="${height - 42}" width="${x(n - 1) - x(Math.round(n * .78))}" height="24" fill="rgba(148,163,184,.12)" stroke="rgba(226,232,240,.72)" rx="2"></rect>
        <rect x="${x(Math.round(n * .78)) - 2}" y="${height - 42}" width="4" height="24" fill="#CBD5E1" rx="1"></rect>
        <rect x="${x(n - 1) - 2}" y="${height - 42}" width="4" height="24" fill="#CBD5E1" rx="1"></rect>
      </svg>
    `;
  }

  function currentRows(items) {
    return items.map(item => `
      <tr class="${item.id === state.dashSelected ? 'selected' : ''}" data-action="select-cockpit-row" data-id="${item.id}">
        <td><b>${item.name}</b><span>${item.type}</span></td>
        <td>${toneTag(item.status, item.tone)}</td>
        <td>${item.spend}</td>
        <td>${item.leads}</td>
        <td>${item.cpa}</td>
        ${state.dashFilter === '按业务' ? `<td>${item.materials || '-'}</td><td>${item.activePlans || '-'}</td>` : ''}
        <td>${spark(item.trend, item.tone === 'bad' ? '#EF4444' : item.tone === 'warn' ? '#F59E0B' : item.tone === 'blue' ? '#38BDF8' : '#18D39E')}</td>
        <td>${toneTag(item.ai, item.tone)}</td>
        <td><button class="mini-btn" data-action="cockpit-row-action" data-name="${item.name}">${item.action}</button></td>
      </tr>
    `).join('');
  }

  function historyRows(items) {
    return items.map(item => `
      <tr data-action="select-history-row" data-name="${item.name}">
        <td><b>${item.name}</b><span>${item.period}</span></td>
        <td>${item.spend}</td>
        <td>${item.leads}</td>
        <td>${item.cpa}</td>
        <td>${toneTag(item.verdict, item.tone)}</td>
        <td>${item.reusable}</td>
      </tr>
    `).join('');
  }

  function focusRows(items) {
    return items.map(item => `
      <tr data-action="select-focus-row" data-name="${item.object}">
        <td><b>${item.name}</b><span>${item.object}</span></td>
        <td>${item.type}</td>
        <td>${toneTag(item.status, item.tone)}</td>
        <td>${item.ai}</td>
      </tr>
    `).join('');
  }

  function cockpitList(cockpit, currentItems = cockpit.current) {
    if (state.dashTab === 'history') {
      return `
        <table class="cockpit-table">
          <thead><tr><th>投放名称</th><th>总消耗</th><th>总线索</th><th>平均CPA</th><th>最终判断</th><th>是否可复用</th></tr></thead>
          <tbody>${historyRows(cockpit.history)}</tbody>
        </table>
      `;
    }
    if (state.dashTab === 'focus') {
      return `
        <table class="cockpit-table">
          <thead><tr><th>重点对象</th><th>类型</th><th>状态</th><th>AI当前盯防动作</th></tr></thead>
          <tbody>${focusRows(cockpit.focus)}</tbody>
        </table>
      `;
    }
    return `
      <table class="cockpit-table">
        <thead><tr><th>名称</th><th>状态</th><th>今日消耗</th><th>今日线索</th><th>CPA</th>${state.dashFilter === '按业务' ? '<th>素材数</th><th>在投计划</th>' : ''}<th>趋势</th><th>AI判断</th><th>操作</th></tr></thead>
        <tbody>${currentRows(currentItems)}</tbody>
      </table>
    `;
  }

  function sideAdvice(items) {
    return `<div class="cockpit-side-list">${items.map((item, index) => `
      <div class="cockpit-side-item ${item.tone}">
        <span class="index-badge ${item.tone}">${index + 1}</span>
        <div><b>${item.title}</b><p>${item.text}</p></div>
        <button class="mini-btn" data-action="confirm-suggestion">${item.action}</button>
      </div>
    `).join('')}</div>`;
  }

  function sideRisks(items) {
    return `<div class="cockpit-side-list">${items.map(item => `
      <div class="cockpit-risk-item ${item.tone}">
        <div><b>${item.title}</b><p>${item.text}</p></div>
        ${toneTag(item.status, item.tone)}
      </div>
    `).join('')}</div>`;
  }

  function businessProductById(id) {
    if (!id || !id.startsWith('business-')) return null;
    return data.products.find(product => businessId(product.name) === id);
  }

  function businessAdvice(product, stats) {
    if (!product) return null;
    const material = data.materials.find(item => item.product.includes(product.name));
    const reusable = material?.deliveryStatus === '可复用' || material?.adAudit === '广告审核通过';
    return [
      { title: `${product.name}当前CPA ${stats.cpaText}`, text: stats.cpa && stats.cpa < 200 ? '低于目标，可作为优先观察业务' : '成本偏高，建议先控预算', tone: stats.cpa && stats.cpa < 200 ? 'good' : 'warn', action: stats.cpa && stats.cpa < 200 ? '扩量' : '控本' },
      { title: `${stats.materialCount} 条素材已关联`, text: reusable ? `可复用「${material.name}」继续投流` : '素材不足，建议补充新视频', tone: reusable ? 'blue' : 'warn', action: reusable ? '复用' : '补素材' },
      { title: `${stats.active} 个计划正在关联`, text: stats.active ? '数据已回流驾驶舱，可继续观察趋势' : '暂无在投计划，可生成投放计划', tone: stats.active ? 'good' : 'warn', action: stats.active ? '观察' : '创建' },
      { title: `推荐账号：${product.account}`, text: 'AI将优先用该账号承接业务线索', tone: 'blue', action: '查看' }
    ];
  }

  function businessSources(product) {
    if (!product) return null;
    const main = product.account.includes('老房') ? '星辰老房翻新号' : product.account.includes('设计师') ? '设计师阿林' : '星辰装饰官方号';
    const rest = data.dashboard.sources.filter(item => item.label !== main).slice(0, 3);
    const colors = ['#22C55E', '#38BDF8', '#8B5CF6', '#F97316'];
    return [
      { label: main, value: 58, leads: '主来源', color: colors[0] },
      ...rest.map((item, index) => ({ label: item.label, value: [24, 12, 6][index], leads: item.leads, color: colors[index + 1] }))
    ];
  }

  function historySummary(items) {
    return `<div class="history-summary">${items.map(item => `
      <div class="${item.tone}">
        <b>${item.title}</b>
        <span>${item.count}</span>
        <em>${item.cpa}</em>
        <small>${item.roi}</small>
      </div>
    `).join('')}</div>`;
  }

  function compactDonut(items, center, subtitle) {
    let start = 0;
    const stops = items.map(item => {
      const end = start + item.value;
      const stop = `${item.color} ${start}% ${end}%`;
      start = end;
      return stop;
    }).join(', ');
    return `
      <div class="compact-donut-wrap">
        <div class="compact-donut" style="background: conic-gradient(${stops})"><span>${center}<small>${subtitle}</small></span></div>
        <div class="compact-legend">${items.map(item => `
          <div><i style="background:${item.color}"></i><b>${item.label}</b><span>${item.value}%</span><em>${item.leads || item.count}</em></div>
        `).join('')}</div>
      </div>
    `;
  }

  function warningDistribution(items) {
    return `<div class="warning-bars">${items.map(item => `
      <div class="warning-bar-row">
        <div><b>${item.label}</b><span>${item.count}</span></div>
        <div class="warning-track"><i style="width:${item.value}%;background:${item.color}"></i></div>
        ${toneTag(item.value >= 40 ? '高' : item.value >= 25 ? '中' : '低', item.tone)}
      </div>
    `).join('')}</div>`;
  }

  function renderHome() {
    const d = data.dashboard;
    const cockpit = d.cockpit;
    const currentItems = cockpitCurrentItems(cockpit);
    const selected = state.dashSelected === 'all' ? { id: 'all', name: state.dashFilter === '按业务' ? '全部业务' : '全部投放' } : currentItems.find(item => item.id === state.dashSelected) || cockpit.current.find(item => item.id === state.dashSelected) || currentItems[0] || cockpit.current[0];
    const chartTitle = selected.id === 'all' ? (state.dashFilter === '按业务' ? '全部业务 · 投放表现' : '投放表现主图') : `${selected.name} · 投放表现`;
    const selectedBusiness = businessProductById(selected.id);
    const selectedBusinessStats = selectedBusiness ? businessStats(selectedBusiness, data.products.indexOf(selectedBusiness)) : null;
    const advice = (selectedBusiness && businessAdvice(selectedBusiness, selectedBusinessStats)) || cockpit.adviceByItem[selected.id] || cockpit.adviceByItem.all || cockpit.adviceByItem['old-house'];
    const sourceItems = businessSources(selectedBusiness) || d.sources;
    const sourceCenter = selectedBusinessStats ? String(selectedBusinessStats.leads) : '16';
    const businessChips = ['全部业务', ...data.products.map(product => product.name)];
    return `
      <div class="dashboard cockpit">
        <div class="dashboard-toolbar">
          <div></div>
          <div class="date-controls"><span>数据时间：2025-06-02</span>${UI.tag(d.date, 'gray')}</div>
        </div>

        <section class="dash-metrics">${d.metrics.map(metricCard).join('')}</section>

        <section class="cockpit-business-filter">
          <span>业务筛选</span>
          ${businessChips.map(name => `<button class="${state.dashBusiness === name ? 'active' : ''}" data-action="dash-business" data-business="${name}">${name}</button>`).join('')}
        </section>

        <section class="cockpit-grid">
          <div class="card card-pad cockpit-main-card">
            <div class="cockpit-chart-head">
              <div>
                <h3 id="cockpitChartTitle">${chartTitle}</h3>
                <div class="legend">${state.dashMetric === 'multi' ? '<i class="blue"></i>消耗<i class="green"></i>线索<i class="purple"></i>CPA<i class="line"></i>目标CPA' : '<i class="purple"></i>CPA<i class="line"></i>目标CPA'}</div>
              </div>
              <div class="cockpit-controls">
                <div class="segmented">${cockpit.filters.map(item => `<button class="${state.dashFilter === item ? 'active' : ''}" data-action="dash-filter" data-filter="${item}">${item}</button>`).join('')}</div>
                <div class="segmented compact"><button class="${state.dashMetric === 'multi' ? 'active' : ''}" data-action="dash-metric-mode">${state.dashMetric === 'multi' ? '多指标对比' : '只看CPA'}</button></div>
                <div class="segmented compact">${cockpit.grains.map(item => `<button class="${state.dashGrain === item ? 'active' : ''}" data-action="dash-grain" data-grain="${item}">${item}</button>`).join('')}</div>
              </div>
            </div>
            ${cockpitChart(cockpit.chart, selected.name, { filter: state.dashFilter, grain: state.dashGrain, metric: state.dashMetric })}
          </div>

          <aside class="cockpit-right">
            <div class="card card-pad dash-card">
              <div class="dash-head"><h3>AI今日建议</h3>${UI.tag('4 条建议', 'good')}</div>
              ${sideAdvice(advice)}
            </div>
            <div class="card card-pad dash-card risk-card">
              <div class="dash-head"><h3>风险预警</h3>${UI.tag('4 项风险', 'bad')}</div>
              ${sideRisks(cockpit.risks)}
            </div>
            <div class="card card-pad dash-card">
              <div class="dash-head"><h3>历史投放摘要</h3><span>近30天</span></div>
              ${historySummary(cockpit.historySummary)}
            </div>
          </aside>

          <div class="cockpit-bottom">
            <div class="card card-pad cockpit-list-card">
              <div class="cockpit-tabs">
                <button class="${state.dashTab === 'current' ? 'active' : ''}" data-action="dash-tab" data-tab="current">当前投放</button>
                <button class="${state.dashTab === 'history' ? 'active' : ''}" data-action="dash-tab" data-tab="history">历史投放</button>
                <button class="${state.dashTab === 'focus' ? 'active' : ''}" data-action="dash-tab" data-tab="focus">重点关注</button>
              </div>
              <div class="table-title">${state.dashTab === 'current' ? `${state.dashFilter}标的（${currentItems.length}）` : state.dashTab === 'history' ? '历史投放记录' : '重点关注对象'}</div>
              ${cockpitList(cockpit, currentItems)}
            </div>
            <div class="cockpit-aux">
              <div class="card card-pad cockpit-aux-card">
                <div class="dash-head"><h3>线索来源分布</h3><span>按账号</span></div>
                ${compactDonut(sourceItems, sourceCenter, '总线索')}
              </div>
              <div class="card card-pad cockpit-aux-card">
                <div class="dash-head"><h3>预警分布</h3><span>按类型</span></div>
                ${warningDistribution(cockpit.warningDistribution)}
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderAssets() {
    const c = data.company;
    const a = data.adAccount;
    return `
      <div class="grid-2">
        <div class="card card-pad">
          <div class="list-row"><h3 class="font-semibold">装修公司主体</h3>${UI.tag('已认证', 'good')}</div>
          <div class="grid-3 section">
            ${UI.info('公司名称', c.name)}
            ${UI.info('所在城市', c.city)}
            ${UI.info('服务区域', c.area)}
            ${UI.info('服务类型', c.services)}
            ${UI.info('客单价区间', c.price)}
            ${UI.info('主推业务', c.main)}
            ${UI.info('资料完整度', c.complete)}
          </div>
        </div>
        <div class="card card-pad">
          <div class="list-row"><h3 class="font-semibold">巨量引擎账户</h3>${UI.tag(a.auth, 'good')}</div>
          <div class="list section">
            ${UI.info('账户名称', a.name)}
            ${UI.info('广告主ID', a.id)}
            ${UI.info('账户余额', a.balance)}
            ${UI.info('日预算建议', a.dailyBudget)}
            ${UI.info('数据同步', `<span id="syncTime">${a.sync}</span>`)}
          </div>
          <div class="actions section">
            <button class="btn secondary" data-action="auth-detail">查看授权详情</button>
            <button class="btn secondary" data-action="balance-alert">设置余额提醒</button>
            <button class="btn" data-action="sync-account">同步账户数据</button>
          </div>
        </div>
      </div>

      <div class="card card-pad section">
        <h3 class="font-semibold">关联抖音号</h3>
        <div class="grid-2 section">${data.accounts.map(account => UI.accountCard(account)).join('')}</div>
      </div>
    `;
  }

  function renderBusiness() {
    const filters = ['全部', '主推', '投放中', '测试中', '储备', '可用'];
    const visibleProducts = data.products.filter(item => state.businessFilter === '全部' || item.status === state.businessFilter);
    const businessData = data.products.map((product, index) => ({ product, stats: businessStats(product, index) }));
    const cpas = businessData.map(item => item.stats.cpa).filter(Boolean);
    const avgCpa = Math.round(cpas.reduce((sum, item) => sum + item, 0) / cpas.length);
    const totalSpend = businessData.reduce((sum, item) => sum + item.stats.spend, 0);
    const totalLeads = businessData.reduce((sum, item) => sum + item.stats.leads, 0);
    const activeBusinesses = businessData.filter(item => item.stats.active).length;
    const reusableMaterials = businessData.reduce((sum, item) => sum + item.stats.reusable, 0);
    const businessMetric = (label, value, icon, tone = 'blue', sub = '') => `
      <div class="business-metric ${tone}">
        <span>${icon}</span>
        <div><label>${label}</label><b>${value}</b>${sub ? `<em>${sub}</em>` : ''}</div>
      </div>
    `;
    const toneOf = status => status === '测试中' ? 'warn' : status === '储备' ? 'gray' : 'good';
    const trendOf = (index, status) => {
      const base = [
        [18, 22, 20, 26, 24, 31, 42, 39, 52, 58],
        [14, 18, 17, 24, 21, 28, 40, 43, 36, 50],
        [12, 14, 16, 20, 24, 22, 28, 34, 30, 38],
        [8, 12, 14, 13, 12, 18, 25, 22, 31, 40],
        [10, 16, 20, 18, 15, 22, 29, 35, 31, 42],
        [16, 18, 21, 20, 19, 30, 28, 41, 37, 46]
      ][index % 6];
      return status === '测试中' ? base.map((v, i) => i > 5 ? v + 8 : v) : base;
    };
    const businessCard = (product, index) => {
      const stats = businessStats(product, index);
      const tone = stats.tone || toneOf(product.status);
      return `
        <div class="business-card ${tone}">
          <div class="business-card-head">
            <h3>${product.name}</h3>
            ${UI.tag(product.status, tone)}
          </div>
          <div class="business-card-body">
            <div class="business-fields">
              <div><span>今日消耗</span><b>${stats.spendText}</b></div>
              <div><span>今日线索</span><b>${stats.leadsText}</b></div>
              <div><span>当前CPA</span><b>${stats.cpaText}</b></div>
              <div><span>推荐账号</span><b>${product.account}</b></div>
            </div>
            ${businessSpark(stats.trend || trendOf(index, product.status), tone)}
          </div>
          <div class="business-link-row">
            <span>${stats.active} 个计划</span>
            <span>${stats.materialCount} 条素材</span>
            <span>${stats.reusable} 条可复用</span>
          </div>
          <div class="business-ai">${product.advice}</div>
          <div class="business-actions">
            <button class="mini-btn" data-action="product-detail" data-name="${product.name}">查看详情</button>
            <button class="mini-btn primary" data-action="plan-draft" data-product="${product.name}" data-account="${product.account}">生成投放计划</button>
          </div>
        </div>
      `;
    };
    return `
      <div class="business-page">
        <div class="business-hero">
          <p>管理推广业务，AI市场经理基于业务自动选择账号、素材与投流方式</p>
          <button class="btn business-add" data-action="add-business">＋ 新增推广业务</button>
        </div>

        <div class="business-metrics">
          ${businessMetric('今日消耗', `¥${totalSpend.toLocaleString()}`, '¥', 'cyan')}
          ${businessMetric('今日线索', `${totalLeads}条`, '●', 'good')}
          ${businessMetric('在投业务', activeBusinesses, '◔', 'blue')}
          ${businessMetric('可复用素材', reusableMaterials, '✓', 'good')}
          ${businessMetric('平均历史CPA', `¥${avgCpa}`, '¥', 'blue', '近30天')}
        </div>

        <div class="business-toolbar">
          <div class="business-tabs">${filters.map(item => `<button class="${state.businessFilter === item ? 'active' : ''}" data-action="business-filter" data-filter="${item}">${item}</button>`).join('')}</div>
          <div class="business-tools">
            <button class="tool-select" data-action="business-sort">默认排序⌄</button>
            <button class="icon-toggle ${state.businessView === 'grid' ? 'active' : ''}" data-action="business-view" data-view="grid">▦</button>
            <button class="icon-toggle ${state.businessView === 'list' ? 'active' : ''}" data-action="business-view" data-view="list">☰</button>
          </div>
        </div>

        <div class="business-grid ${state.businessView === 'list' ? 'list-view' : ''}">
          ${visibleProducts.map(businessCard).join('')}
        </div>
        <div class="business-pager">
          <button class="mini-btn">‹</button><span>1</span><button class="mini-btn">›</button><em>共 ${visibleProducts.length} 条</em>
        </div>
      </div>
    `;
  }

  function renderMaterials() {
    const published = data.materials.filter(item => item.publishStatus === '已发布').length;
    const adAuditing = data.materials.filter(item => item.adAudit === '广告审核中').length;
    const delivering = data.materials.filter(item => item.deliveryStatus === '投放中').length;
    const reusable = data.materials.filter(item => item.deliveryStatus === '可复用').length;
    return `
      <div class="grid-4">
        ${UI.metric({ label: '已发布视频', value: published, trend: '可复用投流' })}
        ${UI.metric({ label: '广告审核中', value: adAuditing, trend: '等待巨量审核', warn: true })}
        ${UI.metric({ label: '投放中素材', value: delivering, trend: '正在消耗' })}
        ${UI.metric({ label: '可复用素材', value: reusable, trend: '可跨业务投放' })}
      </div>
      <div class="card card-pad section">
        <div class="list-row"><h3 class="font-semibold">素材与视频库</h3><button class="btn" data-action="material-upload">上传素材</button></div>
        <div class="section">${UI.table(['素材','类型','关联业务','抖音号','发布状态','广告审核','投放状态','历史CPA','AI标签','AI建议','操作'], data.materials.map(m => UI.materialRow(m)))}</div>
      </div>
    `;
  }

  function renderRecords() {
    return `
      <div class="grid-4">
        ${data.growth.map(item => UI.metric({ label: item.label, value: item.value, trend: '持续更新' })).join('')}
      </div>
      <div class="grid-2 section">
        <div class="card card-pad">
          <h3 class="font-semibold">投放计划</h3>
          <div class="section">${UI.table(['计划','业务','素材','广告审核','投放状态','预算','消耗','CPA','AI动作'], data.plans.map(p => UI.planRow(p)))}</div>
        </div>
        <div class="card card-pad">
          <h3 class="font-semibold">AI操作日志</h3>
          <div class="list section">${data.workLogs.map(item => UI.log(item)).join('')}</div>
        </div>
      </div>
      <div class="card card-pad section">
        <h3 class="font-semibold">账号表现排行</h3>
        <div class="grid-4 section">
          ${data.accounts.map((account, index) => `
            <div class="asset-card rank-item" data-action="rank-account" data-name="${account.name}">
              <div class="list-row"><b>${index + 1}. ${account.name}</b>${UI.tag(account.status === '待授权' ? '待授权' : account.primary ? '主投账号' : '投放账号', account.status === '待授权' ? 'warn' : account.primary ? 'good' : 'blue')}</div>
              <p class="muted mt-3 text-sm">CPA ${account.cpa} / ${account.advice}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    const view = $('#view');
    const pages = {
      home: renderHome,
      business: renderBusiness,
      assets: renderAssets,
      materials: renderMaterials,
      records: renderRecords
    };
    view.innerHTML = pages[state.page]();
  }

  function openPlanModal(product, account) {
    const reusable = data.materials.find(item => item.product.includes(product) && item.publishStatus === '已发布') || data.materials.find(item => item.deliveryStatus === '可复用') || data.materials[0];
    const mode = reusable.publishStatus === '已发布' ? '复用已发布视频投流' : '发布后提交广告审核';
    state.pendingPlan = { product, account, material: reusable.name, mode };
    $('#planModal .modal-head h3').textContent = 'AI已生成投放计划草案';
    $('#planModal .modal-actions').innerHTML = `
      <button class="btn" data-action="confirm-plan">确认创建</button>
      <button class="btn secondary" data-action="close-modal">暂不创建</button>
    `;
    $('#modalBody').innerHTML = `
      <div class="grid-2">
        ${UI.info('目标业务', product)}
        ${UI.info('推荐账号', account)}
        ${UI.info('推荐素材', reusable.name)}
        ${UI.info('投流方式', mode)}
        ${UI.info('预算建议', '日预算 ¥800')}
        ${UI.info('预计CPA', '¥140 - ¥180')}
      </div>
      <div class="asset-card section">
        <b>审核链路</b>
        <p class="muted mt-2 text-sm">${reusable.publishStatus} → 提交巨量广告审核 → 审核通过后开始投流 → 数据回流驾驶舱</p>
      </div>
    `;
    $('#planModal').classList.add('show');
  }

  function openBusinessModal() {
    $('#modalBody').innerHTML = `
      <div class="grid-2">
        <label class="field-label">业务名称<input id="businessName" value="局部改造"></label>
        <label class="field-label">推荐账号<input id="businessAccount" value="星辰装饰官方号"></label>
        <label class="field-label">业务状态<input id="businessStatus" value="储备"></label>
        <label class="field-label">AI建议<input id="businessAdvice" value="待素材完善"></label>
      </div>
    `;
    $('#planModal .modal-head h3').textContent = '新增推广业务';
    $('#planModal .modal-actions').innerHTML = `
      <button class="btn" data-action="confirm-business">确认新增</button>
      <button class="btn secondary" data-action="close-modal">取消</button>
    `;
    $('#planModal').classList.add('show');
  }

  function closePlanModal() {
    $('#planModal').classList.remove('show');
    $('#planModal .modal-head h3').textContent = 'AI已生成投放计划草案';
    $('#planModal .modal-actions').innerHTML = `
      <button class="btn" data-action="confirm-plan">确认创建</button>
      <button class="btn secondary" data-action="close-modal">暂不创建</button>
    `;
  }

  function handleClick(event) {
    const navBtn = event.target.closest('.nav-btn');
    if (navBtn) return setPage(navBtn.dataset.page);

    const jumpBtn = event.target.closest('[data-page-jump]');
    if (jumpBtn) return setPage(jumpBtn.dataset.pageJump);

    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    if (action === 'start-app') return startApp();
    if (action === 'logout') toast('已退出登录');
    if (action === 'confirm-suggestion') toast('AI建议已确认，正在执行');
    if (action === 'adjust-goal') $('#goalInput')?.focus();
    if (action === 'send-goal') toast('AI已生成执行方案');
    if (action === 'quick-goal') {
      $('#goalInput').value = actionEl.dataset.text;
      toast('已填入目标');
    }
    if (action === 'auth-detail') toast('已打开授权详情');
    if (action === 'balance-alert') toast('余额提醒设置成功');
    if (action === 'sync-account') {
      $('#syncTime').textContent = '刚刚同步';
      toast('巨量引擎账户数据已同步');
    }
    if (action === 'show-account') toast(`已打开${actionEl.dataset.name}表现`);
    if (action === 'primary-account') {
      data.accounts.forEach(item => item.primary = item.id === actionEl.dataset.id);
      render();
      toast('已加入优先投放组合');
    }
    if (action === 'auth-account') {
      const account = data.accounts.find(item => item.id === actionEl.dataset.id);
      account.status = '已授权';
      account.advice = account.advice === '待授权' ? '可投放' : account.advice;
      render();
      toast('账号授权状态已更新');
    }
    if (action === 'product-detail') toast(`已打开${actionEl.dataset.name}业务详情`);
    if (action === 'dash-business') {
      state.dashBusiness = actionEl.dataset.business;
      state.dashFilter = '按业务';
      state.dashTab = 'current';
      state.dashSelected = state.dashBusiness === '全部业务' ? 'all' : businessId(state.dashBusiness);
      render();
      toast(`已切换到${state.dashBusiness}数据`);
    }
    if (action === 'business-filter') {
      state.businessFilter = actionEl.dataset.filter;
      render();
      toast(`已筛选${state.businessFilter}业务`);
    }
    if (action === 'business-view') {
      state.businessView = actionEl.dataset.view;
      render();
    }
    if (action === 'business-sort') toast('已按AI建议优先级排序');
    if (action === 'add-business') openBusinessModal();
    if (action === 'confirm-business') {
      const name = $('#businessName')?.value.trim() || '新增业务';
      const account = $('#businessAccount')?.value.trim() || '星辰装饰官方号';
      const status = $('#businessStatus')?.value.trim() || '储备';
      const advice = $('#businessAdvice')?.value.trim() || '待素材完善';
      data.products.unshift({ name, status, account, cpa: '-', advice });
      closePlanModal();
      render();
      toast('推广业务已新增');
    }
    if (action === 'plan-draft') openPlanModal(actionEl.dataset.product, actionEl.dataset.account);
    if (action === 'material-upload') toast('已打开素材上传');
    if (action === 'reuse-material') toast(`${actionEl.dataset.name}已加入可复用素材池`);
    if (action === 'rank-account') toast(`已高亮 ${actionEl.dataset.name}`);
    if (action === 'dash-tab') {
      state.dashTab = actionEl.dataset.tab;
      render();
    }
    if (action === 'dash-filter') {
      state.dashFilter = actionEl.dataset.filter;
      if (state.dashFilter === '全部投放') {
        state.dashSelected = 'all';
        state.dashBusiness = '全部业务';
      } else {
        const items = cockpitCurrentItems(data.dashboard.cockpit);
        state.dashSelected = items[0]?.id || 'all';
      }
      render();
      toast(`已切换为${state.dashFilter}`);
    }
    if (action === 'dash-metric-mode') {
      state.dashMetric = state.dashMetric === 'multi' ? 'cpa' : 'multi';
      render();
      toast(state.dashMetric === 'multi' ? '已切换为多指标对比' : '已切换为只看CPA');
    }
    if (action === 'dash-grain') {
      state.dashGrain = actionEl.dataset.grain;
      render();
      toast(`已切换为${state.dashGrain}`);
    }
    if (action === 'select-cockpit-row') {
      state.dashSelected = actionEl.dataset.id;
      render();
    }
    if (action === 'select-history-row' || action === 'select-focus-row') toast(`已选中 ${actionEl.dataset.name}`);
    if (action === 'cockpit-row-action') toast(`AI市场经理已收到：${actionEl.dataset.name}`);
    if (action === 'close-modal') closePlanModal();
    if (action === 'confirm-plan') {
      const pending = state.pendingPlan || { product: '推广业务', account: '星辰装饰官方号', material: '推荐素材', mode: '复用已发布视频投流' };
      data.plans.unshift({
        name: `${pending.product}-AI新计划`,
        business: pending.product,
        material: pending.material,
        adAudit: '广告审核中',
        status: '待审核',
        budget: '¥800',
        cost: '¥0',
        leads: '0',
        cpa: '-',
        action: '等待巨量审核'
      });
      const material = data.materials.find(item => item.name === pending.material);
      if (material) {
        material.adAudit = '广告审核中';
        material.deliveryStatus = '审核中';
        material.product = Array.from(new Set(`${material.product} / ${pending.product}`.split(' / '))).join(' / ');
      }
      state.pendingPlan = null;
      closePlanModal();
      setPage('records');
      toast('投放计划已创建，正在等待巨量广告审核');
    }
  }

  document.addEventListener('click', handleClick);
  renderNav();
  render();
  if (location.hash === '#app') startApp();
})();
