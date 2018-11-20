$(function() {
	// 'id' : 'name'
	var dicName = new Array();
	// 'id' : 'img'
	var dicImg = new Array();

	var ws;
    var showChatTime = false;
    var showVoteTime = false;
    
    // 每两秒检测是否满员
    var checkNumber = setInterval("checkJoinNumber()",2000);
    
	function checkJoinNumber() {
        // 检查游戏是否满员
		if (dicName.length == 6) {
            if ($.cookie("id") == 1){
                $("#gameBeginModal").modal('show');
            }else{
                $("#waitGameBegin").show();
            }
		}
	}
    
	function addLeaveStyle(id) {
		// 添加离开样式
		var html = '<b class="leave">离开</b>'
		var userBox = '#user-' + id;
		$(userBox).append(html);
	}

	function dropLeaveStyle(id) {
		// 删除离开样式
		var userBox = '#user-' + id;
		$(userBox + '>.leave').remove();
	}

	function addSheriffStyle(id) {
		// 添加警徽
		$('#sixBox').remove();
		var userBox = '#user-' + id;
		var html = '<i id="sixBox"><span id="star-six"></span></i>';
		$(userBox).append(html);
	}

	function addOwnStyle(id) {
		// 添加表示自己的样式
		var userBox = '#user-' + id;
		var html = '<b id="own">我</b>';
		$(userBox).append(html);
	}

	function getText() {
		// 把文本域获取的值中的空格/小于号/大于号进行转换
		var text = $('#text').val();
		var r1 = / /g;
		text = text.replace(r1, '&nbsp;');
		var r2 = /</g;
		text = text.replace(r2, '&lt;');
		var r3 = />/g;
		text = text.replace(r3, '&gt;');
		return text;
	}

	function getChatTimer(number) {
		// 游戏聊天倒计时显示
		if (number == 0 || showChatTime == true) {
			$('.time').text('');
			showChatTime = false;
		} else {
			var html = '<span class="text-muted">距离通话结束：</span>' + number + ' s';
			$('.time').html(html);
			number--;
			setTimeout(function() {
				getChatTimer(number);
			}, 1000)
		}
	};
    function getVoteTimer(number) {
    	// 游戏投票倒计时显示
    	if (number == 0 || showChatTime == true) {
    		$('#shot-clock').text('');
    		showChatTime = false;
    	} else {
    		$('#shot-clock').html(number);
    		number--;
    		setTimeout(function() {
    			getChatTimer(number);
    		}, 1000)
    	}
    };

	function init(host, port) {
		// 连接主体
		ws = new WebSocket("ws://" + host + ":" + port + "/");
		ws.onopen = function() {
			console.log("连接成功")
		};
		ws.onmessage = function(e) {
			msg = e.data;
			console.log('接收的消息:' + msg);
			handleMsg(msg)
		};
		ws.onclose = function() {
			$("#errorText").text("您的网络连接有问题,现已经断开。")
			$("#errorAlert").show();
		}
		ws.onerror = function(e) {
			$("#errorText").text("服务器错误，请告知管理员。")
			$("#errorAlert").show();
			console.log(e)
		}
	};

	function handleMsg(data) {
		// 处理接收到的消息
		var msg_list = data.split("^");
		var flag = msg_list[0]
		var msgList = msg_list[1].split('*')
		if (flag == 'G1') {
			// 加入游戏 
			var name = msgList[0];
			var id = msgList[1];
			var img = msgList[2];

			dicName[id] = name;
			dicImg[id] = img;
			$("#user-" + id).children("img").first().attr("src", img);
			$("#user-" + id).children("p").first().text(name);

			// 如果接收到的消息是cookie中的用户名,添加"我"标志
			if (name == $.cookie('name')) {
				addOwnStyle(id);
			}
		} else if (flag == 'G2') {
			// 游戏消息 从服务器接收到的消息
			//             系统      SYS*msg
			//                       SYS*ROLE*msg    系统发布角色 msg:角色
			//                     
			//             用户    USER*id*msg       接收用户的信息
			//                     USER*id*BOSON      用户进行投骰子
			//             
			//             打开    OPEN*BOSON      打开骰子开关
			//                     OPEN*TEXT       打开文本域和发送按钮
			//                     
			//             关闭     CLOSE*          关闭文本域和发送按钮
			//             
			//             骰子      BOSON*n         接收到从服务器发送的点数
			//             
			//             投票      VOTE*msg*arr    展示投票框，msg为提示信息，list为选项，用#分割
			if (msgList[0] == "SYS") {
				// 系统消息
				if (msgList[1] == 'ROLE') {
					// 展示角色模型
					var roleImg = getImgByRole(msgList[2]);
					$('#roleName').text(msgList[2]);
					$('#roleImg').attr("src", "img/role/role-6.gif");
					$('#roleModal button').prop('disabled', true)
					$('#roleModal').modal('show');
					setTimeout(function() {
						$('#roleImg').attr("src", roleImg);
						$('#roleModal button').prop('disabled', false)
					}, 3000)
				} else {
					addSystemMsgStyle(msgList[1]);
				}
			} else if (msgList[0] == 'USER') {
				// 玩家消息
				addUserMsgStyle(msgList[1], msgList[2]);
			} else if (msgList[0] == 'OPEN') {
				// 打开消息  
				if (msgList[1] == 'BOSON') {
					// 打开骰子和显示提示信息
					$('#diceBtn').prop('disabled', false)
					$('.tooltiptext').show();
                    showChatTime(30);
				} else if (msgList[1] == 'TEXT') {
					// 打开输入
					$('#text').prop('disabled', false);
					$('#sendMsgBtn').prop('disabled', false);
                    showChatTime(30);
				}
			} else if (msgList[0] == "CLOSE") {
				// 关闭输入
				$('#text').prop('disabled', true);
				$('#sendMsgBtn').prop('disabled', true);
			} else if (msgList[0] == 'BOSON') {
				// 改变骰子的点数
				changeDice(msgList[1]);
			} else if (msgList[0] == 'VOTE') {
				// 投票
				var msg = msgList[1];
				var arr = msgList[2].split('#');
				addVoteInfo(msg, arr);
			}
		}
	};

	function addVoteInfo(msg, arr) {
		// 在投票模型添加投票信息,并且显示出来
		$("#clue").text(msg);
		var html = '';
		$.each(arr, function(i, obj) {
			html += '<label><input type="radio" class="blue" name="optionsRadios" value="' + obj + '">' + obj + '</label>';
		});
		$("#voteModal .modal-body").append(html);
        getVoteTimer(30);  // 时间倒计时
		$("#voteModal").modal('show');
	}

	function emptyVoteInfo() {
		$("#voteModal .modal-body").empty();
		$("#clue").text("")
	}

	function getImgByRole(role) {
		// 通过角色名获取对应的图片
		var roleImg = 'img/role/';
		switch (name) {
			case '预言家':
				roleImg += 'role_img_yyj_6469ae9.jpg';
				break;
			case '狼人':
				roleImg += 'role_img_langr_58c5fc7.jpg';
				break;
			case '猎人':
				roleImg += 'role_img_lier_0cdb7ea.jpg';
				break;
			case '平民':
				roleImg += 'role_img_pm_254ca90.jpg';
				break;
		}
		return roleImg;
	}

	function getNowFormatDate() {
		//获取当前时间，格式YYYY-MM-DD
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var h = date.getHours(); //获取当前小时数(0-23)
		var m = date.getMinutes(); //获取当前分钟数(0-59)
		var s = date.getSeconds();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (day >= 0 && day <= 9) {
			day = "0" + day;
		}
		if (h >= 0 && h <= 9) {
			h = "0" + h;
		}
		if (m >= 0 && m <= 9) {
			m = "0" + m;
		}
		if (s >= 0 && s <= 9) {
			s = "0" + s;
		}
		var currentDate = year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
		return currentDate;
	};

	function changeDice(n) {
		// 根据n更换相应的点数
		var img = 'img/dice/' + n + '.png';
		$(".msg .img-rounded").last().attr('src', img);
	}

	function addMyMsgStyle(msg) {
		// 添加自己消息样式
		var img = $.cookie("img"); // 得到自己的头像
		var html = '<div class="msg">'
		html += '<p class="speakTime">' + getNowFormatDate() + '</p>'
		html += '<img src="' + img + '" class="img-circle ownImg">'
		html += '<div class="detail"><p class="ownName">我</p>'
		if (msg == 'BOSON') {
			html += '<span class="ownMsg" style="background: white;"><img src="img/dice/dice.gif" class="img-rounded"></span>'
		} else {
			html += '<span class="ownMsg">' + msg + '</span>'
		}
		html += '</div><div class="clearfix"></div></div>'
		$('#msgBox').append(html);
		$('#msgBox')[0].scrollTop = $('#msgBox')[0].scrollHeight;
	}

	function addUserMsgStyle(id, msg) {
		// 页面添加用户消息 如果是msg = BOSON 则展示gif
		var html = '<div class="msg">';
		html += '<p class="speakTime">' + getNowFormatDate() + '</p>';
		html += '<img src="' + dicImg[id] + '" class="img-circle">';
		html += '<div class="detail">';
		html += '<p><b>' + id + '</b>' + dicName[id] + '</p>';
		if (msg == "BOSON") {
			html +=
				'<span class="userMsg" style="background: white;"><img src="img/dice/dice.gif" class="img-rounded"></span>';
		} else {
			html += '<span class="userMsg">' + msg + '</span>';
		}
		html += '</div><div class="clearfix"></div></div>';
		$('#msgBox').append(html);
		$('#msgBox')[0].scrollTop = $('#msgBox')[0].scrollHeight;
	};

	function addSystemMsgStyle(msg) {
		// 页面添加系统消息
		var html = '<div class="msg">';
		html += '<p class="speakTime">' + getNowFormatDate() + '</p>';
		html += '<img src="img/judge-system.png" class="img-circle">';
		html += '<div class="detail">';
		html += '<p><span>系统</span>法官大人</p>';
		html += '<span class="sysMsg">' + msg + '</span>';
		html += '</div><div class="clearfix"></div></div>'
		$('#msgBox').append(html);
		$('#msgBox')[0].scrollTop = $('#msgBox')[0].scrollHeight;
	};

	function joinGame() {
		// 加入游戏
		var name = $.cookie("name");
		var data = 'G1^' + name;
		ws.send(data)
	}

	function sendData(msg) {
		// 游戏中发送消息
		var id = $.cookie("id");
		var data = 'G2^' + id + '*' + msg;
		ws.send(data);
	}

	$('#diceBtn').click(function() {
		// 点击骰子事件
		addMyMsgStyle("BOSON");
		sendData("BOSON");
		$(this).prop('disabled', true);
		$('.tooltiptext').hide();
        showChatTime = true;
	});

	// 点击发送按钮事件
	$('#sendMsgBtn').click(function() {
		var text = getText();
		if (text) {
			addMyMsgStyle(text);
			sendData(text)
			$("#text").val("");
		} else {
			$('#blankMessage').show();
			setTimeout(function() {
				$('#blankMessage').hide()
			}, 1500);
		}
	});

	// 文本域点击enter发送
	$("#text").keydown(function(event) {
		if (event.ctrlKey && event.keyCode == 13) {
			var e = $(this).val();
			$(this).val(e + '\n');
		} else if (event.keyCode == 13) {
			var text = getText();
			if (text) {
				addMyMsgStyle(text);
				sendData(text)
				$("#text").val("");
				return false;
			} else {
				$("#text").val("");
				$('#blankMessage').show();
				setTimeout(function() {
					$('#blankMessage').hide()
				}, 1500);
				return false;
			}
		}
	});

	$("#voteBtn").click(function() {
		// 投票模型的按钮
		var result = $('.modal-body input[name="optionsRadios"]:checked').val();
		$("#voteText").text(result);
		$("#voteSuccess").show();
		setTimeout(function() {
			$("#voteSuccess").hide();
            $("#voteModal").modal('hide');
            emptyVoteInfo()
            showVoteTime = true;
		}, 1500)
	})
    
    $("#gameBeginBtn").click(function(){
        // 房主点击开始游戏
        clearInterval(checkNumber);
        $("#gameBeginModal").modal('hide');
        $("#waitGameBegin").hide();
        // 发送游戏开始
        var data = "GB^"+$.cookie("id");
        ws.send(data)
    })

});
