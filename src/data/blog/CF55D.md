---
title: CF55D
date: 2025-12-16 19:15:59
author: Ficon
pubDatetime: 2025-12-16T19:15:59+08:00
featured: false
description: ""
publish: true
---

题意简述：寻找范围内的漂亮数，漂亮数的定义是：它本身可以被每一位自己的数字整除。

比如 12 是个漂亮数，它可以被 1 和 2 整除。

讲一下数位 DP 的做法。

一开始可以很轻松写出这样的暴力搜索（如果不会，请去学习一下基本的数位 DP）：

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
int num[66], dp[66];

ll dfs(int pos, bool limit, set<int> st, ll cur) {
  if (pos == 0) {
    for (auto i : st)
      if (cur % i != 0)
        return 0;
    return 1;
  }
  // if (!limit && dp[pos])
  //   return dp[pos];
  ll res = 0;
  int maxx = limit ? num[pos] : 9;
  for (int i = 0; i <= maxx; i++) {
    set<int> tmp = st;
    if (i != 0)
      tmp.insert(i);
    res += dfs(pos - 1, limit && i == maxx, tmp, cur * 10 + i);
  }
  return limit ? res : dp[pos] = res;
}

ll cal(ll x) {
  int k = 0;
  while (x) {
    num[++k] = x % 10;
    x /= 10;
  }
  return dfs(k, true, set<int>(), 0);
}

void solve() {
  ll a, b;
  cin >> a >> b;
  cout << cal(b) - cal(a - 1) << endl;
}

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  int T;
  cin >> T;
  while (T--)
    solve();
  return 0;
}
```

使用了记忆化搜索，但是并没有记忆化任何状态，因为不知道怎么去记录状态。

想到了可以用 set 记录出现过的数，但是这样太不优雅了。

那当前的值呢？如果按照当前值来记录的话，每次搜索的肯定都是不一样的，那记录了和没记录没有任何区别。

我们可以做一些转化。

可以被每一位整除其实就是可以被所有数字的 LCM 整除。

设：
- $Pre$ 为前缀的真实值（比如 2521）。
- $Suf$ 为后缀填出来的数（比如后 10 位）。
- $L_{pre}$ 为前缀的 LCM。
- $L_{suf}$ 为后缀的 LCM。
- $k$ 为剩下的位数（即 $10^{pos}$ 的量级）。

这个数满足漂亮数的条件等价于：

$$(Pre \times 10^k + Suf) \pmod {\operatorname{lcm}(L_{pre}, L_{suf})} == 0$$

假如所有数都已经填完了，我们知道它所有数的 LCM 是 $c=lcm(L_{pre},L_{suf})$，$c$ 一定是 2520 的一个因子，那么 $Pre$ 可以写成 $2520 \times N+rem$，$2520\times N$ 这一项在此时的模运算中贡献为 0，可以舍去，于是需要记录的状态不再是一个 1e18 量级的 $Pre$，而是一个 $rem$。

此时假如 $k$（即 `pos`）、$rem$、$L_{pre}$ 都确定的情况下，$Suf$ 无论如何排列组合，答案都是一样的，所以只需要记录这三个状态。

$L_{pre}$ 和 $rem$ 大小上界都是 2520，$pos$ 上界是 18，总状态量级会达到 1e8，会爆空间，还需要进行压缩。

将 $L_{pre}$ 离散化即可，$2520=2^3\times3^2\times5^1\times7^1$，总状态数只有 48 个（$4\times{3}\times{2}\times{2}$）。

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
const int MOD = 2520;

int num[25];
ll dp[20][2525][50];
int Hash[2525];
int idx = 0;

void init() {
  for (int i = 1; i <= MOD; i++) {
    if (MOD % i == 0)
      Hash[i] = ++idx;
  }
}
ll gcd(ll a, ll b) { return b == 0 ? a : gcd(b, a % b); }
ll lcm(ll a, ll b) { return a == 0 || b == 0 ? a + b : a / gcd(a, b) * b; }

ll dfs(int pos, bool limit, int rem, int current_lcm) {
  if (pos == 0) {
    return rem % current_lcm == 0;
  }

  if (!limit && dp[pos][rem][Hash[current_lcm]] != -1)
    return dp[pos][rem][Hash[current_lcm]];

  ll res = 0;
  int maxx = limit ? num[pos] : 9;

  for (int i = 0; i <= maxx; i++) {
    int next_rem = (rem * 10 + i) % MOD;
    int next_lcm = current_lcm;
    if (i != 0) {
      next_lcm = lcm(current_lcm, i);
    }

    res += dfs(pos - 1, limit && (i == maxx), next_rem, next_lcm);
  }

  if (!limit)
    dp[pos][rem][Hash[current_lcm]] = res;
  return res;
}

ll cal(ll x) {
  int k = 0;
  while (x) {
    num[++k] = x % 10;
    x /= 10;
  }
  return dfs(k, true, 0, 1);
}

void solve() {
  ll a, b;
  cin >> a >> b;
  cout << cal(b) - cal(a - 1) << endl;
}

signed main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  init();
  memset(dp, -1, sizeof(dp));
  int T;
  cin >> T;
  while (T--)
    solve();
  return 0;
}

```