---
title: Dynamic Programming
author: Ficon
pubDatetime: 2026-05-28T19:00:10+08:00
featured: false
showToc: true
description: ""
publish: true
---

## Table of contents

## 总述

- 最优子结构：把原问题化到**规模更小**的问题后，原问题的最优解一定能从**规模更小**问题的**最优解**推出。
- 无后效性：如果在某个阶段上过程的状态已知，则从此阶段**以后过程的发展变化仅与此阶段的状态有关**，而与过程在此阶段以前的阶段所经历过的状态无关。
- 状态：类似搜索中所说的状态，就是怎么描述求解过程中的一个阶段。希望状态完整而不冗余地定义清楚子问题。
- 为什么动态规划和搜索相比更优秀？我们找出转移模式相同的、本质类似的那些状态，将其合并在一个新状态中，从而减少总的状态数量和转移路径数量。



## 线性 DP

### 基础

- 爬楼梯


### 背包问题

#### 普通背包

略。

#### 多重背包

[P1833](https://x.fallingsakura.top/P1833)
#### 完全背包

[P1833](https://x.fallingsakura.top/P1833)

#### 依赖背包

买了主件才能买附件，依赖关系形成了一个树形结构，树形 DP 即可。

`dp[u][j]` 代表以 u 为根节点，用了 j 的容量所能获取的最大价值。

`dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k])`

### 序列问题

## 数位 DP

一般数据范围很大，在某范围内寻找有某特征的值的数量，采取从高位向低位填数的方式进行，通常使用记忆化搜索的方式来写。

先拆分数字为数组：

```cpp
int k = 0, num[100];
while (x) {
	num[++k] = x % 10;
	x /= 10;
}
```

通常从高位向低位填数，需要一个 `pos` 来记录当前填到哪一位了，需要一个 `limit` 来判断当前位是否受最高位限制，有时还需要一个 `lead` 来判断当前是否是前导零状态。

比如对于 54321 这个数，已经填了 54，那么下一位的 `limit` 就是 `true`，也就是下一位最多只能填 3

其它根据题目限制条件，添加相应的参数进行限制判断即可。

对于非 `limit` 和非特殊条件，如果已经搜索过，则直接返回相应搜索值，如果没有搜索过，则进行记录。

[不要62](https://loj.ac/p/10167)

这道题记录了一个限制条件：上一位是不是六。

可以利用空间换时间，添加一维数组记录状态，也可以不要这个状态，在 `!limit && !six` 返回 `dp[pos]`。

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int num[20], dp[20][2];

int dfs(int pos, bool six, bool limit) {
  if (pos < 1)
    return 1;
  if (!limit && dp[pos][six])
    return dp[pos][six];
  int res = 0, maxx = limit ? num[pos] : 9;
  for (int i = 0; i <= maxx; i++) {
    if (six && i == 2 || i == 4)
      continue;
    res += dfs(pos - 1, i == 6, limit && i == maxx);
  }
  return limit ? res : dp[pos][six] = res;
}

int solve(int x) {
  memset(num, 0, sizeof(num));
  int k = 0;
  while (x) {
    num[++k] = x % 10;
    x /= 10;
  }
  return dfs(k, false, true);
}

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int n, m;
  while (cin >> n >> m) {
    if (n == 0 && m == 0)
      break;
    cout << solve(m) - solve(n - 1) << endl;
  }
  return 0;
}

```

[P2567 Windy数](https://www.luogu.com.cn/problem/P2657)

这道题需要记录一下上一位填的数是什么，以及当前是不是前导零状态，这里只利用了一个参数巧妙记录了两种状态。

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
ll num[100], dp[100][10];

ll dfs(int pos, int limit, int lst) {
  if (pos == 0)
    return lst != -2;
  if (!limit && lst != -2 && dp[pos][lst] != -1)
    return dp[pos][lst];
  ll res = 0, maxx = limit ? num[pos] : 9;
  for (int i = 0; i <= maxx; i++) {
    if (abs(i - lst) >= 2) {
      res += dfs(pos - 1, limit && i == maxx, (i == 0 && lst == -2) ? -2 : i);
    }
  }
  return (limit || lst == -2) ? res : dp[pos][lst] = res;
}

ll solve(ll x) {
  memset(num, 0, sizeof(num));
  int k = 0;
  while (x) {
    num[++k] = x % 10;
    x /= 10;
  }
  return dfs(k, true, -2);
}

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  memset(dp, -1, sizeof(dp));
  ll a, b;
  cin >> a >> b;
  cout << solve(b) - solve(a - 1);
  return 0;
}

```

[CF55D](https://x.fallingsakura.top/CF55D)

基于此题引发了我对数位 DP 的思考：

- 如何思考每道题需要记录的状态

可以假设随便一个数，检验它是否符合题目条件，这里 $check$ 需要用到的条件就是我们需要记录的状态，比如 不要62 中需要检查上一位是不是六，Beautiful Numbers 中需要检查这个数模它每一位的 LCM 是不是 0。

- 如何保证无后效性

思考填到当前位置为止，做哪些改变，会导致后续答案不一样，哪些又不会？

## 区间 DP

用来解决区间合并类型的 DP

求解 $dp_{i, j}$ 为合并区间 $[i, j]$ 的最值，它的转移是枚举一个中间点 $k$，所以：

$dp_{i, j} = max(dp_{i, k} + dp_{k + 1, j} + cost)$。

为了保证无后效性，应当由区间长度划分维度，先枚举区间长度，然后枚举左端点，再枚举中间点。

复杂度 $O(n^3)$

[P1880 [NOI1995] 石子合并](https://www.luogu.com.cn/problem/P1880)

```cpp
#include <bits/stdc++.h>
#define ve vector
#define fi first
#define se second
using namespace std;
using ll = long long;
using pii = pair<int, int>;
using pli = pair<ll, int>;
using pil = pair<int, ll>;
using pll = pair<ll, ll>;
using vi = vector<int>;
using vii = vector<vector<int>>;

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int n;
  cin >> n;
  vi a(n + 1);
  for (int i = 1; i <= n; i++)
    cin >> a[i];
  a.insert(a.end(), a.begin() + 1, a.end());
  ve<ve<pii>> dp(n * 2 + 1, ve<pii>(n * 2 + 1));
  vi sum(n * 2 + 1);
  partial_sum(a.begin(), a.end(), sum.begin());
  for (int l = 2; l <= n; l++)
    for (int i = 1; i + l - 1 <= 2 * n; i++) {
      int j = i + l - 1;
      dp[i][j].fi = INT_MAX / 2;
      auto &minn = dp[i][j].fi, &maxn = dp[i][j].se;
      for (int k = i; k < j; k++) {
        minn = min(minn, dp[i][k].fi + dp[k + 1][j].fi + sum[j] - sum[i - 1]);
        maxn = max(maxn, dp[i][k].se + dp[k + 1][j].se + sum[j] - sum[i - 1]);
      }
    }
  int maxn = 0, minn = INT_MAX;
  for (int i = 1; i <= n; i++) {
    minn = min(minn, dp[i][i + n - 1].fi);
    maxn = max(maxn, dp[i][i + n - 1].se);
  }
  cout << minn << endl << maxn << endl;
  return 0;
}
```

用记忆化搜索的写法会更加简洁明了：

```cpp
#include <bits/stdc++.h>
#define ve vector
#define fi first
#define se second
using namespace std;
using ll = long long;
using pii = pair<int, int>;
using pli = pair<ll, int>;
using pil = pair<int, ll>;
using pll = pair<ll, ll>;
using vi = vector<int>;
using vii = vector<vector<int>>;

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int n;
  cin >> n;
  vi a(n + 1);
  for (int i = 1; i <= n; i++)
    cin >> a[i];
  a.insert(a.end(), a.begin() + 1, a.end());
  vii dp(2 * n + 1, vi(2 * n + 1));
  vi sum(n * 2 + 1);
  partial_sum(a.begin(), a.end(), sum.begin());
  auto dfs = [&](auto &dfs, int l, int r) {
    if (dp[l][r])
      return dp[l][r];
    if (l == r)
      return dp[l][r];
    if (!dp[0][0])
      dp[l][r] = INT_MAX;
    for (int k = l; k < r; k++) {
      if (!dp[0][0])
        dp[l][r] = min(dp[l][r], dfs(dfs, l, k) + dfs(dfs, k + 1, r) + sum[r] -
                                     sum[l - 1]);
      else
        dp[l][r] = max(dp[l][r], dfs(dfs, l, k) + dfs(dfs, k + 1, r) + sum[r] -
                                     sum[l - 1]);
    }
    return dp[l][r];
  };
  int maxn = 0, minn = INT_MAX;
  dfs(dfs, 1, 2 * n);
  for (int i = 1; i <= n; i++) {
    minn = min(minn, dp[i][i + n - 1]);
  }
  dp.assign(2 * n + 1, vi(2 * n + 1));
  dp[0][0] = 1;
  dfs(dfs, 1, 2 * n);
  for (int i = 1; i <= n; i++) {
    maxn = max(maxn, dp[i][i + n - 1]);
  }
  cout << minn << endl << maxn << endl;
  return 0;
}
```


## 树形 DP

[P2014](https://www.luogu.com.cn/problem/P2014)

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 307;
int n, m;
vector<int> adj[N];
int a[N], siz[N];
int dp[N][N];

void dfs(int u) {
  siz[u] = 1;
  dp[u][1] = a[u];
  for (auto v : adj[u]) {
    dfs(v);
    siz[u] += siz[v];
    for (int j = m + 1; j >= 1; j--) {
      for (int k = 0; k < j && k <= siz[v]; k++) {
        dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);
      }
    }
  }
}

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  cin >> n >> m;
  for (int i = 1; i <= n; i++) {
    int fa;
    cin >> fa >> a[i];
    adj[fa].push_back(i);
  }
  dfs(0);
  cout << dp[0][m + 1] << endl;
  return 0;
}

```

[P1273](https://www.luogu.com.cn/problem/P1273)

```cpp
#include <bits/stdc++.h>
#define ve vector
#define fi first
#define se second
using namespace std;
using ll = long long;
using vi = vector<int>;
using vii = vector<vector<int>>;
using pii = pair<int, int>;
using pli = pair<ll, int>;
using pil = pair<int, ll>;
using pll = pair<ll, ll>;
const int N = 3007;

ve<pii> adj[N];
int siz[N];
int value[N];
int dp[N][N];
int n, m;

void dfs(int u) {
  siz[u] = 1;
  for (auto [v, w] : adj[u]) {
    dfs(v);
    siz[u] += siz[v];
  }
  dp[u][0] = 0;
  for (auto [v, w] : adj[u]) {
    for (int j = siz[u]; j >= 1; j--) {
      for (int k = 1; k <= siz[v] && k <= j; k++)
        dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k] - w);
    }
  }
}

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  memset(dp, 0xc0, sizeof(dp));
  cin >> n >> m;
  for (int i = 1; i <= n - m; i++) {
    int k;
    cin >> k;
    for (int j = 1; j <= k; j++) {
      int v, w;
      cin >> v >> w;
      adj[i].emplace_back(v, w);
    }
  }
  for (int i = n - m + 1; i <= n; i++) {
    cin >> value[i];
    dp[i][1] = value[i];
  }
  dfs(1);
  for (int i = n; i >= 1; i--) {
    if (dp[1][i] >= 0) {
      cout << i << endl;
      break;
    }
  }
  return 0;
}

//   1
//  2 5
// 3 4

```
