# raspberrypi-car
基于树莓派4B从零开始制作树莓派小车

这个库包含了完整的小车控制程序(car.py)，以及基于树莓派4B从零开始制作树莓派小车的详细步骤方法。

从零开始制作树莓派遥控小车文章地址: 
https://huoyijie.cn/article/3b8281b1e8aa6a1d8bc6718a4256b141/

微信小程序(蓝牙BLE)遥控树莓派小车文章地址:
https://huoyijie.cn/article/769dba20801c11eb983f31fd884051bb/

语音远程遥控树莓派小车文章地址
https://huoyijie.cn/article/ad271380823c11ebb2910fd63136fd48/

# ADD at 2021/3/1

小车的功能非常简单，从代码量上也看得出来。对于想上手树莓派的同学来说，小车项目非常合适。笔者其实还想再尝试一些有趣的功能，比如结合语音识别做语音控制小车，语音合成让小车播报"导航"、自动避障、摄像头物体识别等，但是这些都需要一些算法方面的储备，有些也许可以通过调用大厂的API可以实现，还需要一点儿时间再研究一下。现在手机和树莓派是通过经典蓝牙RFCOMM协议，一个是相对耗电量大，另一个在手机端也没有蓝牙BLE支持的好，所以是可以考虑用小程序写一个支持蓝牙BLE的遥控程序。

回看制作小车的过程，当初遇到的一些问题实际上都算不上难以解决。网上有很多可以资料可以参考，但是也需要仔细筛选，过滤掉一些不适合的内容。还有就是内容比较分散，刚开始入手时有无从下手的感觉，我希望通过这个记录能对一些初学者有所帮助，当然笔者水平实在有限，虽然力求内容详尽和没有差错，其中肯定不免疏忽和错误之处，如果遇到请帮忙斧正。我的邮箱是[yijie.huo@foxmail.com](yijie.huo@foxmail.com)。

# UPDATE at 2021/3/9

RFCOMM协议也是经典蓝牙协议，连接双方是对等的，耗电量比较大，另外手机端对经典蓝牙的开发支持也不太好。如果想自己尝试开发一个手机遥控器，选择蓝牙BLE协议会更好。本次更新增加了通过微信小程序(蓝牙BLE)远程遥控树莓派小车的代码和文章。

遥控程序主要分为3个部分:
1. 手机蓝牙通信客户端(微信小程序)
2. 树莓派蓝牙通信服务端
3. 树莓派小车控制程序接收命令

微信小程序遥控客户端界面操作，转化为指令通过蓝牙传输给树莓派蓝牙服务端程序，蓝牙服务端再把指令下达给小车控制程序，小车控制程序执行指令改变小车的动作。

微信小程序(蓝牙BLE)遥控树莓派小车文章地址:
https://huoyijie.cn/article/769dba20801c11eb983f31fd884051bb/

# UPDATE at 2021/3/11
在实现手机端微信小程序与树莓派小车之间通过蓝牙BLE通信的基础上，增加了小程序端的语音识别能力，让小车可以接收语音命令。代码位于```ble/miniclientctl_2.0_voice```

***

***作者：huoyijie***

***永久链接：https://huoyijie.cn/article/3b8281b1e8aa6a1d8bc6718a4256b141/***

***来源：https://huoyijie.cn***

***著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。***