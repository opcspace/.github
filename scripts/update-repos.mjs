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
  .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
  .slice(0, 8);

const rows = repos.map(repo => {
  const description = descriptions[repo.name] || repo.description || 'OPCspace 开源项目';
  const stack = repo.language || '—';
  const updated = repo.pushed_at.slice(0, 10);
  return `| [${escapeCell(repo.name)}](${repo.html_url}) | ${escapeCell(description)} | ${escapeCell(stack)} | ${updated} |`;
});

const synced = new Date().toISOString().slice(0, 10);
const block = [
  startMarker,
  '| Repository | Description | Stack | Updated |',
  '|---|---|---:|---:|',
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

