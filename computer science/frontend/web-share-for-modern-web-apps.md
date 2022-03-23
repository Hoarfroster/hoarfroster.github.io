---
title: 现代 Web 应用程序中的 Web 分享
subtitle: Web Share for Modern Web Apps
date: 2021/05/16 17:09:00
category: [Computer Science, Frontend, JavaScript]
tag:
- Computer Science
- Frontend
- JavaScript
description: 不知道你有没有接触过 Web Share API？我想你们中的很多人应该都听说过这个词吧！Web Share API 其实已经出现一段时间了，只不过最初只有移动设备支持 Web Share API。
---

> * 原文地址：[Web Share for Modern Web Apps](https://blog.bitsrc.io/web-share-for-modern-web-apps-43c3e2329093)
> * 原文作者：[Janaka Ekanayake](https://medium.com/@clickforjanaka)
> * 译者：[霜羽 Hoarfroster](https://github.com/PassionPenguin)
> * 校对者：[Chorer](https://github.com/Chorer)、[Usualminds](https://github.com/Usualminds)

![](https://cdn-images-1.medium.com/max/5760/1*QXEz4H_A4nons0JRZmblhQ.png)

> 最近，Windows 和 Chrome OS（译者注：其实还有 macOS）开始支持 Web 分享 和 Web Share API，这吸引了不少 Web 开发者的目光。

不知道你有没有接触过 Web Share API？我想你们中的很多人应该都听说过这个词吧！Web Share API 其实已经出现一段时间了，只不过最初只有移动设备支持 Web Share API。

## Web Share API —— 快速演示

我们可以按照以下步骤，对 Web Share API 进行快速测试 —— 在网页与其他应用程序之间进行数据分享。

![来源: [https://web-share.glitch.me/](https://web-share.glitch.me/)](https://cdn-images-1.medium.com/max/2000/1*sHKOD8KJJxktrFqgPyAQwA.png)

1. 首先，确保你使用的是最新版本的谷歌浏览器。
2. 打开浏览器，打开[这个链接](https://web-share.glitch.me/)，点击**分享**按钮。
3. 你可以打开任何允许分享的应用程序。此外，它还支持与附近的设备分享。
4. 点击分享后，你就可以在目标应用程序中查看分享的数据。我这里使用**邮件**作为应用程序。如图所示，应用程序会将 Web Share API 传递过来的文本数据添加到电子邮件正文中。

![](https://cdn-images-1.medium.com/max/2000/1*YSWUxwngdvAWwQOtAHYzvg.png)

**我希望你在尝试以后会感到高兴！** —— 至少这是我在浏览器中查看 Web Share 功能演示时的第一印象。

## 在实践中使用 Web Share

### 分享链接和文本

你可以使用一个简单的 `share()` 方法来分享你想要的链接和文本。下面给出的代码片段可以帮助你完成 Web Share：

```javascript
if (navigator.share) {
    navigator.share({
        title: 'juejin.cn',
        text: '访问掘金开发者社区',
        url: 'https://www.juejin.com/',
    }).then(() => console.log('分享成功！'))
        .catch((error) => console.log('分享时候遇到了错误……', error));
}
```

### 分享文件

文件分享与 URL 分享有些不同 —— 你必须先调用 `navigator.canShare()` 确认是否可以分享文件，然后才可以在调用 `navigator.share()` 时添加一个文件数组。

```js
if (navigator.canShare && navigator.canShare({files: fileArr})) {
    navigator.share({
        files: fileArr,
        title: '我的相片集',
        text: '北极de假期',
    }).then(() => console.log('分享成功！'))
        .catch((error) => console.log('分享时候遇到了错误……', error));
} else {
    console.log(`你的浏览器不支持分享这些文件……`);
}
```

### 分享目标

要成为分享目标，应用程序需要满足 Chrome 设置的一些标准。你可以浏览一下[这篇帮助文档](https://developers.google.com/web/fundamentals/app-install-banners/#criteria)来查看这些条件。

要在网络应用清单中注册，你必须添加一个 `share_target`。这会提醒浏览器将该应用视为一个可能的分享选项，如下文所示：

1. 接收基本信息
2. 接收文件
3. 接收应用程序变更

你必须使用 Web Share Target API 来声明分享目标。它可以明确与其他应用程序分享的文件和内容：

```json
{
  "share_target": {
    "action": "/?share-target",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "file",
          "accept": [
            "image/*"
          ]
        }
      ]
    }
  }
}
```

不过在已安装的应用程序之间传输文件会比较容易。你可以分享链接、文件等多种类型。

```js
async function share(title, text, url) {
    try {
        await navigator.share({title, text, url});
        return true;
    } catch (ex) {
        console.error('分享失败……', ex);
        return false;
    }
}
```

## Web Share API —— 功能和局限性

### 功能

* 使用 Web Share，你的 Web 应用程序可以像特定平台的原生应用程序那样使用系统提供的分享功能。
* 开发者可以获得更全面的分享选项。
* 可以在设备中自定义分享目标和设备。因此，你可以提高页面加载速度。
* Web Share API 有助于分享文本、URL 和文件。此外，Web Share 也扩展来其支持分享的范围。
* 它适用于 Chrome OS、Windows 平台的 Chrome、Safari 和 Android 的 Chromium 内核浏览器。

### 局限性

然而，无论这个功能有多好，它也有不少缺点和局限性。

* 首先，只有通过 https 访问的网站才能使用 Web Share。
* 还有一点就是，你不能用类似于 `onload` 的操作来调用它，它必须通过用户的交互行为进行调用。比如说，用户可以通过点击调用它。

* 另外，Mac 平台的 Chrome 的这个功能还在开发中。

## 小结

Web Share API 是一个现代化的 Web 平台功能，它有助于我们在社交网络、短信和注册目标应用之间更轻松地分享内容。

Chrome 是支持 Web Share Target API 的主要浏览器之一。此外，Safari 也支持它。

![](https://cdn-images-1.medium.com/max/2000/1*CtRllCb7OzXfmPxJk4eaew.png)

> 但是，Web Share API 应该由用户主动操作触发，这样做是为了减少不便和滥用。

谢谢你的阅读。欢迎在下方留言，分享你的经验。

## 译者补充翻译 —— MDN

[网络共享 API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) 的 `navigator.share()` 方法可以用于调用设备的本地共享机制来共享数据，如文本、URL 或文件。可用的_共享接受者_取决于设备，可能会包括剪贴板、联系人和电子邮件应用程序、网站、蓝牙等。

这个方法要求当前文档有 [`web-share`](/en-US/docs/Web/HTTP/Headers/Feature-Policy/web-share) 权限策略，并且该方法必须由一个 UI 事件触发，比如点击按钮，而不能由脚本自行调用。此外，该方法必须指定有效的数据，并由本地实现支持共享。

该方法会用 `undefined` 来 `resolve` 一个 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。在 Windows 上，`resolve` 会发生在启动共享弹出窗口的时候，而在 Android 上，一旦数据被成功传递到_共享接受者_，`Promise` 就会被 `resolve`。

### 语法

```
navigator.share(data)
```

#### 参数

`data`

一个包含要分享的数据的对象。

User Agent 会忽略它无法解析的数据对象，并且也只会基于对象的属性进行判断。所有属性都是可选的，但必须至少指定一个已知的数据属性。

可能的值是。

* `url`: 一个 [`USVString`](https://developer.mozilla.org/en-US/docs/Web/API/USVString) 代表一个要共享的URL。
* `text`: 一个 [`USVString`](https://developer.mozilla.org/en-US/docs/Web/API/USVString) 代表要分享的文本。
* `title`: 一个  [`USVString`](https://developer.mozilla.org/en-US/docs/Web/API/USVString)  代表要共享的标题（可能会被传递接受者忽略）。
* `files`: 一个 [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) 对象的数组，指代要共享的文件。关于可共享的文件类型详见下文。

#### 返回值

一个 `resolve` 结果为 `undefined`的 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)。如果遇到错误，则会返回一个 `rejected` 的 `Promise`。

### Exceptions

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 可能会被以下 `DOMException` 值之一拒绝。

`NotAllowedError`

产生该错误的原因是用户没有授予 [web-share](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy/web-share)  权限，或者这一次调用不是由用户行为调用的（不是 UI 等调用的函数所调用的），或者由于安全考虑，文件共享被阻止了。

`TypeError`

指定的共享数据不合法，可能的原因包括:

* `data` 参数被完全省略或只包含未知值的属性。请注意，任何无法被 User Agent 识别的属性都会被忽略。
* 一个不合规的 `URL`。
* 指定了一个文件但是浏览器在该平台上的 implement 不支持文件共享。
* 分享指定的数据会被 User Agent 认为是 "恶意的分享"。

`AbortError`

用户取消了共享操作或没有可用的共享目标。

`DataError`

启动共享目标或传输数据时出现了问题。

### 可共享文件类型

下面是一个通常可共享的文件类型的列表。然而，你应该总是在调用这个 API 之前先用 [`navigator.canShare()`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare) 测试共享是否会成功。

* 应用程序文件
    * `.pdf` - `application/pdf`。
* 音频
    * `.flac` - `audio/flac`。
    * `.m4a` - `audio/x-m4a`。
    * `.mp3` - `audio/mpeg` (也接受 `audio/mp3`)
    * `.oga` - `audio/ogg`。
    * `.ogg` - `audio/ogg`。
    * `.opus` - `audio/ogg`。
    * `.wav` - `audio/wav`。
    * `.weba` - `audio/webm`。
* 图像
    * `.bmp` - `image/bmp`。
    * `.gif` - `image/gif`。
    * `.ico` - `image/x-icon`。
    * `.jfif` - `image/jpeg`。
    * `.jpeg` - `image/jpeg`。
    * `.jpg` - `image/jpeg`。
    * `.pjp` - `image/jpeg`。
    * `.pjpeg` - `image/jpeg`。
    * `.png` - `image/png`。
    * `.svg` - `image/svg+xml`。
    * `.svgz` - `image/svg+xml`。
    * `.tif` - `image/tiff`。
    * `.tiff` - `image/tiff`。
    * `.webp` - `image/webp`。
    * `.xbm` - `image/x-xbitmap`。
* 文本
    * `.css` - `text/css`。
    * `.csv` - `text/csv`。
    * `.ehtml` - `text/html`。
    * `.htm` - `text/html`。
    * `.html` - `text/html`。
    * `.shtm` - `text/html`。
    * `.shtml` - `text/html`。
    * `.text` - `text/plain`。
    * `.txt` - `text/plain`。
* 视频
    * `.m4v` - `video/mp4`。
    * `.mp4` - `video/mp4`。
    * `.mpeg` - `video/mpeg`。
    * `.mpg` - `video/mpeg`。
    * `.ogm` - `video/ogg`。
    * `.ogv` - `video/ogg`。
    * `.webm` - `video/webm`。

### 示例

如下例子为分享网页链接：一个监测点击按钮行为，调用 Web Share API 分享 MDN 的 URL 的例子。这是从我们的 [Web Share Test](https://mdn.github.io/dom-examples/web-share/)（[见源代码](https://github.com/mdn/dom-examples/blob/master/web-share/index.html)）中复制过来的。

#### HTML

HTML 代码仅仅只包括一个按钮供触发事件以及一个 `<p>` 标签用于显示测试结果。

```html
<p><button>Share MDN!</button></p>
<p class="result"></p>
```

### JavaScript

```js
const shareData = {
    title: 'MDN',
    text: '在 MDN 上学习技术！',
    url: 'https://developer.mozilla.org'
};

const btn = document.querySelector('button');
const resultPara = document.querySelector('.result');

// 分享操作必须由用户行为触发
btn.addEventListener('click', async () => {
  try {
    await navigator.share(shareData);
    resultPara.textContent = 'MDN 链接被成功分享了'
  } catch(err) {
    resultPara.textContent = 'Error: ' + err
  }
});
```

### 规范

相关规范：[Web Share API  #share-method](https://w3c.github.io/web-share/#share-method)
