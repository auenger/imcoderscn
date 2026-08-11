import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const sourceRoot = path.resolve(process.argv[2] || '');
const projectRoot = path.resolve(import.meta.dirname, '..');
const destination = path.join(projectRoot, 'src/content/playbook/harness');
const zhRoot = path.join(sourceRoot, 'zh');
const summaryPath = path.join(zhRoot, 'SUMMARY.md');
const repositoryUrl = 'https://github.com/Agents-Zone/harness-engineering-playbook';
const legacyChapterAliases = {
  '02-specification': '02a-intent-alignment',
  '04-long-running': '04-spec-distributed',
  '04a-context-wall': '04a-artifact-role',
  '04b-task-decomposition': '04b-artifact-principle',
  '04c-context-engineering': '04c-cocreation',
  '04d-memory': '04d-case-study',
  '05-multi-agent': '05-verification-defense',
  '05a-isolation': '05a-verification-to-mechanism',
  '05b-integration': '05b-drift-locations',
  '05c-platform': '05c-three-layers',
};
const localTitleOverrides = {
  'chapters/02d-case-study.md': '实践：AILock-Step Feature Workflow',
};

if (!process.argv[2]) {
  throw new Error('Usage: node scripts/import-harness-playbook.mjs <cloned-repo-path>');
}

const revision = execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const updatedAt = execFileSync('git', ['-C', sourceRoot, 'log', '-1', '--format=%cs'], { encoding: 'utf8' }).trim();
const summary = await readFile(summaryPath, 'utf8');

const slugFor = (relativePath) => {
  if (relativePath === 'README.md') return 'about';
  if (relativePath === 'contributors.md') return 'contributors';
  return path.basename(relativePath, '.md');
};

const chapterLabel = (relativePath) => {
  const slug = slugFor(relativePath);
  if (slug === 'about') return '关于本书';
  if (slug === '00-introduction') return '引言';
  if (slug === 'contributors') return '贡献者';
  if (slug.startsWith('evolution-')) return '演进';
  if (/^v\d-conclusion$/.test(slug)) return '回顾';
  const code = slug.match(/^(\d+[a-z]?)/i)?.[1];
  return code ? code.toUpperCase() : '章节';
};

const cleanInline = (value) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_`>#]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const descriptionFor = (body, fallback) => {
  const paragraph = body.split(/\n\s*\n/)
    .filter((block) => !/^\s*#{1,6}\s/.test(block))
    .map((block) => cleanInline(block))
    .find((block) => block && !block.startsWith('---') && !block.startsWith('🚧'));
  const value = paragraph || fallback;
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
};

const rewriteLinks = (body) => body.replace(/\]\((?:\.\.\/)?(README\.md|contributors\.md|chapters\/[^)#]+\.md)(#[^)]+)?\)/g, (_match, target, hash = '') => {
  const slug = slugFor(target);
  return `](/playbook/harness/${legacyChapterAliases[slug] || slug}${hash})`;
});

const annotateAILockStep = (body) => {
  const lines = body.split('\n');
  const lineIndex = lines.findIndex((line) => line.includes('AILock-Step') && !/\[[^\]]*AILock-Step[^\]]*\]\(/.test(line));
  if (lineIndex < 0) return body;
  lines[lineIndex] = lines[lineIndex].replace(
    /AILock-Step(?: Feature Workflow)?/,
    '[AILock-Step Feature Workflow](/blog/feature-workflow)',
  );
  return lines.join('\n');
};

const applyLocalEditorial = (body, relativePath) => {
  let edited = body;

  if (relativePath === 'README.md') {
    const profile = `## 杨正武与 AILock-Step Feature Workflow

杨正武是 [AILock-Step Feature Workflow](/blog/feature-workflow) 的设计者，也是本书相关实践案例的贡献者。本书中出现的 “AILock-Step”“AILock-Step 框架” 与 “AILock-Step Feature Workflow”，均指向这套持续演进的 Feature Workflow 工作流体系。

AILock-Step 是项目与方法体系的名称，Feature Workflow 是其中面向 AI Agent 软件交付的核心工作流。它融合 BMAD 与 OpenSpec 的思路，以规约、任务、检查清单和 Git Worktree 组织 feature 的完整生命周期，让多个 Agent 可以隔离执行并通过验证闭环交付。

相关内容可以继续阅读：[Feature Workflow v1](/blog/feature-workflow)、[Feature Workflow v3](/blog/feature-workflow-v3)，以及本书的 [AILock-Step 实践章节](/playbook/harness/02d-case-study)。`;
    edited = edited.replace('\n## Agent Coding', `\n${profile}\n\n## Agent Coding`);
  }

  if (relativePath === 'contributors.md') {
    edited = edited.replace(
      /\| 杨正武 \(Ryan Yang\) \|.*\|/,
      '| 杨正武 (Ryan Yang) | AILock-Step Feature Workflow 设计者、框架实践与采访素材 |',
    );
  }

  if (relativePath.startsWith('chapters/')) edited = annotateAILockStep(edited);

  return edited;
};

const entries = [];
const seen = new Set();
let currentPart = '导读';

for (const line of summary.split('\n')) {
  const partMatch = line.match(/^###\s+(.+)$/);
  if (partMatch) {
    currentPart = cleanInline(partMatch[1]);
    continue;
  }

  const linkMatch = line.match(/^\s*\*\s+\[([^\]]+)\]\(([^)]+\.md)\)/);
  if (!linkMatch) continue;
  const [, summaryTitle, relativePath] = linkMatch;
  if (!['README.md', 'contributors.md'].includes(relativePath) && !relativePath.startsWith('chapters/')) continue;
  if (seen.has(relativePath)) continue;
  seen.add(relativePath);
  entries.push({
    relativePath,
    summaryTitle,
    part: relativePath === 'contributors.md' ? '附录' : currentPart,
  });
}

await mkdir(destination, { recursive: true });
for (const filename of await readdir(destination)) {
  if (filename.endsWith('.md')) await rm(path.join(destination, filename));
}

for (const [order, item] of entries.entries()) {
  const sourcePath = path.join(zhRoot, item.relativePath);
  const raw = await readFile(sourcePath, 'utf8');
  const sourceTitle = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() || item.summaryTitle;
  const h1 = localTitleOverrides[item.relativePath] || sourceTitle;
  const withoutTitle = raw.replace(/^#\s+.+\n+/, '');
  const body = applyLocalEditorial(rewriteLinks(withoutTitle), item.relativePath).trim();
  const slug = slugFor(item.relativePath);
  const sourceUrl = `${repositoryUrl}/blob/${revision}/zh/${item.relativePath}`;
  const frontmatter = [
    '---',
    'book: harness',
    `title: ${JSON.stringify(cleanInline(h1))}`,
    `description: ${JSON.stringify(descriptionFor(body, item.summaryTitle))}`,
    `order: ${order}`,
    `part: ${JSON.stringify(item.part)}`,
    `chapter: ${JSON.stringify(chapterLabel(item.relativePath))}`,
    `updatedAt: ${updatedAt}`,
    `sourceUrl: ${JSON.stringify(sourceUrl)}`,
    `sourceRevision: ${JSON.stringify(revision)}`,
    '---',
    '',
  ].join('\n');
  await writeFile(path.join(destination, `${slug}.md`), `${frontmatter}${body}\n`, 'utf8');
}

console.log(`Imported ${entries.length} Harness Playbook entries at ${revision.slice(0, 12)}.`);
