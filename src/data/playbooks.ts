export const playbooks = {
  harness: {
    key: 'harness',
    title: 'Harness Engineering 手册',
    displayTitle: 'HARNESS ENGINEERING',
    accentTitle: 'PLAYBOOK',
    description: '从可靠的 Agent 编程到规模化开发与组织治理，构建百倍生产力的软件交付制度。',
    cover: '/og-default.png',
    coverAlt: '雪猴 Harness 工程师操作笔记本电脑的漫画封面',
  },
  agent: {
    key: 'agent',
    title: 'Agent Engineering',
    displayTitle: 'AGENT ENGINEERING',
    accentTitle: 'PLAYBOOK',
    description: '从模型调用走向具备状态、工具、记忆与协作能力的智能体系统。',
    cover: '/site-assets/blog-hero-monkey-v3.jpg',
    coverAlt: '雪猴 Agent 工程师的黑红色视觉封面',
  },
} as const;

export type PlaybookKey = keyof typeof playbooks;

export const getChapterSlug = (slug: string) => slug.split('/').pop() || slug;
