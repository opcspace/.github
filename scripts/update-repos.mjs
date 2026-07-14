import fs from 'node:fs';

const owner = process.env.GITHUB_REPOSITORY_OWNER || 'opcspace';
const readmePath = new URL('../profile/README.md', import.meta.url);
const startMarker = '<!-- REPO-LIST:START -->';
const endMarker = '<!-- REPO-LIST:END -->';

const descriptions = {
  'Codex-Guide': 'OpenAI Codex 官方实践的中文整理与工程工作流指南',
  'WorkBuddy-Guide': '腾讯 WorkBuddy 官方实践的中文整理与可执行化指南',
  'opc-miaoda-skills': '面向一人公司和非技术用户的秒哒应用创建 Skills',
  'opcstartup-skill': 'AI 一人公司创业执行型 Skills',
  'minimalist-entrepreneur-zh': '《极简企业家》中文 Claude Code 技能库',
  'opcspace.github.io': 'OPCspace 组织官网'
};

const governance = {
  'opcstartup-skill': { status: '**旗舰**', priority: 1 },
  'Codex-Guide': { status: '**旗舰**', priority: 2 },
  'WorkBuddy-Guide': { status: '**旗舰**', priority: 3 },
  'opc-miaoda-skills': { status: '实验', priority: 4 },
  'minimalist-entrepreneur-zh': { status: '知识归档', priority: 5 },
  'opcspace.github.io': { status: '基础设施', priority: 6 }
};

function escapeCell(value = '') {
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'opcspace-profile-updater'
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const response = await fetch(
  `https://api.github.com/orgs/${owner}/repos?type=public&sort=pushed&direction=desc&per_page=100`,
  { headers }
);
if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);

const repos = (await response.json())
  .filter(repo => !repo.archived && repo.name !== '.github')
  .sort((a, b) => (governance[a.name]?.priority || 99) - (governance[b.name]?.priority || 99))
  .slice(0, 8);

const rows = repos.map(repo => {
  const description = descriptions[repo.name] || repo.description || 'OPCspace 开源项目';
  const status = governance[repo.name]?.status || '实验';
  const updated = repo.pushed_at.slice(0, 10);
  return `| [${escapeCell(repo.name)}](${repo.html_url}) | ${status} | ${escapeCell(description)} | ${updated} |`;
});

const synced = new Date().toISOString().slice(0, 10);
const block = [
  startMarker,
  '| Repository | Status | Description | Updated |',
  '|---|---|---|---:|',
  ...rows,
  '',
  `<sub>Last synced: ${synced} UTC · [Browse all repositories](https://github.com/orgs/${owner}/repositories)</sub>`,
  endMarker
].join('\n');

const readme = fs.readFileSync(readmePath, 'utf8');
const start = readme.indexOf(startMarker);
const end = readme.indexOf(endMarker);
if (start < 0 || end < 0 || end < start) throw new Error('Repository list markers are missing or invalid');

const updatedReadme = `${readme.slice(0, start)}${block}${readme.slice(end + endMarker.length)}`;
fs.writeFileSync(readmePath, updatedReadme);
console.log(`Updated ${repos.length} repositories in profile/README.md`);
