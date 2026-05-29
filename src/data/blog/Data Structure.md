---
title: Data Structure
author: Ficon
pubDatetime: 2025-11-17T19:00:40+08:00
featured: false
showToc: true
description: ""
publish: true
---

## Table of contents

## 单调队列

实际上就是滑动窗口，假设维护的是最小值，每次从队头取最小值，那么这个队列就是单调递增的（非递减）。每次进入一个新元素时，如果这个元素小于队尾元素，由于队列内元素始终需要保持单调，所以就持续弹出队尾，直到有元素小于等于当前元素，当前元素入队。

```cpp
// n 为总元素个数，k 为窗口大小
  for (int i = 0; i < n; i++) {
	while(!q.empty() && q.front() <= i - k)
        q.pop_front();
    while (!q.empty() && a[q.back()] > a[i])
      q.pop_back();
    q.push_back(i);
    if (i >= k - 1) {
      cout << a[q.front()] << ' ';
    }
  }
```

## 单调栈

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int n;
  cin >> n;
  vector<int> a(n);
  for (int i = 0; i < n; i++) {
    cin >> a[i];
  }
  stack<int> s;
  vector<int> ans(n);
  for (int i = 0; i < n; i++) {
    while (!s.empty() && a[s.top()] < a[i]) {
      ans[s.top()] = i + 1;
      s.pop();
    }
    s.push(i);
  }
  while (!s.empty()) {
    ans[s.top()] = 0;
    s.pop();
  }
  for (int i = 0; i < n; i++)
    cout << ans[i] << ' ';
  return 0;
}
```

## ST 表

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const int N = 1e5 + 7;

int n, m;
int st[N][20];
int LOG2[N];
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
int query(int l, int r) {
  int k = LOG2[r - l + 1];
  return max(st[l][k], st[r - (1 << k) + 1][k]);
}
signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  n = read(), m = read();
  for (int i = 1; i <= n; i++)
    st[i][0] = read();
  LOG2[1] = 0;
  for (int i = 2; i <= n; i++) {
    LOG2[i] = LOG2[i / 2] + 1;
  }
  for (int j = 1; (1 << j) <= n; j++)
    for (int i = 1; i + (1 << j) - 1 <= n; i++) {
      st[i][j] = max(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
    }
  for (int i = 1; i <= m; i++) {
    int l = read(), r = read();
    cout << query(l, r) << '\n';
  }
  return 0;
}
```

## 树状数组

