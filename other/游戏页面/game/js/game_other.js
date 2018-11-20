/* 存放的是一些不需要参数的效果 */
$(function() {
    init();
    
    function init(){
        $("#intoModal").modal("show");
        $("#diceBtn").prop('disabled', true);
        $("#text").prop('disabled', true);
        $("#sendMsgBtn").prop('disabled', true);
        $("#text").prop('disabled', true);
    }
    
	$('#lookRoleBtn').click(function() {
		// 查看角色按钮
		var roleName = $("#roleName").text();
		if (roleName) {
			$('#roleModal').modal('show');
		} else {
			$('#noRoleModal').modal('show');
		}
	});

	$(".close").click(function() {
		// 弹出框的关闭样式点击隐藏
		$(this).parent().hide();
	})

	$('#sysMsgHistoryBtn').click(function() {
		// 历史消息按钮
		$('#sysMsgBox').fadeToggle('normal');
		// ajax获取数据库的信息
	});

	// 鼠标移动到警徽展示警长牌
	$('#sixBox').mouseover(function() {
		if (!$('#sheriff').is(':animated')) {
			$('#sheriff').fadeIn(700);
		}
	});
    // 鼠标移动到警徽隐藏警长牌
	$('#sixBox').mouseout(function() {
		$('#sheriff').hide(1000);
	});

	$('#helpBtn').click(function() {
		// 帮助按钮
		$('#gameRule').modal('show');
	});
    
    // 返回按钮
    $("#backBtn").click(function() {
    	$('#backAlert').show();
    });
    $("#noBtn").click(function(){
        $('#backAlert').hide();
    });
    $("#yesBtn").click(function(){
        // 当确认退出的操作
        
    });
    
})
