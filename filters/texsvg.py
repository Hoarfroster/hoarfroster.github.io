# -*- coding: utf-8 -*-

import panflute as pf
import os

def action(elem, doc):
    if isinstance(elem, pf.Math) and 'chemfig' in elem.text:
        latex = open("input.tex", 'w')
        latex.write(elem.text)
        os.system("latex input.tex")
        os.system("dvisvgm --no-fonts input.dvi input.svg")
        svg = open("input.svg",'r').read()
        return pf.RawInline(svg)


def main(doc=None):
    return pf.run_filter(action, doc=doc)


if __name__ == '__main__':
    main()