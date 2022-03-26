---
title: 你不会不知道最新的 CSS API 可以给选中的文本添加样式吧？
subtitle: CSS Custom Highlight API: The Future of Highlighting Text Ranges on the Web
date: 2022/03/23 23:42:00
category: [Computer Science, Frontend, Styling]
tag:
- Computer Science
- Frontend
- CSS
- UI
description: 给选中的文本添加样式并不是没用的行为，而值得开心的是，CSS Custom Highlight API 即将到来，而且它将会成为未来 Web 上样式化选中文本的不二法门！
---

> * 原文地址：[CSS Custom Highlight API: The Future of Highlighting Text Ranges on the Web](https://css-tricks.com/css-custom-highlight-api-early-loo/)
> * 原文作者：[Patrick Brosset ](https://css-tricks.com/author/patrickbrosset/)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)

**给选中的文本添加样式**并不是没用的行为，而值得开心的是，CSS Custom Highlight API 即将到来，而且它将会成为未来 Web 上样式化选中文本的不二法门！

![CSS Custom Highlight API demo 动画演示](https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/02/s_8E0FC85C45E73C25EFCF623C768360F2F95DBDDEC338D5F6DE316BB0830F6F67_1644484463021_highlight-api-demo-no-text-deco.gif?resize=800%2C733&ssl=1)

举个例子：如果我们用过 知乎编辑器、Google Docs、百度文库、Word 或 Dropbox Paper 这些文本编辑软件，我们不难发现它们会检测到拼写和语法错误，并会在错误的下方用下划波浪线提醒我们**“大傻子！写错了！”**。类似的，VS Code、IDEA 这样的代码编辑器也会在出现代码错误时有类似的提醒。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/02/s_8E0FC85C45E73C25EFCF623C768360F2F95DBDDEC338D5F6DE316BB0830F6F67_1643042116795_image.png?resize=977%2C269&ssl=1)

对于高亮文本，另一个非常常见的用例的是**搜索并高亮**这一操作。在我们进行网页内搜索时，浏览器会弹出一个文本输入框。在我们输入相关内容后，网页中相匹配的内容就会被高亮。我们可以现在试试按 `Ctrl`/`⌘`\+ `F`，然后并输入本文中的一些文字尝试这一操作。

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/02/s_8E0FC85C45E73C25EFCF623C768360F2F95DBDDEC338D5F6DE316BB0830F6F67_1643042176497_image.png?resize=1117%2C951&ssl=1)

浏览器本身就经常需要处理这类高亮，比如说可编辑元素（如 `<textarea>`）会有错误拼写检查，搜索功能会自动高亮找到的文本内容……

但是我们是否（或者我们的产品经理是否）想要让我们在网页上实现这种样式呢？似乎在网页上实现高亮文本一直是个常见的需求，可能浪费了不少人让他们去造轮子……

别把这个问题想得太简单啦，我们不只需要将文本扔进一个有特定 `class` 的 `<span>` 中并对它应用一些 CSS 样式。实际上，我们需要能够在各种情形下的复杂的 DOM 树中正确高亮文本*多段*文本，并且任意一段文本都可能会跨越多个 DOM 元素的边界。

有两种常见的解决方案，包括：

1. 给伪元素样式化（`:selection` 等伪元素）；
2. 创建自己的文本高亮系统；

我们将首先用这两种方法完成高亮文本操作，然后看看**即将推出的可以改变这一切的 CSS Custom Highlight API**。

### 潜在方案 #1：可样式化的文本范围

