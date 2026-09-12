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
			overflow: "hidden"
		},
		children: [/* @__PURE__ */ jsxs("aside", {
			"data-pm-memory-panel": true,
			style: {
				width: "320px",
				borderRight: "1px solid var(--dsw-alias-border-subtle, rgba(255, 255, 255, 0.08))",
				padding: "16px",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
				overflowY: "auto",
				background: "var(--dsw-alias-bg-surface, rgba(255, 255, 255, 0.02))"
			},
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					style: {
						fontSize: "13px",
						fontWeight: 600,
						color: "#00d4ff",
						marginBottom: "8px"
					},
					children: "📁 项目记忆 (Single Source of Truth)"
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
							children: "当前推进阶段: MVP 验证"
						}),
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: "• 核心目标: 建立 AI 协作产品经理工作流"
						}),
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: "• 当前卡点: 确认企业微信自建应用权限边界"
						}),
						/* @__PURE__ */ jsx("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: "• 风险: IM 回调频控与多群聊并发"
						})
					]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("div", {
						style: {
							fontSize: "13px",
							fontWeight: 600,
							color: "#00d4ff",
							marginBottom: "8px"
						},
						children: "👥 人员记忆 (Stakeholders)"
					}),
					/* @__PURE__ */ jsxs("div", {
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
								children: "研发负责人 (Alex)"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									lineHeight: 1.6
								},
								children: "偏好: 数据驱动、明确的接口 DDL"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#ffaa00",
									lineHeight: 1.6
								},
								children: "⚠️ 欠我Action: 确认群聊消息回调与频控 (今日 18:00)"
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							background: "rgba(255,255,255,0.04)",
							border: "1px solid rgba(255,255,255,0.08)",
							borderRadius: "8px",
							padding: "12px",
							marginTop: "8px"
						},
						children: [
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									color: "#fff",
									marginBottom: "6px"
								},
								children: "业务负责人 (Sarah)"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									lineHeight: 1.6
								},
								children: "偏好: 结论先行、30秒汇报摘要"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									lineHeight: 1.6
								},
								children: "关注点: 员工与 Lily 的私聊体验完整度"
							})
						]
					})
				] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					style: {
						fontSize: "13px",
						fontWeight: 600,
						color: "#00d4ff",
						marginBottom: "8px"
					},
					children: "📑 内部专有术语表"
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: "8px",
						padding: "12px"
					},
					children: [/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							"• ",
							/* @__PURE__ */ jsx("b", { children: "Lily" }),
							": 智能招聘/HR 咨询数字助手"
						]
					}), /* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							"• ",
							/* @__PURE__ */ jsx("b", { children: "SSOT" }),
							": 单一事实源，所有决策唯一的收敛落点"
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
				gap: "20px"
			},
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: "13px",
					fontWeight: 600,
					color: "#00d4ff",
					marginBottom: "12px"
				},
				children: "🎯 Today Must-Happen (今日必须发生的 3 个结果)"
			}), /* @__PURE__ */ jsxs("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: "12px"
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
								children: "1. 确认飞书 / 企微产品形态"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 对比私聊/群聊权限限制"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(0,212,255,0.15)",
									color: "#00d4ff",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "进行中"
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
								children: "2. 确定第一版授权流程"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 画出 V1 首次进入的扫码鉴权时序图"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(255,255,255,0.1)",
									color: "#aaa",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "待开始"
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
								children: "3. 拉研发确认技术风险"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 发出结构化协作消息并等待 Alex 回复"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(255,170,0,0.15)",
									color: "#ffaa00",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "等待对方"
							})
						]
					})
				]
			})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				style: {
					fontSize: "13px",
					fontWeight: 600,
					color: "#00d4ff",
					marginBottom: "12px"
				},
				children: "📝 动态决策与机制卡片 (Mechanism Canvas)"
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
						children: "企微自建应用接入机制 (V1 范围决策)"
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#e6e8eb",
							marginBottom: "6px"
						},
						children: [/* @__PURE__ */ jsx("b", { children: "决策内容:" }), " V1 仅上线私聊对话模式，群聊 @Bot 功能顺延至 V2 评估。"]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#e6e8eb",
							marginBottom: "10px"
						},
						children: [/* @__PURE__ */ jsx("b", { children: "决策理由:" }), " 群聊回调与消息频控存在安全隐患，私聊已能满足 80% HR 咨询场景。"]
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
							" 企微工作台「Lily 助手」图标，点击进入 1v1 对话框。",
							/* @__PURE__ */ jsx("br", {}),
							"2. ",
							/* @__PURE__ */ jsx("b", { children: "用户能做什么:" }),
							" 发送自然语言咨询、点击预设快捷卡片、重试失败消息。",
							/* @__PURE__ */ jsx("br", {}),
							"3. ",
							/* @__PURE__ */ jsx("b", { children: "然后发生什么:" }),
							" Lily 即时流式回复，若超时兜底提示人工 HR 联系方式。"
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