#!/usr/bin/env bash
set -euo pipefail

owner="opcspace"

gh auth status >/dev/null

update_repo() {
  local repo="$1"
  local description="$2"
  local homepage="$3"
  local discussions="$4"
  shift 4

  gh api --method PATCH "repos/${owner}/${repo}" \
    -f description="$description" \
    -f homepage="$homepage" \
    -F has_discussions="$discussions" >/dev/null

  local args=(--method PUT "repos/${owner}/${repo}/topics")
  local topic
  for topic in "$@"; do args+=(-f "names[]=$topic"); done
  gh api "${args[@]}" >/dev/null
  echo "configured ${owner}/${repo}"
}

update_repo ".github" "OPCspace 组织治理、贡献系统与社区入口" "https://opcspace.com.cn/" true \
  community-health governance open-source opcspace
update_repo "opcstartup-skill" "AI 一人公司从验证到盈利的执行型 Agent Skills｜OPCspace 旗舰项目" "https://opcspace.com.cn/knowledge/" false \
  opc solopreneur ai-agent agent-skills entrepreneurship startup chinese
update_repo "Codex-Guide" "OpenAI Codex 中文实践知识库与工程工作流｜OPCspace 旗舰项目" "https://opcspace.github.io/Codex-Guide/" false \
  openai-codex codex ai-coding knowledge-base developer-tools chinese
update_repo "WorkBuddy-Guide" "WorkBuddy 中文实践知识库与办公交付工作流｜OPCspace 旗舰项目" "https://opcspace.github.io/WorkBuddy-Guide/" false \
  workbuddy ai-agent ai-office automation knowledge-base chinese
update_repo "opc-miaoda-skills" "秒哒应用创建 Skills｜OPCspace 实验性项目" "https://opcspace.com.cn/knowledge/" false \
  miaoda no-code ai-agent agent-skills app-builder chinese
update_repo "minimalist-entrepreneur-zh" "《极简企业家》中文 Skills｜OPCspace 知识归档" "https://opcspace.com.cn/knowledge/" false \
  minimalist-entrepreneur entrepreneurship claude-code skills chinese
update_repo "opcspace-global" "OPCspace 国际入口与 GitHub Pages 基础设施" "https://opc-space.com/" false \
  opcspace github-pages community solopreneur

gh label create "maintenance" --repo "${owner}/.github" --color "6f42c1" --description "组织治理与月度发布维护" --force

for repo in opcstartup-skill Codex-Guide WorkBuddy-Guide; do
  gh label create "good first issue" --repo "${owner}/${repo}" --color "7057ff" --description "适合第一次贡献的小任务" --force
  gh label create "documentation" --repo "${owner}/${repo}" --color "0075ca" --description "文档与来源改进" --force
  gh label create "case-study" --repo "${owner}/${repo}" --color "0e8a16" --description "真实使用案例" --force
  gh label create "community" --repo "${owner}/${repo}" --color "fbca04" --description "社区共建" --force
  gh label create "triage" --repo "${owner}/${repo}" --color "d4c5f9" --description "等待维护者确认范围" --force
done

ensure_issue() {
  local repo="$1"
  local title="$2"
  local labels="$3"
  local body="$4"
  if gh issue list --repo "${owner}/${repo}" --state all --limit 100 --json title --jq '.[].title' | grep -Fxq "$title"; then
    echo "issue exists ${repo}: ${title}"
    return
  fi
  gh issue create --repo "${owner}/${repo}" --title "$title" --label "$labels" --body "$body" >/dev/null
  echo "created issue ${repo}: ${title}"
}

for repo in opcstartup-skill Codex-Guide WorkBuddy-Guide; do
  ensure_issue "$repo" "[Good first issue] 检查并修复一个过期链接" "good first issue,documentation" \
    "选择一篇页面，核对其中的外部链接和易变化事实。提交 PR 时附官方来源、核查日期和验证结果。每次只处理一个小范围。"
  ensure_issue "$repo" "[Case] 征集一个真实使用案例" "case-study,community" \
    "请使用组织的真实案例模板，说明背景、使用过程和可验证结果。提交前删除客户姓名、密钥、联系方式和未公开资料。"
  ensure_issue "$repo" "[Docs] 找出一处难以复现的操作说明" "documentation,good first issue" \
    "按照 README 的路径实际执行一项操作，记录卡住的位置、环境和预期结果，并提出最小修正文案。"
done

echo "Remote repository settings applied. Next: select .github as the organization Discussions source in GitHub web settings."
