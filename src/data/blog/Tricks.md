---
title: Tricks
author: Ficon
pubDatetime: 2026-03-31T19:05:27+08:00
featured: false
tags:
description: ""
publish: true
---

## 时间复杂度优化

### 别用 std::endl

频繁刷新缓冲区时间消耗巨大！

养成使用 `\n` 的好习惯。

### 关闭同步流

```cpp
ios::sync_with_stdio(false);  // 关闭 C++ 流与 C 的 stdio 同步，cin/cout 变快
cin.tie(nullptr);              // 解除 cin 与 cout 的自动绑定，避免多余 flush
```

第二个语句的意思就是，每次 `cin` 之前不要调用 `cout << flush` 了，也就是说，不要刷新缓冲区！！！（`std:endl`）

> 注： `cout << '\n' << flush;` = `cout << endl;`

### 快读

```cpp
int read() {
  int x = 0, y = 1;
  char ch = getchar();
  while (ch < '0' || ch > '9') {
    if (ch == '-')
      y = -1;
    ch = getchar();
  }
  while (ch >= '0' && ch <= '9') {
    x = x * 10 + (ch - '0');
    ch = getchar();
  }
  return x * y;
}
```

### 预处理

能预处理就不要现算。

### 尽量开全局变量

开一次变量，每次重新赋值的开销要小于每次重新分配和释放内存的开销。

## 随机

