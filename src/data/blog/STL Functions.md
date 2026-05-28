---
title: STL Functions
author: Ficon
pubDatetime: 2025-11-06T19:01:25+08:00
featured: false
categories: ACM
tags: [cpp]
description: ""
publish: true
---

**STL(Standard Template Library)** 包含了很多实用的数据结构和算法。

## deque

deque 的常数很大，不适合用它来进行高复杂度的操作，用手写队列会更快。

`set` 和 `queue` 都是基于 `deque` 实现的，必要时可以用 `set<int, vector<int>>` 来修改它的底层容器。

![image.png](https://falling-sakura1-1316699389.cos.ap-nanjing.myqcloud.com/image/202512091444489.png)

但看上去似乎原生的更快诶（上面是手写，下面是 STL）

没啥事还是用原生吧，多舒服。

```cpp
class myDeque {
  int l, r, capacity;
  vector<int> q;

public:
  myDeque(int n) : l(n), r(n - 1), capacity(n), q(2 * n) {}
  myDeque() {}
  bool empty() { return l > r; }
  void pop_front() { l++; }
  void pop_back() { r--; }
  void push_back(int x) { q[++r] = x; }
  void push_front(int x) { q[--l] = x; }
  int back() { return q[r]; }
  int front() { return q[l]; }
};
```

## array

`std::array` 是 C++11 引入的一个**固定大小**的数组容器。你可以把它想象成一个“升级版”的 C 风格数组（`int arr[10];`），它拥有 C 风格数组的**高效性能**，同时又具备了 `std::vector` 等容器的**安全性和便利性**。

```cpp
std::array<ElementType, Size> arrayName;
```

定义为局部变量时，内部值不确定，可以用 `arrayName.fill()` 来统一进行初始化。

## fill

```cpp
fill(a.begin(), a.end(), k);
```

将容器内所有元素替换为同一个值。

## find

```cpp
find(a.begin(), a.end(), k);
```

返回 $k$ 值所在位置的迭代器。

## lower_bound

返回大于等于某个值的迭代器，数组需要有序。

## upper_bound

返回大于某个值的迭代器，数组需要有序。

## partial_sum

快速求前缀和数组。

```cpp
partial_sum(a.begin(), a.end(), sum.begin());
```

## adjacent_difference

快速求差分数组

```cpp
adjacent_difference(a.begin(), a.end(), adj.begin());
```

## stoi

将字符串转换为整数


## iota

以某个递增的方式填充某数组。

```cpp
iota(a.begin(), a.end(), 0); // a 将被填充为 0， 1， 2 ...
```

## max_element

如其名

## min_element

如其名

## acuumulate

在 C++ STL 中，用于对容器（或数组）中的元素进行求和的函数主要是 `std::accumulate`。它是一个非常强大和灵活的函数，不仅仅可以求和，还可以执行其他累积操作。

### `std::accumulate`

*   **头文件：** `<numeric>`
*   **功能：** 对指定范围内的元素进行累积操作（默认是求和）。
*   **函数原型 (简化版)：**
    ```cpp
    template <class InputIt, class T>
    T accumulate(InputIt first, InputIt last, T init);

    template <class InputIt, class T, class BinaryOperation>
    T accumulate(InputIt first, InputIt last, T init, BinaryOperation op);
    ```

**参数解释：**

1.  `first`, `last`：
    *   `InputIt` 类型的迭代器，定义了要累积的元素范围 `[first, last)`。
    *   `first` 指向范围的第一个元素。
    *   `last` 指向范围的**末尾之后一个**位置（半开区间）。
2.  `init`：
    *   `T` 类型的值，表示累积的**初始值**。
    *   这个参数的类型 `T` 也会决定最终返回值的类型。
    *   **重要提示：** 如果容器中的元素类型是 `int`，但你希望结果是 `long long` 以防止溢出，那么 `init` 就应该传入 `0LL` (或 `0LL` 的等价类型)。
3.  `op` (可选)：
    *   `BinaryOperation` 类型的二元操作函数对象（或 Lambda 表达式）。
    *   它接受两个参数（累积值和当前元素），并返回它们操作后的结果。
    *   如果省略此参数，`std::accumulate` 默认使用 `std::plus<T>()`，即执行加法操作。

**返回值：**

*   累积操作的最终结果，类型与 `init` 的类型相同。

---

### 示例：基本求和

```cpp
#include <iostream>
#include <vector>
#include <numeric> // 包含 std::accumulate

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // 1. 基本求和 (结果为 int)
    // 初始值为 0
    int sum_int = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum (int): " << sum_int << std::endl; // 输出 15

    // 2. 求和并防止溢出 (结果为 long long)
    // 初始值为 0LL (long long 类型的 0)
    std::vector<int> large_numbers = {1000000000, 1000000000, 1000000000}; // 30亿
    long long sum_long_long = std::accumulate(large_numbers.begin(), large_numbers.end(), 0LL);
    std::cout << "Sum (long long): " << sum_long_long << std::endl; // 输出 3000000000

    // 3. 对数组求和
    int arr[] = {10, 20, 30};
    int sum_arr = std::accumulate(arr, arr + 3, 0); // arr + 3 是末尾之后一个位置
    std::cout << "Sum (array): " << sum_arr << std::endl; // 输出 60

    // 4. 对 double 类型的容器求和
    std::vector<double> prices = {10.5, 20.3, 5.2};
    double total_price = std::accumulate(prices.begin(), prices.end(), 0.0);
    std::cout << "Total Price: " << total_price << std::endl; // 输出 36.0

    return 0;
}
```

---

### 示例：自定义累积操作 (不仅仅是求和)

`std::accumulate` 的强大之处在于你可以提供一个自定义的二元操作。

**1. 求乘积：**

```cpp
#include <iostream>
#include <vector>
#include <numeric>
#include <functional> // 包含 std::multiplies

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // 求乘积，初始值为 1 (因为乘法单位元是 1)
    int product = std::accumulate(numbers.begin(), numbers.end(), 1, std::multiplies<int>());
    std::cout << "Product: " << product << std::endl; // 输出 120 (1*2*3*4*5)

    // 使用 Lambda 表达式求乘积
    int product_lambda = std::accumulate(numbers.begin(), numbers.end(), 1,
                                         [](int current_sum, int element) {
                                             return current_sum * element;
                                         });
    std::cout << "Product (Lambda): " << product_lambda << std::endl; // 输出 120

    return 0;
}
```

**2. 字符串拼接：**

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <numeric>

int main() {
    std::vector<std::string> words = {"Hello", " ", "World", "!"};

    // 字符串拼接，初始值为空字符串
    std::string sentence = std::accumulate(words.begin(), words.end(), std::string(""));
    std::cout << "Sentence: " << sentence << std::endl; // 输出 "Hello World!"

    // 也可以使用 Lambda 表达式
    std::string sentence_lambda = std::accumulate(words.begin(), words.end(), std::string(""),
                                                  [](std::string current_str, const std::string& word) {
                                                      return current_str + word;
                                                  });
    std::cout << "Sentence (Lambda): " << sentence_lambda << std::endl; // 输出 "Hello World!"

    return 0;
}
```

---

### 总结：

*   **求和首选：** `std::accumulate` 是 C++ STL 中进行求和操作的标准和推荐方式。
*   **头文件：** 记住包含 `<numeric>`。
*   **初始值 `init` 的重要性：**
    *   它的类型决定了最终结果的类型。
    *   它的值是累积的起点。
    *   **防止溢出：** 如果求和结果可能超出 `int` 范围，确保 `init` 参数是 `long long` 类型（例如 `0LL`）。
*   **灵活性：** 通过提供自定义的二元操作，`std::accumulate` 可以完成除了求和之外的各种累积任务。

在算法竞赛中，`std::accumulate` 是一个非常实用的工具，可以简洁高效地完成各种累积计算。