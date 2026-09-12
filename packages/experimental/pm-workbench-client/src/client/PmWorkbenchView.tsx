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
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>阶段: 6/16 灰度发布准备</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>定位</b>: 从端到端闭环转向引流工具 (站内商业产品导流)</div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>主流程</b>: 职位访谈 → 搜人 → HR审阅 → 推荐产品 (意向/邀约)</div>
            <div style={{ fontSize: '13px', color: '#ffaa00', lineHeight: 1.6 }}>• <b>P0卡点</b>: 搜索效果不稳定，关键词生成质量是核心</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>👥</span> 人员记忆 (100-bagent 团队分工)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>张万里 / 花卷 (前端/UI)</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>偏好: 结构化 UI 清单分批交付</div>
              <div style={{ fontSize: '12px', color: '#ffaa00' }}>⚠️ 欠我: 交付兑换页面设计稿 (周二)</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>袁金龙 / 瘦头陀 (服务端业务)</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>负责: 项目-会话绑定、预上线环境</div>
              <div style={{ fontSize: '12px', color: '#ffaa00' }}>⚠️ 欠我: 确认预上线环境配置与数据初始化耗时</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>董浩 (后端研发)</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>负责: 访谈摘要生成接口 (三参数契约)</div>
              <div style={{ fontSize: '12px', color: '#00d4ff' }}>状态: 对接摘要接口与短链跳转中</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>肖金华 / 老肖 (匹配系统)</div>
              <div style={{ fontSize: '12px', color: '#9da3ae' }}>负责: 后羿系统 (预选/模选/意向人选)</div>
              <div style={{ fontSize: '12px', color: '#00d4ff' }}>状态: 评估模选维度拆解与推荐策略</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📑</span> 内部术语表 (Terminology)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>后羿</b>: 猎聘承载简历预选/模选与意向人选的核心系统</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>预选/模选</b>: 预选粗筛广撒网，模选大模型逐条核对简历契合度</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>JD+</b>: 广义JD (JD文本 + 在线访谈 + 电话访谈 + 动态反馈)</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>上线代号</b>: 曝光(邀约灰度) / 鲁班 / 朱雀 / 夸父</div>
          </div>
        </div>
      </aside>

      {/* 右侧动态画布：100-bagent 今日必达 Top 3 + 决策日志 + PRD 机制卡片 */}
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
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>1. 联调访谈摘要生成接口</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 确认三参数(type+job_id+summary)并与董浩接口对齐</div>
              <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>进行中 · 依赖董浩</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>2. 催兑换页面设计稿</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 向万里同步周二截止要求，确保周三前端排期落地</div>
              <span style={{ fontSize: '11px', background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '2px 8px', borderRadius: '4px' }}>等待对方 · 万里</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>3. 验证导流短链生成与归因</div>
              <div style={{ fontSize: '13px', color: '#9da3ae', marginBottom: '8px' }}>下一步动作: 测试带访谈信息与纯跳转短链，同会话闭环统计</div>
              <span style={{ fontSize: '11px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>进行中 · 董涛短链</span>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📝</span> 100-bagent 关键决策日志 (Single Source of Truth)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              [2026-05-26] 产品定位重大调整：从端到端闭环转向引流工具
            </div>
            <div style={{ fontSize: '13px', color: '#e6e8eb', marginBottom: '6px' }}>
              <b>决策背景:</b> 原计划端到端闭环招聘全流程，老板 5/26 提出收窄核心目标为向站内商业产品导流。
            </div>
            <div style={{ fontSize: '13px', color: '#9da3ae', lineHeight: 1.6 }}>
              <b>三句话评审口径与机制约束:</b><br/>
              1. <b>用户看到什么:</b> 访谈完成后呈现候选人列表（姓名 + 详情 URL + 引导提示文案，暂不嵌操作按钮）。<br/>
              2. <b>用户能做什么:</b> 审阅候选人满意度，满意则根据数量触发商业产品推荐卡片（意向人选/邀约）。<br/>
              3. <b>然后发生什么:</b> 点击链接带访谈摘要跳转至商业化页面，完成导流归因。
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
