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
      }}
    >
      {/* 左侧记忆库面板：项目上下文 + 人员记忆 + 关键决策 */}
      <aside
        data-pm-memory-panel
        style={{
          width: '320px',
          borderRight: '1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          background: 'var(--dsw-alias-bg-surface, rgba(255, 255, 255, 0.02))',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px' }}>
            📁 项目记忆 (Single Source of Truth)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>当前推进阶段: MVP 验证</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• 核心目标: 建立 AI 协作产品经理工作流</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• 当前卡点: 确认企业微信自建应用权限边界</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• 风险: IM 回调频控与多群聊并发</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px' }}>
            👥 人员记忆 (Stakeholders)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>研发负责人 (Alex)</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>偏好: 数据驱动、明确的接口 DDL</div>
            <div style={{ fontSize: '13px', color: '#ffaa00', lineHeight: 1.6 }}>⚠️ 欠我Action: 确认群聊消息回调与频控 (今日 18:00)</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>业务负责人 (Sarah)</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>偏好: 结论先行、30秒汇报摘要</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>关注点: 员工与 Lily 的私聊体验完整度</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px' }}>
            📑 内部专有术语表
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>Lily</b>: 智能招聘/HR 咨询数字助手</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>SSOT</b>: 单一事实源，所有决策唯一的收敛落点</div>
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
          gap: '20px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '12px' }}>
            🎯 Today Must-Happen (今日必须发生的 3 个结果)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>1. 确认飞书 / 企微产品形态</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 对比私聊/群聊权限限制</div>
              <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>进行中</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>2. 确定第一版授权流程</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 画出 V1 首次进入的扫码鉴权时序图</div>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', color: '#aaa', padding: '2px 8px', borderRadius: '4px' }}>待开始</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>3. 拉研发确认技术风险</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 发出结构化协作消息并等待 Alex 回复</div>
              <span style={{ fontSize: '11px', background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '2px 8px', borderRadius: '4px' }}>等待对方</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '12px' }}>
            📝 动态决策与机制卡片 (Mechanism Canvas)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>企微自建应用接入机制 (V1 范围决策)</div>
            <div style={{ fontSize: '13px', color: '#e6e8eb', marginBottom: '6px' }}><b>决策内容:</b> V1 仅上线私聊对话模式，群聊 @Bot 功能顺延至 V2 评估。</div>
            <div style={{ fontSize: '13px', color: '#e6e8eb', marginBottom: '10px' }}><b>决策理由:</b> 群聊回调与消息频控存在安全隐患，私聊已能满足 80% HR 咨询场景。</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>
              <b>三句话评审口径:</b><br/>
              1. <b>用户看到什么:</b> 企微工作台「Lily 助手」图标，点击进入 1v1 对话框。<br/>
              2. <b>用户能做什么:</b> 发送自然语言咨询、点击预设快捷卡片、重试失败消息。<br/>
              3. <b>然后发生什么:</b> Lily 即时流式回复，若超时兜底提示人工 HR 联系方式。
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
