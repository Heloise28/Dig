8.22
增加一个find card by enter rank and suit的功能在deck里
~~然后test可以find一些牌，然后检查combination~~

~~然后可以做rule，我里面写笔记了，然后你要做完~~

然后问claude我需不需要multitheading之类的，就是游戏运行但是每个turn要等人，但是比如动画还有聊天窗口之类的都是随时的。
现在在command里面到时候输入肯定是要等待的嘛，就是会不会有不同。比如到时候游戏里面是点击，那是不是所有东西都是同时等待之类的。



8.23
~~now have game engine,~~
need Game class extended by DigGame class
diggame class runs a game. within session, contains turns maybe?
~~players should be human dick player and computer dig player, not just human computer ~~


8.25
~~现在DigPlayer里面可以检查最大的可以打的牌型，但是有问题是。 456789会覆盖其中456的蹦蹦。~~
~~然后我要把AI引擎里面的。暂时也不需要去挑选冲突了。我现在就用最大的牌型来挑选那个。简单情况下可以出的牌。我在那边写了@TODO~~
~~最大牌型的设计应该能方便之后的高级运算。~~

8.26
挑选逻辑可以运行，就是没有测全部的情况，不知道怎么样
自己选type的逻辑和选红桃的逻辑刚刚开始测试，现在的就是第一回合
有问题！！不会选正确的type，所以我都不知道它会不会挑红桃。
感觉state的value的一路进去出了问题。

然后测三个玩家的


8.27
因为不同的AI需要不同的数据来分析，所以把2d combs的数据放到AI engine里面了
然后重新挪动了代码让它可以工作。

下面是做好一张到四张的清理冲突
2-4张是如果会拆单连子（单连子尺寸不同），就下降一层
单张是会拆连子就删掉。
从单张开始往后处理，免得比如四个降级成三个然后再处理一遍

8.28
问题是 二三四张连还在用生成所有可用连子的functin，但是那个应该出来2D，但是出来的是1D。
你最好二三四张连在全部检查一下，而且给比如要求3，给5连。





Categories or Sections ( # and a space character after it )

# Home
# Personal tasks
Tasks

[ ] Task 1
[ ] Task 2
[x] Task 3 (Completed)
Text Formatting

**bold**

*italic*

``highlight``
List (Add tab before the list items and add a space character after the symbol)

+ List item 1
- First list item.
- Second list item.
- Third list item.

+ List item 2
1. First numbered list item.
2. Second numbered list item.
3. Third numbered list item.
Images or links are also supported.

![img](https://i.sstatic.net/DxzTM.jpg?s=64)
[link text 123](https://stackoverflow.com/questions/71328373/how-to-use-todo-files-in-vs-code)