---
title: String
author: Ficon
pubDatetime: 2026-05-28T19:00:31+08:00
featured: false
showToc: true
description: ""
publish: true
---

## Table of contents

## KMP

```cpp
int kmp(string& s1, string& s2) {
  int n = s1.length();
  vector<int> pi(n);
  for (int i = 1, j = 0; i < n / 2; i++) {
    while (j && s2[i] != s2[j]) j = pi[j - 1];
    if (s2[i] == s2[j]) j++;
    pi[i] = j;
  }
  for (int i = 0, j = 0; i < n; i++) {
    while (j && s1[i] != s2[j]) j = pi[j - 1];
    if (s1[i] == s2[j]) j++;
    if (j == (int)s2.length()) {
      return i - j + 1;
    }
  }
  return -1;
}
```

定义 `pi[i]` 为 `s[0, i]` 的前缀与后缀相等的最大值（前缀和后缀不能等于字符串本身）

`i` 代表已经匹配的后缀的下一位，`j` 是已经匹配的长度，`[0, j - 1]` 和 `[i - j - 1, i - 1]` 已经匹配完成，比较下一位 `s[i]` 是否等于 `s[j]`，如果相等，则 `i++, j++`，否则就在 `[0, j - 1]` 中寻找可以复用的前缀，即 `j = pi[j - 1]`，因为 `pi` 存的是匹配的长度，所以将它赋值给 `j` 恰好就是 `[0, pi[j - 1] - 1]` 的下一位。

