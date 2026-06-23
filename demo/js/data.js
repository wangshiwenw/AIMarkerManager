window.DEMO_DATA = {
  nav: [
    { id: 'home', label: 'AI市场经理', icon: '⌂' },
    { id: 'business', label: '推广业务', icon: '▦' },
    { id: 'assets', label: '账号管理', icon: '▣' },
    { id: 'materials', label: '素材与视频', icon: '▧' },
    { id: 'records', label: '投放记录', icon: '¥' }
  ],
  dashboard: {
    date: '近7天',
    metrics: [
      { label: '今日消耗', value: '¥2,860', trend: '较昨日 +8.2%', tone: 'bad', icon: '¥', series: [18, 20, 19, 28, 21, 25, 23] },
      { label: '今日线索', value: '16 条', trend: '较昨日 +4条', tone: 'good', icon: '●', series: [8, 10, 9, 13, 12, 14, 16] },
      { label: '平均获客成本', value: '¥178 /条', trend: '较昨日 -9.6%', tone: 'good', icon: '◎', series: [210, 198, 186, 195, 182, 168, 178] },
      { label: '当前在投计划', value: '4 个', trend: '1个观察中', tone: 'blue', icon: '▣', progress: 78 },
      { label: '待确认动作', value: '4 项', trend: '较昨日 +1项', tone: 'warn', icon: '◔', bars: [10, 18, 26, 18, 30, 34, 42, 47, 54, 62] },
      { label: '风险预警', value: '4 项', trend: '1项高风险', tone: 'bad', icon: '!', series: [6, 7, 6, 8, 7, 11, 8, 12] }
    ],
    spendTrend: {
      days: ['05-27', '05-28', '05-29', '05-30', '05-31', '06-01', '06-02'],
      spend: [2400, 3100, 2500, 4200, 3400, 4050, 2860],
      leads: [9, 13, 11, 15, 19, 22, 16]
    },
    cpaTrend: {
      days: ['05-27', '05-28', '05-29', '05-30', '05-31', '06-01', '06-02'],
      cpa: [210, 198, 186, 195, 182, 168, 178],
      target: 200
    },
    budget: [
      { label: '老房翻新', value: 42, amount: '¥8,341', color: '#2F7BFF' },
      { label: '全屋整装', value: 28, amount: '¥5,568', color: '#18D39E' },
      { label: '装修报价', value: 18, amount: '¥3,576', color: '#F59E0B' },
      { label: '免费量房', value: 12, amount: '¥2,375', color: '#EF4444' }
    ],
    sources: [
      { label: '星辰老房翻新号', value: 46, leads: '43条', color: '#22C55E' },
      { label: '星辰装饰官方号', value: 32, leads: '30条', color: '#38BDF8' },
      { label: '设计师阿林', value: 14, leads: '13条', color: '#8B5CF6' },
      { label: '浦东门店号', value: 8, leads: '8条', color: '#F97316' }
    ],
    heatmap: [
      [18, 24, 28, 25, 22, 19, 17],
      [30, 34, 32, 35, 28, 24, 22],
      [42, 47, 45, 50, 39, 32, 28],
      [55, 62, 58, 66, 70, 54, 42],
      [64, 72, 68, 78, 82, 76, 60],
      [44, 48, 46, 52, 58, 51, 40]
    ],
    suggestions: [
      { title: '老房翻新号扩量15%', text: '预计新增4-6条线索，CPA可控', status: '确认', tone: 'good' },
      { title: '测试2条报价素材', text: '报价类素材转化率较高', status: '确认', tone: 'blue' },
      { title: '晚高峰提高预算', text: '19:00-22:00转化最高', status: '确认', tone: 'good' },
      { title: '完成浦东门店号授权', text: '授权后可做浦东区域投放', status: '去处理', tone: 'warn' }
    ],
    risks: [
      { title: '品牌曝光计划 CPA 超目标91%', text: '当前CPA ¥421，目标 ¥200', status: '高风险', tone: 'bad' },
      { title: '浦东门店号尚未授权', text: '暂无法创建投放计划', status: '待处理', tone: 'warn' },
      { title: '账户余额可投放天数不足', text: '预计可投放12天，低于建议值15天', status: '提醒', tone: 'warn' },
      { title: '高转化素材库存不足', text: '当前优质素材仅剩2条', status: '提醒', tone: 'warn' }
    ],
    materialRank: [
      { rank: '1', trophy: '金', name: '老房翻新前后对比', exposure: '128,231', ctr: '3.21%', leads: '28', cpa: '¥131', verdict: '优质', tone: 'good' },
      { rank: '2', trophy: '银', name: '装修报价透明', exposure: '112,342', ctr: '2.87%', leads: '21', cpa: '¥158', verdict: '优质', tone: 'good' },
      { rank: '3', trophy: '铜', name: '装修避坑科普', exposure: '98,765', ctr: '2.35%', leads: '18', cpa: '¥186', verdict: '观察', tone: 'warn' },
      { rank: '4', trophy: '', name: '品牌形象宣传', exposure: '76,543', ctr: '1.12%', leads: '10', cpa: '¥420', verdict: '建议暂停', tone: 'bad' },
      { rank: '5', trophy: '', name: '工地实拍展示', exposure: '64,321', ctr: '1.08%', leads: '8', cpa: '¥520', verdict: '建议暂停', tone: 'bad' }
    ],
    accountRank: [
      { rank: '1', trophy: '金', name: '星辰老房翻新号', cost: '¥1,920', leads: '15', cpa: '¥131', advice: '建议扩量', action: '查看', tone: 'good' },
      { rank: '2', trophy: '银', name: '星辰装饰官方号', cost: '¥1,680', leads: '10', cpa: '¥170', advice: '稳定投放', action: '查看', tone: 'good' },
      { rank: '3', trophy: '铜', name: '设计师阿林', cost: '¥860', leads: '5', cpa: '¥180', advice: '继续观察', action: '查看', tone: 'blue' },
      { rank: '4', trophy: '', name: '浦东门店号', cost: '¥0', leads: '0', cpa: '-', advice: '待授权', action: '授权', tone: 'warn' }
    ],
    cockpit: {
      filters: ['全部投放', '按计划', '按账号', '按素材', '按业务'],
      grains: ['按小时', '按天'],
      chart: {
        days: ['05-27', '05-28', '05-29', '05-30', '05-31', '06-01', '06-02'],
        hours: 157,
        target: 200,
        events: [
          { index: 34, label: '素材上线', time: '05-28 10:30', detail: '装修报价素材 v2.1', tone: 'blue' },
          { index: 63, label: '预算调整', time: '05-29 15:20', detail: '预算 +20%', tone: 'warn' },
          { index: 106, label: 'AI扩量操作', time: '05-31 09:45', detail: '系统建议扩量', tone: 'good' },
          { index: 136, label: '预算调整', time: '06-01 16:10', detail: '预算 +15%', tone: 'warn' },
          { index: 153, label: '素材上线', time: '06-02 09:20', detail: '老房翻新素材 v1.3', tone: 'blue' }
        ]
      },
      current: [
        { id: 'old-house', name: '老房翻新计划', type: '计划', status: '投放中', spend: '¥1,286', leads: '8条', cpa: '¥161', trend: [20, 23, 22, 29, 28, 34, 38], ai: '建议扩量', action: '调整', tone: 'good' },
        { id: 'quote-material', name: '装修报价素材', type: '素材', status: '投放中', spend: '¥856', leads: '6条', cpa: '¥143', trend: [14, 16, 15, 18, 22, 21, 26], ai: '稳定', action: '查看', tone: 'blue' },
        { id: 'official-plan', name: '官方号承接计划', type: '账号', status: '观察中', spend: '¥412', leads: '2条', cpa: '¥206', trend: [18, 16, 14, 15, 13, 12, 11], ai: '继续观察', action: '观察', tone: 'warn' },
        { id: 'brand-plan', name: '品牌曝光计划', type: '计划', status: '超成本', spend: '¥306', leads: '0条', cpa: '-', trend: [22, 16, 18, 13, 12, 9, 8], ai: '建议暂停', action: '暂停', tone: 'bad' }
      ],
      history: [
        { id: 'hist-old', name: '老房翻新避坑计划', period: '05-12 ~ 05-18', spend: '¥4,860', leads: '31条', cpa: '¥157', verdict: '历史优质', reusable: '可复用', tone: 'good' },
        { id: 'hist-quote', name: '整装报价活动', period: '05-26 ~ 06-01', spend: '¥5,940', leads: '35条', cpa: '¥170', verdict: '可复用', reusable: '可复用', tone: 'blue' },
        { id: 'hist-kitchen', name: '厨卫改造收纳', period: '05-19 ~ 05-25', spend: '¥2,780', leads: '12条', cpa: '¥232', verdict: '需优化', reusable: '谨慎复用', tone: 'warn' },
        { id: 'hist-design', name: '高端设计案例', period: '05-21 ~ 05-29', spend: '¥3,620', leads: '8条', cpa: '¥452', verdict: '已淘汰', reusable: '不复用', tone: 'bad' }
      ],
      focus: [
        { id: 'focus-cost', name: '成本异常计划', type: '风险', status: '高风险', object: '品牌曝光计划', ai: '建议暂停并复盘素材', tone: 'bad' },
        { id: 'focus-material', name: '高转化素材', type: '素材', status: '可扩量', object: '装修报价素材', ai: '复制2个版本继续测试', tone: 'good' },
        { id: 'focus-auth', name: '待授权账号', type: '账号', status: '待处理', object: '浦东门店号', ai: '完成授权后投浦东区域', tone: 'warn' },
        { id: 'focus-product', name: '可扩量业务', type: '业务', status: '可扩量', object: '老房翻新', ai: '晚高峰提高预算15%', tone: 'good' }
      ],
      adviceByItem: {
        all: [
          { title: '建议老房翻新计划扩量15%', text: '整体CPA低于目标，主投计划可继续放量', tone: 'good', action: '扩量' },
          { title: '建议测试2条装修报价素材', text: '报价素材贡献稳定线索', tone: 'blue', action: '测试' },
          { title: '建议晚间提高预算', text: '晚高峰转化更集中', tone: 'good', action: '调整' },
          { title: '建议完成浦东门店号授权', text: '授权后可补充区域投放', tone: 'warn', action: '处理' }
        ],
        'old-house': [
          { title: '建议老房翻新计划扩量15%', text: '当前CPA ¥161，低于目标，晚高峰可加预算', tone: 'good', action: '扩量' },
          { title: '保留当前主投账号', text: '星辰老房翻新号线索质量稳定', tone: 'blue', action: '稳定' },
          { title: '补充案例对比素材', text: '同类素材转化继续领先', tone: 'good', action: '生成' },
          { title: '浦东门店号授权后分区域测试', text: '用于浦东区域承接', tone: 'warn', action: '处理' }
        ],
        'quote-material': [
          { title: '建议测试2条装修报价素材', text: '报价类素材点击率稳定，适合复制变体', tone: 'good', action: '测试' },
          { title: '保留透明报价卖点', text: '当前素材线索成本最低', tone: 'blue', action: '稳定' },
          { title: '控制预算上限', text: '先保持小幅测试，避免抢量过快', tone: 'warn', action: '控量' },
          { title: '同步到官方号承接', text: '增强信任背书', tone: 'blue', action: '同步' }
        ],
        'official-plan': [
          { title: '官方号承接计划继续观察', text: '线索量偏低，但信任承接价值仍在', tone: 'warn', action: '观察' },
          { title: '建议替换落地页首屏案例', text: '提高点击后留资率', tone: 'blue', action: '优化' },
          { title: '减少低转化时段预算', text: '午间转化偏弱', tone: 'warn', action: '调整' },
          { title: '与老房翻新计划组合投放', text: '作为辅助承接账号', tone: 'good', action: '组合' }
        ],
        'brand-plan': [
          { title: '品牌曝光计划建议暂停', text: 'CPA超目标91%，短期不进入优先组合', tone: 'bad', action: '暂停' },
          { title: '保留历史曝光数据', text: '用于后续品牌词素材复盘', tone: 'warn', action: '复盘' },
          { title: '预算转移到老房翻新计划', text: '当前转化效率更高', tone: 'good', action: '转移' },
          { title: '重新生成品牌素材开头', text: '当前前三秒留存偏低', tone: 'warn', action: '生成' }
        ]
      },
      risks: [
        { title: '品牌曝光计划 CPA 超目标91%', text: '当前CPA ¥421，建议暂停', tone: 'bad', status: '高风险' },
        { title: '官方号承接计划线索量下降', text: '近2日线索下降33%', tone: 'warn', status: '中风险' },
        { title: '账户余额可投放天数不足', text: '预计可投放12天', tone: 'warn', status: '提醒' },
        { title: '高转化素材库存不足', text: '优质素材仅剩2条', tone: 'warn', status: '提醒' }
      ],
      historySummary: [
        { title: '历史优质', count: '12个计划', cpa: '平均CPA ¥152', roi: '平均ROI 2.3', tone: 'good' },
        { title: '可复用', count: '8个计划', cpa: '平均CPA ¥188', roi: '平均ROI 1.6', tone: 'warn' },
        { title: '已淘汰', count: '6个计划', cpa: '平均CPA ¥312', roi: '平均ROI 0.8', tone: 'bad' }
      ],
      warningDistribution: [
        { label: '超成本', value: 42, count: '2项', color: '#EF4444', tone: 'bad' },
        { label: '待处理', value: 28, count: '1项', color: '#F59E0B', tone: 'warn' },
        { label: '余额提醒', value: 18, count: '1项', color: '#38BDF8', tone: 'blue' },
        { label: '素材不足', value: 12, count: '1项', color: '#8B5CF6', tone: 'blue' }
      ]
    }
  },
  overview: {
    suggestion: 'AI建议今日小幅扩量',
    reason: [
      { label: '昨日CPA', value: '¥182', icon: '▥' },
      { label: '目标CPA', value: '¥200', icon: '◎' },
      { label: '当前结果', value: '低于目标 9%', icon: '↗' },
      { label: '预计新增', value: '4-6 条线索', icon: '♟' }
    ],
    action: '新增 ¥500 测试预算'
  },
  metrics: [
    { label: '昨日消耗', value: '¥3,280', trend: '预算利用率 82%', icon: '▰', tone: 'blue' },
    { label: '昨日线索', value: '18 条', trend: '较前日 +22%', icon: '●', tone: 'green' },
    { label: '获客成本', value: '¥182', trend: '低于目标 9%', icon: '¥', tone: 'purple' },
    { label: '预计今日线索', value: '20-24 条', trend: 'AI建议扩量', icon: '↗', tone: 'cyan' }
  ],
  status: [
    { label: '巨量账户', value: '已授权', status: 'good', icon: '▰' },
    { label: '抖音号', value: '3个可投', status: 'good', icon: '♟' },
    { label: '推广业务', value: '6项业务', status: 'good', icon: '▦' },
    { label: '素材', value: '10条可投', status: 'good', icon: '◉' },
    { label: '余额', value: '¥18,600', status: 'blue', icon: '◒' },
    { label: '可投放', value: '12天', status: 'warn', icon: '▣' }
  ],
  workLogs: [
    { time: '09:20', title: '同步巨量引擎数据', text: '完成账户、计划、创意、线索数据回收。' },
    { time: '13:40', title: '暂停高成本计划', text: '品牌曝光计划 CPA 达 ¥421，已止损。' },
    { time: '19:10', title: '晚高峰扩量', text: '老房翻新号晚间出价提升 8%。' },
    { time: '22:30', title: '沉淀投放经验', text: '老房翻新案例在同城人群转化更高。' }
  ],
  todayPlan: [
    { time: '09:00', title: '继续投放老房翻新计划' },
    { time: '11:00', title: '测试2条新素材' },
    { time: '14:00', title: '观察报价类CPA' },
    { time: '19:00', title: '晚高峰提高预算' }
  ],
  company: {
    name: '上海星辰装饰工程有限公司',
    city: '上海',
    area: '浦东新区、徐汇区、闵行区',
    services: '整装 / 老房翻新 / 局部改造',
    price: '8万 - 25万',
    main: '老房翻新、全屋整装',
    complete: '96%'
  },
  adAccount: {
    name: '星辰装饰总部投放账户',
    id: 'AD-202606-8831',
    auth: '已授权',
    balance: '¥18,600',
    dailyBudget: '¥1,500',
    threshold: '¥3,000',
    sync: '5分钟前已同步'
  },
  accounts: [
    { id: 'official', name: '星辰装饰官方号', type: '官方号', status: '已授权', use: '品牌信任 / 案例承接', cost: '¥680', leads: '4', cpa: '¥170', score: '92', advice: '稳定投放' },
    { id: 'renovation', name: '星辰老房翻新号', type: '垂类号', status: '已授权', use: '老房翻新获客', cost: '¥920', leads: '7', cpa: '¥131', score: '96', advice: '建议扩量', primary: true },
    { id: 'designer', name: '设计师阿林', type: '设计师个人号', status: '已授权', use: '真人出镜 / 设计案例', cost: '¥360', leads: '2', cpa: '¥180', score: '84', advice: '继续观察' },
    { id: 'pudong', name: '浦东门店号', type: '门店号', status: '待授权', use: '区域投放', cost: '-', leads: '-', cpa: '-', score: '-', advice: '待授权' }
  ],
  products: [
    { name: '老房翻新', status: '主推', account: '星辰老房翻新号', cpa: '¥148', advice: '优先投放' },
    { name: '全屋整装', status: '投放中', account: '星辰装饰官方号', cpa: '¥186', advice: '稳定投放' },
    { name: '厨卫改造', status: '测试中', account: '设计师阿林', cpa: '¥220', advice: '小预算测试' },
    { name: '高端设计', status: '储备', account: '官方号', cpa: '-', advice: '待素材完善' },
    { name: '免费量房', status: '可用', account: '官方号', cpa: '¥165', advice: '适合活动投放' },
    { name: '装修报价', status: '可用', account: '老房翻新号', cpa: '¥158', advice: '适合控本获客' }
  ],
  materials: [
    { name: '老房翻新前后对比', type: '已发布视频', product: '老房翻新 / 装修报价', account: '星辰老房翻新号', publishStatus: '已发布', adAudit: '广告审核通过', deliveryStatus: '可复用', ctr: '3.2%', leads: '9', cpa: '¥146', tag: '高转化', advice: '可复用投流' },
    { name: '免费报价避坑', type: '已发布视频', product: '装修报价 / 免费量房', account: '星辰装饰官方号', publishStatus: '已发布', adAudit: '广告审核通过', deliveryStatus: '投放中', ctr: '1.4%', leads: '2', cpa: '¥320', tag: '衰减', advice: '谨慎复投' },
    { name: '高端设计案例', type: '未发布视频', product: '高端设计', account: '设计师阿林', publishStatus: '内容审核中', adAudit: '未提交投放', deliveryStatus: '未投放', ctr: '-', leads: '-', cpa: '-', tag: '待投放', advice: '发布后小预算测试' },
    { name: '厨卫改造收纳图文', type: '图文素材', product: '厨卫改造', account: '设计师阿林', publishStatus: '无需发布', adAudit: '广告审核中', deliveryStatus: '审核中', ctr: '2.1%', leads: '3', cpa: '¥210', tag: '测试中', advice: '等待广告审核' }
  ],
  plans: [
    { name: '老房翻新案例-同城', business: '老房翻新', material: '老房翻新前后对比', adAudit: '广告审核通过', status: '投放中', budget: '¥1,200', cost: '¥820', leads: '6', cpa: '¥136', action: '建议扩量' },
    { name: '免费报价-低价转化', business: '装修报价', material: '免费报价避坑', adAudit: '广告审核通过', status: '观察中', budget: '¥800', cost: '¥640', leads: '2', cpa: '¥320', action: '降频' },
    { name: '品牌曝光-全城', business: '全屋整装', material: '品牌形象宣传', adAudit: '广告审核通过', status: '已暂停', budget: '¥900', cost: '¥421', leads: '1', cpa: '¥421', action: '已止损' },
    { name: '局改套餐-新素材', business: '厨卫改造', material: '厨卫改造收纳图文', adAudit: '广告审核中', status: '待审核', budget: '¥300', cost: '¥0', leads: '0', cpa: '-', action: '等待巨量审核' }
  ],
  growth: [
    { label: '服务天数', value: '21' },
    { label: '已学习计划', value: '126' },
    { label: '已分析素材', value: '342' },
    { label: 'CPA下降', value: '23%' }
  ]
};
