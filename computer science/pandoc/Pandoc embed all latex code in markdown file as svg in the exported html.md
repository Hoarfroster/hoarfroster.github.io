---
title: Pandoc 将 Markdown 中的所有 latex 代码直接以 SVG 形式嵌入在导出的 HTML 中
subtitle: Pandoc embed all latex code in markdown file as svg in the exported html
date: 2022/03/09 19:53:32
categories: 
  - [Computer Science, Pandoc, Filter]
tags:
  - Computer Science
  - Pandoc
  - Lua
---

## 前言

### 为什么要这样做

​	日常写的笔记等文章，或多或少会存在一部分的 latex 代码来实现数学公式的输入与化学结构式的表达，但是 pandoc 默认并不支持完备的 latex，只支持有限的一部分 package，存在一定的限制，故而一直在想着去整一个插件去让 pandoc 支持 latex 转 svg 来嵌入到输出的 HTML 文件中，实现 latex 的嵌入功能。

### 搜索资料

​	参考了一下，使用了 Lua 作为 [pandoc filter](https://pandoc.org/lua-filters.html) 的语言，主要还是因为它简单，而且不少语法与 C 相似。

​	整理一下目的，我需要抓出所有 Markdown 里面的 latex 代码，提取出来后使用命令行工具转换为 svg 文件，再把生成的 svg 返回给 pandoc 供替换。

<!-- more -->

## 开始秃头

### 提取 latex

​	既然我们要提取所有的 latex 代码，首先要抓出所有存放 latex 代码的部分，包括 `InlineMath`、`DisplayMath`、`CodeBlock+latex`。

> ##### pandoc `tex_math_dollars` 错误解析
>
> ​	因为 dollar-symbol `$` 在 pandoc `commonmark+tex_math_dollars` 中会被[错误解析](https://github.com/jgm/pandoc/issues/7942#issuecomment-1053858533)，会导致 `DisplayMath` 中的 `$`（指示 latex 使用数学模式）被当做 `InlineMath` 解析，从而使整个 `DisplayMath` 乱套。
>
> ​	（当时遇到这个问题的时候头都快薅秃了，一脸茫然 😒），最终选择把 latex 代码扔进 `CodeBlock` 中存着，不让 pandoc 去解析了。
>
> ---
>
> ### 后续
>
> ​	维护者 `jgm` 就此将 pandoc 自带的 latex 解析器中的逻辑作为蓝本，向 `tex_math_dollars` 的仓库 `jgm/commonmark-hs` 提交了 [commit#e136525](https://github.com/jgm/commonmark-hs/commit/e136525716b1a0b55e367b07fe5146f88344e7cb)，目前已得到了解决（虽然我已经为此改掉了全部存在问题的代码……）。
>
> ```haskell
> github@jgm/pandoc~master:src/Text/Pandoc/Readers/LaTeX/Math.hs#L29?hash=6ed8999f75be11b4ef9f561599d4dd80fcca92ec
> dollarsMath :: PandocMonad m => LP m Inlines
> dollarsMath = do
>   symbol '$'
>   display <- option False (True <$ symbol '$')
>   (do contents <- try $ untokenize <$> pDollarsMath 0
>       if display
>          then mathDisplay contents <$ symbol '$'
>          else return $ mathInline contents)
>    <|> (guard display >> return (mathInline ""))
> 
> -- Int is number of embedded groupings
> pDollarsMath :: PandocMonad m => Int -> LP m [Tok]
> pDollarsMath n = do
>   tk@(Tok _ toktype t) <- anyTok
>   case toktype of
>        Symbol | t == "$"
>               , n == 0 -> return []
>               | t == "\\" -> do
>                   tk' <- anyTok
>                   (tk :) . (tk' :) <$> pDollarsMath n
>               | t == "{" -> (tk :) <$> pDollarsMath (n+1)
>               | t == "}" ->
>                 if n > 0
>                 then (tk :) <$> pDollarsMath (n-1)
>                 else mzero
>        _ -> (tk :) <$> pDollarsMath n
> ```
>
> ```diff
> github@jgm/commonmark-hs~commonmark-extensions:src/Commonmark/Extensions/Math.hs#L55?hash=e136525716b1a0b55e367b07fe5146f88344e7cb
>   (_, toks) <- withRaw $ many1 $
>                   choice [ () <$ symbol '\\' >> anyTok
>                          , noneOfToks [Symbol '$']
> +                        , try (symbol '$' <* notFollowedBy (symbol '$'))
>                          ]
>   count 2 $ symbol '$'
>   return $! displayMath (untokenize toks)
> ```

​	在这里我们直接在 `return` 处定义（为了后续维护）：

```lua
function exec_math()
end

function exec_codeblock()
end

return {{
  Math = exec_math,
  CodeBlock = exec_codeblock
}}
```

### 转换 SVG

​	因为 `CodeBlock` 和 `Math` 的属性不同，我们无法合并，于是不如写一个接口出来，输入 latex 代码，输出 svg 代码（忽略了 `default_preamble`、`begin_statement`、`ending_statement`，具体内容见文末）：

```lua
local open = io.open

local function read_file(path)
  -- r read mode and b binary mode
  local file = open(path, "rb")
  if not file then
    return nil
  end
  -- *a or *all reads the whole file
  local content = file:read "*a"
  file:close()
  return content
end

function convert_svg(elem, type)
  -- Combine latex source code --
  local mathEq = default_preamble .. begin_statement .. elem.text .. ending_statement
  -- Make latex with `latex` --
  local tex = io.open("input.tex", "w")
  tex:write(mathEq)
  tex:close()
  os.execute("latex input.tex")
  -- Convert dvi to svg and optimize the output svg --
  os.execute("dvisvgm --no-fonts input.dvi -o output.svg && svgo output.svg")
  cleanup()
  return output(type, read_file(filename), hex_value)
end

function cleanup()
  -- Clean up directory --
  for _, name in ipairs({"input.tex", "input.aux", "input.dvi", "input.log", "output.svg"}) do
    print("Deleting " .. name)
    os.remove(name)
  end
end
```

​	`convert_svg` 末尾的那一句 `output` 是输出给 pandoc：

```lua
function output(type, svg, hex_value)
  return pandoc.RawInline('html',
    type == "InlineMath" and "<span class='math latex inline' data-sha1='" .. hex_value .. "'>" .. svg ..
      "</span>" or "<p class='math latex display' data-sha1='" .. hex_value .. "'>" .. svg .. "</p>")
end
```

​	修改 `exec_math` 和 `exec_codeblock` 让它们接上 `convert_svg` 函数：

```lua
function exec_math(elem)
  if string.find(elem.text, "chemfig") or elem.mathtype == "DisplayMath" then --- Select those who are not supported by mathjax
    return convert_svg(elem, elem.mathtype)
  end
  return elem
end

function exec_codeblock(elem)
  if elem.classes[1] == "latex" then
    return convert_svg(elem, "CodeBlock")
  end
  return elem
end
```

​	下面的是终端命令用于应用这一个 filter 到 pandoc 上：

```sh
pandoc --lua-filter=tex2svg.lua -f markdown -s tmp.md -o tmp.html --standalone
```

### 添加缓存机制

​	试着对所有的笔记执行了一下，发现运行效果还可以，但是出于 latex 的慢，因而有点拖沓……就想着能不能做缓存，下次执行的时候先检查一下有没有已经输出。恰逢 pandoc 库自带 `sha1`，就用它做了一下缓存机制，为每一段 latex 代码按照它们的内容 `sha1` 编码为文件名：

```diff
+ -- Check if a file or directory exists in this path --
+ function exists(file)
+   local ok, err, code = os.rename(file, file)
+   if not ok then
+       if code == 13 then
+           -- Permission denied, but it exists --
+           return true
+       end
+   end
+   return ok
+ end
+ -- Check if a directory exists in this path --
+ function isdir(path)
+     -- "/" works on both Unix and Windows --
+     return exists(path .. "/")
+ end
+
+ pandoc.utils = require 'pandoc.utils'

function convert_svg(elem, type)
+ local hex_value = pandoc.utils.sha1(elem.text)
+ local filename = ".texsvg/texsvg-" .. hex_value .. ".svg"
+ 
+ if not isdir(".texsvg") then
+   os.execute("mkdir .texsvg")
+ end
+ -- Check if it's generated previously --
+ if exists(filename) then
+   cleanup()
+   print("Using previously generated svg")
+   return output(elem, read_file(filename), hex_value)
+ end

  -- Combine latex source code --
  local mathEq = default_preamble .. begin_statement .. elem.text .. ending_statement
  -- Make latex with `latex` --
  local tex = io.open("input.tex", "w")
  tex:write(mathEq)
  tex:close()
  os.execute("latex input.tex")
  -- Convert dvi to svg and optimize the output svg --
- os.execute("dvisvgm --no-fonts input.dvi -o output.svg && svgo output.svg")
+ os.execute("dvisvgm --no-fonts input.dvi -o " .. filename .. " && svgo " .. filename)
  cleanup()
  return output(type, read_file(filename), hex_value)
end

function cleanup()
  -- Clean up directory --
- for _, name in ipairs({"input.tex", "input.aux", "input.dvi", "input.log", "output.svg"}) do
+ for _, name in ipairs({"input.tex", "input.aux", "input.dvi", "input.log"}) do
    print("Deleting " .. name)
    os.remove(name)
  end
end
```

### 解决不正常的引用

​	不过值得注意的是，如果一页里面有多个 latex 代码被渲染，因为导出的 svg 中会有大量的 `<use>`，且 `id` 都是以同一个顺序起始，会导致 HTML 页面中 svg 渲染不正常（svg 能够跨标签引用），此时就用上 JavaScript 简单筛一遍加一个 `id`：

```javascript
[...document.querySelectorAll(".math.latex")].forEach(e => {
  [...e.querySelectorAll("defs [id]")].forEach(i => {
    i.id = e.attributes['data-sha1'].value + "_" + i.id;
  });
  [...e.querySelectorAll("[xlink:href]")].forEach(i => {
    i.attributes['xlink:href'].value = i.attributes['xlink:href'].value.replace("#", "#" + e.attributes['data-sha1'].value + "_");
  });
});
```

​	大功告成 🎉~

## 完整代码

​	完整代码如下：

```lua
pandoc.utils = require 'pandoc.utils'

local begin_statement, ending_statement = [[
\begin{document}
\begin{preview}
]], [[
\end{preview}
\end{document}
]]

local default_preamble = [[
\documentclass[12pt,preview]{standalone}
\usepackage{ctex}
\usepackage[version=4]{mhchem}
\usepackage{chemfig}
\usepackage{amsthm,amssymb}
\renewcommand{\qedsymbol}{$\blacksquare$}
\DeclareOldFontCommand{\rm}{\normalfont\rmfamily}{\mathrm}
\DeclareOldFontCommand{\sf}{\normalfont\sffamily}{\mathsf}
\DeclareOldFontCommand{\tt}{\normalfont\ttfamily}{\mathtt}
\DeclareOldFontCommand{\bf}{\normalfont\bfseries}{\mathbf}
\DeclareOldFontCommand{\it}{\normalfont\itshape}{\mathit}
\DeclareOldFontCommand{\sl}{\normalfont\slshape}{\@nomath\sl}
\DeclareOldFontCommand{\sc}{\normalfont\scshape}{\@nomath\sc}
\newcommand{\N}{\mathbb{N}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\Z}{\mathbb{Z}}
]]

-- Check if a file or directory exists in this path --
function exists(file)
  local ok, err, code = os.rename(file, file)
  if not ok then
    if code == 13 then
      -- Permission denied, but it exists --
      return true
    end
  end
  return ok
end

-- Check if a directory exists in this path --
function isdir(path)
  -- "/" works on both Unix and Windows --
  return exists(path .. "/")
end

local open = io.open

local function read_file(path)
  -- r read mode and b binary mode
  local file = open(path, "rb")
  if not file then
    return nil
  end
  -- *a or *all reads the whole file
  local content = file:read "*a"
  file:close()
  return content
end

if FORMAT:match 'html' then
-- Convert Math El -> DVI via latex --
function exec_math(elem)
  if string.find(elem.text, "chemfig") or elem.mathtype == "DisplayMath" then
    return convert_svg(elem, elem.mathtype)
  end
  return elem
end

function exec_codeblock(elem)
  if elem.classes[1] == "latex" then
    return convert_svg(elem, "CodeBlock")
  end
  return elem
end

function convert_svg(elem, type)
  local hex_value = pandoc.utils.sha1(elem.text)
  local filename = ".texsvg/texsvg-" .. hex_value .. ".svg"

  if not isdir(".texsvg") then
    os.execute("mkdir .texsvg")
  end
  -- Check if it's generated previously --
  if exists(filename) then
    cleanup()
    print("Using previously generated svg")
    return output(elem, read_file(filename), hex_value)
  end

  -- Combine latex source code --
  local mathEq = default_preamble .. begin_statement .. elem.text .. ending_statement
  -- Make latex with `latex` --
  local tex = io.open("input.tex", "w")
  tex:write(mathEq)
  tex:close()
  os.execute("latex input.tex")
  -- Convert dvi to svg and optimize the output svg --
  os.execute("dvisvgm --no-fonts input.dvi -o " .. filename .. " && svgo " .. filename)
  cleanup()
  return output(type, read_file(filename), hex_value)
end

function output(type, svg, hex_value)
  return pandoc.RawInline('html',
    type == "InlineMath" and "<span class='math latex inline' data-sha1='" .. hex_value .. "'>" .. svg ..
      "</span>" or "<p class='math latex display' data-sha1='" .. hex_value .. "'>" .. svg .. "</p>")
end

function cleanup()
  -- Clean up directory --
  for _, name in ipairs({"input.tex", "input.aux", "input.dvi", "input.log"}) do
    print("Deleting " .. name)
    os.remove(name)
  end
end
end

return {{
  Math = exec_math,
  CodeBlock = exec_codeblock
}}
```

