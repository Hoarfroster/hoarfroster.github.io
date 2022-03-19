---
title: 如何在第 4 阶段之前体验一个提案
subtitle: How to experiment with a proposal before Stage 4
date: 2021/03/19 16:44:00
category: [Computer Science, Frontend, tc39]
tag:
- Computer Science
- Frontend
- tc39
- JavaScript
description: 对于敢于冒险并想就提案向 TC39 给予反馈的 JavaScript 程序员而言，可以通过本文提到的几种方式提前尝试新提案。
---

> * 原文地址：[How to experiment with a proposal before Stage 4](https://github.com/tc39/how-we-work/blob/master/experiment.md)
> * 原文作者：[Ecma TC39](https://github.com/tc39/how-we-work)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)
> * 校对者：[finalwhy](https://github.com/finalwhy)，[zaviertang](https://github.com/zaviertang)

对于敢于冒险并想就提案向 TC39 给予反馈的 JavaScript 程序员而言，可以通过以下几种方式提前尝试新提案：

- 对于不需要通过 TC39 语言设计更改进行维护的代码，通过使用运行时或构建时标志将其打开来试验该功能，例如：
    - 在 Babel 中，启用你选择的 Babel 预设中的功能（请参阅 [babel/proposals](https://github.com/babel/proposals/issues) 了解功能状态）。
    - 使用高级版本的 Web 浏览器，例如 **Edge Insider Edition**、**Safari Tech Preview**、**Firefox Nightly** 或 **Chrome Canary**，以获得某些新语言功能。你可以选择去查看他们的发行说明以了解包含的内容。
    - 使用 TypeScript —— TypeScript 实现了多个 Stage 3 TC39 的提案。
    - 在 V8 中，通过传入一个以 `--harmony` 开头的标志来开启对应的实验性功能，你可以在 [flag-definitions.h](https://github.com/v8/v8/blob/master/src/flag-definitions.h) 中找到这些标志。请注意，某些标记的实现可能不稳定或不完整，通常不应在生产环境中使用。
        - 在基于 V8 的 Node.js 中，可以像这样直接传递标志；
        - 在 Chrome 中，在 `about:flags` 中启用“实验性 JavaScript 功能”，或使用命令行参数 `--js-flags=--harmony-<flagname>`。
- 如果缺少实现，你可以自己动手 [添加一个](https://github.com/tc39/how-we-work/blob/master/implement.md)！
- 如果你想给提案提出一些反馈，可以在 GitHub 仓库中创建一个 issue。

警告：第 3 阶段及以下阶段的提案可能会发生重大变化或删除。
