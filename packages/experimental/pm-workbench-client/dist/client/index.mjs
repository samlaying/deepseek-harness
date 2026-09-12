import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/client/PmWorkbenchView.tsx
function PmWorkbenchView({ sessionId: _sessionId }) {
	return /* @__PURE__ */ jsxs("div", {
		"data-pm-workbench-root": true,
		style: {
			display: "flex",
			height: "100%",
			width: "100%",
			background: "var(--dsw-alias-bg-base, #121316)",
			color: "var(--dsw-alias-label-primary, #e6e8eb)",
			overflow: "hidden",
			fontFamily: "inherit"
		},
		children: [/* @__PURE__ */ jsxs("aside", {
			"data-pm-memory-panel": true,
			style: {
				width: "340px",
				borderRight: "1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08))",
				padding: "18px",
				display: "flex",
				flexDirection: "column",
				gap: "18px",
				overflowY: "auto",
				background: "var(--dsw-alias-bg-surface, rgba(255, 255, 255, 0.02))"
			},
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					style: {
						fontSize: "13px",
						fontWeight: 600,
						color: "#00d4ff",
						marginBottom: "8px",
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ jsx("span", { children: "📁" }), " 项目记忆 (Lily / bagent)"]
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: "8px",
						padding: "12px"
					},
					children: [
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: "14px",
								fontWeight: 600,
								color: "#fff",
								marginBottom: "6px"
							},
							children: "当前推进: 消费明细与透明化计费"
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "对齐竞品" }),
								": 对齐 WorkBuddy 算力透明度体验"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "核心边界" }),
								": 仅重任务做前置区间预估，普通对话做后置轻量归因"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "13px",
								color: "#ffaa00",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "当前卡点" }),
								": 流式 SSE 传输中途截断时的 Token 实际扣减逻辑"
							]
						})
					]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					style: {
						fontSize: "13px",
						fontWeight: 600,
						color: "#00d4ff",
						marginBottom: "8px",
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ jsx("span", { children: "👥" }), " 人员记忆 (Stakeholders)"]
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px"
					},
					children: [/* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "10px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									color: "#fff"
								},
								children: "计费与网关团队"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "12px",
									color: "#9da3ae"
								},
								children: "负责: SSE usage 直吐与明细日志"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "12px",
									color: "#ffaa00"
								},
								children: "⚠️ 欠我: 确认 stream 结尾是否支持直吐 usage 字段 (今日 17:00 前)"
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "10px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									color: "#fff"
								},
								children: "张万里 / 花卷 (前端/UI)"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "12px",
									color: "#9da3ae"
								},
								children: "负责: 消息气泡末尾消耗 Badge"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "12px",
									color: "#00d4ff"
								},
								children: "待对齐: Hover 浮层展示“提问/回复”Token 拆解样式"
							})
						]
					})]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					style: {
						fontSize: "13px",
						fontWeight: 600,
						color: "#00d4ff",
						marginBottom: "8px",
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ jsx("span", { children: "📑" }), " 内部术语表 (Terminology)"]
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: "8px",
						padding: "10px"
					},
					children: [/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "12px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							"• ",
							/* @__PURE__ */ jsx("b", { children: "AI Pro 回收" }),
							": 席位回收后剩余月度配额的退回与清算日志"
						]
					}), /* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "12px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							"• ",
							/* @__PURE__ */ jsx("b", { children: "预计消耗" }),
							": 仅对耗时任务标注的参考区间（如 ~5-15 点），非强阻断"
						]
					})]
				})] })
			]
		}), /* @__PURE__ */ jsxs("main", {
			"data-pm-canvas-panel": true,
			style: {
				flex: 1,
				padding: "24px",
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				gap: "22px"
			},
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				style: {
					fontSize: "13px",
					fontWeight: 600,
					color: "#00d4ff",
					marginBottom: "12px",
					display: "flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [/* @__PURE__ */ jsx("span", { children: "🎯" }), " Today Must-Happen (今日必须推动落地的 3 个结果)"]
			}), /* @__PURE__ */ jsxs("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: "14px"
				},
				children: [
					/* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "14px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									color: "#fff",
									marginBottom: "6px"
								},
								children: "1. 确认 SSE 消息级 Usage 字段"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 联系网关确认流式完成时是否回传 prompt/completion tokens"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(0,212,255,0.15)",
									color: "#00d4ff",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "进行中 · 依赖网关"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "14px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									color: "#fff",
									marginBottom: "6px"
								},
								children: "2. 走查 WorkBuddy 任务前置预估"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 15:00 前截图确认其预估展现是轻量提示还是弹窗强确认"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(255,170,0,0.15)",
									color: "#ffaa00",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "今日 DDL 15:00"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "14px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									color: "#fff",
									marginBottom: "6px"
								},
								children: "3. 输出难缠用户极端扣费兜底表"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 明确网络截断、连续手抖、余额为0时的系统响应机制"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(0,212,255,0.15)",
									color: "#00d4ff",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "已推导完成"
							})
						]
					})
				]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				style: {
					fontSize: "13px",
					fontWeight: 600,
					color: "#00d4ff",
					marginBottom: "12px",
					display: "flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [/* @__PURE__ */ jsx("span", { children: "📝" }), " 本次需求机制卡片 (Mechanism Canvas - 对齐 WorkBuddy)"]
			}), /* @__PURE__ */ jsxs("div", {
				style: {
					background: "rgba(255,255,255,0.04)",
					border: "1px solid rgba(255,255,255,0.08)",
					borderRadius: "8px",
					padding: "16px"
				},
				children: [
					/* @__PURE__ */ jsx("div", {
						style: {
							fontSize: "15px",
							fontWeight: 600,
							color: "#fff",
							marginBottom: "8px"
						},
						children: "消耗明细分类与消息实际消耗展示机制"
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#e6e8eb",
							marginBottom: "6px"
						},
						children: [/* @__PURE__ */ jsx("b", { children: "核心取舍:" }), " 红方质询通过——普通对话不做前置预估阻断（保护流畅度），改为气泡轻量 Badge 归因；仅重任务展示「预计消耗区间」。"]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							/* @__PURE__ */ jsx("b", { children: "三句话评审口径:" }),
							/* @__PURE__ */ jsx("br", {}),
							"1. ",
							/* @__PURE__ */ jsx("b", { children: "用户看到什么:" }),
							" 明细页显示三种分类 Tag（对话/任务/清算）；每条 AI 气泡右下角灰色显示「⚡ 实际消耗 12 点」，Hover 查看详细 Token。",
							/* @__PURE__ */ jsx("br", {}),
							"2. ",
							/* @__PURE__ */ jsx("b", { children: "用户能做什么:" }),
							" 在明细列表按类型筛选流水；点击消息气泡消耗能查看费用拆解明细。",
							/* @__PURE__ */ jsx("br", {}),
							"3. ",
							/* @__PURE__ */ jsx("b", { children: "然后发生什么:" }),
							" 任务执行完成后，系统自动回写扣减流水，若网络异常截断则仅按实际截断字符扣费。"
						]
					})
				]
			})] })]
		})]
	});
}
//#endregion
//#region src/client/index.ts
const inject = ["slots"];
function apply(ctx) {
	ctx.slots.register({
		name: "conversation.view",
		id: "pm-workbench",
		order: 10,
		label: () => "PM 工作台",
		inject: (sessionId) => ({ sessionId })
	}, PmWorkbenchView);
}
//#endregion
export { apply, inject };

//# sourceMappingURL=index.mjs.map