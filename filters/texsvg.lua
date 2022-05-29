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
\newcommand{\Q}{\mathbb{Q}}

\makeatletter\catcode`\_=11
\definearrow5{-u>}{%
    \CF_arrowshiftnodes{#3}%
    \expandafter\draw\expandafter[\CF_arrowcurrentstyle](\CF_arrowstartnode)
    --(\CF_arrowendnode)node[midway](uarrow@arctangent){};%
    \CF_ifempty{#4}
    {\def\CF_uarrowradius{0.333}}
    {\def\CF_uarrowradius{#4}}%
    \CF_ifempty{#5}%
    {\def\CF_uarrowabsangle{60}}
    {\pgfmathsetmacro\CF_uarrowabsangle{abs(#5)}}
    %
    \edef\CF_tmpstr{[\CF_ifempty{#1}{draw=none}{\unexpanded\expandafter{\CF_arrowcurrentstyle}},-]}%
    \expandafter\draw\CF_tmpstr (uarrow@arctangent)%
    arc[radius=\CF_compoundsep*\CF_currentarrowlength*\CF_uarrowradius,start angle=\CF_arrowcurrentangle+90,delta angle=\CF_uarrowabsangle]node(uarrowstart){};
    %
    \edef\CF_tmpstr{[\CF_ifempty{#2}{draw=none}{\unexpanded\expandafter{\CF_arrowcurrentstyle}},-CF]}%
    \expandafter\draw\CF_tmpstr (uarrow@arctangent)%
    arc[radius=\CF_compoundsep*\CF_currentarrowlength*\CF_uarrowradius,%
    start angle=\CF_arrowcurrentangle+90,%
    delta angle=-\CF_uarrowabsangle]%
    node(uarrowend){};
    \pgfmathsetmacro\CF_tmpstr{\CF_uarrowradius*cos(\CF_arrowcurrentangle)<0?"+":"-"}%
    \ifdim\CF_uarrowradius pt>\z@
    \CF_arrowdisplaylabel{#1}{0}\CF_tmpstr{uarrowstart}{#2}{1}\CF_tmpstr{uarrowend}%
    \else
    \CF_arrowdisplaylabel{#2}{0}\CF_tmpstr{uarrowstart}{#1}{1}\CF_tmpstr{uarrowend}%
    \fi
}
\catcode`\_=8
\makeatother
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

    function exec_header(elem)
        local text = pandoc.utils.stringify(elem.content)
        if text:find("| #exp-") then
            local id, tag = text:match("| #(exp-.*)$"), "h" .. elem.level
            return pandoc.RawInline('html', "<" .. tag .. " id='" .. id .. "'>" .. text:gsub("| #.*$", "") .. "</" ..
                tag .. ">")
        end
        return elem
    end

    function convert_svg(elem, type)
        local hex_value = pandoc.utils.sha1(elem.text)
        print(elem.text)
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
    CodeBlock = exec_codeblock,
    Header = exec_header
}}
