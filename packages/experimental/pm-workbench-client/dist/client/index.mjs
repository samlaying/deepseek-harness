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
							children: "阶段: 6/16 灰度发布准备"
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "13px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "定位" }),
								": 从端到端闭环转向引流工具 (站内商业产品导流)"
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
								/* @__PURE__ */ jsx("b", { children: "主流程" }),
								": 职位访谈 → 搜人 → HR审阅 → 推荐产品 (意向/邀约)"
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
								/* @__PURE__ */ jsx("b", { children: "P0卡点" }),
								": 搜索效果不稳定，关键词生成质量是核心"
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
					children: [/* @__PURE__ */ jsx("span", { children: "👥" }), " 人员记忆 (100-bagent 团队分工)"]
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px"
					},
					children: [
						/* @__PURE__ */ jsxs("div", {
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
									children: "偏好: 结构化 UI 清单分批交付"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#ffaa00"
									},
									children: "⚠️ 欠我: 交付兑换页面设计稿 (周二)"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
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
									children: "袁金龙 / 瘦头陀 (服务端业务)"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#9da3ae"
									},
									children: "负责: 项目-会话绑定、预上线环境"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#ffaa00"
									},
									children: "⚠️ 欠我: 确认预上线环境配置与数据初始化耗时"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
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
									children: "董浩 (后端研发)"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#9da3ae"
									},
									children: "负责: 访谈摘要生成接口 (三参数契约)"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#00d4ff"
									},
									children: "状态: 对接摘要接口与短链跳转中"
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
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
									children: "肖金华 / 老肖 (匹配系统)"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#9da3ae"
									},
									children: "负责: 后羿系统 (预选/模选/意向人选)"
								}),
								/* @__PURE__ */ jsx("div", {
									style: {
										fontSize: "12px",
										color: "#00d4ff"
									},
									children: "状态: 评估模选维度拆解与推荐策略"
								})
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
					children: [/* @__PURE__ */ jsx("span", { children: "📑" }), " 内部术语表 (Terminology)"]
				}), /* @__PURE__ */ jsxs("div", {
					style: {
						background: "rgba(255,255,255,0.04)",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: "8px",
						padding: "10px"
					},
					children: [
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "12px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "后羿" }),
								": 猎聘承载简历预选/模选与意向人选的核心系统"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "12px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "预选/模选" }),
								": 预选粗筛广撒网，模选大模型逐条核对简历契合度"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "12px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "JD+" }),
								": 广义JD (JD文本 + 在线访谈 + 电话访谈 + 动态反馈)"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							style: {
								fontSize: "12px",
								color: "#9da3ae",
								lineHeight: 1.6
							},
							children: [
								"• ",
								/* @__PURE__ */ jsx("b", { children: "上线代号" }),
								": 曝光(邀约灰度) / 鲁班 / 朱雀 / 夸父"
							]
						})
					]
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
								children: "1. 联调访谈摘要生成接口"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 确认三参数(type+job_id+summary)并与董浩接口对齐"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(0,212,255,0.15)",
									color: "#00d4ff",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "进行中 · 依赖董浩"
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
								children: "2. 催兑换页面设计稿"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 向万里同步周二截止要求，确保周三前端排期落地"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(255,170,0,0.15)",
									color: "#ffaa00",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "等待对方 · 万里"
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
								children: "3. 验证导流短链生成与归因"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									fontSize: "13px",
									color: "#9da3ae",
									marginBottom: "8px"
								},
								children: "下一步动作: 测试带访谈信息与纯跳转短链，同会话闭环统计"
							}),
							/* @__PURE__ */ jsx("span", {
								style: {
									fontSize: "11px",
									background: "rgba(0,212,255,0.15)",
									color: "#00d4ff",
									padding: "2px 8px",
									borderRadius: "4px"
								},
								children: "进行中 · 董涛短链"
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
				children: [/* @__PURE__ */ jsx("span", { children: "📝" }), " 100-bagent 关键决策日志 (Single Source of Truth)"]
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
							fontSize: "14px",
							fontWeight: 600,
							color: "#fff",
							marginBottom: "8px"
						},
						children: "[2026-05-26] 产品定位重大调整：从端到端闭环转向引流工具"
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#e6e8eb",
							marginBottom: "6px"
						},
						children: [/* @__PURE__ */ jsx("b", { children: "决策背景:" }), " 原计划端到端闭环招聘全流程，老板 5/26 提出收窄核心目标为向站内商业产品导流。"]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							fontSize: "13px",
							color: "#9da3ae",
							lineHeight: 1.6
						},
						children: [
							/* @__PURE__ */ jsx("b", { children: "三句话评审口径与机制约束:" }),
							/* @__PURE__ */ jsx("br", {}),
							"1. ",
							/* @__PURE__ */ jsx("b", { children: "用户看到什么:" }),
							" 访谈完成后呈现候选人列表（姓名 + 详情 URL + 引导提示文案，暂不嵌操作按钮）。",
							/* @__PURE__ */ jsx("br", {}),
							"2. ",
							/* @__PURE__ */ jsx("b", { children: "用户能做什么:" }),
							" 审阅候选人满意度，满意则根据数量触发商业产品推荐卡片（意向人选/邀约）。",
							/* @__PURE__ */ jsx("br", {}),
							"3. ",
							/* @__PURE__ */ jsx("b", { children: "然后发生什么:" }),
							" 点击链接带访谈摘要跳转至商业化页面，完成导流归因。"
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