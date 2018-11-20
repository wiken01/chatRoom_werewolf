import requests
import time

class AiRobot(object):
    def __init__(self,msg):
        self.msg = msg 


    def ai_robot(self):
            # set status of robot            
            print(self.msg)
            msg = self.msg.split("*")[1]            
            api_url = "http://www.tuling123.com/openapi/api"
            data = {
                'key': 'cfa3da11ea2245ff9775de478a2b84de',
                'info': msg,
                'userid': "wiken"
            }
            # send data to tuling
            r = requests.post(api_url, data=data).json()
            # get response from tuling
            r_data = r.get("text")
            # set robot name
            r_data = "小爱机器人" + "*" + r_data
            return r_data
            

if __name__ =="__main__":    
    while 1:
        # time.sleep(2)
        msg = input("msg:")

        data = AiRobot(msg).ai_robot()
        print(data)

                