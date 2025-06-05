---
title: AI Deadlines
emoji: ⚡
colorFrom: gray
colorTo: blue
---

# AI Conference Deadlines

本仓库用于追踪实验室关注的人工智能领域顶级会议投稿截止日期，帮助团队成员快速了解各大 AI 会议（如 AAAI、ICLR、NeurIPS 等）的最新征稿时间，便于论文和项目规划。

## 如何增补/修改会议

我们欢迎实验室成员持续补充、修正会议数据！请按以下流程操作：

### 1. 编辑会议列表

所有会议信息集中于 [`src/data/conferences.yml`](src/data/conferences.yml) 文件。每条会议记录格式如下：

```yaml
- title: AAAI
  year: 2026
  id: aaai26
  full_name: AAAI Conference on Artificial Intelligence
  link: https://aaai.org/conference/aaai/aaai-26/
  deadline: '2025-08-01 23:59:59'
  timezone: UTC-12
  place: Singapore
  date: January 20 – January 27, 2026
  tags:
    - artificial-intelligence
    - machine-learning
  abstract_deadline: '2025-07-25 23:59:59'
  rankings: 'CCF: A, CORE: A*, THCPL: A'
  venue: Singapore EXPO, Singapore
  hindex: 212
  note: |
    <ul>
      <li><b>Abstract deadline:</b> July 25, 2025, 23:59 UTC-12</li>
      <li><b>Full paper deadline:</b> August 1, 2025, 23:59 UTC-12</li>
      <li><b>Conference dates:</b> January 20–27, 2026</li>
      <li><b>All deadlines are</b> "anywhere on Earth" (UTC-12)</li>
      <li>More information: <a href="https://aaai.org/conference/aaai/aaai-26/" target="_blank">AAAI-26 Official Website</a></li>
    </ul>
```

### 2. 字段说明
	•	title: 会议简称（如 AAAI）
	•	year: 举办年份
	•	id: 标识符（如 aaai26，建议小写+年份）
	•	full_name: 会议全称
	•	link: 官网链接
	•	deadline: 投稿截止时间（UTC-12，格式：YYYY-MM-DD HH:mm:ss）
	•	abstract_deadline: 摘要截止（如无可省略）
	•	timezone: 时区字符串（通常 UTC-12）
	•	date: 会议召开时间
	•	place: 会议举办地（如 Singapore）
	•	venue: 具体场馆
	•	tags: 领域标签，支持多个
	•	rankings: 推荐填写，如 “CCF: A, CORE: A*, THCPL: A”
	•	hindex: h5-index，可查自 Google Scholar Metrics
	•	note: 支持 HTML 结构，可用于重要日期等补充说明

请参考已有会议条目进行补充。务必保证 YAML 缩进和格式正确。

### 3. 提交流程
	1.	Fork 本仓库（或新建分支）
	2.	编辑并保存 src/data/conferences.yml
	3.	发起 Pull Request（或合并到主分支）

如有疑问可在 Issue 区提问，或直接联系维护者。

### 致谢 & 版权信息
	•	本项目基于 paperswithcode/ai-deadlines 进行二次开发和维护，并感谢 ccfddl/ccf-deadlines 提供数据支持。
	•	新前端 UI 参考 Hugging Face 及 Lovable、Cursor 等现代工具。

### License

本项目遵循 MIT License。