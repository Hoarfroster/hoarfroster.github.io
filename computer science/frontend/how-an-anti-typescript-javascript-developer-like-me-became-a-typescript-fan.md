---
title: 为什么我对 TypeScript 黑转粉？一个 JS 开发者的深情自白
subtitle: How an Anti-TypeScript “JavaScript developer” like me became a TypeScript fan
date: 2021/03/04 10:49:00
category: [Computer Science, Backend, JavaScript]
tag:
- Computer Science
- Frontend
- Backend
- TypeScript
- JavaScript
description: 在这篇博客文章中，我将会讲述我是如何从一名 TypeScript 黑粉的开发者转变到如今不想回到原生 JavaScript 世界的开发者的旅程 🚀，也许我的想法可以帮助和我几年前一样境遇的人们。
---

> * 原文地址：[How an Anti-TypeScript “JavaScript developer” like me became a TypeScript fan](https://chiragswadia.medium.com/how-an-anti-typescript-javascript-developer-like-me-became-a-typescript-fan-a4e043151ad7)
> * 原文作者：[chiragswadia](https://chiragswadia.medium.com/)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)
> * 校对者：[itcodes](https://github.com/itcodes)、[husiyu](https://github.com/husiyu)


在这篇博客文章中，我将会讲述我是如何从一名 TypeScript 黑粉的开发者转变到如今不想回到原生 JavaScript 世界的开发者的旅程 🚀，也许我的想法可以帮助和我几年前一样境遇的人们。

# **为什么我曾经是 TypeScript 的黑粉？**

我一直觉得给函数和变量设定类型，满足 TypeScript 编译器的各种检查是一种过度的设计，并且没有任何意义上的好处。而且这个设计也让我编写程序的速度很慢，也是因为我经常会遇到一些作为一名新人所难以理解的编译错误。我挠头三千尺，白发飘落，试图去找出问题所在，也同时增生了一丝惆怅与挫败。我开始讨厌 TypeScript 这门语言了。

另一个原因是 TypeScript 中诸如[范型](https://www.typescriptlang.org/docs/handbook/generics.html)之类的概念我一开始觉得很难理解。我开始觉得自己又深陷 **Java** 世界那般的泥潭，似乎每句代码的输入都是强类型并且令我极度厌烦的。当我开始学习 TypeScript 时，即使像下面这样的简单代码也足以让我感到恐惧。

![TypeScript 泛型示例](https://miro.medium.com/max/1544/1*ccNIwcBOISh4ZJ7kAuaY4A.png)

由于上述的原因，即使我通过观看一些在线的教程或是尝试去阅读书籍来学习 TypeScript，我也从未主导或参与过任何使用 TypeScript 编写的企业应用程序的开发之中。实际上，我过去常常选择 JavaScript 而不是 TypeScript（如果可以选择）去完成家庭作业这一公司面试过程的一部分 🙈。

但是，当我转任现职时，我失去了使用 JavaScript 的权利！因为我将要处理的所有应用程序都是用 TypeScript 编写的（JavaScript 部分都是些旧代码）。我对 TypeScript 的仇恨，与日俱增！但在几个月后，我终于明白了为什么会有人更喜欢 TypeScript，而不是喜欢 JavaScript 的原因，明白了使用 TypeScript 的好处和一些激励我去尝试使用的的理由。这些内容我将在下面的部分中列出：

## **我成为 TypeScript 粉丝的三大原因**

### **避免无效状态的出现 & 拥有详尽的检查**

这就是我喜欢 TypeScript 的主要原因。如果你想了解更多这个概念的信息，我建议你看下面的视频 —— 虽说它说的是 Elm 语言，但该概念也适用于 TypeScript 语言。


![Making Impossible State Impossible](https://youtu.be/IcgmSRJHu_8)

如果你想查看一些有关如何在 React 应用程序中利用 TypeScript 来避免程序出现无效状态的示例，我建议你去阅读一下下面的博客文章：

1. [交通信号灯系统是如何处理无效状态的现实示例 🚦](https://zohaib.me/leverage-union-types-in-typescript-to-avoid-invalid-state/)
2. [带有加载中、已加载和加载错误状态的 React 组件 ⚛️](https://dev.to/housinganywhere/matching-your-way-consistent-states-1oag)

### **及早发现错误**

在使用 JavaScript 时，我多次遇到过由于在前端没有进行类型检查而在生产环境发现 bug 的情况。这些 bug 本可以被避免，并且可以在编译时被 TypeScript 编译器发现，这样可以节省研发和 QA 的工作周期。

使用 TypeScript，一切都保持最初定义的方式。如果将变量声明为布尔型，则它将始终是布尔型，并且不会变成数字。这增加了代码按照最初预期的方式工作的可能性。简而言之，代码是可预测的！

### **丰富的 IDE 支持 & 易于重构**

集成开发环境（IDE）让有关类型的信息更加有用 —— 我们可以在 IDE 中使用上代码导航和自动完成等功能，并借助这些准确的建议修复错误。我们还可以在输入代码时获得反馈：编辑器会在错误发生时立即标记出错误，包括与类型相关的错误。这些功能可帮助开发者写出可维护的代码，并带来巨大的生产力提升 🚀。

关于重构，比如引入一个新状态或者移除应用程序正在使用的不需要的状态，如果在过程中我们忘记了要去更新部分引用，TypeScript 编译器就会进行警告。重构后的应用程序将像重构之前一样工作，不用担心兼容问题。这能让你对重构充满信心。

## **结论**

总而言之，使用 TypeScript 有许多的好处（如果你还没有这样做的话），而以上的几点就是我的主要动力，也是因为这些动力，我对 TypeScript 黑转粉了。

如果你是 TypeScript 的初学者或想提高你的知识，那么我可以推荐一些书：

1. [TypeScript 50课](https://amzn.to/37YslR2)（是个会员链接）
2. [使用 TypeScript](https://exploringjs.com/tackling-ts/)

让我们一起干杯! 🙂
