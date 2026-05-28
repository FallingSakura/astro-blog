---
title: CPP_Note
author: Ficon
pubDatetime: 2023-07-12T19:02:22+08:00
categories: ACM
featured: false
tags: cpp
description: ""
publish: true
---

## 结构化绑定

被解构的右值需要是聚合类型，例如数组、pair、tuple、结构体等。

变量名无所谓，但是个数必须相同，顺序是按照右值中的定义顺序。

## Lambda 表达式

```cpp
[捕获列表](参数列表) -> 返回值类型 { 函数体 }
```

1. **`[捕获列表]` (Capture List)：** 这是Lambda表达式最独特、最强大的部分。它决定了Lambda函数体内部可以访问哪些外部（定义Lambda所在作用域）的变量。
	- **`[]`：** 不捕获任何外部变量。Lambda函数体只能访问自己的参数和局部变量。
	- **`[var]`：** 值捕获。将外部变量`var`的值拷贝一份到Lambda函数体内部。Lambda内部不能修改这个拷贝（除非Lambda是`mutable`）。
	- **`[&var]`：** 引用捕获。Lambda函数体内部通过引用访问外部变量`var`。这意味着Lambda内部对`var`的修改会影响外部的`var`。
	- **`[=]`：** 值捕获所有外部变量。将所有在Lambda函数体中使用的外部变量都以值的方式拷贝一份。
	- **`[&]`：** 引用捕获所有外部变量。将所有在Lambda函数体中使用的外部变量都以引用的方式访问。
	- **`[var1, &var2]`：** 混合捕获。可以指定某些变量值捕获，某些变量引用捕获。
	- **`[=, &var]`：** 默认值捕获所有，但`var`是引用捕获。
	- **`[&, var]`：** 默认引用捕获所有，但`var`是值捕获。
2. **`(参数列表)` (Parameter List)：** 和普通函数的参数列表一样，定义Lambda函数接受的参数。如果Lambda不接受任何参数，可以写成`()`或省略（C++14及以后）。
3. **`-> 返回值类型` (Return Type)：** 指定Lambda函数的返回值类型。
	- 如果函数体只有一条`return`语句，或者没有`return`语句（返回`void`），编译器可以自动推断返回值类型，此时可以省略`-> 返回值类型`。
	- 如果函数体有多条`return`语句，且返回类型不一致，或者有复杂的类型推断，最好显式指定。
4. **`{ 函数体 }` (Function Body)：** Lambda函数实际执行的代码块，和普通函数体一样。

Lambda 表达式可用于定义匿名函数：

```cpp
// std::function<int(int)> dfs = ...
auto dfs = [&](int x) {
	return dfs(nxt[x]);
}
```

## tie

相当于给多个变量同时引用，与结构化绑定相对。

tie 只能连接已有的变量，返回引用，不产生任何复制行为。

而结构化绑定创建了新的变量。

在结构体重载运算符中，可以使用 tie 来快速进行字典序比较，而不用写复杂的 if-else，因为返回值 tuple 默认重载了比较函数。

## decltype

```cpp
decltype([expression])
```

用于推断表达式的类型，不会真的执行表达式。

```cpp
int a = 1, b = 2;
decltype(a + b) c; 
```

可以利用它和 `auto` 来定义复杂类型的数据结构：

```cpp
set<int> st;
auto it = st.begin();
vector<decltype(it)> a;
```

## static 关键字

## inline 关键字

## explicit 关键字

用来修饰结构体中的构造函数，代表其不可被隐式转换。

```cpp
struct Node {
	int x;
	explicit Node(int x) : x(x) {}
};

// Node a = 10; // 如果不加 explicit，这样写也是合法的，但会带来许多问题
Node a(10);
```

## push_back 与 emplace_back

### 核心概念：构造 vs 拷贝/移动

理解这个问题的关键在于理解 `push_back` 和 `emplace_back` 在底层是如何处理你提供的数据的。

1.  **`push_back`：先构造，再拷贝/移动**
    *   当你给 `push_back` 一个对象时，这个对象**必须已经存在**（或者说，它会先被构造出来）。
    *   然后，`push_back` 会把这个已经存在的对象**拷贝**（如果可以，会**移动**）到 `vector` 的内部。
    *   可以简单理解为：你先在外面把菜做好，然后 `push_back` 负责把菜端到桌上。

