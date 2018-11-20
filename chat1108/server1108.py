from multiprocessing import Process,Queue
from aiRobot import AiRobot
import socket,time
import base64
import hashlib
import re,time
import threading
import struct


class server(object):
    '''
        需要实现的功能
        1、server程序几乎永远运行
        2、接收客户端信息并发送给所有人
        3、存在客户信息到服务器
        4、
    '''

    def __init__(self):
        self.HOST = "127.0.0.1"
        self.PORT = 9002
        self.ADDR = (self.HOST,self.PORT)
        self.magic_string = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
        self.handshake_string = "HTTP/1.1 101 Switching Protocols\r\n" \
        "Upgrade:websocket\r\n" \
        "Connection: Upgrade\r\n" \
        "Sec-WebSocket-Accept: {1}\r\n" \
        "WebSocket-Location: ws://{2}/chat\r\n" \
        "WebSocket-Protocol:chat\r\n\r\n"        

        # 创建字典存在用户信息(username and password)
        self.user_info = {"m":1,"w":1,"admini":1}

        # 创建列表存储在线人员及socket地址
        self.sock_info = []
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(self.ADDR)
        self.sock.listen(128)
        # 3 个游戏房间
        self.h1 = {}
        self.h2 = {}
        self.h3 = {}
        # 房间为键，队列对象为值
        self.house_list = {}
        # 机器人开关标志位
        self.flag_R = False



    def recv_data(self,clientSocket):
        while True:
            try:
                info = clientSocket.recv(2048)
                if not info:
                    return
            except:
                return                           
            code_len = info[1] & 0x7f
            if code_len == 0x7e:
                extend_payload_len = info[2:4]
                mask = info[4:8]
                decoded = info[8:]
            elif code_len == 0x7f:
                extend_payload_len = info[2:10]
                mask = info[10:14]
                decoded = info[14:]
            else:
                extend_payload_len = None
                mask = info[2:6]
                decoded = info[6:]
            bytes_list = bytearray()                
            for i in range(len(decoded)):
                chunk = decoded[i] ^ mask[i % 4]
                bytes_list.append(chunk)
            try:
                raw_str = str(bytes_list, encoding="utf-8")                
            except Exception:
                pass
            self.msg_classifier(raw_str,clientSocket)

    
    # 此方法实现接收的消息分类及发送
    '''
        消息类型:
        "flag^userName*msg"
        flag:消息类型标志位
            C:聊天室消息
                C1：打开/关闭聊天机器人 
                    前端需设置开关按钮，按下打开，再按关闭               
            G1：加入游戏
            G2：游戏消息
            G3：退出游戏
            G4: 房间结束游戏
            G5：语音消息
        userName：用户名
        msg:消息内容

        '''
    def msg_classifier(self,msg,sock):
        msg_list = msg.split("^")        
        flag = msg_list[0]
        print(flag[0],"0")
        print(flag,"flag")
        content = msg_list[1]
        name = content[0]
        print(content,"content")
        print(bool(flag[0] == "C"),"t or f")
        # 聊天信息，发送给所有人
        if flag[0] == "C":
            if len(flag) == 1:
                self.send_to_all(content)
                if self.flag_R:
                    try:
                        print(content, "in try ")
                        data = ""
                        data = AiRobot(content).ai_robot()
                    except:
                        print("小爱出故障了")
                    if data:
                        self.send_to_all(data)
            else:
                self.flag_R = not self.flag_R
                if self.flag_R:
                    msg = "小爱机器人：*各位我来了！！"
                    self.send_to_all(msg)
                else:
                    msg = "小爱机器人：*再见了~~啦啦，，我还会回来的！！"
                    self.send_to_all(msg)
                print(self.flag_R,"flag_r")





        # 加入游戏的请求

        elif flag == "G1":
            print("游戏消息")                               
            # 人数更改为2测试用
            if len(self.h1) < 2:
            # if len(self.h1) < 6:
                print("in house 1")
                self.h1[name] = sock                
                print("1#房间:%s 连入，已有 %d 人连接"%(name,len(self.h1)))
                if len(self.h1) == 2:
                # 创建进程调用游戏，开始游戏
                # 满足开房要求，创建队列对象并加入字典                    
                    queue1 = Queue()
                    self.house_list[queue1] = self.h1                    
                    p1 = Process(target=self.start_game,args=(self.h1,queue1))
                    print("1#房间游戏开始")                    
                    p1.start()
                    

            #测试用            
            elif len(self.h2) < 2:  
                print("in house 2")      
            # elif len(self.h2) < 6:
                self.h2[name] = sock
                print("2#房间:%s 连入，已有 %d 人连接"%(name,len(self.h2)))
                if len(self.h2) == 2:
                    # 创建进程调用游戏，开始游戏
                    queue2 = Queue()                    
                    self.house_list[queue2] = self.h2
                    p2 = Process(target=self.start_game,args=(self.h2,queue2))
                    print("2#房间游戏开始")                    
                    p2.start()
            # 测试用
            elif len(self.h3) < 2:
            # elif len(self.h3) < 6:
                print("in house 3")
                self.h3[name] = sock
                print("3#房间:%s 连入，已有 %d 人连接"%(name,len(self.h3)))
                if len(self.h3) == 2:
                    queue3 = Queue()                    
                    self.house_list[queue3] = self.h3
                    p3 = Process(target=self.start_game,args=(self.h3,queue3))
                    print("3#房间游戏开始")                    
                    p3.start()
                    
            else:
                sock.send("房间已满,请稍等......")
        elif flag== "G5":
            self.send_to_all(content.split("*")[1])
        else:
            # 判断发送消息玩家所在的房间并将消息发送至该        
            # 房间服务器
            print("in else to send ")
            for q,house in self.house_list.items():
                if name in house:
                    q.put(content)                    


    # 启动游戏
    def start_game(self,h,q):
        # q :队列对象
        # h : 玩家，sock 字典
        print("已进入游戏")
        while True:            
            # 接收主进程传入的消息
            content = q.get()            
            for name,sock in h.items():                                        
                self.send_to_player(content,sock)
                
               
    def send_to_player(self,data,sock):
        print("消息：%s"%data)
        token = b'\x81'
        length = len(data.encode())
        if length<=125:
            token += struct.pack('B', length)
        elif length <= 0xFFFF:
            token += struct.pack('!BH', 126, length)
        else:
            token += struct.pack('!BQ', 127, length)
        data = token + data.encode()        
        err_list = []
        try:
            sock.send(data)
        except Exception as e:
            print("一个玩家已下线！")
        print("消息已发送！")
  
          

    def send_to_all(self,data):         
        token = b'\x81'
        length = len(data.encode())
        if length<=125:
            token += struct.pack('B', length)
        elif length <= 0xFFFF:
            token += struct.pack('!BH', 126, length)
        else:
            token += struct.pack('!BQ', 127, length)
        data = token + data.encode()        
        err_list = []         
        for s in self.sock_info:
            try:                
                s.send(data)
            except:
                err_list.append(s)
        for i in err_list:
            self.sock_info.remove(i)
    
    # 长连接握手
    def handshake(self):
        while True:
            print("等待新用户连接......")
            clientSocket, addressInfo = self.sock.accept()    
            # add socket info to dict
            self.sock_info.append(clientSocket)

            print("有新的连接")
            request = clientSocket.recv(2048)            
            # 获取Sec-WebSocket-Key
            ret = re.search(r"Sec-WebSocket-Key: (.*==)", str(request.decode()))
            if ret:
                key = ret.group(1)
            else:
                return
            Sec_WebSocket_Key = key + self.magic_string
            # print("key ", Sec_WebSocket_Key)
            # 将Sec-WebSocket-Key先进行sha1加密,转成二进制后在使用base64加密
            response_key = base64.b64encode(hashlib.sha1(bytes(Sec_WebSocket_Key, encoding="utf8")).digest())
            response_key_str = str(response_key)
            response_key_str = response_key_str[2:30]
            # print(response_key_str)
            # 构建websocket返回数据
            response = self.handshake_string.replace("{1}",
                                    response_key_str).replace("{2}", 
                                    self.HOST + ":" + str(self.PORT))
            # send response to client
            clientSocket.send(response.encode())            
            t1 = threading.Thread(target = self.recv_data, args = (clientSocket,))
            t1.start()
        t1.join()
           
            

if __name__ =="__main__":
    webServer = server()
    webServer.handshake()




   