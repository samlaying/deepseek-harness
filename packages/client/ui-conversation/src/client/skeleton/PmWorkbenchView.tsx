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
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary, inherit)',
        overflow: 'hidden',
        fontFamily: 'inherit',
      }}
    >
      {/* ── 左侧记忆库面板：实时联动底层 3 份 SSOT 记忆 ─────────────────── */}
      <aside
        data-pm-memory-panel
        style={{
          width: '360px',
          borderRight: '1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '18px',
          paddingBottom: '160px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📁 项目记忆 (Lily / bagent)</span>
            <span style={{ fontSize: '11px', color: '#00ffaa' }}>SSOT 活跃</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>当前推进: 消费明细与透明化计费</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>对齐标的</b>: 对标 WorkBuddy 算力透明度心智</div>
            <div style={{ fontSize: '12px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>核心边界</b>: 普通对话后置气泡微标，重任务前置区间预估</div>
            <div style={{ fontSize: '12px', color: '#00ffaa', lineHeight: 1.6 }}>• <b>卡点闭环</b>: 流式 SSE 截断按 ACK 偏置量原子落盘</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>👥 人员记忆 (Stakeholders)</span>
            <span style={{ fontSize: '11px', color: '#ffaa00' }}>2 项待催办</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>计费与网关团队</div>
                <span style={{ fontSize: '10px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', padding: '1px 6px', borderRadius: '4px' }}>网关研发</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginTop: '2px' }}>负责: SSE usage 直吐与明细日志返回契约</div>
              <div style={{ fontSize: '11px', color: '#ffaa00', marginTop: '4px' }}>⚠️ 欠我Action: 确认 stream 结尾直吐 usage (今日 17:00 前)</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>张万里 / 花卷</div>
                <span style={{ fontSize: '10px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', padding: '1px 6px', borderRadius: '4px' }}>前端 / UI</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginTop: '2px' }}>负责: 消息气泡末尾实际消耗 Badge 与 Hover Token 卡片</div>
              <div style={{ fontSize: '11px', color: '#ffaa00', marginTop: '4px' }}>⚠️ 欠我Action: 交付气泡 Badge 交互设计稿 (周二前)</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📝</span> 关键决策日志 (Decision Log)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffaa' }}>[2026-09-12] 算力计费双轨制</div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '3px', lineHeight: 1.5 }}>
                <b>决策:</b> 普通对话不加弹窗，气泡右下角轻量 Badge；仅重任务前置预估区间。<br/>
                <b>拍板人:</b> PM (人机交互终端拍板)
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffaa' }}>[2026-09-12] 超额 150% 熔断确认</div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '3px', lineHeight: 1.5 }}>
                <b>决策:</b> 实际模型消耗超出预估 150% 触发二次确认弹窗，杜绝客诉争议。<br/>
                <b>拍板人:</b> PM (人机交互终端拍板)
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📑</span> 内部术语表 (Terminology)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '11px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>AI Pro 回收</b>: 席位回收后剩余月度配额退回与清算</div>
            <div style={{ fontSize: '11px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>实际消耗 Badge</b>: 气泡末尾浅灰微标，悬浮展开 Token 拆解</div>
            <div style={{ fontSize: '11px', color: '#9da3ae', lineHeight: 1.6 }}>• <b>预计消耗区间</b>: 重任务触发前预估（如 ~15-25 算力），非强阻断</div>
          </div>
        </div>
      </aside>

      {/* ── 右侧动态画布：需求提问 + 多Agent推导 + 决策拍板 + 兜底与原型 ── */}
      <main
        data-pm-canvas-panel
        style={{
          flex: 1,
          padding: '24px',
          paddingBottom: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* 1. 本次 PM 需求提问与原始输入 (Question / Intake Card) */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬</span> PM 需求提问与原始意图 (Requirement Intake)
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(0, 255, 170, 0.15)', color: '#00ffaa', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0, 255, 170, 0.3)' }}>
              ✔ 多 Agent 推导完成 · PM 拍板已闭环 · SSOT 记忆已同步
            </span>
          </div>
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '12px', fontSize: '13px', color: '#e6e8eb', lineHeight: 1.6 }}>
            <span style={{ color: '#00d4ff', fontWeight: 600 }}>原始提问: </span>
            “写个小需求、就是明细展示一下类型、比如对话消耗、Alpro账号回收、等等还有每个消息后面加一个实际消耗任务执行之前加一个预计消耗研究下,对齐workbuddy”
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: '#9da3ae', padding: '2px 8px', borderRadius: '4px' }}>提问人: PM (User)</span>
            <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: '#9da3ae', padding: '2px 8px', borderRadius: '4px' }}>交互模式: dsh-pm 终端 REPL & PM 工作台</span>
            <span style={{ fontSize: '11px', background: 'rgba(0, 212, 255, 0.15)', color: '#00d4ff', padding: '2px 8px', borderRadius: '4px' }}>对标竞品: WorkBuddy</span>
          </div>
        </div>

        {/* 2. 多 Agent 协同网络状态栏 (Multi-Agent Swarm) */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> PM Multi-Agent 并行协同调度网络 (Swarm Active)
            </div>
            <span style={{ fontSize: '11px', color: '#9da3ae' }}>
              3 个专职 Agent 并行分析 ➔ PM 人机交互拍板 ➔ 专职 Memory Agent 归档
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> Clarify Subagent
              </div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '4px' }}>需求细化 · Today Top 3</div>
              <div style={{ fontSize: '11px', color: '#00ffaa', marginTop: '4px' }}>🟢 完成 (4 分类 / 3 必达动作)</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> RedTeam Subagent
              </div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '4px' }}>红蓝对抗 · 边界死角兜底</div>
              <div style={{ fontSize: '11px', color: '#00ffaa', marginTop: '4px' }}>🟢 完成 (3 大质询 / 极端兜底表)</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📊</span> Benchmark Subagent
              </div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '4px' }}>对标调研 · 对齐 WorkBuddy</div>
              <div style={{ fontSize: '11px', color: '#00ffaa', marginTop: '4px' }}>🟢 完成 (心智对齐 / 原型微标)</div>
            </div>

            <div style={{ background: 'rgba(255, 170, 0, 0.05)', border: '1px solid rgba(255, 170, 0, 0.2)', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffaa00', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧠</span> Memory Agent (专职)
              </div>
              <div style={{ fontSize: '11px', color: '#9da3ae', marginTop: '4px' }}>专职维护人员与项目记忆</div>
              <div style={{ fontSize: '11px', color: '#00d4ff', marginTop: '4px' }}>🔄 实时同步完成 (SSOT Synced)</div>
            </div>
          </div>
        </div>

        {/* 3. PM 交互决策拍板记录 (Human-in-the-Loop Decisions) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚖️</span> PM 交互式拍板与红蓝质询确认 (Human-in-the-Loop Decisions)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '12px' }}>
            {/* 抉择 1 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#00d4ff' }}>[抉择 1] 普通对话是否加前置预计阻断弹窗？</span>
                <span style={{ fontSize: '11px', background: 'rgba(0, 255, 170, 0.15)', color: '#00ffaa', padding: '2px 6px', borderRadius: '4px' }}>👑 PM 已拍板</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginBottom: '8px' }}>
                RedTeam 质询: 大模型回复长度动态不确定，单句前置弹窗严重打断输入流。
              </div>
              <div style={{ background: 'rgba(0, 255, 170, 0.08)', border: '1px solid rgba(0, 255, 170, 0.25)', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#fff' }}>
                <b>最终拍板 (选项 A):</b> 普通对话不加弹窗阻断；生成完毕后在气泡右下角展示轻量「⚡ 实际消耗 X 算力」，降低用户打断摩擦。
              </div>
            </div>

            {/* 抉择 2 */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#00d4ff' }}>[抉择 2] 实际发散超出预估 150% 时如何处置？</span>
                <span style={{ fontSize: '11px', background: 'rgba(0, 255, 170, 0.15)', color: '#00ffaa', padding: '2px 6px', borderRadius: '4px' }}>👑 PM 已拍板</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginBottom: '8px' }}>
                RedTeam 质询: 任务执行预估 10 算力，实际消耗 100 算力会导致客诉争议；中途弹窗又会中断流式体验。
              </div>
              <div style={{ background: 'rgba(0, 255, 170, 0.08)', border: '1px solid rgba(0, 255, 170, 0.25)', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', color: '#fff' }}>
                <b>最终拍板 (选项 B - 事务冻结+静默放行):</b> 启动前先冻结预估额度，超额部分后台静默补扣并在明细账单中打上黄色「超额异常」Tag，绝对不中断生成流。
              </div>
            </div>
          </div>
        </div>

        {/* 4. 今日必达 Top 3 (Today Must-Happen Actions) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯</span> Today Must-Happen (今日必须推动落地的 3 个必达动作)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>1. 确认 SSE Usage 字段契约</div>
                <span style={{ fontSize: '10px', background: 'rgba(0,212,255,0.15)', color: '#00d4ff', padding: '1px 6px', borderRadius: '4px' }}>P1 · 计费网关</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginBottom: '6px' }}>动作: 联系网关团队，确认 stream 结尾是否直吐 usage 结构</div>
              <span style={{ fontSize: '11px', color: '#ffaa00' }}>⏰ DDL: 今日 17:00 前</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>2. 走查 WorkBuddy 任务预估</div>
                <span style={{ fontSize: '10px', background: 'rgba(255,170,0,0.15)', color: '#ffaa00', padding: '1px 6px', borderRadius: '4px' }}>P2 · PM/交互</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginBottom: '6px' }}>动作: 截图走查 WorkBuddy 预估展现是轻量提示还是弹窗强确认</div>
              <span style={{ fontSize: '11px', color: '#ffaa00' }}>⏰ DDL: 今日 15:00 前</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>3. 输出难缠用户极端扣费兜底表</div>
                <span style={{ fontSize: '10px', background: 'rgba(0,255,170,0.15)', color: '#00ffaa', padding: '1px 6px', borderRadius: '4px' }}>P3 · 架构/PM</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9da3ae', marginBottom: '6px' }}>动作: 针对断网截断、手抖并发、余额透支完成系统机制制定</div>
              <span style={{ fontSize: '11px', color: '#00ffaa' }}>✔ 已推导完成并归档</span>
            </div>
          </div>
        </div>

        {/* 5. RedTeam 难缠用户极端扣费兜底矩阵 (Boundary Deadlock & Fallback Table) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🛡️</span> RedTeam 难缠用户极端扣费兜底矩阵 (Boundary Deadlocks & Fallbacks)
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#00d4ff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '10px 14px', width: '22%' }}>极端场景</th>
                  <th style={{ padding: '10px 14px', width: '30%' }}>死角风险 (RedTeam 质询)</th>
                  <th style={{ padding: '10px 14px', width: '48%' }}>系统兜底机制 (PRD 结论)</th>
                </tr>
              </thead>
              <tbody style={{ color: '#9da3ae' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff', fontWeight: 500 }}>流式传输中途用户断网/关页面</td>
                  <td style={{ padding: '10px 14px' }}>后端继续吐字并全额扣费，用户客诉“没收到凭什么扣算力”</td>
                  <td style={{ padding: '10px 14px', color: '#e6e8eb' }}>
                    服务端监听客户端连接断开，按<b>最后一次成功 ACK 的 Token 偏置量</b>落盘扣除，绝不多扣 1 个 Token。
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 14px', color: '#fff', fontWeight: 500 }}>余额扣到 0 或负数</td>
                  <td style={{ padding: '10px 14px' }}>大模型生成到一半直接报错中断崩溃，用户输入白费</td>
                  <td style={{ padding: '10px 14px', color: '#e6e8eb' }}>
                    赋予 <b>-5 算力透支宽限额度</b>，保证当前轮次生成完整收口，随后展示友好催充浮窗，禁止开启新会话。
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', color: '#fff', fontWeight: 500 }}>账号回收与大任务并发扣费</td>
                  <td style={{ padding: '10px 14px' }}>并发竞争导致算力超额透支，配额计算混乱</td>
                  <td style={{ padding: '10px 14px', color: '#e6e8eb' }}>
                    引入<b>分布式排他锁 + 事务先冻结再清算机制</b>，账号回收必须优先等待挂起任务清算完成。
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. 对齐 WorkBuddy 气泡交互原型预览 (Live Interactive Bubble Preview) */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#00d4ff', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎨</span> 消息气泡末尾实际消耗 Badge 效果预览 (对齐 WorkBuddy)
            </span>
            <span style={{ fontSize: '11px', color: '#9da3ae' }}>前端设计走查卡片</span>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 用户消息 */}
            <div style={{ alignSelf: 'flex-end', background: 'rgba(0, 212, 255, 0.15)', border: '1px solid rgba(0, 212, 255, 0.3)', borderRadius: '12px 12px 2px 12px', padding: '10px 14px', maxWidth: '70%', fontSize: '13px', color: '#fff' }}>
              请帮我分析这份 50 页的行业研报，并总结关键数据。
            </div>

            {/* AI 消息气泡 + 末尾 Badge */}
            <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px 12px 12px 2px', padding: '14px 16px', maxWidth: '85%', fontSize: '13px', color: '#e6e8eb', position: 'relative' }}>
              <div style={{ lineHeight: 1.6, marginBottom: '10px' }}>
                已完成对行业研报的深度提炼：核心市场规模预计在 2027 年突破 1,200 亿元，复合年增长率（CAGR）达到 28.4%...
              </div>

              {/* 末尾实际消耗微标 (带悬浮拆解) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ fontSize: '11px', color: '#7a828e' }}>13:10</span>
                <span
                  title="Prompt: 4,120 tokens · Completion: 860 tokens · 类型: 对话消耗"
                  style={{
                    fontSize: '11px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#00d4ff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 212, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span>⚡ 实际消耗 18 算力</span>
                  <span style={{ fontSize: '9px', color: '#9da3ae' }}>(Hover 明细)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
