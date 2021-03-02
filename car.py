# -*- coding: UTF-8 -*-

import bluetooth
import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False) 

########电机驱动接口定义#################
ENA = 13    # L298使能A
ENB = 15    # L298使能B
IN1 = 31    # 电机接口1
IN2 = 33    # 电机接口2
IN3 = 35    # 电机接口3
IN4 = 37    # 电机接口4

frequency = 30 # 电机频率
dc = 50 # 占空比，即电机工作时间占比

#########电机初始化为LOW#################
GPIO.setup(ENA, GPIO.OUT, initial=GPIO.LOW)
ENA_pwm = GPIO.PWM(ENA, frequency)
ENA_pwm.start(0)
# ENA_pwm.ChangeFrequency(frequency)
ENA_pwm.ChangeDutyCycle(dc)
GPIO.setup(IN1, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(IN2, GPIO.OUT, initial=GPIO.LOW)

GPIO.setup(ENB, GPIO.OUT, initial=GPIO.LOW)
ENB_pwm = GPIO.PWM(ENB, frequency)
ENB_pwm.start(0)
# ENB_pwm.ChangeFrequency(frequency)
ENB_pwm.ChangeDutyCycle(dc)
GPIO.setup(IN3, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(IN4, GPIO.OUT, initial=GPIO.LOW)

def Motor_Forward():
    print( 'motor forward' )
    GPIO.output(ENA, True)
    GPIO.output(ENB, True)
    GPIO.output(IN1, False)
    GPIO.output(IN2, True)
    GPIO.output(IN3, False)
    GPIO.output(IN4, True)
    
def Motor_Backward():
    print( 'motor_backward' )
    GPIO.output(ENA, True)
    GPIO.output(ENB, True)
    GPIO.output(IN1, True)
    GPIO.output(IN2, False)
    GPIO.output(IN3, True)
    GPIO.output(IN4, False)
    
def Motor_TurnLeft():
    print( 'motor_turnleft' )
    GPIO.output(ENA, True)
    GPIO.output(ENB, True)
    GPIO.output(IN1, True)
    GPIO.output(IN2, False)
    GPIO.output(IN3, False)
    GPIO.output(IN4, True)
    
def Motor_TurnRight():
    print( 'motor_turnright' )
    GPIO.output(ENA, True)
    GPIO.output(ENB, True)
    GPIO.output(IN1, False)
    GPIO.output(IN2, True)
    GPIO.output(IN3, True)
    GPIO.output(IN4, False)
    
def Motor_Stop():
    print( 'motor_stop' )
    GPIO.output(ENA, False)
    GPIO.output(ENB, False)
    GPIO.output(IN1, False)
    GPIO.output(IN2, False)
    GPIO.output(IN3, False)
    GPIO.output(IN4, False)


##########分割线##############################################


##########蓝牙连接接收命令##################
server_sock=bluetooth.BluetoothSocket( bluetooth.RFCOMM )

port = 1
server_sock.bind(('', port))
server_sock.listen(1)

# 只有一个客户端可以连接上，并控制小车
# 小车进程不会退出，直到主动kill进程
while True:

    print('ready accept connection...')

    # 接受客户端连接
    client_sock, address = server_sock.accept()
    print('Accepted connection from ', address)

    while True:
        try:
            # 读取命令字符
            action = int ( client_sock.recv(1024) )
            print('received action [%s]' % action)

            # 控制小车执行命令
            if action == 1:       # 前进
                Motor_Forward()
            elif action == 2:     # 后退
                Motor_Backward()
            elif action == 3:     # 左转
                Motor_TurnLeft()
                time.sleep(0.05)
                Motor_Stop()
            elif action == 4:     # 右转
                Motor_TurnRight()
                time.sleep(0.05)
                Motor_Stop()
            elif action == 5:     # 停止
                Motor_Stop()
            elif action == 6:     # clockwise circle
                Motor_TurnRight()
            elif action == 7:     # anti-clockwise circle
                Motor_TurnLeft()
            else:                 # 未知命令，小车停止
                Motor_Stop()
        except:

            # 遇到意外，小车停止，断开蓝牙连接
            print('except...')
            Motor_Stop()
            break

        #finally:

    # 断开客户端连接
    client_sock.close()
    print('close connection from ', address)