2.  **`emplace_back`：原地构造**
    *   `emplace_back` 的设计初衷是为了提高效率，它会**直接在 `vector` 内部的内存空间上构造**你想要的对象。
    *   这意味着你给 `emplace_back` 的参数，应该是**构造函数所需的参数**，而不是一个已经构造好的对象。
    *   可以简单理解为：`emplace_back` 直接在桌上把菜做出来，省去了端菜的步骤。

### 为什么 `{}` push 结构体时 `emplace_back` 会报错？

我们来举个例子：

```cpp
struct MyStruct {
    int x;
    std::string s;

    // 构造函数1
    MyStruct(int val, const std::string& str) : x(val), s(str) {
        std::cout << "MyStruct(int, string) 构造函数被调用" << std::endl;
    }

    // 构造函数2 (默认构造函数，如果需要)
    // MyStruct() : x(0), s("") {
    //     std::cout << "MyStruct() 默认构造函数被调用" << std::endl;
    // }

    // 拷贝构造函数
    MyStruct(const MyStruct& other) : x(other.x), s(other.s) {
        std::cout << "MyStruct 拷贝构造函数被调用" << std::endl;
    }

    // 移动构造函数
    MyStruct(MyStruct&& other) noexcept : x(other.x), s(std::move(other.s)) {
        std::cout << "MyStruct 移动构造函数被调用" << std::endl;
    }
};

int main() {
    std::vector<MyStruct> vec;

    // 场景1: push_back with {}
    std::cout << "--- push_back with {} ---" << std::endl;
    vec.push_back({10, "hello"}); // 编译通过，运行正常
    std::cout << "vec size: " << vec.size() << std::endl;
    std::cout << std::endl;

    // 场景2: emplace_back with {}
    std::cout << "--- emplace_back with {} ---" << std::endl;
    // vec.emplace_back({20, "world"}); // 编译报错！
    // 为什么报错？
    // 因为 {20, "world"} 并不是 MyStruct 的构造函数参数列表。
    // {20, "world"} 本身会先被编译器理解为构造一个临时的 MyStruct 对象 (使用 MyStruct(int, string) 构造函数)。
    // 然后 emplace_back 试图用这个临时的 MyStruct 对象作为参数来调用 MyStruct 的构造函数。
    // 但是 MyStruct 并没有一个接受 MyStruct 类型参数的构造函数（除了拷贝/移动构造函数）。
    // emplace_back 的参数是用来“原地构造”的，它期望的是构造函数的参数，而不是一个已经构造好的对象。

    // 正确的 emplace_back 用法
    std::cout << "--- emplace_back correctly ---" << std::endl;
    vec.emplace_back(20, "world"); // 编译通过，运行正常
    std::cout << "vec size: " << vec.size() << std::endl;
    std::cout << std::endl;

    return 0;
}
```

**报错原因分析：**

当你写 `vec.push_back({10, "hello"});` 时：

1.  `{10, "hello"}` 会被编译器识别为 **初始化列表**。
2.  编译器会尝试用这个初始化列表来**构造一个临时的 `MyStruct` 对象**。它会找到 `MyStruct(int val, const std::string& str)` 这个构造函数，并用 `10` 和 `"hello"` 来调用它，从而创建出一个临时的 `MyStruct` 对象。
3.  然后，`push_back` 会接收这个**已经构造好的临时 `MyStruct` 对象**，并将其**移动**（因为是临时对象）到 `vector` 内部。

当你写 `vec.emplace_back({20, "world"});` 时：

1.  `emplace_back` 期望的是**构造 `MyStruct` 所需的参数**，而不是一个已经构造好的 `MyStruct` 对象。
2.  然而，`{20, "world"}` 仍然会被编译器首先解析为**构造一个临时的 `MyStruct` 对象**。
3.  现在，`emplace_back` 收到的是一个**临时的 `MyStruct` 对象**。它会尝试用这个临时对象作为参数来调用 `MyStruct` 的某个构造函数，以便在 `vector` 内部“原地构造”。
4.  但是，`MyStruct` 的构造函数并没有一个参数类型是 `MyStruct` 本身（除了拷贝构造和移动构造）。`emplace_back` 的设计意图是避免这种拷贝/移动，它想直接用原始参数来构造。
5.  所以，编译器找不到一个合适的构造函数来匹配 `emplace_back` 的调用，于是报错。

