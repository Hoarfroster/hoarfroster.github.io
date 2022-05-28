{-# LANGUAGE OverloadedStrings #-}
import Text.Pandoc.JSON
import System.Directory
import System.FilePath ((</>))
import qualified Data.Hash.MD5 as MD5
import qualified Data.Text as T
import System.IO.Temp
import System.Process
import Control.Monad (unless)

main :: IO ()
main = toJSONFilter mathToSvg

mathToSvg :: Inline -> IO Inline
mathToSvg m@(Math mathType x) = do
  let wrap = T.unpack . removeNewline . case mathType of
                   InlineMath -> \x' -> "\\(" <> x' <> "\\)"
                   DisplayMath -> \x' -> "\\[" <> x' <> "\\]"
      preamble =[
          "\\documentclass[border=1pt,varwidth]{standalone}",
          "\\usepackage{standalone}" <>
          "\\usepackage{amsmath}" <>
          "\\usepackage{amssymb}" <>
          "\\usepackage{cancel}" <>
          "\\begin{document}"
        ]
      postamble = [ "\\end{document}" ]
      removeNewline = T.filter (`notElem` ("\r\n" :: [Char]))

  tempDir <- getTemporaryDirectory
  let cacheDir = tempDir </> "pandoc.texsvg.cache"
  createDirectoryIfMissing True cacheDir
  let mathHash = MD5.md5s $ MD5.Str $ show m
      outfilename =  cacheDir </> mathHash <> ".svg"

  fileExists <- doesFileExist outfilename

  unless fileExists $
    withSystemTempDirectory "pandoc.dir" $ \tmpDir ->
      do
        origDir <- getCurrentDirectory
        setCurrentDirectory tmpDir
        _ <- readProcess "latex" (preamble <> [wrap x] <> postamble) []
        _ <- readProcess "dvisvgm"
                 ["-b2pt", "-Z1.2", "-n", "-o", outfilename, "standalone.dvi"] []
        setCurrentDirectory origDir

  svg <- T.pack <$> readFile outfilename
  return $ RawInline (Format "html") $ case mathType of
    InlineMath -> svg
    DisplayMath -> "<p>" <> svg <> "</p>"
mathToSvg x = return x