//定义全局变量userName
var userName='wiken'


$(function () {
    console.log("in js")

    var ws;
    init(userName);
    var uname
    friends_list()




});

    function init(userName) {
        <!--Connect to Web Socket-->
        ws = new WebSocket("ws://127.0.0.1:9002/");
        // Set event handlers.
        ws.onopen = function () {
            // var  msg = "G1^user*参加游戏1" ;
            // only_send(msg);
            console.log("连接成功");
        };
        ws.onmessage = function (e) {
            // e.data contains received string.
            msgRecv = e.data;
            console.log(e.data, "data income");
            msg = msgRecv.split("*");
            name = msg[0];
            text_msg = msg[1];
            if(name!=userName){
                var data = " "+data;
                data = compoundMsg(msg);
                $("#add").append(data);
                $('#add').animate({scrollTop:99999});
            }

        };
        ws.onclose = function () {
            $("#log").append("<p style='color:grey;font-size:14;'>" + "断开连接" + "</P>")
        };
        ws.onerror = function (e) {
            $("#log").append("<p style='color:grey;font-size:14;'>" + "onerror" + "</P>");
            console.log(e)
        };

        $("#middleBar inpout").click(function () {
            var msg = "C1^"+userName+"* ";
            ws.send(msg);
        });

        //加入游戏按钮事件
        $("input:button").click(function () {
            var value = $(this).attr("name");
            if(true){
                value=="1";
                ws.send('G1^'+userName+"* ")
            }
        });

        //消息输入回车事件
        $('#inputMsg').on("keydown",function(event){
            var keyCode = event.keyCode || event.which;
            if(keyCode == "13"){
                console.log("sdfsf")
                var	text = $('#input>input').val();
                text = " "+text;
                var str = compoundSendMsg(text);
                $('#add').append(str);
                $('#add').animate({scrollTop:9999},0);
                msg = "C^"+userName+"*"+text;
                ws.send(msg);
                console.log(msg,"sended");
                $("#input>input").val("");
                $("#input>input").focus();
           }
        });
    };



    function sendMsg(){
        var	text = $('#input>input').val();
            text = " "+text;
            var str = compoundSendMsg(text);
            $('#add').append(str);
            $('#add').animate({scrollTop:9999},0);
            msg = "C^"+userName+"*"+text;
            ws.send(msg);
            console.log(msg,"sended");
            $("#input>input").val("");
            $("#input>input").focus();
    };
//加入游戏事件
function join_game(evt) {
    msg = "G1^"+userName+"* ";
    ws.send(msg);
    console.log(userName,"已加入游戏");
}
//操作小爱
function aiRobot() {
    msg = "C1^"+userName+"* ";
    ws.send(msg);
    console.log("C1已发送");
}
//加入框左边
function compoundMsg(text){
    var msg = "";
    msg += '<div id="sender"><div ><img class="img" src="images/dglvyou.jpg"></div>';
    msg+= '<div class="two" ><div class="triangle"></div>';
    msg += '<div id="text_up_left"><span class="text">'+text+'</span></div></div></div>';
    return msg
};
//消息加入框右边
function compoundSendMsg(text){
    var msg = "";
    msg += '<div id="sender_right"><div ><img class="img_right" src="images/dglvyou.jpg"></div>';
    msg+= '<div class="two_right" ><div class="triangle_right"></div>';
    msg += '<div id="text_up_right"><span class="text_right">'+text+'</span></div></div></div>';
    return msg
};


//添加好友列表
function friends_list(){
    var arr = ['wiken','kiki','小张','小王','那年春天','章開','你说的幸福呢','一别竟是天涯','说好的呢？']
    for(var i=0;i<arr.length;i++){
        var name=arr[i];
        console.log(name);
        var msg = "";
        msg += '<div id="friend"><div ><img id="friend_img" src="images/dglvyou.jpg"></div>';
        msg += '<div id="name">'+name+'</div><div id="hidden_div"></div></div>';
        $("#friends_list").append(msg);
    };
};








