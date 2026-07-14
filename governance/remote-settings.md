# GitHub 远程设置清单

本文件记录不能仅靠仓库文件完成的组织设置。

## Discussions

1. 在 `.github` 仓库启用 Discussions。
2. 在 OPCspace 组织设置中将 `.github` 选为组织 Discussions 的源仓库。
3. 关闭其他仓库的 Discussions，将跨项目交流集中到组织入口。
4. 建议分类：公告、问答、想法、案例、城市社区、工具实践。

GitHub 当前要求组织所有者在网页设置中选择组织讨论源仓库；自动化脚本只能完成仓库级启用与关闭。

## 旗舰仓库保护

- 默认分支：`main`；
- 合并前至少通过仓库现有检查；
- 禁止强制推送和删除默认分支；
- 外部贡献默认通过 Pull Request；
- 小团队阶段不强制双人审批，但发布前必须由维护者复核来源与隐私。

## Release 节奏

- 每月最后一个工作周审查三个旗舰仓库；
- 有用户可感知变化时发布版本；无变化时在月度维护 Issue 记录“无发布”；
- Release Notes 至少包含新增、修复、行为变化、已知问题和贡献者；
- 实验项目按 `when-ready` 发布，知识归档只做维护版本。

## 执行

维护者完成 `gh auth login` 后，在本仓库根目录运行：

```bash
bash scripts/apply-governance.sh
```

脚本会配置仓库描述、主页、Topics、Discussions、统一标签和三个旗舰仓库的首批贡献任务。
