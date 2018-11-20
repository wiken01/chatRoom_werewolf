function addMsg() {
    var text = $("#input").val();
    $("#add").append(text);
    console.log(text);
    $("#input").val("");
    $("#input").focus("");


}

function friends_list(){
    var arr = ['wiken','kiki','小张','小王','那年春天','章開']
    for(var i=0;i<arr.length;i++){
        var name=arr[i];
        console.log(name);
        var msg = "";
        msg += '<div id="friend"><div ><img class="img" src="images/dglvyou.jpg"></div>';
        msg += '<div class="name">'+name+'></div></div>';
        $("#frineds_list").append(msg);
    };
};