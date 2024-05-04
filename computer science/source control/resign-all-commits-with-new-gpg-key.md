---
title: Git 使用新 gpg 秘钥重新 commit
subtitle: Git resign all commits with new gpg key
date: 2022/03/05 16:00:00
categories: 
  - [Computer Science, Source Control]
tags:
  - Computer Science
  - Source Control
  - Git
---

之前的 gpg 私钥在电脑重装时候丢失了，更早的私钥却还在，GitHub 上两者又都有，就想着把所有我签名的 commits 都改成更早的那一个 gpg 私钥。

```sh
git filter-branch --commit-filter '
if [ "$GIT_COMMITTER_EMAIL" = "your@email.com" ]
then
git commit-tree -S "$@";
fi
' -- --all
# 将 your@email.com 更改为自己以前 commit 时候用的邮箱即可
# 建议运行前先备份！
```