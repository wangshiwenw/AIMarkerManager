'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import demoData from './data/demo-data.json';
import type { AuthStatus, Plan, PublishCombo } from './types';
import { AppShell, useToast } from './components/app-shell';
import { Button, DataTable, Info, MetricCard, Sparkline, Tag, toneColor } from './components/primitives';
import { CockpitChart, PlanPerformanceChart } from './components/charts';

function initialPublishCombos(): PublishCombo[] {
  return [
    { name: '组合A', account: '星辰老房翻新号', material: '老房前后对比 v2.1 / 报价避坑口播', budget: '45%', reason: '账号近7天老房翻新成本低，素材复投稳定', status: '待发布' },
    { name: '组合B', account: '浦东门店号', material: '报价避坑口播 v1.3', budget: '35%', reason: '适合价格敏感但咨询明确的人群', status: '待发布' },
    { name: '组合C', account: '设计师阿林', material: '老房设计师讲解 v1', budget: '20%', reason: '小预算测试设计需求', status: '待发布' }
  ];
}

export function WorkbenchApp({
  page,
  initialStep = 0
}: {
  page: 'cockpit' | 'plans' | 'planCreate' | 'auth' | 'materials' | 'leads' | 'distribution' | 'companies';
  initialStep?: number;
}) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unbound');

  useEffect(() => {
    const stored = window.sessionStorage.getItem('marketing-demo-auth-status') as AuthStatus | null;
    if (stored) setAuthStatus(stored);
  }, []);

  function updateAuthStatus(status: AuthStatus) {
    setAuthStatus(status);
    window.sessionStorage.setItem('marketing-demo-auth-status', status);
  }

  return (
    <AppShell authStatus={authStatus}>
      {page === 'cockpit' && <CockpitView />}
      {page === 'plans' && <PlansView />}
      {page === 'planCreate' && <PlanCreateDetailView initialStep={initialStep} />}
      {page === 'auth' && <AuthView authStatus={authStatus} setAuthStatus={updateAuthStatus} />}
      {page === 'materials' && <MaterialsView />}
      {page === 'leads' && <LeadsView />}
      {page === 'distribution' && <DistributionView />}
      {page === 'companies' && <CompaniesView />}
    </AppShell>
  );
}

