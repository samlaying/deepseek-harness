/** `pm-workbench` namespace dictionaries. */

export const NS = 'pm-workbench'

/** Simplified Chinese dictionary and key source. */
export const zh = {
  'view.label': 'PM 画板',
  'projects.title': '项目',
  'projects.empty': '还没有绑定的项目文件夹。点绑定文件夹，在访达里选择一个目录。',
  'projects.open': '绑定文件夹',
  'chat.title': '对话',
  'chat.empty': '在下方输入。每出现一个字，右侧画板的实时卡片会跟着刷新。',
  'canvas.title': '项目画板',
  'canvas.empty': '绑定一个项目文件夹后，思路、模板、文档和记忆会出现在这块无限画布上。',
  'canvas.live': '实时输出',
  'card.preview': '预览',
  'card.edit': '编辑',
  'card.save': '保存到本地',
  'kind.thought': '思路',
  'kind.template': '模板',
  'kind.doc': '文档',
  'kind.memory': '记忆',
} as const

/** The PM Workbench namespace key union. */
export type PmWorkbenchKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'view.label': 'PM board',
  'projects.title': 'Projects',
  'projects.empty': 'No project folders yet. Bind a folder to choose a directory in Finder.',
  'projects.open': 'Bind folder',
  'chat.title': 'Conversation',
  'chat.empty': 'Type below. Each streamed character refreshes the live card on the canvas.',
  'canvas.title': 'Project canvas',
  'canvas.empty': 'Bind a project folder to pin thoughts, templates, documents, and memory on this infinite canvas.',
  'canvas.live': 'Live output',
  'card.preview': 'Preview',
  'card.edit': 'Edit',
  'card.save': 'Save locally',
  'kind.thought': 'Thought',
  'kind.template': 'Template',
  'kind.doc': 'Document',
  'kind.memory': 'Memory',
} satisfies Record<PmWorkbenchKey, string>