**正确的 `emplace_back` 用法：**

`vec.emplace_back(20, "world");`

这里，`20` 和 `"world"` 直接作为参数传递给了 `emplace_back`。`emplace_back` 会直接在 `vector` 内部调用 `MyStruct(int val, const std::string& str)` 这个构造函数，用 `20` 和 `"world"` 来构造 `MyStruct` 对象。这样就避免了临时对象的创建和随后的拷贝/移动。

### 总结与易错点

*   **`push_back`：** 接收**已经构造好的对象**（或可以被隐式转换为对象的参数），然后拷贝/移动到容器中。
    *   你可以给它一个 `{}` 初始化列表，因为它会先用 `{}` 构造一个临时对象。
*   **`emplace_back`：** 接收**构造函数所需的参数**，然后在容器内部**原地构造**对象。
    *   你不能直接给它一个 `{}` 初始化列表，因为 `{}` 会先构造一个临时对象，而 `emplace_back` 不期望一个已经构造好的对象作为其参数（除非这个对象本身就是你构造函数的参数类型，但那又绕回去了）。
    *   它期望的是参数列表，比如 `(arg1, arg2, ...)`。

## 取地址和引用

### 取地址

获取一个变量在内存中的地址，返回一个指针类型，比如：

```cpp
scanf("%d", &a);
```

### 引用

声明一个变量是另一个变量的别名，两者相互绑定，注意每个变量前都应该加上，出现在定义变量时：

```cpp
int &a = b, &c = d;
```

### 右值引用

右值引用和直接赋值的过程有什么区别？

直接复制有一个复制的过程，会占用额外的内存和时间，而使用右值引用则可以直接将自己的指针重定向到当时计算好的结果所暂时存储的地址，就没有了复制的过程，对于 `vector(10000000)` 这样的大型数据，直接赋值会带来大量的开销，此时使用 `move`：

```cpp
vector<int> a(1000000000, 1);
vector<int> b = move(a); 
```

则只有指针重定向的过程，`a` 此时变为空，相当于直接偷走，而不是复制一份带走。

# 结构体构造函数

```cpp
struct node
{
	int v,u,op;
	node(){}
	node(int a,int b,int c):v(a),u(b),op(c){}
}
// 使用成员化初始列表
```

```cpp
struct node
{
	int v,u,op;
	node(){}
	node(int a,int b,int c){ v = a; u = b; op = c; }
}
```

# 重载运算符

详见：[[重载运算符]]。

# 范围 for 循环

```cpp
for(auto &i : a)
```

第一个参数表示遍历声明，即声明的变量，被遍历到的元素会储存到这个变量中，相当于拷贝一份，若加上`&`，则可以直接引用并修改元素。

第二个参数为遍历对象，常见为各种容器(`map,vector,set,list等`)，数组，填入它们的名称即可；

若防止元素被修改，可以这样写：

```cpp
for(const auto &i : a)
```

这里加入`&`是为了防止拷贝导致运行变慢。

---

对于关系型容器比如`map`，有几点要注意：

对于 `map` 的迭代器遍历：`for(auto i = m.begin())` 识别`i`为迭代器（指针），则访问就要用迭代器的方式：

```cpp
i->first;
i->second;
```

而对于范围`for`，`for(auto i:m)` 识别 `i` 为容器中的 `value_type`，这里相当于 `pair`，访问就要用 `pair` 的方式：

```cpp
i.first;
i.second;
```

---

若识别到的元素不可被修改，为只读模式，那么就会被视为`const auto&`，例如 `set`

冒号后面的表达式只会被执行一次，得到访问对象后确定迭代的范围，在这个范围内进行遍历。

例如：

```cpp
#include <iostream>
#include <vector>
#include <cstdlib>
using namespace std;
vector<int> v = {1, 2, 3, 4, 5, 6};
vector<int> &getRange()
{
    cout << "get vector range..." << endl;
    return v;
}

int main(void)
{
    for (auto val : getRange())
    {
        cout << val << " ";
    }
    cout << endl;
    system("pause");
    return 0;
}
```

