---
title: 2024-Zhejiang-J
date: 2026-03-31 11:58
author: Ficon
pubDatetime: 2026-03-31 11:58T00:00:00+08:00
featured: false
description: ""
publish: true
---

先求一个最小生成树。

偶数边不会影响奇偶性，所以：

- 和为奇数等价于有奇数条奇数边
- 和为偶数等价于有偶数条奇数边

设奇数最小生成树为 T1，偶数最小生成树为 T2，那么：

要么是去掉一条奇数边，新增一条偶数边。

要么是去掉一条偶数边，新增一条奇数边。

遍历所有不在最小生成树上的边，假设它是偶数边 $(u, v)$，那么 $u$ 到 $v$ 的路径上就要删掉一条奇数边，而且这条奇数边要是最大的。

将路径边给看成序列的话，这不就是 RMQ 问题吗？

倍增处理即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using pii = pair<int, int>;
const int N = 5e5 + 7;
const int INF = 1e9 + 7;

struct DSU {
  vector<int> pa, siz;
  DSU() {}
  DSU(int n) { init(n); }
  void init(int n) {
    pa.assign(n, 0), siz.assign(n, 1);
    iota(pa.begin(), pa.end(), 0);
  }
  int find(int x) { return pa[x] == x ? x : pa[x] = find(pa[x]); }
  void unite(int x, int y) {
    x = find(x), y = find(y);
    if (x == y)
      return;
    if (siz[x] < siz[y])
      swap(x, y);
    pa[y] = x;
    siz[x] += siz[y];
  }
} dsu;
struct Edge {
  int u, v, w;
  Edge(int u, int v, int w) : u(u), v(v), w(w) {}
  bool operator<(const Edge &a) const { return w < a.w; }
};
vector<pii> adj[N];
vector<Edge> e;
int mx[N][25][2];
int f[N][25];
int dep[N];
bool inT[N];

void clean(int n) {
  e.clear();
  dsu.init(n);
  for (int i = 0; i <= n; i++) {
    adj[i].clear();
  }
}
void dfs(int u, int pa) {
  dep[u] = dep[pa] + 1;
  for (int i = 1; i <= 20; i++) {
    f[u][i] = f[f[u][i - 1]][i - 1];
    mx[u][i][0] = max(mx[u][i - 1][0], mx[f[u][i - 1]][i - 1][0]);
    mx[u][i][1] = max(mx[u][i - 1][1], mx[f[u][i - 1]][i - 1][1]);
  }
  for (auto &[v, w] : adj[u]) {
    if (v == pa)
      continue;
    f[v][0] = u;
    mx[v][0][w & 1] = w, mx[v][0][(w & 1) ^ 1] = -INF;
    dfs(v, u);
  }  
}
int query(int u, int v, int op) {
  if (dep[u] < dep[v])
    swap(u, v);
  int ans = -INF;
  for (int i = 20; ~i; i--)
    if (dep[f[u][i]] >= dep[v]) {
      ans = max(ans, mx[u][i][op]);
      u = f[u][i];
    }
  if (u == v)
    return ans;
  for (int i = 20; ~i; i--)
    if (f[u][i] != f[v][i]) {
      ans = max(ans, max(mx[u][i][op], mx[v][i][op]));
      u = f[u][i];
      v = f[v][i];
    }
  return max(ans, max(mx[u][0][op], mx[v][0][op]));
}

void solve() {
  int n, m;
  cin >> n >> m;
  clean(n + 1);
  array<ll, 2> ans{-1, -1};
  int cnt = 0;
  for (int i = 0; i < m; i++) {
    int u, v, w;
    cin >> u >> v >> w;
    e.emplace_back(u, v, w);
  }
  sort(e.begin(), e.end());
  ll sum = 0;
  for (int i = 0; i < m; i++) {
    auto [u, v, w] = e[i];
    if (dsu.find(u) != dsu.find(v)) {
      dsu.unite(u, v);
      cnt++;
      adj[u].emplace_back(v, w);
      adj[v].emplace_back(u, w);
      inT[i] = true;
      sum += w;
    } else
      inT[i] = false;
  }
  if (cnt < n - 1) {
    cout << -1 << ' ' << -1 << '\n';
    return;
  }
  ans[sum & 1] = sum;
  int o = (sum & 1) ^ 1;
  ans[o] = 1e18;
  dfs(1, 0);
  for (int i = 0; i < m; i++) {
    if (!inT[i]) {
      auto [u, v, w] = e[i];
      int p = query(u, v, (w & 1) ^ 1);
      if (p > 0)
        ans[o] = min(ans[o], sum - p + w);
    }
  }
  cout << (ans[0] == 1e18 ? -1 : ans[0]) << ' '
       << (ans[1] == 1e18 ? -1 : ans[1]) << '\n';
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