function CockpitView() {
  const { notify } = useToast();
  const [dashFilter, setDashFilter] = useState('汇总');
  const [dashGrain, setDashGrain] = useState('按小时');
  const [entity, setEntity] = useState('全部投放');
  const filteredCombos = useMemo(() => {
    if (dashFilter === '汇总' || entity === '全部投放') return demoData.combinations;
    const key = dashFilter === '按计划' ? 'plan' : dashFilter === '按账号' ? 'account' : dashFilter === '按素材' ? 'material' : 'direction';
    return demoData.combinations.filter((item) => item[key as keyof typeof item] === entity);
  }, [dashFilter, entity]);
  const entityOptions = useMemo(() => {
    if (dashFilter === '汇总') return ['全部投放'];
    const key = dashFilter === '按计划' ? 'plan' : dashFilter === '按账号' ? 'account' : dashFilter === '按素材' ? 'material' : 'direction';
    return Array.from(new Set(demoData.combinations.map((item) => String(item[key as keyof typeof item]))));
  }, [dashFilter]);

  function switchFilter(filter: string) {
    setDashFilter(filter);
    setEntity(filter === '汇总' ? '全部投放' : entityOptions[0]);
    notify(`已切换为${filter}`);
  }

  return (
    <div className='dashboard cockpit operator-cockpit'>
      <div className='dashboard-toolbar'>
        <div className='desk-pulse'>AI巡检运行中 · {demoData.operator.lastInspection} 已更新 · 下一次 {demoData.operator.nextInspection}</div>
        <div className='date-controls'>
          <span>数据时间：{demoData.cockpit.date}</span>
          <Tag tone='blue'>{demoData.operator.availableDays}</Tag>
        </div>
      </div>
      <section className='dash-metrics'>
        {demoData.cockpit.metrics.map((item) => (
          <div className={`dash-metric dash-${item.tone}`} key={item.label}>
            <label>{item.label}</label>
            <span className='dash-icon'>{item.icon}</span>
            <b>{item.value}</b>
            <div className='metric-bottom'>
              <span>{item.trend}</span>
              {'series' in item && item.series ? <Sparkline color={toneColor(item.tone)} values={item.series} /> : null}
              {'progress' in item && item.progress ? <div className='bar'><i style={{ '--w': `${item.progress}%` } as React.CSSProperties} /></div> : null}
            </div>
          </div>
        ))}
      </section>
      <section className='cockpit-business-filter'>
        <span>业务筛选</span>
        {demoData.cockpit.filters.map((name, index) => (
          <button className={index === 0 ? 'active' : ''} key={name} onClick={() => notify(`${name}已记录`)} type='button'>{name}</button>
        ))}
      </section>
      <section className='cockpit-grid'>
        <aside className='cockpit-right'>
          <div className='card card-pad dash-card scroll-card'>
            <div className='dash-head'><h3>AI待处理建议</h3><Tag tone='good'>{demoData.operator.pendingActions} 条未关闭</Tag></div>
            <div className='cockpit-side-list'>
              {demoData.aiActions.map((item, index) => (
                <div className={`cockpit-side-item ${item.tone}`} key={item.recommendation}>
                  <span className={`index-badge ${item.tone}`}>{index + 1}</span>
                  <div>
                    <div className='advice-meta'><span>{item.time}</span><Tag tone={item.status === '未处理' ? 'bad' : item.status === '观察中' ? 'warn' : 'blue'}>{item.status}</Tag></div>
                    <b>{item.recommendation}</b>
                    <p>{item.evidence}</p>
                  </div>
                  <div className='advice-actions'>
                    <Button onClick={() => notify('忽略建议已记录')} variant='mini'>忽略</Button>
                    <Button className='confirm' onClick={() => notify(`${item.buttons[0]}已记录`)} variant='mini'>{item.buttons[0]}</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='card card-pad dash-card risk-card scroll-card'>
            <div className='dash-head'><h3>风险预警</h3><Tag tone='bad'>{demoData.operator.risks} 项风险</Tag></div>
            <div className='cockpit-side-list'>
              {demoData.risks.map((item) => (
                <div className={`cockpit-risk-item ${item.tone}`} key={item.title}>
                  <div><b>{item.title}</b><p>{item.text}</p></div>
                  <Tag tone={item.tone}>{item.status}</Tag>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <div className='card card-pad cockpit-main-card'>
          <div className='cockpit-chart-head'>
            <div><h3>投放表现主图</h3><div className='legend'><i className='blue' />消耗<i className='green' />客资<i className='purple' />客资成本<i className='line' />参考成本</div></div>
            <div className='cockpit-controls'>
              <div className='segmented'>{['汇总', '按计划', '按账号', '按素材', '按获客方向'].map((item) => <button className={dashFilter === item ? 'active' : ''} key={item} onClick={() => switchFilter(item)} type='button'>{item}</button>)}</div>
              <Button onClick={() => notify('多指标对比已记录')}>多指标对比</Button>
              <div className='segmented compact'>{['按小时', '按天'].map((item) => <button className={dashGrain === item ? 'active' : ''} key={item} onClick={() => setDashGrain(item)} type='button'>{item}</button>)}</div>
            </div>
          </div>
          {dashFilter !== '汇总' ? <div className='entity-selector'>{entityOptions.map((option) => <button className={entity === option ? 'active' : ''} key={option} onClick={() => setEntity(option)} type='button'>{option}</button>)}</div> : null}
          <CockpitChart combos={filteredCombos} grain={dashGrain} />
        </div>
        <div className='cockpit-bottom'>
          <div className='card card-pad cockpit-list-card'>
            <div className='table-title'>正在监控的投放组合（{demoData.combinations.length}）</div>
            <div className='combo-watch-list'>
              {demoData.combinations.map((item) => (
                <div className={`combo-watch-item ${item.tone}`} key={item.name}>
                  <div className='combo-watch-main'><b>{item.name}</b><span>{item.account}</span><em>{item.material}</em></div>
                  <div className='combo-watch-metrics'><div><span>今日消耗</span><strong>{item.spend}</strong></div><div><span>客资</span><strong>{item.leads}条</strong></div><div><span>客资成本</span><strong>{item.cost}</strong></div></div>
                  <div className='combo-watch-state'><Tag tone={item.tone}>{item.publishStatus}</Tag><Tag tone={item.tone}>{item.ai}</Tag></div>
                  <div className='combo-watch-actions'><Button onClick={() => notify(`${item.action}已记录`)} variant='mini'>{item.action}</Button><Button onClick={() => notify('查看诊断已记录')} variant='mini'>查看诊断</Button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlansView() {
  const router = useRouter();
  const { notify } = useToast();
  const [mode, setMode] = useState<'list' | 'detail'>('list');
  const [selectedPlanId, setSelectedPlanId] = useState(demoData.plans[0].id);
  const selectedPlan = demoData.plans.find((plan) => plan.id === selectedPlanId) ?? demoData.plans[0];

  if (mode === 'detail') {
    return <PlanDetail plan={selectedPlan} onBack={() => setMode('list')} />;
  }

  return (
    <div className='plan-workspace'>
      <div className='page-hero plan-hero'><p>投放计划负责创建、组合确认、发布审核、自动投流和计划级监控调控；实时操作建议与操盘纵览同池。</p><Button onClick={() => router.push('/plans/planesDetail?step=0')}>创建投放计划</Button></div>
      <section className='plan-filter-bar'>{['全部', '配置中', '待发布审核', '投放中', '监控中', '已结束', '异常'].map((name, index) => <button className={index === 0 ? 'active' : ''} key={name} onClick={() => notify(`${name}已记录`)} type='button'>{name}</button>)}</section>
      <section className='plan-card-grid'>
        {demoData.plans.map((plan) => <button className={`plan-work-card ${plan.tone}`} key={plan.id} onClick={() => { setSelectedPlanId(plan.id); setMode('detail'); }} type='button'><div className='plan-work-head'><div><b>{plan.name}</b><span>{plan.direction} · {plan.city}/{plan.area}</span></div><Tag tone={plan.tone}>{plan.status}</Tag></div><div className='plan-work-kpis'><div><span>总预算</span><strong>{plan.totalBudget}</strong></div><div><span>已消耗</span><strong>{plan.spent}</strong></div><div><span>客资</span><strong>{plan.leads}条</strong></div><div><span>客资成本</span><strong>{plan.cost}</strong></div></div><div className='plan-work-step'><div><span>当前步骤</span><strong>{plan.step}</strong></div><div><span>下一步</span><strong>{plan.nextAction}</strong></div></div><div className='plan-work-foot'><Sparkline color={toneColor(plan.tone)} values={plan.trend} /><div>{plan.adviceCount ? <Tag tone='warn'>{plan.adviceCount}条AI建议</Tag> : <Tag tone='good'>暂无待处理建议</Tag>}<Tag tone={plan.tone}>{plan.anomaly}</Tag></div></div></button>)}
      </section>
    </div>
  );
}

function PlanCreateDetailView({ initialStep }: { initialStep: number }) {
  const router = useRouter();
  const { notify } = useToast();
  const [step, setStep] = useState(initialStep);
  const [maxStep, setMaxStep] = useState(initialStep);
  const [createStage, setCreateStage] = useState<'input' | 'parsing' | 'result'>(initialStep > 0 ? 'result' : 'input');
  const [publishCombos, setPublishCombos] = useState(initialPublishCombos);

  useEffect(() => {
    setStep(initialStep);
    setMaxStep((current) => Math.max(current, initialStep));
    if (initialStep > 0) setCreateStage('result');
  }, [initialStep]);

  function goStep(nextStep: number) {
    const safeStep = Math.min(Math.max(nextStep, 0), 3);
    setStep(safeStep);
    setMaxStep((current) => Math.max(current, safeStep));
    if (safeStep > 0) setCreateStage('result');
    router.push(`/plans/planesDetail?step=${safeStep}`);
  }

  return (
    <div className={`plan-detail-page ${step === 3 ? 'monitor-mode' : 'create-mode'}`}>
      <div className='plan-detail-top'>
        <Button onClick={() => router.push('/plans')} variant='mini'>返回计划列表</Button>
        <div>
          <h3>{step === 3 ? '投放执行监控' : '创建投放计划'}</h3>
          <p>{step === 3 ? '老房翻新获客计划 · 运行中' : '用一句话、语音输入或文件导入，让AI先解析计划配置。'}</p>
        </div>
        <Tag tone='blue'>AI解析计划</Tag>
      </div>
      <PlanStepper active={step} max={maxStep} onStep={goStep} />
      <section className='plan-create-canvas'>
        {createStage === 'parsing' ? <AiLoader /> : step === 0 && createStage === 'input' ? (
          <div className='ai-task-layout'>
            <div className='ai-task-main'>
              <section className='ai-task-card'>
                <div className='ai-task-head'><span className='magic-icon'>✣</span><div><b>给AI操盘手下达投放任务</b><p>请尽可能详细地描述你的投放需求，AI将为你解析并生成完整的投放计划。</p></div></div>
                <div className='prompt-box'><textarea aria-label='投放任务描述' defaultValue='帮我在上海浦东老房翻新，预算1.2万，先测试报价类和前后对比素材，周期7天。' rows={7} /><span>36 / 1000</span></div>
                <div className='prompt-actions'>
                  <button className='mode-btn active' type='button'>T 文字描述</button>
                  <button className='mode-btn' type='button'>◉ 按住说话</button>
                  <button className='mode-btn' type='button'>▣ 导入文件</button>
                  <em>支持 .doc / .txt / .pdf</em>
                  <Button onClick={() => { setCreateStage('parsing'); window.setTimeout(() => { setCreateStage('result'); notify('AI已完成计划解析'); }, 900); }}>AI开始解析 →</Button>
                </div>
              </section>
            </div>
          </div>
        ) : step === 0 ? (
          <>
            <div className='step-stage-note'><b>AI已解析出计划配置</b><p>AI已自动填入识别到的字段，未识别内容需要手动补充后匹配投放组合。</p></div>
            <div className='plan-config-form'>
              {['老房翻新', '上海', '浦东', '¥12,000', '7天'].map((value, index) => {
                const label = ['获客方向', '投放城市', '投放区域', '总预算', '投放周期'][index];
                return <label className='field-label' htmlFor={`plan-field-${index}`} key={value}>{label}<input aria-label={label} defaultValue={value} id={`plan-field-${index}`} /></label>;
              })}
              <label className='field-label needs-fill' htmlFor='plan-extra-requirement'>特殊要求<textarea aria-label='特殊要求' id='plan-extra-requirement' placeholder='请输入AI未识别到的投放限制、排除素材、区域偏好等' rows={3} /></label>
            </div>
            <div className='step-action-row'><Button onClick={() => { setCreateStage('parsing'); window.setTimeout(() => { setCreateStage('result'); notify('AI已完成投放组合匹配'); goStep(1); }, 900); }}>匹配投放组合</Button><Button onClick={() => setCreateStage('input')} variant='mini'>重新输入</Button></div>
          </>
        ) : step === 1 ? (
          <>
            <div className='step-stage-note'><b>AI已生成组合方案</b><p>请选择要发布的投放组合，可删除不需要的组合，或新增账号与视频组合。</p></div>
            <div className='combo-stage-list combo-edit-list'>{publishCombos.map((combo, index) => <div className='combo-stage-item combo-edit-item good' key={combo.name}><label className='combo-check' htmlFor={`combo-${index}`}><input aria-label={`选择${combo.name}`} defaultChecked id={`combo-${index}`} type='checkbox' /><span /><b>{combo.name}</b></label><div><b>{combo.account}</b><span>{combo.material}</span><small>{combo.reason}</small></div><Tag tone='blue'>{combo.budget}</Tag><Button onClick={() => setPublishCombos((rows) => rows.filter((_, i) => i !== index))} variant='dangerLite'>删除</Button></div>)}</div>
            <div className='step-action-row bottom-actions'><Button onClick={() => goStep(0)} variant='mini'>返回解析结果</Button><Button onClick={() => goStep(2)}>确认组合，进入发布审核</Button></div>
          </>
        ) : step === 2 ? (
          <div className='publish-stage'>
            <div className='publish-toolbar'><div><b>发布审核并投流</b><span>{publishCombos.filter((item) => item.status === '投流中').length}/{publishCombos.length} 已投流</span></div><div className='publish-toolbar-actions'><Button onClick={() => { setPublishCombos((rows) => rows.map((item) => ({ ...item, status: '审核通过' }))); notify('已一键发布，自动进入审核'); }}>一键发布</Button><Button onClick={() => { setPublishCombos((rows) => rows.map((item) => ({ ...item, status: '投流中' }))); notify('已一键投放，进入监控'); goStep(3); }}>一键投放</Button></div></div>
            <div className='publish-list'>{publishCombos.map((item, index) => <div className='publish-row good' key={item.name}><div className='publish-index'>{index + 1}</div><div className='publish-main'><b>{item.name}</b><span>{item.account} · {item.material}</span></div><Tag tone='good'>{item.status}</Tag></div>)}</div>
          </div>
        ) : (
          <ExecutionMonitor />
        )}
      </section>
    </div>
  );
}

function PlanStepper({ active, max, onStep }: { active: number; max: number; onStep: (step: number) => void }) {
  const steps = ['AI解析计划', '组合方案', '发布审核并投流', '监控调控'];
  return <div className='plan-stepper'>{steps.map((name, index) => <button className={`plan-step ${index === active ? 'active' : index < active ? 'done' : index > max ? 'locked' : ''}`} disabled={index > max} key={name} onClick={() => onStep(index)} type='button'><span>{index + 1}</span><b>{name}</b><small>{['输入任务，AI智能解析', 'AI生成投放组合方案', '提交审核并开启投放', '实时监控，智能优化'][index]}</small></button>)}</div>;
}

function PlanDetail({ plan, onBack }: { plan: Plan; onBack: () => void }) {
  const [step, setStep] = useState(plan.stepIndex);
  const combos = demoData.combinations.filter((item) => item.plan === plan.name).length ? demoData.combinations.filter((item) => item.plan === plan.name) : demoData.combinations.slice(0, 2);
  return <div className='plan-detail-page'><div className='plan-detail-top'><Button onClick={onBack} variant='mini'>返回计划列表</Button><div><h3>{plan.name}</h3><p>{plan.direction} · {plan.city}/{plan.area}</p></div><div className='plan-detail-tags'><Tag tone={plan.tone}>{plan.status}</Tag><Tag tone='blue'>{['AI解析计划', '组合方案', '发布审核并投流', '监控调控'][step]}</Tag></div></div><div className='plan-detail-kpis'><Info label='总预算' value={plan.totalBudget} /><Info label='已消耗' value={plan.spent} /><Info label='已获客资' value={`${plan.leads}条`} /><Info label='客资成本' value={plan.cost} /><Info label='下一步动作' value={plan.nextAction} /></div><PlanStepper active={step} max={plan.stepIndex} onStep={setStep} /><section className='plan-detail-grid'><div className='card card-pad plan-stage-card'><div className='dash-head'><h3>{['AI解析计划', '组合方案', '发布审核并投流', '监控调控'][step]}</h3><Tag tone={plan.tone}>{plan.ai}</Tag></div>{step >= 3 ? <div className='plan-monitor-grid'><div className='plan-monitor-chart'><PlanPerformanceChart plan={plan} /></div><ComboStageList combos={combos} /></div> : <ComboStageList combos={combos} />}</div><aside className='card card-pad plan-log-card'><div className='dash-head'><h3>AI工作日志</h3><Tag tone='blue'>当前计划</Tag></div><div className='plan-log-list'>{['AI生成计划判断', 'AI匹配投放组合', '发布审核状态更新', '监控调控提醒'].map((title, index) => <div key={title}><time>{['10:30', '10:34', '10:42', '11:30'][index]}</time><b>{title}</b><p>{plan.ai}</p></div>)}</div></aside></section></div>;
}

function ComboStageList({ combos }: { combos: typeof demoData.combinations }) {
  return <div className='combo-stage-list'>{combos.map((item) => <div className={`combo-stage-item ${item.tone}`} key={item.name}><div><b>{item.name}</b><span>{item.account} · {item.material}</span></div><strong>{item.spend} / {item.leads}条 / {item.cost}</strong><Tag tone={item.tone}>{item.ai}</Tag></div>)}</div>;
}

function AiLoader() {
  return <div className='ai-inline-loader show'><div className='ai-bg-grid' /><div className='ai-particles' /><div className='ai-loader-content'><div className='ai-core'><div className='ai-ring ring-1' /><div className='ai-ring ring-2' /><div className='ai-ring ring-3' /><div className='ai-orb'>AI</div></div><div className='ai-loader-title'>AI 正在解析投放任务</div><div className='ai-loader-subtitle'>正在识别投放目标、人群地域、预算周期与素材方向</div><div className='ai-loading-steps'><span>识别需求</span><span>拆解策略</span><span>匹配素材</span><span>生成方案</span></div><div className='ai-progress-bar'><div className='ai-progress-line' /></div></div></div>;
}

function ExecutionMonitor() {
  return <div className='exec-monitor'><div className='exec-alert'><span className='info-dot'>i</span><b>计划已进入投放监控阶段，系统将持续回流消耗、咨询、成本、点击率、转化率等数据，并生成AI调优建议。</b><em>数据更新时间：2025-05-15 20:30</em></div><section className='exec-metrics'>{['累计消耗', '咨询量', '客资成本', '点击率', '转化率', 'ROI'].map((label, index) => <div className='exec-metric' key={label}><div><span>{label}</span><b>{['¥12,456.78', '238', '¥52.34', '2.87%', '6.30%', '2.41'][index]}</b><p className={index === 2 ? 'good' : 'bad'}>较昨日 {index === 2 ? '-6.21% ↓' : '+8.62% ↑'}</p></div><i className='exec-icon wallet' /></div>)}</section><section className='exec-main-grid'><div className='exec-panel exec-trend'><div className='exec-panel-head'><h3>数据趋势</h3></div><PlanPerformanceChart plan={demoData.plans[0]} /></div><div className='exec-panel exec-advice'><div className='exec-panel-head'><h3>AI调优建议</h3><span className='exec-badge'>3 条待处理</span></div><div className='exec-advice-list'>{demoData.aiActions.slice(0, 3).map((item) => <div className='exec-advice-item' key={item.recommendation}><span className='exec-advice-icon chart' /><div><b>{item.type}</b><p>{item.recommendation}</p></div><button className='adopt' type='button'>采纳建议</button><button className='reason' type='button'>查看原因</button></div>)}</div></div></section></div>;
}

function AuthView({ authStatus, setAuthStatus }: { authStatus: AuthStatus; setAuthStatus: (status: AuthStatus) => void }) {
  const { notify } = useToast();
  const meta = authStatus === 'authorized' ? { label: '已授权', tone: 'good', title: '当前巨量引擎账号授权正常', desc: '系统已完成账户绑定，可同步可投放账号、账户余额和投放数据。' } : authStatus === 'confirm' ? { label: '待确认绑定', tone: 'blue', title: '授权成功', desc: '已获取巨量引擎授权，请确认本次绑定账户信息。' } : authStatus === 'syncing' || authStatus === 'authorizing' ? { label: '处理中', tone: 'blue', title: '正在处理授权', desc: '系统正在完成授权和账户同步。' } : { label: '未授权', tone: 'warn', title: '尚未绑定巨量引擎账号', desc: '完成授权后，系统将自动同步账户余额、可投放账号和投放数据。' };

  function startAuth() {
    setAuthStatus('authorizing');
    notify('正在跳转巨量引擎授权页面');
    window.setTimeout(() => { setAuthStatus('confirm'); notify('巨量引擎授权成功，请确认绑定信息'); }, 900);
  }

  function syncAuth() {
    setAuthStatus('syncing');
    notify('正在同步巨量引擎账号信息');
    window.setTimeout(() => { setAuthStatus('authorized'); notify('绑定成功，已同步可投放账号'); }, 900);
  }

  return (
    <div className='auth-page'>
      <section className='auth-hero'>
        <div>
          <h3>巨量引擎授权管理</h3>
          <p>绑定巨量引擎账号后，系统可同步可投放账号、账户余额、投放数据，并支持后续投放计划创建与监控调优。</p>
        </div>
        <Tag tone={meta.tone}>{meta.label}</Tag>
      </section>
      <section className={`card card-pad auth-status-card ${meta.tone}`}>
        <div className='dash-head'>
          <h3>{meta.title}</h3>
          <Tag tone={meta.tone}>{meta.label}</Tag>
        </div>
        {authStatus === 'authorized' ? (
          <div className='auth-kpi-grid'>
            <Info label='授权状态' value='已授权' />
            <Info label='巨量引擎账户名称' value={demoData.giantAuth.accountName} />
            <Info label='账户ID' value={demoData.giantAuth.accountId} />
            <Info label='授权主体' value={demoData.giantAuth.subject} />
            <Info label='账户余额' value={demoData.giantAuth.balance} />
            <Info label='可投账号数量' value='3 / 4' />
          </div>
        ) : (
          <div className={`auth-empty-state ${meta.tone}`}>
            <div aria-hidden='true' className='auth-empty-icon'>
              {authStatus === 'confirm' ? '✓' : '+'}
            </div>
            <b>{meta.title}</b>
            <p>{meta.desc}</p>
            {authStatus === 'confirm' ? (
              <Button onClick={syncAuth}>确认绑定并同步账号</Button>
            ) : (
              <Button disabled={authStatus === 'authorizing' || authStatus === 'syncing'} onClick={startAuth}>
                {authStatus === 'authorizing' ? '授权中' : '立即授权巨量引擎'}
              </Button>
            )}
          </div>
        )}
      </section>
      <section className='card card-pad section'>
        <div className='dash-head'>
          <h3>可投放账号列表</h3>
          <Tag tone={authStatus === 'authorized' ? 'good' : 'warn'}>
            {authStatus === 'authorized' ? `最近同步 ${demoData.giantAuth.lastSyncAt}` : '等待授权后同步'}
          </Tag>
        </div>
        {authStatus === 'authorized' ? (
          <DataTable headers={['账号名称', '平台', '账号类型', '授权状态', '可投放状态', '最近同步时间', '操作']}>
            {demoData.giantAuth.accounts.map((item) => (
              <tr className={`risk-row ${item.tone}`} key={item.name}>
                <td><b>{item.name}</b><span>{item.reason}</span></td>
                <td>{item.platform}</td>
                <td>{item.type}</td>
                <td><Tag tone='good'>{item.authStatus}</Tag></td>
                <td><Tag tone={item.deliveryStatus === '可投放' ? 'good' : 'warn'}>{item.deliveryStatus}</Tag></td>
                <td>{item.syncedAt}</td>
                <td><Button onClick={() => notify('查看详情已记录')} variant='mini'>查看详情</Button></td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <div className='auth-table-empty'><b>{meta.title}</b><span>{meta.desc}</span></div>
        )}
      </section>
    </div>
  );
}

function MaterialsView() {
  const { notify } = useToast();
  return <div className='operator-page'><section className='cockpit-business-filter'>{['全部素材', '视频素材', '图文素材', '多次投放', '待复盘'].map((name, index) => <button className={index === 0 ? 'active' : ''} key={name} onClick={() => notify(`${name}已记录`)} type='button'>{name}</button>)}</section><div className='grid-4 section'><MetricCard label='素材库存' tone='green' trend='外部平台同步' value='42 条' /><MetricCard label='多次投放素材' tone='cyan' trend='可做组合复盘' value='18 条' /><MetricCard label='高流量组合' tone='green' trend='账号/计划相关' value='11 组' /><MetricCard label='待复盘组合' tone='purple' trend='同素材表现分化' value='7 组' warn /></div><div className='card card-pad section'><div className='dash-head'><h3>素材库</h3><Tag tone='blue'>素材资产 + 多计划表现</Tag></div><DataTable headers={['素材/视频', '类型', '获客方向', '投放次数', '表现分布', '高流量组合', '低流量组合', '成本区间', 'AI分析', '操作']}>{demoData.materialRecommendations.map((item) => <tr className={`risk-row ${item.tone}`} key={item.name}><td><div className='material-title'><Image alt={item.name} height={64} src={item.image} width={88} /><div><b>{item.name}</b><span>{item.source}</span></div></div></td><td>{item.type}</td><td>{item.direction}</td><td>{item.used}</td><td>{item.performance}</td><td>{item.bestCombo}</td><td>{item.weakCombo}</td><td>{item.costRange}</td><td>{item.ai}</td><td><Button onClick={() => notify('加入组合已记录')} variant='mini'>加入组合</Button></td></tr>)}</DataTable></div></div>;
}

function LeadsView() {
  return <SimpleTablePage metrics={['今日客资', '可分发客资', '待分发', '暂不分发']} rows={demoData.leads.map((item) => [item.id, item.source, item.city, item.area, item.demand, item.intent, item.budget, item.house, item.distribution])} title='客资池' headers={['客资ID', '来源组合', '城市', '区域', '需求分类', '意向等级', '预算', '房屋类型', '分发状态']} />;
}

function DistributionView() {
  return <SimpleTablePage metrics={['待分发', 'AI已推荐', '今日分发', '需复核']} rows={demoData.distributions.map((item) => [item.lead, item.city, item.demand, item.recommended, item.reason, item.status])} title='线索分发' headers={['待分发客资', '城市', '需求类型', 'AI推荐装企', '推荐原因', '分发状态']} />;
}

function CompaniesView() {
  return <SimpleTablePage metrics={['承接装企', '今日已分发', '反馈异常', '平均反馈率']} rows={demoData.contractors.map((item) => [item.name, item.city, item.business, item.area, `${item.assigned}条`, item.feedback, item.dealRate, item.status])} title='装企承接' headers={['装企名称', '城市', '可承接业务', '服务区域', '今日已分发', '反馈率', '成交率', '承接状态']} />;
}

function SimpleTablePage({ metrics, title, headers, rows }: { metrics: string[]; title: string; headers: string[]; rows: string[][] }) {
  const { notify } = useToast();
  return <div className='operator-page'><div className='grid-4'>{metrics.map((metric, index) => <MetricCard key={metric} label={metric} tone={index === 1 ? 'cyan' : index === 2 ? 'purple' : 'green'} trend='轻量展示' value={index === 0 ? `${rows.length} 条` : index === 1 ? '12 条' : index === 2 ? '4 条' : '1 条'} warn={index >= 2} />)}</div><div className='card card-pad section'><div className='dash-head'><h3>{title}</h3><Tag tone='blue'>结果展示</Tag></div><DataTable headers={[...headers, '操作']}>{rows.map((row) => <tr key={row.join('-')}>{row.map((cell) => <td key={cell}>{cell}</td>)}<td><Button onClick={() => notify('操作已记录')} variant='mini'>查看</Button></td></tr>)}</DataTable></div></div>;
}
