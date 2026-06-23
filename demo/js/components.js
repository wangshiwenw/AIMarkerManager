window.UI = {
  tag(text, type = '') {
    return `<span class="tag ${type}">${text}</span>`;
  },
  metric(item) {
    return `<div class="metric metric-${item.tone || 'green'}"><div class="metric-icon">${item.icon || '●'}</div><div><label>${item.label}</label><b>${item.value}</b><span class="${item.warn ? 'warn' : ''}">${item.trend || ''}</span></div></div>`;
  },
  statusCard(item) {
    return `<div class="asset-card status-card-mini"><div class="mini-icon ${item.status}">${item.icon || '●'}</div><div><p class="weak text-xs">${item.label}</p><b>${item.value}</b></div>${this.tag(item.status === 'warn' ? '提醒' : '正常', item.status)}</div>`;
  },
  info(label, value) {
    return `<div class="asset-card"><p class="weak text-xs">${label}</p><b>${value}</b></div>`;
  },
  kpi(item) {
    return `<div class="kpi-card"><div class="kpi-icon">${item.icon || '●'}</div><div><p class="weak text-xs">${item.label}</p><b>${item.value}</b></div></div>`;
  },
  log(item) {
    return `<div class="panel-item"><div class="list-row"><time class="text-sky text-xs">${item.time}</time><div class="flex-1"><b>${item.title}</b><p class="muted mt-1 text-sm">${item.text}</p></div></div></div>`;
  },
  accountCard(account) {
    const statusType = account.status === '待授权' ? 'warn' : 'good';
    return `<div class="asset-card account-card ${account.primary ? 'primary' : ''}" data-account="${account.id}">
      <div class="list-row">
        <div>
          <h3 class="font-semibold">${account.name}</h3>
          <div class="actions mt-2">${this.tag(account.type, 'blue')}${this.tag(account.status, statusType)}${account.primary ? this.tag('主投账号', 'good') : ''}</div>
        </div>
        ${this.tag(account.advice, statusType)}
      </div>
      <p class="muted mt-3 text-sm">${account.use}</p>
      <div class="grid-4 mt-4">
        ${this.info('今日消耗', account.cost)}
        ${this.info('线索', account.leads)}
        ${this.info('CPA', account.cpa)}
        ${this.info('AI评分', account.score)}
      </div>
      <div class="actions mt-4">
        <button class="mini-btn" data-action="show-account" data-name="${account.name}">查看表现</button>
        <button class="mini-btn" data-action="primary-account" data-id="${account.id}">设为主投</button>
        <button class="mini-btn" data-action="auth-account" data-id="${account.id}">${account.status === '待授权' ? '授权' : '重新授权'}</button>
      </div>
    </div>`;
  },
  productCard(product) {
    const type = product.status === '测试中' ? 'warn' : product.status === '储备' ? 'gray' : 'good';
    return `<div class="asset-card">
      <div class="list-row"><h3 class="font-semibold">${product.name}</h3>${this.tag(product.status, type)}</div>
      <div class="mt-4 list">
        ${this.info('推荐账号', product.account)}
        ${this.info('历史CPA', product.cpa)}
        ${this.info('AI建议', product.advice)}
      </div>
      <div class="actions mt-4">
        <button class="mini-btn" data-action="product-detail" data-name="${product.name}">查看详情</button>
        <button class="mini-btn" data-action="plan-draft" data-product="${product.name}" data-account="${product.account}">生成投放计划</button>
      </div>
    </div>`;
  },
  table(headers, rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  },
  materialRow(m) {
    const publishTone = m.publishStatus === '已发布' || m.publishStatus === '无需发布' ? 'good' : m.publishStatus === '内容审核中' ? 'warn' : 'gray';
    const auditTone = m.adAudit === '广告审核通过' ? 'good' : m.adAudit === '广告审核中' ? 'warn' : m.adAudit === '广告审核未通过' ? 'bad' : 'gray';
    const deliveryTone = m.deliveryStatus === '投放中' || m.deliveryStatus === '可复用' ? 'good' : m.deliveryStatus === '审核中' ? 'warn' : 'gray';
    const tagType = m.tag === '衰减' ? 'warn' : m.tag === '高转化' ? 'good' : 'blue';
    return `<tr><td>${m.name}</td><td>${m.type}</td><td>${m.product}</td><td>${m.account}</td><td>${this.tag(m.publishStatus, publishTone)}</td><td>${this.tag(m.adAudit, auditTone)}</td><td>${this.tag(m.deliveryStatus, deliveryTone)}</td><td>${m.cpa}</td><td>${this.tag(m.tag, tagType)}</td><td>${m.advice}</td><td><button class="mini-btn" data-action="reuse-material" data-name="${m.name}">复用投放</button></td></tr>`;
  },
  planRow(p) {
    const statusType = p.status === '投放中' ? 'good' : p.status === '待审核' || p.status === '观察中' ? 'warn' : p.status === '已暂停' ? 'gray' : 'blue';
    const auditType = p.adAudit === '广告审核通过' ? 'good' : p.adAudit === '广告审核中' ? 'warn' : p.adAudit === '广告审核未通过' ? 'bad' : 'gray';
    return `<tr><td>${p.name}</td><td>${p.business || '-'}</td><td>${p.material || '-'}</td><td>${this.tag(p.adAudit || '未提交', auditType)}</td><td>${this.tag(p.status, statusType)}</td><td>${p.budget}</td><td>${p.cost}</td><td>${p.cpa}</td><td>${p.action}</td></tr>`;
  }
};
