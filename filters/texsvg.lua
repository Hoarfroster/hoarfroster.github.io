local default_template = [[
\documentclass[12pt,preview]{standalone}
{{ preamble }}
\begin{document}
\begin{preview}
{{ code }}
\end{preview}
\end{document}
]]

local default_preamble = [[
\usepackage[utf8x]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{amstext}
\usepackage{newtxtext}
\usepackage{mhchem}
\usepackage{chemfig}
\usepackage[libertine]{newtxmath}
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

if FORMAT:match 'html' then
    function exec_math (elem)
        -- Convert Math El -> DVI via latex --
        if string.find(elem.text, "\\chemfig{") then
            -- Combine latex source code --
            mathEq = default_template:gsub("{{ preamble }}", default_preamble):gsub("{{ code }}", elem.text)
            -- Make latex with `latex` --
            local tex = io.open("input.tex", "w")
            tex:write(mathEq)
            io.close(tex)
            os.execute("latex input.tex")
            -- Convert dvi to svg and optimize the output svg --
            os.execute("dvisvgm --no-fonts input.dvi -o output.svg && svgo output.svg")
            local svg = io.open("output.svg", "rb")
            if not svg then
                goto clear
            end
            local content = svg:read "*a"
            io.close(svg)
            elem = pandoc.RawInline('html', elem.mathtype=="InlineMath" and content or "<p>" .. content .. "</p>")
        end
        -- Clean up directory --
        :: clear ::
        for _, name in ipairs({ "input.tex", "input.aux", "input.dvi", "input.log", "output.svg" }) do
            print("Deleting " .. name)
            os.remove(name)
        end
        return elem
    end
end

return {
    { Math = exec_math }
}