可能最常见的用例是我们选择的文本，当我们使用鼠标等选择网页中的一段文本时，浏览器会自动创建一个 [`Selection`](https://developer.mozilla.org/en-US/docs/Web/API/Selection) 对象。事实上，现在尝试在此页面上选择文本，然后在 DevTools 控制台中运行 `document.getSelection()`。 我们应该会看到有关所选文本的位置信息。

![DevTools 的一个显示当前文本选择位置的控制台窗口。](https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/02/Screen-Shot-2022-02-14-at-7.33.16-AM.png?resize=1846%2C1196&ssl=1)

事实证明，我们还可以通过 JavaScript 以编程方式创建文本选择。 这是一个例子：

```javascript
// First, create a Range object.
const range = new Range();

// And set its start and end positions.
range.setStart(parentNode, startOffset);
range.setEnd(parentNode, endOffset);

// Then, set the current selection to this range.
document.getSelection().removeAllRanges();
document.getSelection().addRange(range);
```

还有一些代码，用于定义选中内容的样式。 CSS 有一个名为 [`::selection`](https://css-tricks.com/almanac/selectors/s/selection/) 的伪元素可以做到这一点，它在 [所有浏览器](https: //caniuse.com/css-selection) 中几乎都得到支持。

```css
::selection {
  background-color: #f06;
  color: white;
}
```

这是一个使用此方案按单词顺序高亮页面中所有单词的示例：[CodePen](https://codepen.io/captainbrosset/pen/eYeYJBx)。

在 `::selection` 伪元素之上，还有许多其他伪元素：

* `::target-text` 选择在支持 [scroll-to-text](https://wicg.github.io/scroll-to-text-fragment/) 功能的浏览器中滚动到的文本。 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::target-text))
* `::spelling-error` 选择被浏览器标记为包含拼写错误的文本。 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::spelling-error))
* `::grammar-error` 选择被浏览器标记为包含语法错误的文本。 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/::grammar-error))

不幸的是，这些 CSS 选择器的浏览器支持不是很好，虽然这些范围选择器在需要用到它们的领域中都很有用，但它们不能用于设置自定义文本的样式 —— 这些只能由浏览器定义。

所以我们的方案很好，因为它相对简单，不会改变页面的 DOM。事实上，`Range` 对象本质上是页面中段落的坐标，而不是需要创建才能存在的 HTML 元素。

然而，一个主要缺点是创建选择会重置用户已经手动选择的任何内容。尝试在上面的演示中选择文本来测试它。一旦代码将选择移动到其他地方，我们就会看到它是如何消失的。

### 潜在方案 #2：自定义高亮文本系统

如果使用 `Selection` 对象对我们来说不够用，那么第二个解决方案几乎是我们唯一可以做的事情。这个解决方案围绕着自己做所有事情，使用 JavaScript 在我们希望高亮文本的 DOM 中插入新的 HTML 元素。

不幸的是，这意味着要编写和维护更多的 JavaScript，更不用说它迫使浏览器在高亮文本发生变化时重新创建页面布局。此外，还有一些复杂的边缘情况，例如，当我们想要高亮文本跨越多个 DOM 元素的一段文本时。

