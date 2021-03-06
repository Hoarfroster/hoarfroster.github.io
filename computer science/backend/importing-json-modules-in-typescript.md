---
title: 在 TypeScript 中引入 JSON 模块
subtitle: Importing JSON Modules in TypeScript
date: 2021/01/29 10:35:00
category: [Computer Science, Backend, TypeScript]
tag:
- Computer Science
- Backend
- TypeScript
description: TypeScript 2.9 版本引入了一个新的 --resolveJsonModule 编译选项，让我们可以在 TypeScript 模块内部引入 JSON 模块。
---

> * 原文地址：[Importing JSON Modules in TypeScript](https://mariusschulz.com/blog/importing-json-modules-in-typescript)
> * 原文作者：[Marius Schulz](https://mariusschulz.com/)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)
> * 校对者：[zenblo](https://github.com/zenblo)、[regonCao](https://github.com/regon-cao)

TypeScript 2.9 版本引入了一个新的 `--resolveJsonModule` 编译选项，让我们可以在 TypeScript 模块内部引入 JSON 模块。

## 通过 `require` 函数的调用引入 JSON 模块

假设我们有一个用 TypeScript 编写的 Node 应用程序，并且假设我们要导入以下 JSON 文件：

```json
{
    "server": {
        "nodePort": 8080
    }
}
```

在 Node 中，我们可以调用 `require` 函数导入这一个 JSON 文件，就像是导入别的 CommonJS 模块一样：

```typescript
const config = require("./config.json");
```

这一个 JSON 文件会被自动的反序列化为普通的 JavaScript 对象，让我们可以轻松访问配置对象的属性：

```typescript
"use strict";

const express = require("express");
const config = require("./config.json");

const app = express();

app.listen(config.server.nodePort, () => {
    console.log(`在端口 ${config.server.nodePort} 上监听...`);
});
```

迄今为止，一切都挺棒的！

## 通过使用静态的 `import` 声明语句导入 JSON 文件

现在如果说我们要使用原生的 ECMAScript 模块而不是 CommonJS 模块，那么我们必须将 `require` 的调用转换为静态的 `import` 声明：

```typescript
// 因为所有的 ECMAScript 模块都默认使用 strict 模式
// 我们不需要再声明 `use strict`

import * as express from "express";
import * as config from "./config.json";

const app = express();

app.listen(config.server.nodePort, () => {
    console.log(`在端口 ${config.server.nodePort} 上监听...`);
});
```

现在，程序在第 2 行中出现了类型错误。TypeScript 不允许我们按照这种方式开箱即用地导入 JSON 模块。这是 TypeScript 团队的一项明智的设计决定：获取较大的 JSON 文件可能会[消耗大量内存](https://github.com/Microsoft/TypeScript/pull/22167#issuecomment-385479553)。这就是为什么我们需要通过启用 `--resolveJsonModule` 编译器标志来选择使用该功能：

> 让人们有意识地选择这个做法帮助着用户了解耗费的成本。

让我们转到 **tsconfig.json** 文件并在其中启用该选项：

```json
{
    "compilerOptions": {
        "target": "es2015",
        "module": "commonjs",
        "strict": true,
        "moduleResolution": "node",
        "resolveJsonModule": true
    }
}
```

在声明了 `--resolveJsonModule` 以后，我们的 TypeScript 文件现在不会再出现类型错误。而且，我们现在还拥有了类型检查和自动补全功能！

如果使用上面显示的编译器选项编译 TypeScript 文件，则会得到以下 JavaScript 输出：

```typescript
"use strict";

Object.defineProperty(exports, "__esModule", {value: true});

const express = require("express");
const config = require("./config.json");

const app = express();

app.listen(config.server.nodePort, () => {
    console.log(`在端口 ${config.server.nodePort} 上监听...`);
});
```

注意，输出与我们的第一个方法（使用 `require`） 几乎相同：

```typescript
"use strict";

const express = require("express");
const config = require("./config.json");

const app = express();

app.listen(config.server.nodePort, () => {
    console.log(`在端口 ${config.server.nodePort} 上监听...`);
});
```

这就是在 TypeScript 模块中导入 JSON 模块的方法！我们仅需在配置文件中通过设置 `resolveJsonModule` 这个编译器选项的值为 `true` 即可启用这个功能！
