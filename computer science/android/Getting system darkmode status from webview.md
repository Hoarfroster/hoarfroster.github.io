---
title: Android Kotlin 在 WebView 中获取系统 DarkMode 状态
subtitle: Getting system darkmode status from webview
date: 2022/03/11 20:43:00
categories: 
  - [Computer Science, Android]
tags:
  - Computer Science
  - Android
  - Kotlin
---

​	不清楚现在的情况如何，仅记录一下 2020 年初 Android 刚出 DarkMode 时从 WebView 中判断系统 DarkMode 状态方法。

​	当时的问题是，所有的应用 WebView 的 DarkMode 都与系统的 DarkMode 状态隔离，导致应用中嵌入的网页的主题与应用的主题不一致，想了一想，选择加了一个 `JavaScriptInterface` 传递数据。虽然说现在看代码似乎存在一定问题，不过算是接触 Kotlin、Android 开发刚刚 2 星期的初三萌新所写，哈哈哈。

```kotlin
val isDarkMode = this.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK===Configuration.UI_MODE_NIGHT_YES

val webView = findViewById<WebView>(R.id.sswebview)
class WebAppInterface(private val mContext: Context) {
      @JavascriptInterface
      fun isDarkTheme(): Boolean {
           return isDarkMode
      }
}
webView.getSettings().setJavaScriptEnabled(true);
webView.addJavascriptInterface(WebAppInterface(this), "Android")
```