![显示一行用斜体、粗体显示，并且由一条亮黄色的高亮的 HTML 内容。](https://i0.wp.com/css-tricks.com/wp-content/uploads/2022/02/s_8E0FC85C45E73C25EFCF623C768360F2F95DBDDEC338D5F6DE316BB0830F6F67_1643109885151_image.png?resize=1129%2C100&ssl=1)

有趣的是，[CodeMirror](https://codemirror.net) 和 [Monaco](https://microsoft.github.io/monaco-editor/)（支持 VS Code 的 JavaScript 文本编辑器库）有自己的高亮逻辑，使用了稍微不同的方法，其中高亮放在了 DOM 树单独一个部分中 —— 文本行和高亮文本的段在 DOM 中的两个不同位置呈现，然后彼此重叠。如果我们检查包含文本的 DOM 子树，你会发现并没有高亮样式。这样，可以重新渲染高亮样式，而不会影响文本行，也不必在其中引入新元素。

总体而言，感觉就像缺少浏览器驱动的高亮文本功能。有助于解决所有这些缺点（不干扰用户文本选择、多选支持、简单代码）并且比定制解决方案更快的东西。

幸运的是，这就是我们在这里谈论的内容！

### 开始研究 CSS 自定义高亮 API

[CSS 自定义高亮 API](https://www.w3.org/TR/css-highlight-api-1/) 是一个新的 W3C 规范（目前处于工作草案状态），它可以设置任意文本范围的样式来自 JavaScript！这里的方法与我们之前回顾的用户文本选择技术非常相似。它为开发人员提供了一种从 JavaScript 创建任意范围，然后使用 CSS 设置样式的方法。

#### 创建文本范围

第一步是创建要高亮文本的文本范围。这可以使用 JavaScript 中的 [`Range`](https://developer.mozilla.org/en-US/docs/Web/API/Range) 来完成。所以，就像我们在设置当前选择时所做的那样：

```javascript
const range = new Range();
range.setStart(parentNode, startOffset);
range.setEnd(parentNode, endOffset);
```

值得注意的是，如果作为第一个参数传递的节点是否是文本节点，则 `setStart` 和 `setEnd` 方法的工作方式不同。对于文本节点，偏移量对应于节点内的字符数。对于其他节点，偏移量对应于父节点内的子节点数。

另外值得注意的是，`setStart` 和 `setEnd` 并不是描述范围开始和结束位置的唯一方法。查看 `Range` 类上可用的 [其他方法](https://developer.mozilla.org/en-US/docs/Web/API/Range#methods) 以查看其他选项。

#### 创建 Highlight 对象

第二步包括为最后一步中创建的范围创建 [`Highlight`](https://www.w3.org/TR/css-highlight-api-1/#highlight) 对象。一个 `Highlight` 对象可以接收一个或多个 `Range`。因此，如果我们想以完全相同的方式高亮文本一堆文本，我们可能应该创建一个 `Highlight` 对象并使用与这些文本相对应的所有 `Range` 来初始化它。

```javascript
const highlight = new Highlight(range1, range2, ..., rangeN);
```

但我们也可以根据需要创建任意数量的 `Highlight` 对象。 例如，如果我们正在构建一个协作文本编辑器，其中每个用户都获得不同的文本颜色，那么我们可以为每个用户创建一个 `Highlight` 对象。 然后每个对象都可以设置不同的样式，我们接下来会看到。

#### 注册 Highlight

现在高亮对象自己不做任何事情。 他们首先需要在所谓的高亮注册表中注册。 这是通过使用 [CSS Highlights API](https://www.w3.org/TR/css-highlight-api-1/#highlight-registry) 完成的。 注册表就像一张地图，我们可以在其中通过命名来注册新的亮点，以及删除亮点（甚至清除整个注册表）。

这是注册单个亮点的方法。

```javascript
CSS.highlights.set('my-custom-highlight', highlight);
```

其中 `my-custom-highlight` 是我们选择的名称，而 `highlight` 是在最后一步中创建的 `Highlight` 对象。

#### 给高亮文本设置样式

最后一步是实际设置注册高光的样式。 通过定义新的 CSS [`::highlight()`](https://www.w3.org/TR/css-highlight-api-1/#custom-highlight-pseudo) 伪元素并使用我们在注册 `Highlight` 对象时选择的名称（在我们上面的示例中为`my-custom-highlight`），我们就完成设置了。

```css
::highlight(my-custom-highlight) {
  background-color: yellow;
  color: black;
}
```

值得注意的是，就像 `::selection` 一样，CSS 属性的子集只能与 `::highlight()` 伪元素一起使用：

*   [`background-color`](https://css-tricks.com/almanac/properties/b/background-color/)
*   [`caret-color`](https://css-tricks.com/almanac/properties/c/caret-color/)
*   [`color`](https://css-tricks.com/almanac/properties/c/color/)
*   [`cursor`](https://css-tricks.com/almanac/properties/c/cursor/)
*   [`fill`](https://css-tricks.com/almanac/properties/f/fill/)
*   [`stroke`](https://css-tricks.com/almanac/properties/s/stroke/)
*   [`stroke-width`](https://css-tricks.com/almanac/properties/s/stroke-width/)
*   [`text-decoration`](https://css-tricks.com/almanac/properties/t/text-decoration/)（可能仅在规范的第 2 版中受支持）
*   [`text-shadow`](https://css-tricks.com/almanac/properties/t/text-shadow/)

#### 更新高亮文本

有多种方法可以更新页面上高亮文本的文本。

例如，我们可以使用 `CSS.highlights.clear()` 完全清除高亮注册表，然后从头开始。或者，我们也可以更新基础范围，而无需重新创建任何对象。为此，再次使用 `range.setStart` 和 `range.setEnd` 方法（或任何其他 `Range` 方法），浏览器将重新绘制高亮文本。

但是，`Highlight` 对象的工作方式类似于 JavaScript 的 [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)，因此这意味着我们还可以添加使用 `highlight.add(newRange)` 将新的 `Range` 对象添加到现有的 `Highlight` 或使用 `highlight.delete(existingRange)` 删除 `Range`。

第三，我们还可以从 `CSS.highlights` 注册表中添加或删除特定的 `Highlight` 对象。由于此 API 的工作方式类似于 JavaScript 的 [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)，因此我们可以 [`set`](https: //developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set) 和 [`delete`](https://developer.mozilla.org/en-US/docs/Web /JavaScript/Reference/Global_Objects/Map/delete) 来更新当前注册的`Highlight`。

#### 浏览器支持

CSS Custom Highlight API 的规范相对较新，它在浏览器中的实现仍然不完整。因此，尽管这将成为 Web 平台的一个非常有用的补充，但它还没有完全准备好用于生产环境。

Microsoft Edge 团队目前正在 Chromium 中实现 CSS 自定义高亮 API。事实上，通过启用 Experimental Web Platform features 标志（在 `about:flags` 下），该功能现在已经可以在 Canary 版本中使用。目前还没有确定该功能何时会在 Chrome、Edge 和其他基于 Chromium 的浏览器中发布的计划，但已经非常接近了。

[Safari 99+](https://developer.apple.com/safari/technology-preview/release-notes/#r99) 也支持该 API，但需要开启 Experiment Flag（Develop → Experimental Features → Highlight API）后才可以使用，并且接口有点不同，因为它使用 [`StaticRange`](https://developer.mozilla.org/en-US/docs/Web/API/StaticRange) 对象。

Firefox 尚不支持 API，你可以 [阅读 Mozilla 对此的观点](https://github.com/mozilla/standards-positions/issues/482) 了解更多信息。

### Demo

说到 Microsoft Edge，他们在 GitHub 上建立了一个 Demo，让我们可以在其中使用 CSS 自定义高亮 API 进行试驾。（尝试 demo 前，首先请确保使用的是 Chrome Canary 或 Edge Canary，并在 `about:flags` 页面中开启 Experimental Web Platform features flag）：[查看演示](https://microsoftedge.github.io/Demos/custom-highlight-api/)。

该演示使用自定义高亮文本 API 根据我们在页面顶部的搜索字段中键入的内容高亮文本页面中的文本范围。

页面加载后，JavaScript 代码检索页面中的所有文本节点（使用 [TreeWalker](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)）以及当用户键入时在搜索字段中，代码会遍历这些节点，直到找到匹配项。然后使用这些匹配项创建“范围”对象，然后使用自定义高亮文本 API 高亮文本这些对象。

### 结束思考

那么，这个新的浏览器提供的高亮 API 真的值得吗？当然！

一方面，即使 CSS 自定义高亮文本 API 一开始可能看起来有点复杂（即必须创建范围，然后高亮文本，然后注册它们，最后为它们设置样式），它仍然比创建新的 DOM 元素并插入要简单得多他们在正确的地方。

更重要的是，浏览器引擎可以非常非常快速地设置这些范围的样式。

仅允许将 CSS 属性的子集与 `::highlight()` 伪元素一起使用的原因是子集仅包含可以由浏览器非常有效地应用而无需重新创建页面布局的属性.通过在周围的页面中插入新的 DOM 元素来高亮文本文本范围需要引擎做更多的工作。

[Fernando Fiori](https://github.com/ffiori)，这一 API 的贡献者，创建了这个漂亮的[性能比较演示](https://ffiori.github.io/highlight-api-demos/demo-performance .html)。在笔者的测试中，CSS 自定义高亮 API 的平均执行速度比基于 DOM 的高亮快 5 倍。

有了 Chromium 和 Safari 的实验性支持，我们正在稳步接近这一即将可以运用在生产中的 API。我着实迫不及待地期盼着浏览器对这一 API 的广泛支持，想象着可以用这一 API 解决什么问题，解锁什么 CSS 的骚操作！