---
title: Math
author: Ficon
pubDatetime: 2026-05-28T19:00:56+08:00
featured: false
showToc: true
description: ""
publish: true
---

## Table of contents

## MEX

[conversation](https://gemini.google.com/share/e4c22bfb77ef)

### 01

如何高效求动态全局 MEX？

利用 set 维护未出现过的数字，利用数组维护每个数字当前的频次。

当频次变成等于零时，往 set 中插入这个数字。

当频次从零变大时，从 set 中删除这个数字。

对于每次查询，答案是 `*st.begin()`。

复杂度 $nlogn$

### 02

如果是动态，并且每次查询一个区间的 MEX 呢？

这时候就没办法使用 set 维护了。

考虑维护一个权值线段树，节点存该值最后出现的下标，区间 `[L, R]` 代表 `[L, R]` 的所有值的最后出现下标的最小值。

假设要查询 `[l, r]` 的 MEX，那么可以对 `[0, r]` 的线段树进行二分，如果左半部分最后出现位置的最小值小于 l，那么就继续递归左半部分，否则递归右半部分。最后得到的值就是 MEX。

### 03

如果是离线，并且每次查询的是不同区间内带限制条件的 MEX，比如出现次数大于等于 2 的数的 MEX？

可以使用莫队进行维护。

## GCD

### 欧几里得算法

$\gcd(a, b)=\gcd(b, a\bmod b)$

**证明：**

假设 $a > b$

$$
\begin{align*}
a=kb+c\\
a\bmod b=c\\
c=a-kb
\end{align*}
$$

如果 $d\mid a,d\mid b$，那么显然 $d\mid c$，所以 $\gcd(a, b)=\gcd(b, c)$

关于 $c$ 的大小：

- 如果 $b > \frac{a}{2}$，那么 $a\bmod b=a-b=c<\frac{a}{2}$
- 如果 $b\le\frac{a}{2}$，那么 $a\bmod b=c<b$，即 $c<\frac{a}{2}$

综上，时间复杂度为 $O(logN)$

### 更相减损术

在高精度运算下，取模的复杂度太高，于是我们可以根据两个数与 2 的关系，使用加减和位运算，代替乘除。

如果 a, b 都被 2 整除，那么 `gcd(a, b) = 2 * gcd(a / 2, b / 2)`

如果只有 a 被 2 整除，那么 `gcd(a, b) = gcd(a / 2, b)`

如果两个数都不被 2 整除，那么 `gcd(a, b) = gcd(a - b, b)`，那么就回到了第二种情况。

## EXGCD

用来解决一类二元一次同余方程问题。

$ax+by=\gcd(a,b)$，求一组 $(x,y)$

设：

$$
\begin{align*}
ax_1+by_1&=\gcd(a,b)\\
bx_2+(a\bmod b)y_2&=\gcd(b,a\bmod b)\\
\because a\bmod b&=a - b\times \lfloor{\frac{a}{b}}\rfloor\\
\therefore bx_2+(a - b\times \lfloor\frac{a}{b}\rfloor)y_2&=\gcd(b,a\bmod b)\\
&=\gcd(a,b)\\
&= ax_1+by_1\\
\therefore ay_2 + b(x_2-\lfloor\frac{a}{b}\rfloor y_2) &= ax_1+by_1\\
&\left \{ 
  \begin{array}{l} x_1=y_2\\ y_1=x_2-\lfloor\frac{a}{b}\rfloor y_2
  \end{array}  \right.
\end{align*}
$$

如果是

$ax_1+by_1=c$ 

如果 $c | gcd(a, b)$，那么求得的 $x, y$ 都要乘以一个系数 $gcd / c$

如果不是，那么方程就无整数解。

如果是，方程有无数整数解，我们求得的只是随机的一个。

如果得到通解呢？我们只需要增大 x，减小 y，或者反过来，就可以得到另一组解，设表达式如下：

$$a(x + \Delta x) + b(y + \Delta y) = g$$

那么等式依然成立的条件就是：

$$a\Delta x + b\Delta y = 0$$

如何让 $\Delta x$ 最小呢？

两者步长相等，要一个最小的数，使得它同时被 a, b 整除，那就是 $lcm(a, b)=\frac{a \cdot b}{g}$，所以 $\Delta x = \frac{b}{g}, \Delta y  = \frac{a}{g}$

如果要求最小的正整数 $x$，那么它的范围就是 $[-\Delta x, +\Delta x]$，可以通过取模操作得到（记得处理模为 0 的情况），$y$ 同理。

## 埃式筛

核心思路：排除法。标记所有的合数，剩下的就是质数。

从 2 开始，遇到的每个没被标记的数，那这个数就是质数，然后标记它的倍数。当遍历到一个数发现它没被标记，那么这个数就是一个质数。

```cpp
for (int i = 2; i * i <= N; i++) { // 优化1
	if (isPrime[i]) {
		for (int j = i * i; j <= N; j += i) { // 优化2
			isPrime[j] = false;
		}
	}
}
```

- 优化1：见优化 2，$j$ 从哪里开始枚举的。
- 优化2：$2i, 3i, \dots, (i-1)i$ 已经被 $2, 3, \dots, (i - 1)$ 筛过。

复杂度 $O(nloglogn)$

## 欧拉筛

是埃式筛的优化，我们发现每个合数只会被它的最小质因子筛掉。

```cpp
for (int i = 2; i <= N; i++) {
	if (!notPrime[i]) {
		primes.emplace_back(i);
	}
	for (auto j : primes) {
		if (i * j > N) break;
		notPrime[i * j] = true;
		if (i % j == 0) break;
	}
}
```

当 `i % j == 0` 时，说明 `j` 是 `i` 的最小质因子。

这样保证了每个数只会被其最小的质因子筛掉且只筛一次，复杂度是 $O(n)$

## 分解质因数

### 试除法

每个合数不可能有两个大于 $\sqrt{n}$ 的因数，所以只需要枚举到 $\sqrt{n}$，最后剩的如果不是 1，那就是最后一个质因子。

```cpp
for (int i = 2; i *i <= n; i++) {
	if (n % i == 0) {
		while (n % i == 0) {
			n /= i;
		}
	}
}
```

复杂度 $O(\sqrt{n})$

### 利用欧拉筛

我们在欧拉筛的时候可以记录每个数的最小质因子，然后不断除以自己的最小质因子就可以了，复杂度可以来到 $O(logn)$

```cpp
for (int i = 2; i <= n; ++i) {
	if (!minp[i]) {
		minp[i] = i;
		primes.push_back(i);
	}
	for (int p : primes) {
		if (p > minp[i] || i * p > n) break;
		minp[i * p] = p;
	}
}
void fast_factorize(int n) {
    while (n > 1) {
        int p = minp[n];
        int count = 0;
        while (n % p == 0) {
            n /= p;
            count++;
        }
        cout << p << "^" << count << endl;
    }
}
```
