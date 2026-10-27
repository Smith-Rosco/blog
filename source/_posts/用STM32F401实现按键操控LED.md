---
title: 用STM32F401实现按键操控LED
abbrlink: 35db5886
date: 2023-06-30 00:34:43
tags: STM32
cover:
top_img:
description: 检测按键单击、双击、长按，并实现相应功能
---



# 功能要求

通过一个按键控制 LED 显示

| 状态       | 功能                                                         |
| ---------- | ------------------------------------------------------------ |
| 1.常亮     | 此状态下 LED 处于常亮状态下，长按按键切换到状态2。           |
| 2.闪烁     | 此状态下LED闪烁周期为1s，默认亮0.1s，暗0.9s，通过每次单击按键一个周期内亮的时间增加0.1s直到加到1s回到初始状态，通过长按按键切换到状态3。 |
| 3.亮度调节 | 此状态下LED亮度可控(PWM)，以100%为最亮，默认初始10%亮度，通过单击按键，亮度增加10%，增加到90%回到初始状态；双击按键亮度减小10%，减到10%后不能再减小，长按回到状态1。 |

# 软硬件要求

- 我选用的开发板主控是 STM32F401CCU6 
- 代码平台选用的是 VsCode，配合 EIDE 插件和 CubeMX 完成开发

# 代码思路

我将代码分为了两个部分，分别是状态功能和按键检测。

## 状态功能

此部分代码直接写在主函数 while 循环里

### 状态一

直接将 GPIO 置为低电平以实现常亮

``` c
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);	// 点亮 LED
```



### 状态二

使用延时函数达到闪烁的目的

``` c
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);	// 点亮 LED
HAL_Delay(counter_1);									 // 延迟 counter_1, 单位为 ms
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_SET);	// 熄灭 LED
HAL_Delay(1000 - counter_1);							  // 延迟，以满足周期为 1s
```

其中 counter_1 为 LED 在 1s 内点亮的时间，以 1s 为周期闪烁。



### 状态三

我采用的是软件 PWM 的方案（因为可以加分）

这里仍然采用延时函数来达到 PWM 的目的，经测试，当 PWM 的周期达到 20ms 时人眼已经无法察觉闪烁，所以可以直接用 HAL 库的延时函数

``` c
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_RESET);	  // 点亮 LED
HAL_Delay(counter_2);									   // 延迟 1ms
HAL_GPIO_WritePin(LED_GPIO_Port, LED_Pin, GPIO_PIN_SET);	  // 熄灭 LED
HAL_Delay(20 - counter_2);							        // 延迟，以满足周期为 20ms
```



## 按键检测

使用外部中断检测按键单击，双击，长按三种状态，同时实现三种状态的相应功能。

具体代码较长，后面详细步骤会讲到。

以上就是总的代码的思路了。

# 详细步骤

打开 CubeMX 

## 配置 GPIO

- PC13 选择为 GPIO_OUTPUT 模式，Pull-up, User Lable 改成 LED
- PA0 选择位  GPIO_EXti0 模式（即外部触发模式），下降沿触发，Pull-up, User Lable 改成 KEy

![1](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/1.png)

![2](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/2.png)

## 配置定时器

我选用的是 TIM1

- 分频值为 16 - 1 （我的主频是 16MHz)
- 计数周期为 1000 - 1
- 自动重装为 Enbale

![3](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/3.png)

## 配置 NVIC

- 启用 EXIT line0 interrupt，并将其抢占优先级设置为1
- 启用 定时器 1 的更新中断

![3](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/4.png)

## 新建工程

- 选择文件名和文件存放路径
- 工具链选择 Makefile
- 点击 GENERATE CODE

![5](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/5.png)

## 代码部分

使用 VsCode 开发 STM32 要用到 EIDE 插件或者 PlatformIO 插件，这里用的是 EIDE，详细步骤参照这位 UP 的[视频](https://www.bilibili.com/video/BV1Zu4y1f72H/?spm_id_from=333.999.0.0)

下载源代码，将对应的文件拖入相应的文件夹内，文件层级如下

![6](E:/7.File/Stm32/2.HotPot/Funny_key/Attachment/6.png)

修改 Drivers\STM32F4xx_HAL_Driver\Src\stm32f4xx_hal_gpio.c 内的 HAL_GPIO_EXTI_IRQHandle 函数。

``` c
void HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin)
{
  /* EXTI line interrupt detected */
  extern uint8_t scan_finish_flag;
  if(__HAL_GPIO_EXTI_GET_IT(GPIO_Pin) != RESET)
  {
    if (scan_finish_flag == 1)
    {
      scan_finish_flag = 0;
      __HAL_GPIO_EXTI_CLEAR_IT(GPIO_Pin);
    }
    else
    {
      HAL_GPIO_EXTI_Callback(GPIO_Pin);
    }
  }
}
```



编译并下载即可

# 缺点和不足

由于采用外部中断触发按键检测，按下按键时需要 500ms 检测按键是单击，双击还是长按（长按需要 2000ms），在这段时间内，LED 的状态却决于按下按键之前的瞬间

- 若前一个瞬间 LED 为低电平，后面将保持低电平，LED 持续点亮
- 若前一个瞬间 LED 为高电平，后见将保持高电平，LED 持续熄灭

这种状态会持续到按键检测完成，这会导致按下按键的期间，LED 的状态不可预测，但是按键检测完毕后，功能恢复正常。

## 造成的后果

由于 LED 的状态不可预测，当此代码被应用到其他代码的内部时，可能会出现问题。

## 原因

究其原因，是因为 STM32 的串行操作逻辑，一个时间只能执行一条任务

## 解决办法

- 也许可以采用并行操作逻辑，但是我还不会。
- FPGA 是并行操作的，如果转换到 FPGA 的平台，这个问题将会迎刃而解

