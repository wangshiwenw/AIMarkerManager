(function () {
  const data = window.DEMO_DATA;
  const UI = window.UI;
  function initialPublishCombos() {
    return [
      { name: '组合A', account: '星辰老房翻新号', material: '老房前后对比 v2.1 / 报价避坑口播', budget: '45%', reason: '账号近7天老房翻新成本低，素材复投稳定', status: '待发布' },
      { name: '组合B', account: '浦东门店号', material: '报价避坑口播 v1.3', budget: '35%', reason: '适合价格敏感但咨询明确的人群', status: '待发布' },
      { name: '组合C', account: '设计师阿林', material: '老房设计师讲解 v1', budget: '20%', reason: '小预算测试设计需求', status: '待发布' }
    ];
  }

  const publishAuditTimers = new Map();
  let aiLoaderTimer = null;
  let aiLoaderTextTimer = null;
  let authFlowTimer = null;

  const state = {
    page: 'home',
    dashFilter: '汇总',
    dashEntity: '全部投放',
    dashGrain: '按小时',
    planView: 'list',
    selectedPlanId: 'plan-oldhouse',
    planStep: null,
    createStep: 0,
    createMaxStep: 0,
    createStage: 'input',
    createPublish: initialPublishCombos(),
    createComboSerial: 4,
    pendingPlan: null,
    authModal: null
  };

  function clearPublishAuditTimers() {
    publishAuditTimers.forEach(timer => clearTimeout(timer));
    publishAuditTimers.clear();
  }

  function clearAuthFlowTimer() {
    clearTimeout(authFlowTimer);
    authFlowTimer = null;
  }

  function scheduleAuditPass(index, delay = 900) {
    if (publishAuditTimers.has(index)) clearTimeout(publishAuditTimers.get(index));
    const timer = setTimeout(() => {
      publishAuditTimers.delete(index);
      const item = state.createPublish[index];
      if (!item || item.status !== '审核中') return;
      item.status = '审核通过';
      render();
      toast(`${item.name} 审核通过`);
    }, delay);
    publishAuditTimers.set(index, timer);
  }

  function $(selector) {
    return document.querySelector(selector);
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2200);
  }

  function hideAiFullscreenLoader() {
    const loader = $('#aiInlineLoader');
    if (!loader) return;
    loader.classList.remove('show');
    loader.setAttribute('aria-hidden', 'true');
    clearTimeout(aiLoaderTimer);
    clearInterval(aiLoaderTextTimer);
    aiLoaderTimer = null;
    aiLoaderTextTimer = null;
  }

  function showAiFullscreenLoader(onComplete) {
    state.createStage = 'parsing';
    render();
    const loader = $('#aiInlineLoader');
    const textEl = $('#aiLoadingText');
    if (!loader || !textEl) {
      onComplete?.();
      return;
    }
    const texts = [
      '正在识别投放目标、人群地域、预算周期与素材方向',
      '正在拆解获客策略，生成计划配置草案',
      '正在匹配可投抖音号与可复用素材',
      '正在生成投放组合与预算分配建议'
    ];
    let index = 0;
    textEl.textContent = texts[index];
    loader.classList.add('show');
    loader.setAttribute('aria-hidden', 'false');
    clearTimeout(aiLoaderTimer);
    clearInterval(aiLoaderTextTimer);
    aiLoaderTextTimer = setInterval(() => {
      index = (index + 1) % texts.length;
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = texts[index];
        textEl.style.opacity = '1';
      }, 160);
    }, 820);
    aiLoaderTimer = setTimeout(() => {
      hideAiFullscreenLoader();
      onComplete?.();
    }, 3100);
  }

  function aiInlineLoader() {
    return `
      <div class="ai-inline-loader show" id="aiInlineLoader" aria-hidden="false">
        <div class="ai-bg-grid"></div>
        <div class="ai-particles"></div>
        <div class="ai-loader-content">
          <div class="ai-core">
            <div class="ai-ring ring-1"></div>
            <div class="ai-ring ring-2"></div>
            <div class="ai-ring ring-3"></div>
            <div class="ai-orb">AI</div>
          </div>
          <div class="ai-loader-title">AI 正在解析投放任务</div>
          <div class="ai-loader-subtitle" id="aiLoadingText">正在识别投放目标、人群地域、预算周期与素材方向</div>
          <div class="ai-loading-steps">
            <span>识别需求</span>
            <span>拆解策略</span>
            <span>匹配素材</span>
            <span>生成方案</span>
          </div>
          <div class="ai-progress-bar">
            <div class="ai-progress-line"></div>
          </div>
        </div>
      </div>
    `;
  }

  function tag(text, tone = 'blue') {
    return UI.tag(text, tone);
  }

  function budgetValue(value) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0;
  }

  function comboBudgetTotal() {
    return state.createPublish.reduce((sum, item) => sum + budgetValue(item.budget), 0);
  }

  function statusTone(status) {
    if (status === '投流中' || status === '可投流') return 'good';
    if (status === '视频审核中' || status === '待发布') return 'warn';
    if (status === '审核未过') return 'bad';
    if (status === '待配置') return 'gray';
    return 'blue';
  }

  function toneColor(tone) {
    return tone === 'good' ? '#18D39E' : tone === 'bad' ? '#EF4444' : tone === 'warn' ? '#F59E0B' : '#38BDF8';
  }

  function points(values, width, height, pad = 8) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return values.map((value, index) => {
      const x = pad + index * ((width - pad * 2) / (values.length - 1));
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

  function metricCard(item) {
    const color = toneColor(item.tone);
    return `
      <div class="dash-metric dash-${item.tone}">
        <label>${item.label}</label>
        <span class="dash-icon">${item.icon}</span>
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

  function renderNav() {
    $('#nav').innerHTML = data.nav.map(item => `
      <button class="nav-btn ${item.id === state.page ? 'active' : ''}" data-page="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `).join('');
  }

  function updateChrome() {
    document.title = data.productName;
    document.querySelectorAll('.brand h1, .landing-brand h1').forEach(el => el.textContent = data.productName);
    const heroStrong = document.querySelector('.landing-hero h2 strong');
    const heroSpan = document.querySelector('.landing-hero h2 span');
    const heroCopy = document.querySelector('.landing-hero p');
    if (heroStrong) heroStrong.textContent = 'AI 投流操盘手';
    if (heroSpan) heroSpan.textContent = '平台获客闭环';
    if (heroCopy) heroCopy.textContent = 'AI自动匹配账号与素材，围绕投放组合持续复盘、调预算、换素材、换账号。';
    updateTopbar();
  }

  function updateTopbar() {
    const o = data.operator;
    $('#pageTitle').textContent = data.nav.find(item => item.id === state.page)?.label || '操盘纵览';
    const auth = data.giantAuth;
    const authTone = auth.status === 'authorized' ? 'good' : ['expired', 'error', 'authFailed', 'syncFailed'].includes(auth.status) ? 'bad' : ['authorizing', 'confirm', 'syncing'].includes(auth.status) ? 'blue' : 'warn';
    const authLabel = auth.status === 'authorized' ? o.giantStatus : auth.status === 'unbound' ? '巨量未授权' : auth.status === 'authorizing' ? '授权中' : auth.status === 'confirm' ? '待确认绑定' : auth.status === 'syncing' ? '同步中' : '授权异常';
    const accountReady = auth.status === 'authorized' ? `可投账号 ${auth.accounts.filter(item => item.deliveryStatus === '可投放').length}/${auth.accounts.length}` : '可投账号 0/0';
    $('.top-status').innerHTML = `
      <span class="tag good">${o.platform}</span>
      <span class="tag ${authTone}">${authLabel}</span>
      <span class="tag ${auth.status === 'authorized' ? 'good' : 'warn'}">${accountReady}</span>
      <span class="tag blue">余额 ${auth.status === 'authorized' ? auth.balance : '-'}</span>
      <div class="user-menu">
        <div class="avatar">A</div>
        <div class="user-copy"><b>${o.name}</b><span>${o.role}</span></div>
        <button class="mini-btn" data-action="logout">退出登录</button>
      </div>
    `;
  }

  function isExecutionMonitor() {
    return state.page === 'acquisition' && state.planView === 'create' && state.createStep === 3;
  }

  function updateMonitorChrome() {
    document.body.classList.toggle('exec-monitor-active', isExecutionMonitor());
    if (!isExecutionMonitor()) {
      updateTopbar();
      return;
    }
    $('.top-status').innerHTML = `
      <span class="tag good">● 投放中</span>
      <span class="tag good">${data.operator.giantStatus}</span>
      <span class="tag good">${data.operator.accountReady}</span>
      <span class="tag blue">余额 ${data.operator.balance}</span>
      <div class="user-menu">
        <div class="avatar">A</div>
        <div class="user-copy"><b>${data.operator.name}</b><span>${data.operator.role}</span></div>
        <button class="mini-btn" data-action="logout">退出登录</button>
      </div>
    `;
  }

  function setPage(page) {
    state.page = page;
    updateTopbar();
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    render();
  }

  function startApp() {
    $('#landingPage')?.classList.add('app-hidden');
    $('#appShell')?.classList.remove('app-hidden');
  }

  function actionButtons(labels) {
    return `<div class="actions">${labels.map(label => `<button class="mini-btn" data-action="quick-action" data-label="${label}">${label}</button>`).join('')}</div>`;
  }

  function moneyValue(value) {
    return Number(String(value || '').replace(/[^\d.]/g, '')) || 0;
  }

  function groupRows(rows, key) {
    const groups = new Map();
    rows.forEach(row => {
      const label = row[key] || '未归类';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(row);
    });
    return Array.from(groups, ([label, items]) => ({ label, rows: items }));
  }

  function dimensionOptions() {
    const rows = data.combinations;
    if (state.dashFilter === '汇总') return [{ label: '全部投放', rows }];
    const keyMap = {
      '按计划': 'plan',
      '按账号': 'account',
      '按素材': 'material',
      '按获客方向': 'direction'
    };
    return groupRows(rows, keyMap[state.dashFilter] || 'name');
  }

  function currentScope() {
    const options = dimensionOptions();
    const picked = options.find(item => item.label === state.dashEntity) || options[0];
    state.dashEntity = picked.label;
    const spend = picked.rows.reduce((sum, row) => sum + moneyValue(row.spend), 0);
    const leads = picked.rows.reduce((sum, row) => sum + Number(row.leads || 0), 0);
    const cost = leads ? Math.round(spend / leads) : 0;
    return { ...picked, spend, leads, cost, comboCount: picked.rows.length };
  }

  function isGiantAuthReady() {
    return data.giantAuth.status === 'authorized';
  }

  function authStatusMeta() {
    const auth = data.giantAuth;
    if (auth.status === 'authorized') {
      return { label: '已授权', tone: 'good', title: '当前巨量引擎账号授权正常', desc: '系统已完成账户绑定，可同步可投放账号、账户余额和投放数据。' };
    }
    if (auth.status === 'authorizing') {
      return { label: '授权跳转中', tone: 'blue', title: '正在跳转巨量引擎授权页面', desc: '系统已发起授权请求，请在巨量引擎授权页完成确认。' };
    }
    if (auth.status === 'confirm') {
      return { label: '待确认绑定', tone: 'blue', title: '授权成功', desc: '已获取巨量引擎授权，请确认本次绑定账户信息。' };
    }
    if (auth.status === 'syncing') {
      return { label: '同步中', tone: 'blue', title: '正在同步巨量引擎账号信息', desc: '系统正在同步账户基本信息、可投放账号和授权状态。' };
    }
    if (auth.status === 'authFailed') {
      return { label: '授权失败', tone: 'bad', title: '授权失败', desc: '未能完成巨量引擎授权，请检查授权页状态后重新发起授权。' };
    }
    if (auth.status === 'syncFailed') {
      return { label: '同步失败', tone: 'bad', title: '同步失败', desc: '已获取授权，但同步账户信息失败，请重试同步或重新发起授权。' };
    }
    if (auth.status === 'expired' || auth.status === 'error') {
      return { label: auth.status === 'expired' ? '授权已过期' : '授权异常', tone: 'bad', title: '授权过期或异常', desc: '当前授权不可用，请重新授权后再创建投放计划。' };
    }
    return { label: '未授权', tone: 'warn', title: '尚未绑定巨量引擎账号', desc: '完成授权后，系统将自动同步账户余额、可投放账号和投放数据。' };
  }

  function authStepList(steps, activeIndex, doneIndex = activeIndex - 1) {
    return `<div class="auth-flow-steps" style="--step-count:${steps.length}">${steps.map((step, index) => `
      <div class="${index <= doneIndex ? 'done' : index === activeIndex ? 'active' : ''}">
        <i>${index + 1}</i>
        <span>${step}</span>
      </div>
    `).join('')}</div>`;
  }

  function beginAuthRedirect() {
    clearAuthFlowTimer();
    data.giantAuth.status = 'authorizing';
    render();
    authFlowTimer = setTimeout(() => {
      data.giantAuth.status = 'confirm';
      data.giantAuth.accountName = '上海星辰装饰巨量引擎主账户';
      data.giantAuth.accountId = 'AD-1098-5623-2048';
      data.giantAuth.subject = '上海星辰装饰工程有限公司';
      data.giantAuth.authorizedAt = '2026-06-24 10:42';
      data.giantAuth.expiresAt = '2027-06-24 10:42';
      data.giantAuth.balance = '¥18,600';
      data.giantAuth.availableAccountCount = 4;
      render();
      toast('巨量引擎授权成功，请确认绑定信息');
    }, 1100);
  }

  function beginAccountSync() {
    clearAuthFlowTimer();
    data.giantAuth.status = 'syncing';
    render();
    authFlowTimer = setTimeout(() => {
      data.giantAuth.status = 'authorized';
      data.giantAuth.lastSyncAt = '2026-06-24 10:45';
      data.giantAuth.availableAccountCount = data.giantAuth.accounts.filter(item => item.deliveryStatus === '可投放').length;
      data.giantAuth.accounts.forEach(item => { item.syncedAt = data.giantAuth.lastSyncAt; });
      render();
      toast('绑定成功，已同步可投放账号');
    }, 1200);
  }

  function hashText(text) {
    return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function scopeSeries(scope, n) {
    const seed = hashText(`${state.dashFilter}-${scope.label}`);
    const spendBase = Math.max(160, Math.min(980, scope.spend / 3));
    const leadBase = Math.max(130, Math.min(900, scope.leads * 82));
    const cpaBase = scope.cost || 240;
    return {
      spend: Array.from({ length: n }, (_, i) => spendBase + Math.sin(i * .43 + seed) * 105 + Math.sin(i * .13 + seed / 3) * 58 + i * 3),
      leads: Array.from({ length: n }, (_, i) => leadBase + Math.sin(i * .47 + seed / 7) * 120 + Math.sin(i * .86) * 48),
      cpa: Array.from({ length: n }, (_, i) => Math.max(60, cpaBase + Math.sin(i * .34 + seed / 9) * 42 + (i > n * .72 ? 18 : 0)))
    };
  }

  function scopeSelector(scope) {
    const options = dimensionOptions();
    const selector = state.dashFilter === '汇总' ? '' : `
      <div class="entity-selector">
        <span>${state.dashFilter.replace('按', '选择')}</span>
        ${options.map(item => `<button class="${state.dashEntity === item.label ? 'active' : ''}" data-action="dash-entity" data-entity="${item.label}">${item.label}</button>`).join('')}
      </div>
    `;
    return `
      <div class="chart-scope-row">
        ${selector}
        <div class="scope-summary">
          <span>当前：${state.dashFilter} · ${scope.label}</span>
          <b>消耗 ¥${scope.spend.toLocaleString()}</b>
          <b>客资 ${scope.leads} 条</b>
          <b>成本 ${scope.cost ? `¥${scope.cost}/条` : '-'}</b>
          <em>${scope.comboCount} 个组合</em>
        </div>
      </div>
    `;
  }

  function cockpitChart() {
    const scope = currentScope();
    const width = 980;
    const height = 350;
    const pad = { left: 60, right: 64, top: 38, bottom: 70 };
    const n = state.dashGrain === '按天' ? 7 : 42;
    const { spend, leads, cpa } = scopeSeries(scope, n);
    const x = index => pad.left + index * ((width - pad.left - pad.right) / (n - 1));
    const yLeft = value => pad.top + (1180 - value) / 1180 * (height - pad.top - pad.bottom);
    const yRight = value => pad.top + (480 - value) / 480 * (height - pad.top - pad.bottom);
    const makeLine = (values, mapper) => values.map((value, index) => `${x(index).toFixed(1)},${mapper(value).toFixed(1)}`).join(' ');
    const labels = state.dashGrain === '按天' ? ['06-17', '06-18', '06-19', '06-20', '06-21', '06-22', '06-23'] : ['00:00', '06:00', '12:00', '18:00', '00:00', '06:00', '12:00'];
    const labelIndexes = labels.map((_, index) => Math.round(index * (n - 1) / (labels.length - 1)));
    const events = [
      { index: Math.round(n * .22), label: '素材上线', time: '05-28 10:30', detail: '老房前后对比 v2.1', tone: 'blue' },
      { index: Math.round(n * .43), label: '预算调整', time: '05-29 15:20', detail: '预算 +20%', tone: 'warn' },
      { index: Math.round(n * .68), label: 'AI扩量操作', time: '05-31 09:45', detail: '建议扩量', tone: 'good' },
      { index: Math.round(n * .84), label: '预算调整', time: '06-01 16:10', detail: '预算 +15%', tone: 'warn' },
      { index: Math.round(n * .95), label: '素材上线', time: '06-02 09:20', detail: '报价素材 v1.3', tone: 'blue' }
    ];
    const color = item => item.tone === 'good' ? '#18D39E' : item.tone === 'warn' ? '#F59E0B' : '#38BDF8';

    return `
      <svg class="cockpit-chart" viewBox="0 0 ${width} ${height}" aria-label="投放表现主图">
        <defs>
          <linearGradient id="spendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#2F7BFF" stop-opacity=".18"></stop>
            <stop offset="100%" stop-color="#2F7BFF" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${pad.left}" y1="${pad.top + i * 44}" x2="${width - pad.right}" y2="${pad.top + i * 44}" stroke="rgba(148,163,184,.12)"></line>`).join('')}
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${pad.left + i * 108}" y1="${pad.top}" x2="${pad.left + i * 108}" y2="${height - pad.bottom}" stroke="rgba(148,163,184,.07)"></line>`).join('')}
        <text x="${pad.left - 12}" y="${pad.top - 14}" fill="#94A3B8" font-size="13" font-weight="800">消耗 / 客资</text>
        <text x="${width - 10}" y="${pad.top - 14}" text-anchor="end" fill="#94A3B8" font-size="13" font-weight="800">客资成本(元)</text>
        <line x1="${pad.left}" x2="${width - pad.right}" y1="${yRight(180).toFixed(1)}" y2="${yRight(180).toFixed(1)}" stroke="rgba(226,232,240,.7)" stroke-width="2" stroke-dasharray="6 8"></line>
        <polyline points="${makeLine(spend, yLeft)} ${width - pad.right},${height - pad.bottom} ${pad.left},${height - pad.bottom}" fill="url(#spendFill)"></polyline>
        <polyline points="${makeLine(spend, yLeft)}" fill="none" stroke="#2F7BFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${makeLine(leads, yLeft)}" fill="none" stroke="#18D39E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${makeLine(cpa, yRight)}" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${events.map(event => {
          const cx = x(event.index);
          const c = color(event);
          const boxX = Math.max(pad.left + 4, Math.min(width - pad.right - 128, cx - 60));
          const boxY = event.index > n * .75 ? 70 : 54;
          return `
            <g>
              <line x1="${cx}" x2="${cx}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="${c}" stroke-dasharray="5 7" opacity=".5"></line>
              <circle cx="${cx}" cy="${yRight(cpa[event.index]).toFixed(1)}" r="6" fill="${c}"></circle>
              <rect x="${boxX}" y="${boxY}" width="128" height="58" rx="5" fill="rgba(2,6,23,.78)" stroke="${c}"></rect>
              <text x="${boxX + 12}" y="${boxY + 20}" fill="${c}" font-size="13" font-weight="900">${event.label}</text>
              <text x="${boxX + 12}" y="${boxY + 38}" fill="#E2E8F0" font-size="12">${event.time}</text>
              <text x="${boxX + 12}" y="${boxY + 53}" fill="#94A3B8" font-size="11">${event.detail}</text>
            </g>
          `;
        }).join('')}
        ${labelIndexes.map((index, labelIndex) => `<text x="${x(index)}" y="${height - 46}" text-anchor="middle" fill="#64748B" font-size="12">${labels[labelIndex]}</text>`).join('')}
        <rect x="${x(Math.round(n * .76))}" y="${height - 32}" width="${x(n - 1) - x(Math.round(n * .76))}" height="24" fill="rgba(148,163,184,.13)" stroke="rgba(226,232,240,.72)" rx="2"></rect>
      </svg>
    `;
  }

  function planPerformanceChart(plan) {
    const width = 820;
    const height = 260;
    const pad = { left: 52, right: 48, top: 34, bottom: 48 };
    const values = plan.trend.length ? plan.trend : [0, 0, 0, 0, 0, 0, 0];
    const spend = values.map((value, index) => value * 18 + 90 + index * 12);
    const leads = values.map(value => value * 13 + 80);
    const cost = values.map((value, index) => Math.max(80, 240 - value * 2 + Math.sin(index) * 22));
    const x = index => pad.left + index * ((width - pad.left - pad.right) / (values.length - 1));
    const yLeft = value => pad.top + (1050 - value) / 1050 * (height - pad.top - pad.bottom);
    const yRight = value => pad.top + (360 - value) / 360 * (height - pad.top - pad.bottom);
    const line = (arr, mapper) => arr.map((value, index) => `${x(index).toFixed(1)},${mapper(value).toFixed(1)}`).join(' ');
    const events = [
      { index: 1, label: '视频审核', tone: 'warn' },
      { index: 3, label: '自动投流', tone: 'blue' },
      { index: 5, label: 'AI建议', tone: plan.tone }
    ];
    return `
      <svg class="plan-chart" viewBox="0 0 ${width} ${height}" aria-label="${plan.name}计划表现">
        ${[0, 1, 2, 3].map(i => `<line x1="${pad.left}" y1="${pad.top + i * 42}" x2="${width - pad.right}" y2="${pad.top + i * 42}" stroke="rgba(148,163,184,.12)"></line>`).join('')}
        <text x="${pad.left}" y="22" fill="#94A3B8" font-size="12" font-weight="800">${plan.name} · 消耗/客资/成本</text>
        <line x1="${pad.left}" x2="${width - pad.right}" y1="${yRight(180)}" y2="${yRight(180)}" stroke="rgba(226,232,240,.66)" stroke-dasharray="6 7"></line>
        <polyline points="${line(spend, yLeft)}" fill="none" stroke="#2F7BFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${line(leads, yLeft)}" fill="none" stroke="#18D39E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${line(cost, yRight)}" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${events.map(event => {
          const cx = x(Math.min(event.index, values.length - 1));
          const c = toneColor(event.tone);
          return `<g><line x1="${cx}" x2="${cx}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="${c}" stroke-dasharray="4 6" opacity=".52"></line><circle cx="${cx}" cy="${yRight(cost[event.index]).toFixed(1)}" r="5" fill="${c}"></circle><text x="${cx + 8}" y="${pad.top + 18}" fill="${c}" font-size="12" font-weight="900">${event.label}</text></g>`;
        }).join('')}
        ${['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((label, index) => `<text x="${x(index)}" y="${height - 20}" text-anchor="middle" fill="#64748B" font-size="11">${label}</text>`).join('')}
      </svg>
    `;
  }

  function monitorMetricCards() {
    const metrics = [
      { label: '累计消耗', value: '¥12,456.78', delta: '+8.62% ↑', tone: 'bad', icon: 'wallet' },
      { label: '咨询量', value: '238', delta: '+15.13% ↑', tone: 'bad', icon: 'chat' },
      { label: '客资成本', value: '¥52.34', delta: '-6.21% ↓', tone: 'good', icon: 'user' },
      { label: '点击率', value: '2.87%', delta: '+0.32% ↑', tone: 'bad', icon: 'cursor' },
      { label: '转化率', value: '6.30%', delta: '+0.48% ↑', tone: 'bad', icon: 'filter' },
      { label: 'ROI', value: '2.41', delta: '+0.19 ↑', tone: 'bad', icon: 'crown' }
    ];
    return metrics.map(item => `
      <div class="exec-metric">
        <div>
          <span>${item.label}</span>
          <b>${item.value}</b>
          <p class="${item.tone}">较昨日 ${item.delta}</p>
        </div>
        <i class="exec-icon ${item.icon}"></i>
      </div>
    `).join('');
  }

  function execTrendChart() {
    const width = 620;
    const height = 235;
    const pad = { left: 50, right: 38, top: 34, bottom: 34 };
    const series = {
      spend: [420, 430, 480, 560, 610, 690, 1120, 1450, 1820, 2040, 1900, 1680, 2000, 2160, 2240, 2180, 2120, 2140, 1660, 2040, 1780, 1690],
      consult: [180, 190, 220, 270, 285, 295, 480, 560, 690, 630, 520, 510, 670, 760, 640, 630, 770, 850, 680, 610, 760, 820],
      cost: [820, 860, 920, 1000, 1060, 980, 780, 820, 930, 1020, 860, 900, 960, 980, 990, 1040, 1120, 1140, 960, 940, 1020, 1040],
      ctr: [1220, 1450, 1580, 1480, 1760, 1640, 1620, 1340, 1280, 1500, 1420, 1600, 1680, 1420, 1380, 1520, 1600, 1620, 1540, 1680, 1620, 1500]
    };
    const max = 2500;
    const x = index => pad.left + index * ((width - pad.left - pad.right) / (series.spend.length - 1));
    const y = value => pad.top + (max - value) / max * (height - pad.top - pad.bottom);
    const line = values => values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
    return `
      <svg class="exec-chart" viewBox="0 0 ${width} ${height}" aria-label="数据趋势">
        ${[0, 1, 2, 3, 4].map(i => `<line x1="${pad.left}" y1="${pad.top + i * 34}" x2="${width - pad.right}" y2="${pad.top + i * 34}" stroke="rgba(148,163,184,.13)" stroke-dasharray="${i === 0 ? 0 : '4 6'}"></line>`).join('')}
        ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${pad.left + i * 98}" y1="${pad.top}" x2="${pad.left + i * 98}" y2="${height - pad.bottom}" stroke="rgba(148,163,184,.08)"></line>`).join('')}
        <polyline points="${line(series.spend)}" fill="none" stroke="#2F8BFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${line(series.consult)}" fill="none" stroke="#19D6A0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${line(series.cost)}" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        <polyline points="${line(series.ctr)}" fill="none" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${['0', '500', '1,000', '1,500', '2,000', '2,500'].map((label, index) => `<text x="16" y="${height - pad.bottom - index * 30}" fill="#7C8BA1" font-size="11">${label}</text>`).join('')}
        ${['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((label, index) => `<text x="${pad.left + index * 86}" y="${height - 9}" fill="#7C8BA1" font-size="11" text-anchor="middle">${label}</text>`).join('')}
        <text x="${width - 18}" y="${pad.top + 4}" fill="#7C8BA1" font-size="11">5%</text>
        <text x="${width - 18}" y="${height - pad.bottom + 2}" fill="#7C8BA1" font-size="11">0%</text>
      </svg>
    `;
  }

  function executionMonitorPage() {
    const materialImages = data.materialRecommendations.map(item => item.image);
    const suggestions = [
      { icon: 'bar', title: '降低高成本地区预算', text: '上海-浦东客资成本 ¥78.6，高于账户均值 48%，建议下调预算。' },
      { icon: 'chart', title: '放量高CTR素材', text: '素材《老房避坑案例03》CTR达 4.12%，高于账户均值 1.2 倍，建议加大投放。' },
      { icon: 'pause', title: '暂停低转化账号', text: '账号“轻企联盟_02”转化率仅 1.2%，低于账户均值 70%，建议暂停投放。' }
    ];
    const rows = [
      ['老房翻新获客计划-01', '巨量引擎_官方_01', '老房避坑案例03', '● 投放中', '3,456.78', '128,456', '3,682', '86', '40.20', '2.87%'],
      ['老房翻新获客计划-02', '巨量引擎_官方_02', '旧房翻新必看指南', '● 投放中', '2,987.55', '96,725', '2,615', '58', '51.51', '2.70%'],
      ['老房翻新获客计划-03', '穿山甲_优质_01', '30天旧房焕新挑战', '● 投放中', '2,354.22', '78,430', '2,001', '39', '60.37', '2.55%'],
      ['老房翻新获客计划-04', '巨量引擎_官方_03', '局部改造案例集锦', '● 已暂停', '1,658.23', '45,612', '1,102', '14', '118.45', '2.41%']
    ];
    return `
      <div class="exec-monitor">
        <div class="exec-alert">
          <span class="info-dot">i</span>
          <b>计划已进入投放监控阶段，系统将持续回流消耗、咨询、成本、点击率、转化率等数据，并生成AI调优建议。</b>
          <em>数据更新时间：2025-05-15 20:30</em>
          <button class="refresh-btn">↻</button>
          <button class="range-btn">近24小时⌄</button>
        </div>
        <section class="exec-metrics">${monitorMetricCards()}</section>
        <section class="exec-main-grid">
          <div class="exec-panel exec-trend">
            <div class="exec-panel-head">
              <h3>数据趋势</h3>
              <div class="exec-legend">
                <span><i class="blue"></i>消耗(¥)</span>
                <span><i class="green"></i>咨询量</span>
                <span><i class="purple"></i>客资成本(¥)</span>
                <span><i class="yellow"></i>点击率(%)</span>
              </div>
              <div class="exec-tools"><span>指标对比</span><i></i><button>按小时⌄</button></div>
            </div>
            ${execTrendChart()}
          </div>
          <div class="exec-panel exec-advice">
            <div class="exec-panel-head"><h3>AI调优建议</h3><span class="exec-badge">3 条待处理</span></div>
            <div class="exec-advice-list">
              ${suggestions.map(item => `
                <div class="exec-advice-item">
                  <span class="exec-advice-icon ${item.icon}"></span>
                  <div><b>${item.title}</b><p>${item.text}</p></div>
                  <button class="adopt">采纳建议</button>
                  <button class="reason">查看原因</button>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
        <section class="exec-panel exec-table-panel">
          <h3>投放明细</h3>
          <div class="exec-table-wrap">
            <table class="exec-table">
              <thead><tr>${['计划名称', '投放账号', '素材名称', '状态', '消耗(¥)', '曝光', '点击', '咨询量', '客资成本(¥)', '点击率', '操作'].map(head => `<th>${head}</th>`).join('')}</tr></thead>
              <tbody>
                ${rows.map((row, rowIndex) => `
                  <tr>
                    ${row.map((cell, index) => `<td class="${index === 3 ? (rowIndex === 3 ? 'paused' : 'running') : ''}">${index === 2 ? `<span class="thumb" style="background-image:url('${materialImages[rowIndex % materialImages.length]}')"></span>` : ''}${cell}</td>`).join('')}
                    <td><button>加预算</button><button>降预算</button><button class="${rowIndex === 3 ? 'enable' : 'danger'}">${rowIndex === 3 ? '启用' : '暂停'}</button><button>查看详情</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
        <div class="exec-footer">
          <button class="footer-btn" data-action="plan-list">返回计划列表</button>
          <span></span>
          <button class="footer-btn primary" data-action="go-monitor-dashboard">进入监控大盘</button>
        </div>
      </div>
    `;
  }

  function aiConfirmLabel(item) {
    const labels = {
      '加预算': '确认扩量',
      '替换素材': '确认换素材',
      '暂停低效组合': '确认暂停',
      '新增账号': '确认新增',
      '发布提醒': '确认发布',
      '素材复盘': '确认复盘'
    };
    return labels[item.type] || item.buttons?.[0] || '确认';
  }

  function aiActionList() {
    return `<div class="cockpit-side-list">${data.aiActions.map((item, index) => `
      <div class="cockpit-side-item ${item.tone}">
        <span class="index-badge ${item.tone}">${index + 1}</span>
        <div>
          <div class="advice-meta"><span>${item.time}</span>${tag(item.status, item.status === '未处理' ? 'bad' : item.status === '观察中' ? 'warn' : 'blue')}</div>
          <b>${item.recommendation}</b>
          <p>${item.evidence}</p>
        </div>
        <div class="advice-actions">
          <button class="mini-btn" data-action="quick-action" data-label="忽略建议">忽略</button>
          <button class="mini-btn confirm" data-action="quick-action" data-label="${aiConfirmLabel(item)}">${aiConfirmLabel(item)}</button>
        </div>
      </div>
    `).join('')}</div>`;
  }

  function riskList() {
    return `<div class="cockpit-side-list">${data.risks.map(item => `
      <div class="cockpit-risk-item ${item.tone}">
        <div><b>${item.title}</b><p>${item.text}</p></div>
        ${tag(item.status, item.tone)}
      </div>
    `).join('')}</div>`;
  }

  function combinationRows() {
    return `
      <div class="combo-watch-list">
        ${data.combinations.map(item => `
          <div class="combo-watch-item ${item.tone}">
            <div class="combo-watch-main">
              <b>${item.name}</b>
              <span>${item.account}</span>
              <em>${item.material}</em>
            </div>
            <div class="combo-watch-metrics">
              <div><label>今日消耗</label><strong>${item.spend}</strong></div>
              <div><label>客资</label><strong>${item.leads}条</strong></div>
              <div><label>客资成本</label><strong>${item.cost}</strong></div>
            </div>
            <div class="combo-watch-state">
              ${tag(item.publishStatus, statusTone(item.publishStatus))}
              ${tag(item.ai, item.tone)}
            </div>
            <div class="combo-watch-actions">
              <button class="mini-btn" data-action="quick-action" data-label="${item.action}">${item.action}</button>
              <button class="mini-btn" data-action="quick-action" data-label="查看诊断">查看诊断</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function miniRecommendation(title, items, type) {
    return `
      <div class="card card-pad cockpit-aux-card">
        <div class="dash-head"><h3>${title}</h3><span>${type}</span></div>
        <div class="recommend-list">
          ${items.map(item => `
            <div class="recommend-item ${item.tone}">
              <div>
                <b>${item.name}</b>
                <p>${item.bestFor || item.bestCombo}</p>
                <span>${item.ai}</span>
              </div>
              ${tag(item.status || item.recommendation, item.tone)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderHome() {
    return `
      <div class="dashboard cockpit operator-cockpit">
        <div class="dashboard-toolbar">
          <div class="desk-pulse">AI巡检运行中 · ${data.operator.lastInspection} 已更新 · 下一次 ${data.operator.nextInspection}</div>
          <div class="date-controls"><span>数据时间：${data.cockpit.date}</span>${tag(data.operator.availableDays, 'blue')}</div>
        </div>
        <section class="dash-metrics">${data.cockpit.metrics.map(metricCard).join('')}</section>
        <section class="cockpit-business-filter">
          <span>业务筛选</span>
          ${data.cockpit.filters.map((name, index) => `<button class="${index === 0 ? 'active' : ''}" data-action="quick-action" data-label="${name}">${name}</button>`).join('')}
        </section>
        <section class="cockpit-grid">
          <aside class="cockpit-right">
            <div class="card card-pad dash-card scroll-card">
              <div class="dash-head"><h3>AI待处理建议</h3>${tag(`${data.operator.pendingActions} 条未关闭`, 'good')}</div>
              ${aiActionList()}
            </div>
            <div class="card card-pad dash-card risk-card scroll-card">
              <div class="dash-head"><h3>风险预警</h3>${tag(`${data.operator.risks} 项风险`, 'bad')}</div>
              ${riskList()}
            </div>
            <div class="card card-pad dash-card">
              <div class="dash-head"><h3>历史投放摘要</h3><span>近30天</span></div>
              <div class="history-summary">
                <div class="good"><b>历史优质</b><span>12个组合</span><em>平均客资成本 ¥152</em><small>可复用</small></div>
                <div class="warn"><b>待观察</b><span>8个组合</span><em>成本波动</em><small>继续测试</small></div>
                <div class="bad"><b>已淘汰</b><span>6个组合</span><em>空耗/低质</em><small>不再复投</small></div>
              </div>
            </div>
          </aside>
          <div class="card card-pad cockpit-main-card">
            <div class="cockpit-chart-head">
              <div>
                <h3>投放表现主图</h3>
                <div class="legend"><i class="blue"></i>消耗<i class="green"></i>客资<i class="purple"></i>客资成本<i class="line"></i>参考成本</div>
              </div>
              <div class="cockpit-controls">
                <div class="segmented">${['汇总', '按计划', '按账号', '按素材', '按获客方向'].map(item => `<button class="${state.dashFilter === item ? 'active' : ''}" data-action="dash-filter" data-filter="${item}">${item}</button>`).join('')}</div>
                <button class="btn small" data-action="quick-action" data-label="多指标对比">多指标对比</button>
                <div class="segmented compact">${['按小时', '按天'].map(item => `<button class="${state.dashGrain === item ? 'active' : ''}" data-action="dash-grain" data-grain="${item}">${item}</button>`).join('')}</div>
              </div>
            </div>
            ${scopeSelector(currentScope())}
            ${cockpitChart()}
          </div>
          <div class="cockpit-bottom">
            <div class="card card-pad cockpit-list-card">
              <div class="table-title">正在监控的投放组合（${data.combinations.length}）</div>
              ${combinationRows()}
            </div>
            <div class="cockpit-aux">
              ${miniRecommendation('推荐账号', data.accountRecommendations.slice(0, 4), '按客资类型')}
              ${miniRecommendation('推荐素材/视频', data.materialRecommendations.slice(0, 4), '按复投表现')}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderAcquisition() {
    if (state.planView === 'detail') return renderPlanDetail();
    if (state.planView === 'create') return renderPlanCreate();
    return renderPlanList();
  }

  function planSteps(activeIndex, maxStep = activeIndex) {
    const steps = ['AI解析计划', '组合方案', '发布审核并投流', '监控调控'];
    const descriptions = ['输入任务，AI智能解析', 'AI生成投放组合方案', '提交审核并开启投放', '实时监控，智能优化'];
    return `<div class="plan-stepper">${steps.map((step, index) => {
      const isActive = index === activeIndex;
      const isDone = index <= maxStep && !isActive;
      const isLocked = index > maxStep;
      return `
        <button class="plan-step ${isDone ? 'done' : isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-action="plan-step" data-step="${index}" ${isLocked ? 'disabled' : ''}>
          <span>${index + 1}</span><b>${step}</b><small>${descriptions[index]}</small>${isDone ? '<span class="step-check">✓</span>' : ''}
        </button>
      `;
    }).join('')}</div>`;
  }

  function planCard(plan) {
    return `
      <article class="plan-work-card ${plan.tone}" data-action="plan-detail" data-plan-id="${plan.id}">
        <div class="plan-work-head">
          <div>
            <b>${plan.name}</b>
            <span>${plan.direction} · ${plan.city}/${plan.area}</span>
          </div>
          ${tag(plan.status, plan.tone)}
        </div>
        <div class="plan-work-kpis">
          <div><label>总预算</label><strong>${plan.totalBudget}</strong></div>
          <div><label>已消耗</label><strong>${plan.spent}</strong></div>
          <div><label>客资</label><strong>${plan.leads}条</strong></div>
          <div><label>客资成本</label><strong>${plan.cost}</strong></div>
        </div>
        <div class="plan-work-step">
          <div><label>当前步骤</label><strong>${plan.step}</strong></div>
          <div><label>下一步</label><strong>${plan.nextAction}</strong></div>
        </div>
        <div class="plan-work-foot">
          ${spark(plan.trend, toneColor(plan.tone))}
          <div>${plan.adviceCount ? tag(`${plan.adviceCount}条AI建议`, 'warn') : tag('暂无待处理建议', 'good')}${tag(plan.anomaly, plan.tone)}</div>
        </div>
      </article>
    `;
  }

  function renderPlanList() {
    const filters = ['全部', '配置中', '待发布审核', '投放中', '监控中', '已结束', '异常'];
    return `
      <div class="plan-workspace">
        <div class="page-hero plan-hero">
          <p>投放计划负责创建、组合确认、发布审核、自动投流和计划级监控调控；实时操作建议与操盘纵览同池。</p>
          <button class="btn" data-action="plan-create">创建投放计划</button>
        </div>
        <section class="plan-filter-bar">
          ${filters.map((name, index) => `<button class="${index === 0 ? 'active' : ''}" data-action="quick-action" data-label="${name}">${name}</button>`).join('')}
        </section>
        <section class="plan-card-grid">
          ${data.plans.map(planCard).join('')}
        </section>
      </div>
    `;
  }

  function selectedPlan() {
    return data.plans.find(plan => plan.id === state.selectedPlanId) || data.plans[0];
  }

  function planCombos(plan) {
    const matched = data.combinations.filter(item => item.plan === plan.name);
    if (matched.length) return matched;
    return data.combinations.slice(0, 2).map(item => ({ ...item, plan: plan.name, name: item.name.replace(/^[^-]+/, plan.direction.slice(0, 4)) }));
  }

  function planLogs(plan) {
    return [
      { time: '10:30', title: 'AI生成计划判断', text: `${plan.direction} · ${plan.city}/${plan.area}，预算 ${plan.totalBudget}` },
      { time: '10:34', title: 'AI匹配投放组合', text: `推荐 ${plan.accountCount || 2} 个账号，${plan.materialCount || 3} 条素材` },
      { time: '10:42', title: '发布审核状态更新', text: plan.stepIndex >= 2 ? plan.nextAction : '等待确认组合后发布视频' },
      { time: '11:30', title: '监控调控提醒', text: plan.stepIndex >= 3 ? plan.ai : '投放满1小时后开启计划级监控' }
    ];
  }

  function stepFooter(nextLabel = '进入下一步') {
    return `<div class="step-action-row"><button class="btn" data-action="plan-next-step">${nextLabel}</button><button class="mini-btn" data-action="quick-action" data-label="保存当前进度">保存当前进度</button></div>`;
  }

  function planDetailBody(plan, activeStep) {
    if (activeStep === 0) {
      return `
        <div class="step-stage-note">
          <b>本步目标：确认AI解析出的计划配置</b>
          <p>已有计划不会一直显示“AI生成中”，只展示AI解析结果和缺失项。重新解析时才出现动态动画。</p>
        </div>
        <div class="task-input-box">
          <p>帮我在${plan.city}${plan.area}投${plan.direction}，预算${plan.totalBudget}，周期${plan.period}。</p>
          <div class="actions"><button class="mini-btn" data-action="quick-action" data-label="重新AI解析">重新AI解析</button><button class="mini-btn">按住说话</button><button class="mini-btn">导入文件</button></div>
        </div>
        <div class="param-chip-grid">
          ${[plan.direction, `${plan.city} · ${plan.area}`, `总预算 ${plan.totalBudget}`, plan.period, plan.materialType, plan.pace, plan.anomaly].map((item, index) => `<button class="${index === 6 && plan.tone !== 'good' ? 'missing' : ''}">${item}</button>`).join('')}
        </div>
        ${stepFooter('匹配投放组合')}
      `;
    }
    if (activeStep === 1) {
      return `
        <div class="step-stage-note">
          <b>本步目标：确认AI生成的投放组合</b>
          <p>AI推荐账号、素材和预算占比，运营可以勾选、替换账号/素材或新增组合。</p>
        </div>
        <div class="combo-stage-list">
          ${planCombos(plan).map((item, index) => `
            <div class="combo-stage-item ${item.tone}">
              <label class="combo-check"><input type="checkbox" checked /><span></span><b>${item.name}</b></label>
              <div><b>${item.account}</b><span>${item.material}</span></div>
              ${tag(item.budgetShare || `${40 - index * 10}%`, 'blue')}
              <button class="mini-btn" data-action="quick-action" data-label="调整组合">调整组合</button>
            </div>
          `).join('')}
        </div>
        ${stepFooter('确认组合，进入发布审核')}
      `;
    }
    if (activeStep === 2) {
      return `
        <div class="step-stage-note">
          <b>本步目标：发布视频并等待审核，审核通过后自动投流</b>
          <p>无需单独启动投流。审核未过的组合需要替换素材或修改内容后重新发布。</p>
        </div>
        <div class="combo-stage-list">
          ${planCombos(plan).map(item => `
            <div class="combo-stage-item ${item.tone}">
              <div><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
              ${tag(item.publishStatus, statusTone(item.publishStatus))}
              <button class="mini-btn" data-action="quick-action" data-label="${item.action}">${item.action}</button>
            </div>
          `).join('')}
        </div>
        ${stepFooter('审核通过，进入监控调控')}
      `;
    }
    if (activeStep >= 3) {
      return `
        <div class="step-stage-note">
          <b>本步目标：投放满1小时后开启计划级监控调控</b>
          <p>这里展示当前计划的趋势、组合表现和AI建议；AI建议与操盘纵览同池，只是按当前计划过滤。</p>
        </div>
        <div class="plan-monitor-grid">
          <div class="plan-monitor-chart">${planPerformanceChart(plan)}</div>
          <div class="combo-stage-list">
            ${planCombos(plan).map(item => `
              <div class="combo-stage-item ${item.tone}">
                <div><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
                <strong>${item.spend} / ${item.leads}条 / ${item.cost}</strong>
                ${tag(item.ai, item.tone)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  function planCreateBody() {
    const draftPlan = {
      id: 'draft-plan',
      name: '新建老房翻新投放计划',
      direction: '老房翻新',
      city: '上海',
      area: '浦东',
      totalBudget: '¥12,000',
      spent: '¥0',
      leads: 0,
      cost: '-',
      period: '7天',
      pace: 'AI均衡消耗',
      materialType: '报价/前后对比素材',
      materialCount: 3,
      accountCount: 3,
      status: '配置中',
      step: 'AI解析计划',
      stepIndex: state.createStep,
      nextAction: '匹配投放组合',
      adviceCount: 0,
      anomaly: '特殊要求待补充',
      ai: 'AI已解析出计划配置',
      tone: 'blue',
      trend: [0, 0, 0, 0, 0, 0, 0]
    };
    if (state.createStage === 'parsing') {
      return aiInlineLoader();
    }
    if (state.createStep === 1) {
      const budgetTotal = comboBudgetTotal();
      const budgetOver = budgetTotal > 100;
      return `
        <div class="step-stage-note">
          <b>AI已生成组合方案</b>
          <p>请选择要发布的投放组合，可删除不需要的组合，或新增账号与视频组合。</p>
        </div>
        <div class="combo-stage-list combo-edit-list">
          ${state.createPublish.map((combo, index) => `
            <div class="combo-stage-item combo-edit-item good">
              <label class="combo-check"><input type="checkbox" checked /><span></span><b>${combo.name}</b></label>
              <div><b>${combo.account}</b><span>${combo.material}</span><small>${combo.reason || '运营手动新增组合'}</small></div>
              <label class="budget-edit ${budgetOver ? 'over' : ''}"><span>预算占比</span><input type="number" min="0" max="100" step="1" value="${budgetValue(combo.budget)}" data-action="budget-input" data-index="${index}" /><em>%</em></label>
              <button class="mini-btn danger-lite" data-action="delete-combo" data-index="${index}">删除</button>
            </div>
          `).join('')}
        </div>
        <div class="budget-summary ${budgetOver ? 'over' : ''}">
          <b>预算占比合计 ${budgetTotal}%</b>
          <span>${budgetOver ? '已超过100%，请下调后再进入发布审核' : `剩余可分配 ${100 - budgetTotal}%`}</span>
        </div>
        <div class="combo-add-panel">
          <div>
            <b>新增组合</b>
            <span>选择一个抖音号和一个视频素材</span>
          </div>
          <select id="comboAccountSelect">
            <option>星辰老房翻新号</option>
            <option>浦东门店号</option>
            <option>设计师阿林</option>
          </select>
          <select id="comboMaterialSelect">
            <option>老房前后对比 v2.1</option>
            <option>报价避坑口播 v1.3</option>
            <option>老房设计师讲解 v1</option>
          </select>
          <button class="mini-btn" data-action="add-combo">新增组合</button>
        </div>
        <div class="step-action-row bottom-actions"><button class="mini-btn" data-action="create-prev-step">返回解析结果</button><button class="btn" data-action="create-next-step" ${budgetOver ? 'disabled' : ''}>确认组合，进入发布审核</button></div>
      `;
    }
    if (state.createStep === 2) {
      const allReviewed = state.createPublish.every(item => item.status === '审核通过' || item.status === '投流中');
      const hasUnpublished = state.createPublish.some(item => item.status === '待发布');
      return `
        <div class="publish-stage">
          <div class="publish-toolbar">
            <div>
              <b>发布审核并投流</b>
              <span>${state.createPublish.filter(item => item.status === '投流中').length}/${state.createPublish.length} 已投流</span>
            </div>
            <div class="publish-toolbar-actions">
              <button class="btn" data-action="publish-all" ${hasUnpublished ? '' : 'disabled'}>一键发布</button>
              <button class="btn ${allReviewed ? '' : 'secondary'}" data-action="launch-all" ${allReviewed ? '' : 'disabled'}>一键投放</button>
              <button class="mini-btn" data-action="create-prev-step">返回组合方案</button>
            </div>
          </div>
          <div class="publish-list">
            ${state.createPublish.map((item, index) => {
              const tone = item.status === '投流中' || item.status === '审核通过' ? 'good' : item.status === '审核中' ? 'warn' : 'blue';
              const actionButton = item.status === '待发布'
                ? `<button class="mini-btn" data-action="publish-one" data-index="${index}">发布视频</button>`
                : item.status === '审核中'
                  ? `<button class="mini-btn" disabled>审核中</button>`
                  : item.status === '审核通过'
                    ? `<button class="mini-btn" data-action="launch-one" data-index="${index}">投放</button>`
                    : `<button class="mini-btn" data-action="quick-action" data-label="查看投放">查看投放</button>`;
              return `
              <div class="publish-row ${tone}">
                <div class="publish-index">${index + 1}</div>
                <div class="publish-main"><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
                <div class="publish-flow">
                  <span class="${['审核中','审核通过','投流中'].includes(item.status) ? 'done' : 'active'}">发布</span>
                  <span class="${item.status === '审核中' ? 'active' : ['审核通过','投流中'].includes(item.status) ? 'done' : ''}">审核</span>
                  <span class="${item.status === '投流中' ? 'done' : item.status === '审核通过' ? 'active' : ''}">投流</span>
                </div>
                ${tag(item.status, tone)}
                <div class="publish-actions">${actionButton}</div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
      `;
    }
    if (state.createStep === 3) {
      return executionMonitorPage();
    }
    if (state.createStage === 'input') {
      return `
        <div class="ai-task-layout">
          <div class="ai-task-main">
            <section class="ai-task-card">
              <div class="ai-task-head">
                <span class="magic-icon">✣</span>
                <div>
                  <b>给AI操盘手下达投放任务</b>
                  <p>请尽可能详细地描述你的投放需求，AI将为你解析并生成完整的投放计划。</p>
                </div>
                <button class="example-link" data-action="quick-action" data-label="试试示例任务">⌖ 不知道怎么写？试试示例任务</button>
              </div>
              <div class="prompt-box">
                <textarea rows="7">帮我在上海浦东老房翻新，预算1.2万，先测试报价类和前后对比素材，周期7天。</textarea>
                <span>36 / 1000</span>
              </div>
              <div class="prompt-actions">
                <button class="mode-btn active">T 文字描述</button>
                <button class="mode-btn">◉ 按住说话</button>
                <button class="mode-btn">▣ 导入文件</button>
                <em>支持 .doc / .txt / .pdf</em>
                <button class="btn parse-btn" data-action="ai-parse-start">AI开始解析 →</button>
              </div>
            </section>
            <div class="ai-dimension-grid">
              ${[
                ['◎', '投放目标', '明确核心目标与量化指标', '如：获取线索、表单提交'],
                ['♙', '地域人群', '精准定位人群与投放地域', '如：上海浦东，30-45岁'],
                ['¥', '预算设置', '合理分配预算与出价策略', '如：预算1.2万，CPM出价'],
                ['▧', '素材方向', '创意方向与素材组合策略', '如：报价类、前后对比']
              ].map(([icon, title, desc, sample]) => `
                <div class="ai-dimension-card">
                  <i>${icon}</i>
                  <b>${title}</b>
                  <span>${desc}</span>
                  <em>${sample}</em>
                </div>
              `).join('')}
            </div>
          </div>
          <aside class="ai-output-card">
            <div class="side-card">
              <h3>✣ AI将输出什么</h3>
              ${[
                ['投放目标', '明确你的核心目标与预期效果'],
                ['人群地域', '精准定位目标人群与投放地域'],
                ['素材方向', '推荐素材创意方向与测试策略'],
                ['预算周期', '合理分配预算与投放时间周期']
              ].map(([title, text]) => `<div class="output-item"><i></i><b>${title}</b><span>${text}</span></div>`).join('')}
            </div>
            <div class="side-card example-card">
              <h3>▣ 示例任务 <button data-action="quick-action" data-label="换一换">换一换</button></h3>
              <p>北京二手房局改，预算8000，测试户型案例素材</p>
              <p>杭州全屋定制，预算1.5万，测试环保卖点素材</p>
              <p>深圳办公室装修，预算2万，测试性价比素材</p>
            </div>
          </aside>
        </div>
      `;
    }
    return `
      <div class="step-stage-note">
        <b>AI已解析出计划配置</b>
        <p>AI已自动填入识别到的字段，未识别内容需要手动补充后匹配投放组合。</p>
      </div>
      <div class="plan-config-form">
        <label class="field-label">获客方向<input value="老房翻新" /></label>
        <label class="field-label">投放城市<input value="上海" /></label>
        <label class="field-label">投放区域<input value="浦东" /></label>
        <label class="field-label">总预算<input value="¥12,000" /></label>
        <label class="field-label">投放周期<input value="7天" /></label>
        <label class="field-label">素材偏好<select><option>报价口播 / 前后对比素材</option><option>报价图文</option><option>设计师口播</option></select></label>
        <label class="field-label">账号范围<select><option>优先已授权账号</option><option>全部可投账号</option></select></label>
        <label class="field-label needs-fill">特殊要求<textarea rows="3" placeholder="请输入AI未识别到的投放限制、排除素材、区域偏好等"></textarea></label>
      </div>
      <div class="step-action-row"><button class="btn" data-action="create-next-step">匹配投放组合</button><button class="mini-btn" data-action="ai-parse-reset">重新输入</button></div>
    `;
  }

  function legacyPlanDetailBody(plan) {
    if (plan.stepIndex === 2) {
      return `
        <div class="combo-stage-list">
          ${planCombos(plan).map(item => `
            <div class="combo-stage-item ${item.tone}">
              <div><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
              ${tag(item.publishStatus, statusTone(item.publishStatus))}
              <button class="mini-btn" data-action="quick-action" data-label="${item.action}">${item.action}</button>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (plan.stepIndex >= 3) {
      return `
        <div class="plan-monitor-grid">
          <div class="plan-monitor-chart">${planPerformanceChart(plan)}</div>
          <div class="combo-stage-list">
            ${planCombos(plan).map(item => `
              <div class="combo-stage-item ${item.tone}">
                <div><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
                <strong>${item.spend} / ${item.leads}条 / ${item.cost}</strong>
                ${tag(item.ai, item.tone)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    return `
      <div class="combo-stage-list">
        ${planCombos(plan).map(item => `
          <div class="combo-stage-item ${item.tone}">
            <div><b>${item.name}</b><span>${item.account} · ${item.material}</span></div>
            ${tag(item.budgetShare, 'blue')}
            <button class="mini-btn" data-action="quick-action" data-label="调整组合">调整组合</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPlanDetail() {
    const plan = selectedPlan();
    const activeStep = state.planStep ?? plan.stepIndex;
    const stepNames = ['AI解析计划', '组合方案', '发布审核并投流', '监控调控'];
    return `
      <div class="plan-detail-page">
        <div class="plan-detail-top">
          <button class="mini-btn" data-action="plan-list">返回计划列表</button>
          <div><h3>${plan.name}</h3><p>${plan.direction} · ${plan.city}/${plan.area}</p></div>
          <div class="plan-detail-tags">${tag(plan.status, plan.tone)}${tag(stepNames[activeStep], 'blue')}</div>
        </div>
        <div class="plan-detail-kpis">
          ${UI.info('总预算', plan.totalBudget)}
          ${UI.info('已消耗', plan.spent)}
          ${UI.info('已获客资', `${plan.leads}条`)}
          ${UI.info('客资成本', plan.cost)}
          ${UI.info('下一步动作', plan.nextAction)}
        </div>
        ${planSteps(activeStep, plan.stepIndex)}
        <section class="plan-detail-grid">
          <div class="card card-pad plan-stage-card">
            <div class="dash-head"><h3>${stepNames[activeStep]}</h3>${tag(plan.ai, plan.tone)}</div>
            ${planDetailBody(plan, activeStep)}
          </div>
          <aside class="card card-pad plan-log-card">
            <div class="dash-head"><h3>AI工作日志</h3>${tag('当前计划', 'blue')}</div>
            <div class="plan-log-list">
              ${planLogs(plan).map(item => `<div><time>${item.time}</time><b>${item.title}</b><p>${item.text}</p></div>`).join('')}
            </div>
          </aside>
        </section>
      </div>
    `;
  }

  function renderPlanCreate() {
    const isMonitoring = state.createStep === 3;
    return `
      <div class="plan-detail-page ${isMonitoring ? 'monitor-mode' : 'create-mode'}">
        <div class="plan-detail-top">
          <button class="mini-btn" data-action="plan-list">返回计划列表</button>
          <div><h3>${isMonitoring ? '投放执行监控' : '创建投放计划'}</h3><p>${isMonitoring ? '老房翻新获客计划 · 运行中' : '用一句话、语音输入或文件导入，让AI先解析计划配置。'}</p></div>
          ${tag('AI解析计划', 'blue')}
        </div>
        ${planSteps(state.createStep, state.createMaxStep)}
        <section class="plan-create-canvas">${planCreateBody()}</section>
      </div>
    `;
  }

  function renderAuthorization() {
    const auth = data.giantAuth;
    const meta = authStatusMeta();
    const isReady = isGiantAuthReady();
    const canDeliverCount = auth.accounts.filter(item => item.deliveryStatus === '可投放').length;
    const canShowTable = isReady || auth.status === 'expired' || auth.status === 'error' || auth.status === 'syncFailed';
    const rows = isReady ? auth.accounts.map(item => `
      <tr class="risk-row ${item.tone}">
        <td><b>${item.name}</b><span>${item.reason}</span></td>
        <td>${item.platform}</td>
        <td>${item.type}</td>
        <td>${tag(item.authStatus, item.authStatus === '已授权' ? 'good' : 'bad')}</td>
        <td>${tag(item.deliveryStatus, item.deliveryStatus === '可投放' ? 'good' : 'warn')}</td>
        <td>${item.syncedAt}</td>
        <td>${actionButtons(['查看详情', '刷新状态', '查看原因'])}</td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="7">
          <div class="auth-table-empty">
            <b>${meta.title}</b>
            <span>${meta.desc}</span>
          </div>
        </td>
      </tr>
    `;
    const managePanel = `
      <section class="card card-pad auth-status-card ${meta.tone}">
        <div class="dash-head"><h3>当前授权状态</h3>${tag('P0 仅支持绑定 1 个巨量引擎账号', 'blue')}</div>
        <div class="auth-kpi-grid">
          ${UI.info('授权状态', meta.label)}
          ${UI.info('巨量引擎账户名称', auth.accountName)}
          ${UI.info('账户ID', auth.accountId)}
          ${UI.info('授权主体', auth.subject)}
          ${UI.info('授权时间', auth.authorizedAt)}
          ${UI.info('授权到期时间', auth.expiresAt)}
          ${UI.info('账户余额', auth.balance)}
          ${UI.info('可投账号数量', `${canDeliverCount} / ${auth.accounts.length}`)}
        </div>
        <div class="auth-actions">
          <button class="btn" data-action="sync-auth-account">同步账号</button>
          <button class="mini-btn" data-action="reauth-giant">重新授权</button>
          <button class="mini-btn danger-lite" data-action="unbind-giant">解除绑定</button>
        </div>
      </section>
    `;
    const emptyPanel = `
      <section class="card card-pad auth-status-card ${meta.tone}">
        <div class="dash-head"><h3>首次绑定入口</h3>${tag('P0 单账号绑定', 'warn')}</div>
        <div class="auth-empty-state ${meta.tone}">
          <div class="auth-empty-icon">+</div>
          <b>尚未绑定巨量引擎账号</b>
          <p>完成授权后，系统将自动同步账户余额、可投放账号和投放数据。</p>
          <div class="auth-capability-grid">
            ${['同步可投账号', '账户余额', '投放数据'].map(item => `<span>${item}</span>`).join('')}
          </div>
          <button class="btn" data-action="authorize-giant">立即授权巨量引擎</button>
        </div>
      </section>
    `;
    const redirectPanel = `
      <section class="card card-pad auth-process-card">
        <div class="auth-process-head">
          <div class="auth-process-pulse"></div>
          <div>
            <h3>正在跳转巨量引擎授权页面</h3>
            <p>请在巨量引擎授权页确认授权，系统将通过回调继续完成绑定。</p>
          </div>
          ${tag('授权中', 'blue')}
        </div>
        ${authStepList(['发起授权请求', '等待巨量引擎确认', '回调系统并同步数据'], 1, 0)}
        <div class="auth-flow-actions">
          <button class="mini-btn" data-action="auth-flow-reset">返回</button>
          <button class="mini-btn danger-lite" data-action="simulate-auth-failed">模拟授权失败</button>
        </div>
      </section>
    `;
    const confirmPanel = `
      <section class="card card-pad auth-status-card blue">
        <div class="dash-head"><h3>授权成功</h3>${tag('待确认绑定', 'blue')}</div>
        <div class="auth-confirm-copy">
          <b>已获取巨量引擎授权，请确认本次绑定账户信息</b>
          <span>确认后系统将同步账户基本信息、可投放账号、账户余额与投放数据能力。</span>
        </div>
        <div class="auth-kpi-grid">
          ${UI.info('巨量引擎账户名称', auth.accountName)}
          ${UI.info('账户ID', auth.accountId)}
          ${UI.info('授权主体', auth.subject)}
          ${UI.info('授权时间', auth.authorizedAt)}
          ${UI.info('账户余额', auth.balance)}
          ${UI.info('可同步账号数', `${auth.availableAccountCount} 个`)}
        </div>
        <div class="auth-actions">
          <button class="mini-btn" data-action="auth-flow-reset">返回修改</button>
          <button class="btn" data-action="confirm-bind-sync">确认绑定并同步账号</button>
        </div>
      </section>
    `;
    const syncPanel = `
      <section class="card card-pad auth-process-card">
        <div class="auth-process-head">
          <div class="auth-process-pulse"></div>
          <div>
            <h3>正在同步巨量引擎账号信息</h3>
            <p>系统正在完成绑定后的账户数据初始化，请稍候。</p>
          </div>
          ${tag('同步中', 'blue')}
        </div>
        ${authStepList(['同步账户基本信息', '同步可投放账号', '同步授权状态', '完成绑定'], 2, 1)}
        <div class="auth-flow-actions">
          <button class="mini-btn danger-lite" data-action="simulate-sync-failed">模拟同步失败</button>
        </div>
      </section>
    `;
    const errorPanel = `
      <section class="card card-pad auth-status-card bad">
        <div class="dash-head"><h3>${meta.title}</h3>${tag(meta.label, 'bad')}</div>
        <div class="auth-empty-state bad">
          <div class="auth-empty-icon">!</div>
          <b>${meta.title}</b>
          <p>${meta.desc}</p>
          <div class="auth-actions compact">
            ${auth.status === 'syncFailed' ? '<button class="btn" data-action="confirm-bind-sync">重试同步</button>' : auth.status === 'expired' || auth.status === 'error' ? '<button class="btn" data-action="reauth-giant">重新授权</button>' : '<button class="btn" data-action="authorize-giant">重新发起授权</button>'}
            <button class="mini-btn" data-action="${auth.status === 'expired' || auth.status === 'error' ? 'unbind-giant' : 'auth-flow-reset'}">${auth.status === 'expired' || auth.status === 'error' ? '解除绑定' : '返回未绑定状态'}</button>
          </div>
        </div>
      </section>
    `;
    const panelMap = {
      authorized: managePanel,
      expired: errorPanel,
      error: errorPanel,
      unbound: emptyPanel,
      authorizing: redirectPanel,
      confirm: confirmPanel,
      syncing: syncPanel,
      authFailed: errorPanel,
      syncFailed: errorPanel
    };
    const authModal = state.authModal ? `
      <div class="auth-modal-layer">
        <div class="auth-modal">
          <div class="modal-head"><h3>${state.authModal === 'bind' ? '开始绑定巨量引擎账号' : '需要先解除当前绑定'}</h3><button class="mini-btn" data-action="close-auth-modal">关闭</button></div>
          ${state.authModal === 'bind' ? `
            <p>即将跳转巨量引擎授权。授权成功后，系统将同步账户信息、可投放账号、余额及投放数据能力。</p>
            <div class="auth-modal-warning">${tag('当前版本仅支持绑定 1 个巨量引擎账号', 'warn')}<span>如需更换账号，请先解除当前绑定。</span></div>
            <div class="modal-actions"><button class="btn secondary" data-action="close-auth-modal">取消</button><button class="btn" data-action="go-giant-auth">去授权</button></div>
          ` : `
            <p>当前系统账号已绑定 1 个巨量引擎账号。P0 阶段暂不支持再次绑定或直接更换授权。</p>
            <div class="auth-modal-warning">${tag('更换账号规则', 'warn')}<span>请先解除当前绑定，再重新发起授权。</span></div>
            <div class="modal-actions"><button class="btn secondary" data-action="close-auth-modal">知道了</button><button class="mini-btn danger-lite" data-action="unbind-giant">解除绑定</button></div>
          `}
        </div>
      </div>
    ` : '';
    return `
      <div class="auth-page">
        <section class="auth-hero">
          <div>
            <h3>巨量引擎授权管理</h3>
            <p>绑定巨量引擎账号后，系统可同步可投放账号、账户余额、投放数据，并支持后续投放计划创建与监控调优。</p>
          </div>
          ${tag(meta.label, meta.tone)}
        </section>
        ${panelMap[auth.status] || emptyPanel}
        <section class="card card-pad section ${canShowTable ? '' : 'auth-muted-section'}">
          <div class="dash-head"><h3>可投放账号列表</h3>${tag(isReady ? `最近同步 ${auth.lastSyncAt}` : '等待授权后同步', isReady ? 'good' : 'warn')}</div>
          ${UI.table(['账号名称', '平台', '账号类型', '授权状态', '可投放状态', '最近同步时间', '操作'], [rows])}
        </section>
        <section class="card card-pad section auth-note-card">
          <div class="dash-head"><h3>授权说明</h3>${tag('长期支持多账号', 'blue')}</div>
          <p>当前版本仅支持绑定 1 个巨量引擎账号。如需更换账户，请先解除当前绑定后重新授权。后续版本将支持多巨量引擎账户管理。</p>
        </section>
        ${authModal}
      </div>
    `;
  }

  function renderMaterials() {
    const statusTabs = ['全部素材', '视频素材', '图文素材', '多次投放', '待复盘'];
    const rows = data.materialRecommendations.map(item => `
      <tr class="risk-row ${item.tone}">
        <td><div class="material-title"><img src="${item.image}" alt="" /><div><b>${item.name}</b><span>${item.source}</span></div></div></td>
        <td>${item.type}</td>
        <td>${item.direction}</td>
        <td>${item.used}</td>
        <td>${item.performance}</td>
        <td>${item.bestCombo}</td>
        <td>${item.weakCombo}</td>
        <td>${item.costRange}</td>
        <td>${item.ai}</td>
        <td>${actionButtons(['看投放记录', '加入组合'])}</td>
      </tr>
    `).join('');
    return `
      <div class="operator-page">
        <section class="cockpit-business-filter">${statusTabs.map((name, index) => `<button class="${index === 0 ? 'active' : ''}" data-action="quick-action" data-label="${name}">${name}</button>`).join('')}</section>
        <div class="grid-4 section">
          ${UI.metric({ label: '素材库存', value: '42 条', trend: '外部平台同步', tone: 'green' })}
          ${UI.metric({ label: '多次投放素材', value: '18 条', trend: '可做组合复盘', tone: 'cyan' })}
          ${UI.metric({ label: '高流量组合', value: '11 组', trend: '账号/计划相关', tone: 'green' })}
          ${UI.metric({ label: '待复盘组合', value: '7 组', trend: '同素材表现分化', tone: 'purple', warn: true })}
        </div>
        <div class="card card-pad section">
          <div class="dash-head"><h3>素材库</h3>${tag('素材资产 + 多计划表现', 'blue')}</div>
          ${UI.table(['素材/视频', '类型', '获客方向', '投放次数', '表现分布', '高流量组合', '低流量组合', '成本区间', 'AI分析', '操作'], [rows])}
        </div>
      </div>
    `;
  }

  function renderLeadPool() {
    const rows = data.leads.map(item => `
      <tr class="risk-row ${item.tone}">
        <td><b>${item.id}</b><span>已脱敏</span></td>
        <td>${item.source}</td>
        <td>${item.city}</td>
        <td>${item.area}</td>
        <td>${item.demand}</td>
        <td>${tag(item.intent, item.intent === '高意向' ? 'good' : item.intent === '中意向' ? 'warn' : 'bad')}</td>
        <td>${item.budget}</td>
        <td>${item.house}</td>
        <td>${tag(item.distribution, item.tone)}</td>
        <td>${actionButtons(['查看', '推荐分发'])}</td>
      </tr>
    `).join('');
    return `
      <div class="operator-page">
        <div class="grid-4">
          ${UI.metric({ label: '今日客资', value: '16 条', trend: '投放回流', tone: 'green' })}
          ${UI.metric({ label: '可分发客资', value: '12 条', trend: '等待处理', tone: 'cyan' })}
          ${UI.metric({ label: '待分发', value: '4 条', trend: '轻量展示', tone: 'purple', warn: true })}
          ${UI.metric({ label: '暂不分发', value: '1 条', trend: '预算不明', tone: 'green', warn: true })}
        </div>
        <div class="card card-pad section">
          <div class="dash-head"><h3>客资池</h3>${tag('结果展示', 'blue')}</div>
          ${UI.table(['客资ID', '来源组合', '城市', '区域', '需求分类', '意向等级', '预算', '房屋类型', '分发状态', '操作'], [rows])}
        </div>
      </div>
    `;
  }

  function renderDistribution() {
    const rows = data.distributions.map(item => `
      <tr class="risk-row ${item.tone}">
        <td><b>${item.lead}</b><span>${item.city}</span></td>
        <td>${item.demand}</td>
        <td>${item.recommended}</td>
        <td>${item.reason}</td>
        <td>${tag(item.status, item.tone)}</td>
        <td>${actionButtons([item.action, '暂缓'])}</td>
      </tr>
    `).join('');
    return `
      <div class="operator-page">
        <div class="grid-4">
          ${UI.metric({ label: '待分发', value: '4 条', trend: '轻量确认', tone: 'green', warn: true })}
          ${UI.metric({ label: 'AI已推荐', value: '3 条', trend: '按城市/业务', tone: 'cyan' })}
          ${UI.metric({ label: '今日分发', value: '12 条', trend: '成功 10 条', tone: 'green' })}
          ${UI.metric({ label: '需复核', value: '1 条', trend: '预算待确认', tone: 'purple', warn: true })}
        </div>
        <div class="card card-pad section">
          <div class="dash-head"><h3>线索分发</h3>${tag('轻量结果流', 'warn')}</div>
          ${UI.table(['待分发客资', '需求类型', 'AI推荐装企', '推荐原因', '分发状态', '操作'], [rows])}
        </div>
      </div>
    `;
  }

  function renderCompanies() {
    const rows = data.contractors.map(item => `
      <tr class="risk-row ${item.tone}" data-action="customer-detail" data-name="${item.name}">
        <td><b>${item.name}</b></td>
        <td>${item.city}</td>
        <td>${item.business}</td>
        <td>${item.area}</td>
        <td>${item.assigned}条</td>
        <td>${item.feedback}</td>
        <td>${item.dealRate}</td>
        <td>${tag(item.status, item.tone)}</td>
        <td>${actionButtons(['查看承接'])}</td>
      </tr>
    `).join('');
    return `
      <div class="operator-page">
        <div class="grid-4">
          ${UI.metric({ label: '承接装企', value: `${data.contractors.length} 家`, trend: '按城市匹配', tone: 'green' })}
          ${UI.metric({ label: '今日已分发', value: '12 条', trend: '轻量展示', tone: 'cyan' })}
          ${UI.metric({ label: '反馈异常', value: '1 家', trend: '需观察', tone: 'purple', warn: true })}
          ${UI.metric({ label: '平均反馈率', value: '74%', trend: '仅作参考', tone: 'green' })}
        </div>
        <div class="card card-pad section">
          <div class="dash-head"><h3>装企承接</h3>${tag('线索承接方', 'blue')}</div>
          ${UI.table(['装企名称', '城市', '可承接业务', '服务区域', '今日已分发', '反馈率', '成交率', '承接状态', '操作'], [rows])}
        </div>
      </div>
    `;
  }

  function openPlanModal() {
    state.pendingPlan = {
      name: '老房翻新6月加量计划',
      direction: '老房翻新',
      city: '上海',
      area: '浦东 / 徐汇',
      totalBudget: '¥12,000',
      period: '7天'
    };
    $('#planModal .modal-head h3').textContent = '创建获客计划 · AI生成投放组合';
    $('#planModal .modal-actions').innerHTML = `
      <button class="btn" data-action="confirm-plan">提交发布审核</button>
      <button class="btn secondary" data-action="close-modal">继续调整</button>
    `;
    $('#modalBody').innerHTML = `
      <div class="plan-flow compact-flow">
        ${['填写基础目标', 'AI匹配账号', 'AI推荐素材', '选择投放组合', '发布视频审核', '审核通过投流'].map((step, index) => `<span>${index + 1}. ${step}</span>`).join('')}
      </div>
      <div class="grid-2 section">
        ${UI.info('获客方向', state.pendingPlan.direction)}
        ${UI.info('城市/区域', `${state.pendingPlan.city} · ${state.pendingPlan.area}`)}
        ${UI.info('总预算', state.pendingPlan.totalBudget)}
        ${UI.info('投放周期', state.pendingPlan.period)}
        ${UI.info('参考客资成本', 'AI生成，非必填')}
        ${UI.info('账号/素材', 'AI默认匹配，人工可改')}
      </div>
      <div class="combo-choice-head section">
        <div>
          <b>AI投放组合方案</b>
          <p>默认勾选AI推荐组合，运营可以取消、调整预算占比，或新增一组自定义组合后再上线。</p>
        </div>
        <button class="mini-btn" data-action="quick-action" data-label="新增自定义组合">新增自定义组合</button>
      </div>
      <div class="combo-draft section">
        ${[
          ['组合A', '星辰老房翻新号', '老房前后对比 v2.1 / 报价避坑口播', '45%', '待发布', '账号近7天老房翻新成本低，素材在该账号复投数据稳定', 'checked'],
          ['组合B', '浦东门店号', '报价避坑口播 v1.3', '35%', '待发布', '更容易吸引浦东报价咨询用户', 'checked'],
          ['组合C', '设计师阿林', '老房设计师讲解 v1', '20%', '待发布', '小预算测试设计需求，AI建议先观察', 'checked'],
          ['自定义组合', '选择抖音号', '选择素材/视频', '0%', '待配置', '运营可自行指定账号、素材和预算占比', '']
        ].map(([name, account, material, budget, status, reason, checked]) => `
          <div class="asset-card combo-option ${checked ? 'selected' : ''}">
            <div class="combo-option-head">
              <label class="combo-check">
                <input type="checkbox" ${checked ? 'checked' : ''} />
                <span></span>
                <b>${name}</b>
              </label>
              <div class="combo-tags">${tag(status, statusTone(status))}${tag(`预算占比 ${budget}`, checked ? 'blue' : 'gray')}</div>
            </div>
            <div class="combo-option-grid">
              <div>
                <label>抖音号</label>
                <strong>${account}</strong>
              </div>
              <div>
                <label>素材/视频</label>
                <strong>${material}</strong>
              </div>
              <div>
                <label>预算占比</label>
                <strong>${budget}</strong>
              </div>
              <div>
                <label>投放前状态</label>
                <strong>${status}</strong>
              </div>
            </div>
            <p class="weak mt-2 text-xs">推荐原因：${reason}</p>
            <div class="actions mt-3">
              <button class="mini-btn" data-action="quick-action" data-label="调整账号">调整账号</button>
              <button class="mini-btn" data-action="quick-action" data-label="替换素材">替换素材</button>
              <button class="mini-btn" data-action="quick-action" data-label="调整预算占比">调整预算</button>
              <button class="mini-btn" data-action="quick-action" data-label="发布视频">发布视频</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    $('#planModal').classList.add('show');
  }

  function closePlanModal() {
    $('#planModal').classList.remove('show');
  }

  function confirmPlan() {
    const p = state.pendingPlan;
    data.plans.unshift({
      name: p.name,
      direction: p.direction,
      city: p.city,
      area: p.area,
      totalBudget: p.totalBudget,
      period: '06-23 至 06-30',
      pace: 'AI均衡消耗',
      materialType: '前后对比 / 报价口播',
      materialCount: 5,
      accountCount: 3,
      status: '待上线',
      ai: '已生成3个投放组合，等待视频发布审核',
      tone: 'blue'
    });
    closePlanModal();
    setPage('acquisition');
    toast('获客计划已创建，组合进入视频发布审核流程');
  }

  function render() {
    const pages = {
      home: renderHome,
      acquisition: renderAcquisition,
      auth: renderAuthorization,
      materials: renderMaterials,
      leads: renderLeadPool,
      distribution: renderDistribution,
      companies: renderCompanies
    };
    $('#view').innerHTML = pages[state.page]();
    updateMonitorChrome();
  }

  function handleClick(event) {
    const navBtn = event.target.closest('.nav-btn');
    if (navBtn) return setPage(navBtn.dataset.page);

    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    if (action === 'start-app') return startApp();
    if (action === 'logout') return toast('已退出登录');
    if (action === 'customer-detail') return toast(`查看装企承接：${actionEl.dataset.name}`);
    if (action === 'plan-create') {
      if (!isGiantAuthReady()) {
        setPage('auth');
        return toast('创建投放计划前请先完成巨量引擎授权');
      }
      clearPublishAuditTimers();
      state.planView = 'create';
      state.createStep = 0;
      state.createMaxStep = 0;
      state.createStage = 'input';
      state.createPublish = initialPublishCombos();
      state.createComboSerial = 4;
      render();
      return;
    }
    if (action === 'plan-list') {
      clearPublishAuditTimers();
      state.planView = 'list';
      state.planStep = null;
      render();
      return;
    }
    if (action === 'plan-detail') {
      state.selectedPlanId = actionEl.dataset.planId;
      state.planView = 'detail';
      state.planStep = selectedPlan().stepIndex;
      render();
      return;
    }
    if (action === 'plan-step') {
      if (actionEl.disabled) return;
      if (state.planView === 'create') {
        state.createStep = Number(actionEl.dataset.step);
        if (state.createStep > 0 && state.createStage !== 'result') state.createStage = 'result';
        render();
        return;
      }
      state.planStep = Number(actionEl.dataset.step);
      render();
      return;
    }
    if (action === 'plan-next-step') {
      const plan = selectedPlan();
      const current = state.planStep ?? plan.stepIndex;
      state.planStep = Math.min(current + 1, 3);
      render();
      return toast('已进入下一步');
    }
    if (action === 'ai-parse-start') {
      if (!isGiantAuthReady()) {
        setPage('auth');
        return toast('创建投放计划前请先完成巨量引擎授权');
      }
      showAiFullscreenLoader(() => {
        state.createStage = 'result';
        state.createStep = 0;
        render();
        toast('AI已完成计划解析');
      });
      return;
    }
    if (action === 'ai-parse-reset') {
      clearPublishAuditTimers();
      state.createStage = 'input';
      state.createStep = 0;
      state.createMaxStep = 0;
      state.createPublish = initialPublishCombos();
      state.createComboSerial = 4;
      render();
      return;
    }
    if (action === 'create-next-step') {
      if (state.planView === 'create' && !isGiantAuthReady()) {
        setPage('auth');
        return toast('创建投放计划前请先完成巨量引擎授权');
      }
      if (state.planView === 'create' && state.createStep === 1 && comboBudgetTotal() > 100) {
        return toast('预算占比合计不能超过100%');
      }
      if (state.planView === 'create' && state.createStep === 0 && state.createStage === 'result') {
        showAiFullscreenLoader(() => {
          state.createStage = 'result';
          state.createStep = 1;
          state.createMaxStep = Math.max(state.createMaxStep, 1);
          render();
          toast('AI已完成投放组合匹配');
        });
        return;
      }
      state.createStage = 'result';
      state.createStep = Math.min(state.createStep + 1, 3);
      state.createMaxStep = Math.max(state.createMaxStep, state.createStep);
      render();
      return toast('已进入下一步');
    }
    if (action === 'create-prev-step') {
      state.createStep = Math.max(state.createStep - 1, 0);
      render();
      return;
    }
    if (action === 'delete-combo') {
      if (state.createPublish.length <= 1) return toast('至少保留一个组合');
      const index = Number(actionEl.dataset.index);
      const removed = state.createPublish.splice(index, 1)[0];
      render();
      return toast(`${removed?.name || '组合'}已删除`);
    }
    if (action === 'add-combo') {
      const account = $('#comboAccountSelect')?.value || '星辰老房翻新号';
      const material = $('#comboMaterialSelect')?.value || '老房前后对比 v2.1';
      const name = `组合${String.fromCharCode(64 + state.createComboSerial)}`;
      state.createComboSerial += 1;
      state.createPublish.push({
        name,
        account,
        material,
        budget: '0%',
        reason: '运营手动新增组合',
        status: '待发布'
      });
      render();
      return toast(`${name}已新增`);
    }
    if (action === 'publish-one') {
      const index = Number(actionEl.dataset.index);
      const item = state.createPublish[index];
      if (item) {
        item.status = '审核中';
        scheduleAuditPass(index);
      }
      render();
      return toast('已发布视频，正在审核');
    }
    if (action === 'publish-all') {
      state.createPublish.forEach((item, index) => {
        if (item.status === '待发布') {
          item.status = '审核中';
          scheduleAuditPass(index, 700 + index * 450);
        }
      });
      render();
      return toast('已一键发布，自动进入审核');
    }
    if (action === 'approve-one') {
      const item = state.createPublish[Number(actionEl.dataset.index)];
      if (item) item.status = '审核通过';
      render();
      return toast('视频审核通过');
    }
    if (action === 'launch-one') {
      const item = state.createPublish[Number(actionEl.dataset.index)];
      if (item) item.status = '投流中';
      if (state.createPublish.every(row => row.status === '投流中')) {
        state.createStep = 3;
        state.createMaxStep = 3;
      }
      render();
      return toast('已启动投放');
    }
    if (action === 'launch-all') {
      state.createPublish.forEach(item => {
        if (item.status === '审核通过') item.status = '投流中';
      });
      state.createStep = 3;
      state.createMaxStep = 3;
      render();
      return toast('已一键投放，进入监控');
    }
    if (action === 'go-monitor-dashboard') {
      state.planView = 'list';
      state.planStep = null;
      return setPage('home');
    }
    if (action === 'authorize-giant' || action === 'reauth-giant') {
      if (['authorized', 'expired', 'error'].includes(data.giantAuth.status)) {
        state.authModal = 'bound';
        render();
        return toast('当前已绑定账号，请先解除绑定后重新授权');
      }
      state.authModal = 'bind';
      render();
      return;
    }
    if (action === 'close-auth-modal') {
      state.authModal = null;
      render();
      return;
    }
    if (action === 'go-giant-auth') {
      state.authModal = null;
      beginAuthRedirect();
      return toast('正在跳转巨量引擎授权页面');
    }
    if (action === 'auth-flow-reset') {
      clearAuthFlowTimer();
      data.giantAuth.status = 'unbound';
      state.authModal = null;
      render();
      return toast('已返回未绑定状态');
    }
    if (action === 'simulate-auth-failed') {
      clearAuthFlowTimer();
      data.giantAuth.status = 'authFailed';
      render();
      return toast('授权失败，请重新发起授权');
    }
    if (action === 'confirm-bind-sync') {
      beginAccountSync();
      return toast('正在同步巨量引擎账号信息');
    }
    if (action === 'simulate-sync-failed') {
      clearAuthFlowTimer();
      data.giantAuth.status = 'syncFailed';
      render();
      return toast('同步失败，请重试同步');
    }
    if (action === 'sync-auth-account') {
      beginAccountSync();
      return toast('正在同步可投放账号状态');
    }
    if (action === 'unbind-giant') {
      clearAuthFlowTimer();
      data.giantAuth.status = 'unbound';
      state.authModal = null;
      render();
      return toast('已解除当前巨量引擎账号绑定');
    }
    if (action === 'quick-action') return toast(`${actionEl.dataset.label || actionEl.textContent.trim()}已记录`);
    if (action === 'dash-filter') {
      state.dashFilter = actionEl.dataset.filter;
      state.dashEntity = dimensionOptions()[0].label;
      render();
      return toast(`已切换为${state.dashFilter}`);
    }
    if (action === 'dash-entity') {
      state.dashEntity = actionEl.dataset.entity;
      render();
      return toast(`已切换对象：${state.dashEntity}`);
    }
    if (action === 'dash-grain') {
      state.dashGrain = actionEl.dataset.grain;
      render();
      return toast(`已切换为${state.dashGrain}`);
    }
    if (action === 'plan-draft') {
      if (!isGiantAuthReady()) {
        setPage('auth');
        return toast('创建投放计划前请先完成巨量引擎授权');
      }
      return openPlanModal();
    }
    if (action === 'close-modal') return closePlanModal();
    if (action === 'confirm-plan') return confirmPlan();
  }

  function handleInput(event) {
    const input = event.target.closest('[data-action="budget-input"]');
    if (!input) return;
    const item = state.createPublish[Number(input.dataset.index)];
    if (!item) return;
    const value = Math.max(0, Math.min(100, Number(input.value || 0)));
    item.budget = `${value}%`;
    render();
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleInput);
  updateChrome();
  renderNav();
  render();
  if (location.hash === '#app') startApp();
})();
