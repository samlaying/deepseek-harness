import React from 'react'

export interface PmWorkbenchViewProps {
  sessionId: string
}

export function PmWorkbenchView({ sessionId: _sessionId }: PmWorkbenchViewProps) {
  return (
    <div
      data-pm-workbench-root
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        background: 'var(--dsw-alias-bg-base, #121316)',
        color: 'var(--dsw-alias-label-primary, #e6e8eb)',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* 左侧记忆库面板：实时注入 100-bagent 真实上下文与团队记忆 */}
      <aside
        data-pm-memory-panel
        style={{
          width: '340px',
          borderRight: '1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          background: 'var(--dsw-alias-bg-surface, rgba(255, 255, 255, 0.02))',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📁</span> 项目记忆 (Lily / bagent)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>当前推进: 消费明细与透明化计费</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>对齐竞品</b>: 对齐 WorkBuddy 算力透明度体验</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>核心边界</b>: 仅重任务做前置区间预估，普通对话做后置轻量归因</div>
            <div style={{ fontSize: '13px', color: '#ffaa00', lineHeight: 1.6 }}>• <b>当前卡点</b>: 流式 SSE 传输中途截断时的 Token 实际扣减逻辑</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>👥</span> 人员记忆 (Stakeholders)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>计费与网关团队</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>负责: SSE usage 直吐与明细日志</div>
              <div style={{ fontSize: '12px', color: '#ffaa00' }}>⚠️ 欠我: 确认 stream 结尾是否支持直吐 usage 字段 (今日 17:00 前)</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>张万里 / 花卷 (前端/UI)</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>负责: 消息气泡末尾消耗 Badge</div>
              <div style={{ fontSize: '12px', color: '#00d4ff' }}>待对齐: Hover 浮层展示“提问/回复”Token 拆解样式</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📑</span> 内部术语表 (Terminology)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>AI Pro 回收</b>: 席位回收后剩余月度配额的退回与清算日志</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>预计消耗</b>: 仅对耗时任务标注的参考区间（如 ~5-15 点），非强阻断</div>
          </div>
        </div>
      </aside>

      {/* 右侧动态画布：今日必达 Top 3 + 决策日志 + PRD 机制卡片 */}
      <main
        data-pm-canvas-panel
        style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯</span> Today Must-Happen (今日必须推动落地的 3 个结果)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>1. 确认 SSE 消息级 Usage 字段</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 联系网关确认流式完成时是否回传 prompt/completion tokens</div>
              <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>进行中 · 依赖网关</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>2. 走查 WorkBuddy 任务前置预估</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 15:00 前截图确认其预估展现是轻量提示还是弹窗强确认</div>
              <span style={{ fontSize: '11px', background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '2px 8px', borderRadius: '4px' }}>今日 DDL 15:00</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>3. 输出难缠用户极端扣费兜底表</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 明确网络截断、连续手抖、余额为0时的系统响应机制</div>
              <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>已推导完成</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📝</span> 本次需求机制卡片 (Mechanism Canvas - 对齐 WorkBuddy)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              消耗明细分类与消息实际消耗展示机制
            </div>
            <div style={{ fontSize: '13px', color: '#e6e8eb', marginBottom: '6px' }}>
              <b>核心取舍:</b> 红方质询通过——普通对话不做前置预估阻断（保护流畅度），改为气泡轻量 Badge 归因；仅重任务展示「预计消耗区间」。
            </div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>
              <b>三句话评审口径:</b><br/>
              1. <b>用户看到什么:</b> 明细页显示三种分类 Tag（对话/任务/清算）；每条 AI 气泡右下角灰色显示「⚡ 实际消耗 12 点」，Hover 查看详细 Token。<br/>
              2. <b>用户能做什么:</b> 在明细列表按类型筛选流水；点击消息气泡消耗能查看费用拆解明细。<br/>
              3. <b>然后发生什么:</b> 任务执行完成后，系统自动回写扣减流水，若网络异常截断则仅按实际截断字符扣费。
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