此函数只会被执行一次。

此外，范围 `for` 的变量需要在其内部声明，不可引用全局变量。

# 从字符串中读入

可以使用 C 风格的 `sscanf(str, "%d:%d", &h, &m);`

也可以使用 string 流：

```cpp
#include <sstream>

string time = "9:30";
stringstream ss(time);  // 创建字符串流

int h, m;
char colon;
ss >> h >> colon >> m;  // 从字符串流中读取，就像从 cin 读取一样
// h = 9, colon = ':', m = 30
```

# 编译参数

`-o` 可以给生成的 `.exe` 命名。

```
-Wall -Wextra -g3 -Wl,--stack=81920000 -O2 -pipe
```

# 实时报错

![image.png](https://falling-sakura1-1316699389.cos.ap-nanjing.myqcloud.com/image/202310121713579.webp)


# 命令窗口运行cpp文件

**1.**

```cd 指定文件目录```

**2.**

```g++ xxx.cpp```

**3.**

```./a.out```或者```./a.exe```

因为生成的文件可能不同。

# 关键字

命名：避免关键字，以字母或者下划线开头，后面包含字母、下划线、数字。

![image.png](https://cdn.jsdelivr.net/gh/FallingSakura/Source@main/img/202306181613059.webp)

# 数据类型

![image.png](https://cdn.jsdelivr.net/gh/FallingSakura/Source@main/img/202306181627734.webp)

![image.png](https://cdn.jsdelivr.net/gh/FallingSakura/Source@main/img/202510011037923.png)

# 类型别名

## typedef

![image.png](https://cdn.jsdelivr.net/gh/FallingSakura/Source@main/img/202306181627666.webp)

`using` 关键字可替代传统的 `typedef`，写法更直观：

```cpp
using ll = long long;
```

# ifdef

## 语法：

![image.png](https://cdn.jsdelivr.net/gh/FallingSakura/Source@main/img/202306181600046.webp)


```cpp
#define A

..

#ifdef A
//程序段1
#else
//程序段2
#endif A
```

判断某个量是否被宏定义，如果是则执行语句。

# 时间复杂度

> [时间复杂度- 知乎](https://zhuanlan.zhihu.com/p/121838438)

![image.png](https://falling-sakura1-1316699389.cos.ap-nanjing.myqcloud.com/image/202306231915701.png)

# 读入EOF

> 注：`cin`无法读取`EOF`

![](https://falling-sakura1-1316699389.cos.ap-nanjing.myqcloud.com/image/202307121422938.png)

`~`作用是将这个数变成它的相反数后再减一。

那么EOF读进来后就变成了0，循环就终止了，但是如果是普通的-1，不会让循环终止。

# 数组传参

```cpp
int x[100];
int get(int a[])
{
	a[1]+=1;
	//blabla...
}
int main()
{
	get(x);
	cout<<x[1];
}
```

比如这里就可以把$x$数组传进去

这里的$x$为数组名字，实际上传进去的是数组首元素的指针，get接受的是指针，就可以根据下标访问该数组中的元素，所以这里不用加取地址`&`符也可以（是不能加，对一个指针取地址是什么啊）。

这里特意用了$a$这另一个名字，这样就可以明显得看出它访问的是传入数组的地址而不是全局变量里的地址。


而传入数组地址时，编译器是不知道该数组是多大的，所以一般我们会把该数组的大小以int类型传入。

而数组大小可以用该式子得出：

```cpp
int lenth=sizeof(x)/sizeof(x[0]);
```

`sizeof`函数返回的是该数据的字节大小，比如`sizeof(int)`返回的是4，因为`int`是四个字节。

被除数写上数组，除数写上数组中某一个值，这样得到的就是数组的长度了。

# 文件读入/输出

```cpp
freopen("xxx.in","r",stdin);
freopen("xxx.out","w",stdout);
```

# sscanf&sprintf

```cpp
sscanf(str,"%d",x);
sprintf(str,"%d",x);
```

表示从一个字符串中读入。

表示输出到一个字符串中。

# 文件和流

> 首先我们熟知的`cin`和`cout`是`iostream`标准库中的分别用于从标准输入读取和向标准输出写入流

其次就是今天要说的从文件读取和向文件写入流，需引用`fstream`库。

其中定义了三种新的**数据类型**：

1. `ofstream`：输出文件流，用于创建文件和向文件中写入信息。
2. `ifstream`：输入文件流，用于从文件中读取信息。
3. `fstream`：文件流，具有上述两种功能。

## 对象函数

`open()`函数：

第一个参数为双引号下的字符串，表示文件路径即名称。

第二个参数为打开模式：

![image.png](https://falling-sakura1-1316699389.cos.ap-nanjing.myqcloud.com/image/202307171637182.webp)

可以用`|`符号相间表示两个同时启用。

`close()`函数：

关闭文件。

写入文件：

类似`cin cout` ，即`>> <<`。

## 例子：

```cpp
#include <fstream>
#include <iostream>
using namespace std;
 
int main ()
{
    
   char data[100];
 
   // 以写模式打开文件
   ofstream outfile;
   outfile.open("afile.dat");
 
   cout << "Writing to the file" << endl;
   cout << "Enter your name: "; 
   cin.getline(data, 100);
 
   // 向文件写入用户输入的数据
   outfile << data << endl;
 
   cout << "Enter your age: "; 
   cin >> data;
   cin.ignore();
   
   // 再次向文件写入用户输入的数据
   outfile << data << endl;
 
   // 关闭打开的文件
   outfile.close();
 
   // 以读模式打开文件
   ifstream infile; 
   infile.open("afile.dat"); 
 
   cout << "Reading from the file" << endl; 
   infile >> data; 
 
   // 在屏幕上写入数据
   cout << data << endl;
   
   // 再次从文件读取数据，并显示它
   infile >> data; 
   cout << data << endl; 
 
   // 关闭打开的文件
   infile.close();
 
   return 0;
}
```

# 命名空间

我们比较熟悉的命名空间，比如 `using namespace std`

这时候我们访问命名空间内的变量就可以像全局一样访问了。

命名空间可以嵌套：

```cpp
namespace A {
	int a = 100;
	namespace B {
		...
	}
}
```

命名空间是开放的，可以随时添加而不会覆盖：

```cpp
namespace A {
	int a = 100;
	namespace B {
		...
	}
}
namespace A {
	int b = 100;
}
```

命名空间内可以存储变量和函数。

命名空间内的函数和变量也可以在命名空间外定义，当然，要加上 `::`

无命名空间（没有名字），那么里卖弄的东西只可以在本文件内访问。

	也可以通过赋值的方式取别名。

# 随机化

> [引用](https://blog.csdn.net/cmm0401/article/details/54599083)

`rand()`函数会返回零到最大随机数的任意整数。

1. $0\sim{99}$: `rand()%100`
2. $1\sim{100}$: `rand()%100+1`
3. $a\sim{b}$: `rand()%(b-a+1)+a`

`rand()`函数每次随机都是产生相同的随机数，若要不同，可以用`srand(seed)`来随机化种子。

也可以引用`srand(time(0))`来使用当前时间使随机数发生随机化，两次程序运行时间间隔超过一秒。

---

## 高性能

> mt19937

范围是 `unsigned int`

```cpp
mt19937 rd(time(0));
int a=rd();
```

为一个类型，变量名后面的括号代表种子。

另一种方法：

```cpp
ll Rand(ll mod)
{
    ll ans = INT_MAX;
    return ans * rand() % mod + 1;
}
```

# 原码反码补码

## 原码

计算机字长为8位，二进制数最高位表示符号位，0为正，1为负。

原码即二进制表示。

但是按照原码进行正负数的二进制加减显然得到的是错误的答案。

于是就有了反码。

## 反码

正数不变，负数除了符号位每位取反，即反码。

但是这样会出现两种$0$，即`11111111`和`00000000`。

为了避免这种情况出现，于是出现了补码。

## 补码

整数不变，负数在反码的基础上+1.

这样就可以把多出的一位进掉，变成“第九位”，而第九位不在计算机的字长里，这样就可以很好的规避两种$0$的问题。

# auto类型

当我们定义一个**迭代器**的时候，我们通常要这样写：

```cpp
map<int,string> m;
map<int,string>::iterator it;
it=m.begin();
```

这样就很麻烦，所以我们可以简单地写为：

```cpp
map<int,string> m;
auto it=m.begin();
```

`auto`会自动识别该元素的类型。

需要**注意**的是：用auto定义的这一行必须是同种类型，下面举出反例：

```cpp
auto a=1,b=1.0,c="abc";
```

这样是过不了编译的。

# 指针

> [迭代器和指针](https://blog.csdn.net/qq_39072627/article/details/107353728)

**数组名其实就是一个指针常量，它指向数组的首元素。**

## 定义：

```cpp
int *p;
```

`*`最好加在变量名旁边，因为不会产生误解比如：

```cpp
int *a,*b,*c;
```

这样定义的是三个指针，而这样：

```cpp
int *a,b,c;
```

这样仅$a$ 为指针。

## 使用

通过`*a`来访问该地址的值，指针储存的为地址，所以我们可以这样赋值：

```cpp
int num,*a;
a=&num;
cout<<*a;
```

其中`&`为取地址，返回值为$num$的地址。

## 取地址

`&`还有一个功能，那就是起别名，称为**引用**。

引用应加在变量名前而非类型名后。

因此在逗号定义中要写多个。

比如下面这串代码：

```cpp
#include<bits/stdc++.h>
using namespace std;
int main()  
{  
    // int *a,*b,*c;
    // cout<<a<<b<<c;
    int val = 7, val2 = 999;  
    int &refval = val, &refval2 = val2; //引用必须要初始化，使其绑定到一个变量上  
    //修改引用的值将改变其所绑定的变量的值  
    refval = -12;  
    printf("%d %d\n", val, refval);//-12，refval的值和val一样  
    //将引用b赋值给引用a将改变引用a所绑定的变量的值，  
    //引用一但初始化(绑定)，将始终绑定到同一个特定对象上，无法绑定到另一个对象上  
    refval = refval2;  
    printf("%d %d\n", val, refval);//999  
    return 0;  
}  
```

输出为：

```cpp
-12 -12
999 999
```

相当于`windows`系统下的`mklink`命令，相当于可以直接修改文件原内容的快捷方式。

在上述例子中，`refval`是`val`的别名，`refval2` 是`val2` 的别名。

修改别名就相当于修改元素本身。

# 字符串的读入

对于字符的二维数组，我们可以这样读入：

```cpp
char c[N][N];
...
for(int i=1;i,=n;i++)
	scanf("%s",c[i]);
```

# String 初始化

> [引用](https://blog.csdn.net/VariatioZbw/article/details/116592225)

## 1.

```cpp
string str1 = "test01" ;
```

## 2.

`string( size_type length, char ch );`

```cpp
string str2( 5, 'c' );  //  str2 'ccccc'
```

## 3.

`string( const char *str );`

```cpp
string str3( "Now is the time..." );
```


## 4.

`string( string &str, size_type index, size_type length );`

- 以`index`为索引开始的子串，长度为`length`, 或者以从`start`到`end`的元素为初值.。

```cpp
string str4( str3, 11, 4 );  //str4 "time"
```

## eg.

```cpp
#include <iostream>
using namespace std;
int main() {
	string str1 = "test01" ;
	string str2( 5, 'c' );  //  str2 'ccccc'
	string str3( "Now is the time..." );
	string str4( str3, 11, 4 );
	cout << str1 << endl;
	cout << str2 << endl;
	cout << str3 << endl;
	cout << str4 << endl;
	return 0;
}
```

**输出：**

```cpp
test01
ccccc
Now is the time...
time
```

## 清除

```cpp
str.clear();
```

# 迭代器的辅助函数

> `#include<algorithm>`

**注：** `.begin()`指向的是容器首个元素的迭代器，`.end()`指向的是容器末尾的下一个元素的迭代器，因此是左开右闭得一个区间。
## 1.

`advance(iterator,int)`

例如`advance(it,6)`就是使`it`这个迭代器向后移动6个元素（`++`六次）。

`advance(it,-6)`就是使`it`这个迭代器向前移动6个元素。

## 2.

`distance(it1,it2)`计算两个迭代器之间的距离（从`it1`到`it2`需要`++`多少次）。

若`it2`在`it1`前面，那么会进入死循环。

## 3.

`iter_swap(it1,it2)`交换两个迭代器的值。

## 反向迭代器

> 倒着遍历

```cpp
for(vector<int>::reverse_iterator it=b.rbegin();it!=b.rend();it++)
```

这里`++`表示向前一个元素，`--`表示向后一个元素。

也可以这样写：

```cpp
for(auto it=b.rbegin();it!=b.rend();it++)
```

# 函数内终止程序

```cpp
exit(0);
```

# 函数重载

函数的**参数个数、参数类型、参数顺序**不同三者中满足其中一个，就是函数重载。

函数重载可以通过一个函数名根据参数的不同执行多个操作。

# 异或1

假如一个偶数异或1，那么得到的结果是偶数+1.

如果一个奇数异或1，那么得到的结果是奇数-1。

无论正负。

# 加快读入

```cpp
ios::sync_with_stdio(false),cin.tie(0);
```

[cin.tie与sync_with_stdio加速输入输出-码农场 (hankcs.com)](https://www.hankcs.com/program/cpp/cin-tie-with-sync_with_stdio-acceleration-input-and-output.html)

[(41条消息) 【C++】ios_base::sync_with_stdio(false) 和 cin.tie(NULL)_sync with stdio_大熊の笔记的博客-CSDN博客](https://blog.csdn.net/kernelxiao/article/details/108600862#:~:text=cin.tie%20%28NULL%29%20%E5%8F%96%E6%B6%88%20cin%20%E5%92%8C%20cout%20%E7%9A%84%E7%BB%91%E5%AE%9A%E3%80%82%20%23include,int%20main%28%29%20%7B%20std%3A%3Aios%3A%3Async_with_stdio%28false%29%3B%20std%3A%3Acin.tie%280%29%3B%20%2F%2F%20IO%20%7D)

# 异或交换变量值

只需要一下三步：

```cpp
a=a^b;
b=a^b;
a=a^b;
```

前两步做完：

```cpp
a=a^b;
b=a;
```

最后一步：

```cpp
a=a^b^a=b;
```

# scanf循环读入

```cpp
while(scanf("%d",&n),n)
{

}
```

这里为**逗号表达式**，若干项之间由逗号隔开，值为表达式的最后一项。

当然也可以直接 `while(cin >> n)`

# Vector判重

```cpp
sort(vec.begin(),vec.end());
vec.erase(unique(vec.begin(),vec.end()),vec.end());
```

其中，`unique`函数返回值为去重后的序列的下一个元素的迭代器，而去重并不是真正的去重，只是把重复的都丢到了容易尾部而已，所以要把后面的都删掉。

`unique`函数从头到尾扫一遍，只是把每个元素和上一个元素比较是否重复，所以使用之前记得`sort`一遍。

# 求和函数

```cpp
int sum = accumulate(vec.begin() , vec.end() , 42);  
```

第三个参数为初始值。

# Memset

```cpp
memset(s,ASCII,size);
```

表示把指针 $s$ 开始往后 $size$ 个字节大小全部赋值为 ASCII，如果是 `char` 类型，那么就可以**直接赋值**为对应 ASCII 的字符，因为 `char` 的内存占用为 $1$ 字节，而 $int$ 的话对应四个字节，每个i字节对应 $8bit$ 会导致二进制下重复了四次，所以就会导致赋值后不是原来的数。

比如常见的 `0x3f` 就变成了 `0x3f3f3f3f`，其中 `0x` 代表十六进制。

那么127就可以把除了符号位的前七位都补满，使它变成一个很大的数，而 -1 的补码全为1，这样就可以完成全部 -1 的赋值，同样 255 也可以做到全赋值为 -1。

而我们常见的 `0x3f` 就是常用的“无穷大”，它的值为 $1061109567$ 它的精妙之处在于它使得无穷大加上无穷大之后依然是无穷大，而 $127$ 做不到，`0x7fffffff` 也做不到，那么无穷小呢？通常就会设为 $128$ 使得其符号位为 $1$ ，但是这还是太小了，万一减去一个无穷小就变成无穷大了。

参考 `0x3f` ，经过*简单的进制转换和推导*，我们轻松得到了 $-1061109567$ 的补码的 16进制表示为 `0xc0c0c0c1`，而 memset 的时候我们就可以直接设为 `0xc0` 就可以了，这样得到的值为 $-1061109568$ ，可以满足我们的需求。

补充：`memset` 的时候设为 `~0x3f` 也有同样的效果。

# Memcpy

```cpp
int g[N], f[N];
memcpy(g, f, sizeof(f)); // 将 f 数组内的 sizof(f) 个字节复制到 g 数组中
```

# Strcpy

```cpp
char a[100];
strcpy(a, "10212");
```

# Strstr

```cpp
char a[100], b[100];
int res = strstr(a, b) - a; // 返回 b 在 a 中出现的第一个位置的指针，若不存在返回空指针，减去数组指针得到下标
```

# 内存转换

$1 MiB=1024 KiB=1024^2B=1024^3b$

$1BiB=1024YiB=1024^2ZiB=1024^3EiB=1024^4PiB=1024^5TiB=1024^6GiB=1024^7MiB$
其中 B 之前有一个 "i" 是表示这个是换算单位是 $2^{10}$ 而非 $10^3$ ，通常也省略 "i"，这里与另一种作区分。

# 动态内存分配

一维：

```cpp
int* arr;
int n;
scanf("%d",&n);
arr = (int*)malloc(sizeof(int)*n); // 分配n的空间
free(arr);
```

二维：

```cpp
#include<bits/stdc++.h>
using namespace std;
int main()
{
    int **r;
    int n,m;
    scanf("%d%d",&n,&m);
    r= (int**)(sizeof(int)*m);
    for(int i = 0; i < m; ++i)
        r[i] = (int*)malloc(sizeof(int)*n);
    for(int i = 0; i < m; ++i)
        free(r[i]);
    free(r);
    return 0;
}
```

要记得 `free`。

# 库函数

##  builtin_popcount

```cpp
__builtin_popconunt(x);
```

返回 $x$ 二进制下的 $1$ 的个数。

```cpp
__builtin_popcount(12); // 2
```

与 bitset 里的 `a.conut()` 类似。

## builtin_ctz

返回输入数的二进制表示下右起连续的零的个数（后导零长度）

```cpp
__builtin_ctz(unsigned int x)
__builtin_ctz(unsigned long x)
__builtin_ctz(unsigned long long x)
```

## builtin_clz

返回该类型前导零的个数。

```cpp
__builtin_clz(unsigned int x)
__builtin_clz(unsigned long x)
__builtin_clz(unsigned long long x)
```

## builtin_parity

判断该数二进制表示下 1 的个数的奇偶性，偶数返回 0，奇数返回 1

```cpp
__builtin_parity(x)
```

## builtin_ffs

```cpp
__builtin_ffs(x)
```

返回最低的 1 的下标 + 1

## builtin_sqrt

```cpp
__builtin_sqrt(double x)
```

快速开平方。

返回值为 `double` 类型。

# Template

[C++模板template用法总结_c++ template-CSDN博客](https://blog.csdn.net/qq_35637562/article/details/55194097)

可以理解为自动识别类型的函数/类。

# 结构体去重

```cpp
unique()
```

不过要先重载小于号进行排序，然后重载等于号才能进行判重。

# Multiset 单点修改

正常情况下 `erase` 一个值会把所有的这个值给删除，那假如只想删去一个呢？

可以先 `find` 得到这个值的一个迭代器，然后 `erase` 这个迭代器即可。

```cpp
/* CF1884D */
#include <bits/stdc++.h>
using namespace std;

multiset<int> ml, mr;

int main()
{
    int T;
    scanf("%d", &T);
    while(T--)
    {
        char op[2];
        scanf("%s", op);
        int l, r;
        scanf("%d%d", &l, &r);
        if(*op == '-')
        {
            ml.erase(ml.find(l));
            mr.erase(mr.find(r));
        }
        else
        {
            ml.insert(l);
            mr.insert(r);
        }
        if(!ml.size())
        {
            cout << "NO" << endl;
        }
        else if(*(prev(ml.end())) > *mr.begin())
        {
            cout << "YES" << endl;
        }
        else
        {
            cout << "NO" << endl;
        }
    }
    return 0;
}
```