[树状数组（Binary Indexed Tree）](https://oi-wiki.org/ds/fenwick/#%E5%88%9D%E6%AD%A5%E6%84%9F%E5%8F%97)

![](https://oi-wiki.org/ds/images/fenwick.svg)

用来解决单点修改、区间查询的操作，查询的内容需要满足两个条件：

1. 可合并
2. 可差分

举个例子，比如维护区间和，那么 `sum[7] = sum[1~4] + sum[5~7]`，如果要查询 `[3, 7]`，需要满足 `ans = sum[7] - sum[2]`，显然区间和、区间乘积、区间异或和都满足此条件。

### Lowbit函数

```cpp
#define lowbit(x) (x & (-x))
```

这是树状数组最重要的一个环节，代表该节点管辖的区间长度。

举个例子，假如查询 `c[7]`，$7$ 的二进制组成是 `111`，所以 `c[7]` 就是 `a[7]`，然后会查询 `c[6]`(`7 - lowbit(7)`)，`c[6]` 维护的区间大小就是从 `index = 6` 开始向左的 `lowbit(6) = 2` 长度的区间，所以答案就是 `c[7], c[6], c[4]` 合并后的结果。

单点修改时，比如修改 `a[7]`，需要修改包含该元素的所有区间，通过观察不难发现，为所有 `i = i + lowbit(i)` 这样不断加上去，修改每个对应的 `c[i]` 即可。

具体证明详见原链接。

### 维护不可差分的信息

**查询：**

```cpp
int getmax(int l, int r) {
  int ans = 0;
  while (r >= l) {
    ans = max(ans, a[r]);
    --r;
    for (; r - lowbit(r) >= l; r -= lowbit(r)) {
      // 注意，循环条件不要写成 r - lowbit(r) + 1 >= l
      // 否则 l = 1 时，r 跳到 0 会死循环
      ans = max(ans, C[r]);
    }
  }
  return ans;
}
```

`c[r]` 的区间为 `[r - lowbit(r) + 1, r]`，`r - lowbit(r)` 为左端点减一。

比如查询 `[4, 7]`，会先查 `c[7] = {a[7]}`，然后 `c[6] = {a[6], a[5]`，`r = 4` 退出循环，再与 `a[r]` 合并，结束查询。

时间复杂度 $O(\log^{2}N)$

**修改：**

单点修改后，依次更新该节点和其所有父亲节点，对于每个更新的节点，用所有它的儿子更新它本身。

```cpp
void update(int x, int v) {
  a[x] = v;
  for (int i = x; i <= n; i += lowbit(i)) {
    // 枚举受影响的区间
    C[i] = a[i];
    for (int j = 1; j < lowbit(i); j *= 2) { // 枚举除了 a[i] 之外的儿子节点
      C[i] = max(C[i], C[i - j]);
    }
    
    // for(int j = i - 1; lowbit(j) <= lowbit(i); j -= lowbit(j)) {
	//	C[i] = max(C[i], C[j]);
    //}
  }
}
```

这里的第二层循环十分之巧妙，比如我需要更新 `c[12]`，其实就是想查询一下 `[1,11]` 和 `[12]`，需要用到它的所有儿子节点：`c[12], c[11], c[10],`，把最右端的那个点单拎出来：`c[12] = a[12]`，然后枚举其它儿子，我们不妨看一下它们的二进制表示。

`12: 1100, 11: 1011, 10: 1010`，按照前面的分解区间的做法，可以写成注释的那段代码。

每次的 $lowbit(j)$ 加起来刚好就是 $lowbit(i) - 1$。

因为 $lowbit(i) = 2^k$，所以 $lowbit(i) - 1$ 一定能被拆分为 $1 + 2 + \dots$  的形式，从 $i - 1$ 开始向左的，加起来长度为 $lowbit(i) - 1$ 的区间，就是我们要找的 `[i - lowbit(i) + 1, i - 1]`。

### 区间修改区间查询

可以使用差分数组来实现区间修改，本质上还是单点修改。

但是这样区间查询就变成了单点查询，如何在此基础上查询区间和？

[详见](https://oi-wiki.org/ds/fenwick/#%E5%8C%BA%E9%97%B4%E5%8A%A0%E5%8C%BA%E9%97%B4%E5%92%8C)

$$
\begin{align*}
sum[r] &= \sum_{i = 1}^{r}\sum_{j=1}^{i}d_{j} \\
      &= \sum_{i = 1}^{r}d_{i} \times (r - i + 1) \\
      &= \sum_{i = 1}^{r}d_{i} \times i + \sum_{i = 1}^{r}d_{i} \times (r - 1)
\end{align*}
$$


## 并查集

**Disjoint Set Union**（DSU）

维护集合关系的数据结构。

```cpp
struct DSU {
  vector<int> pa, size;
  explicit DSU(int x) : pa(x), size(x, 1) { iota(pa.begin(), pa.end(), 0); }
  int find(int x) { return pa[x] == x ? x : pa[x] = find(pa[x]); } // 路径压缩
  void unite(int x, int y) {
    x = find(x), y = find(y);
    if (x == y) return;
    if (size[x] < size[y]) swap(x, y);
    pa[y] = x;
    size[x] += size[y];
  } // 启发式合并
};

```

## 线段树

### 为什么修改时要下放标记？

我的错误想法：

> 修改时不需要先下放标记，只需要在查询时统一下放即可

哪里有问题？

假如对于 `[1, 8]` 的线段树，先修改 `[1, 8]`，这时候它的信息是正确的，但是 `[1, 4]` 和 `[5, 8]` 的信息是过时的。此时再修改 `[1, 4]`，由于修改时没有下放，所以更新得到的 `[1, 4]` 信息依旧是过时的，致命的一点来了：修改完后会进行上传合并，这时 `[1, 8]` 的信息就会被错误更新，导致产生错误。

## 线段树分治

- [P5787 线段树分治](https://x.fallingsakura.top/P5787 线段树分治)
- [CF2222F](https://x.fallingsakura.top/CF2222F)
- [P4219 BJOI4219 大融合](https://x.fallingsakura.top/P4219 BJOI4219 大融合)

通过上面三题可以看出这种类型的问题有几个特征：

- 数据结构需要可撤回。（比如按秩合并的并查集）
- 元素有一定的生命周期区间。（时间、权值）
- 允许离线操作。

通过递归和回溯，利用在不同条件的限制下，得到的场景的交集。

如果是暴力每次重置的话，相当于每次全部修改，又全部撤销。

但我们发现有些时候不需要全部撤销，只需要撤销一点，那么就可以利用线段树分治来解决。
