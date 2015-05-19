var FootballCtrl = (function () {
    var that;
    var obj = function () {
        that = this;
        that.openId = Util.getQueryString("openId");
        that.insId = Util.getQueryString("insId");
    };

    obj.prototype = {
        ctrl: function ($scope, $http, $timeout) {
            that.$http = $http;
            that.$scope = $scope;
            that.$timeout = $timeout;
            that.$scope.intoStrategy = that.intoStrategy;
            that.$scope.selectStar = that.selectStar;
            that.$scope.startGame = that.startGame;
            that.$scope.playOrPause = that.playOrPause;
            that.$scope.pre = that.pre;
            that.$scope.next = that.next;
            that.$scope.submitGrade = that.submitGrade;
            that.$scope.toRankingList = that.toRankingList;
            that.$scope.share = that.share;
            that.$scope.backLogin = that.backLogin;
            that.$scope.backToOver = that.backToOver;
            that.$scope.insertUserInfoShow = that.insertUserInfoShow;
            that.$scope.limitWord = that.limitWord;
            that.$scope.helpPlay = that.helpPlay;
            that.$scope.backHelpPlay = that.backHelpPlay;

             Util.getShareParam(that.$http, that.insId);
            //球星默认选中
            that.starType = "0";
            that.userId = "0";
            //背景声音
            that.isPlayM = true;
        },
        selectLoaded: function () {
            var hs = $(".title_image").height(),
            h = $(".panil-select").height();
            $(".panil-last").css({
                top: (h + hs + 50) + "px",
            }).show();
        },
        selectStar: function (type) {
            if (type == "0" && that.starType != "0") {
                that.starType = type;
                $("#starOneSelect").attr("src", "/static/game1_ball/picture/starSelect1.png");
                $("#starTwoSelect").attr("src", "/static/game1_ball/picture/starUnSelect2.png");
                
            } else if (type == "1" && that.starType != "1") {
                that.starType = type;
                $("#starOneSelect").attr("src", "/static/game1_ball/picture/starUnSelect1.png");
                $("#starTwoSelect").attr("src", "/static/game1_ball/picture/starSelect2.png");
            }
        },
        startGame: function () {
            if (that.isPlayM) {
                document.getElementById('audioRound').play();
            }
            that.count = 0;
            $("#totalCount").html(that.count);
            $("#strategy").hide();
            $("#overWord").hide();
            $("#pennant").hide();
            $("#wordShow").hide();
            $("#kickDiv").hide();
            $("#submitBtn").hide();
            $("#invitation").hide();
            $("#rankingList").hide();
            $("#playAgain").hide();
            $("#submited").hide();

            $("#submitUserInfo").hide();

            $("#btnPalay").hide();
            $("#kickCountList").hide();

            $("#audio_btn").show();
            $("#totalDiv").show();
            //人物选择
            if (that.starType == "0") {
                $("#star_stand").attr("src", "/static/game1_ball/picture/starStand.png");
                $("#starHead").attr("src", "/static/game1_ball/picture/starHead.png");
            } else {
                $("#star_stand").attr("src", "/static/game1_ball/picture/starStand1.png");
                $("#starHead").attr("src", "/static/game1_ball/picture/starHead1.png");
            }
            $(".login_tab").hide();
            $(".paly_tab").fadeIn();

            $("#startCount").show();
            
            $("#startCount").attr("src", "/static/game1_ball/picture/3.png");
            var countData = 2;
            var last = setInterval(function () {
                if (countData > 0) {
                    $("#startCount").attr("src", "/static/game1_ball/picture/" + countData + ".png");
                    countData--;
                } else if (countData == 0) {
                    $("#startCount").attr("src", "/static/game1_ball/picture/go.png");
                    countData--;
                } else {
                    clearInterval(last);
                    $("#startCount").fadeOut();
                    that.startKick();
                }
            },1000);
           
        },
        initGame: function () {
            that.g = 9.8;//重力加速度
            that.isPlaying = false;
            that.isKicking = false;
            that.touchStartOrMousedown = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
            that.touchendOrMouseup = 'ontouchstart' in window ? 'touchend' : 'mouseup';
            that.gamestart = true;
        },
        kick: function () {
            that.t = 0;
            that.setRandomVStart();
            that.isPlaying = true;
        },
        gameOver: function () {
            document.getElementById('audioRound').pause();
            $("#totalDiv").hide();
            that.ball.style.webkitTransform = "translateY(0)";
            $("#kickCount").html(that.count);
            that.submitFlag = false;
            Util.ajax(that.$http, {
                method: "POST",
                data: {
                    insId: that.insId,
                    openId: that.openId,
                    kickCount: that.count
                },
                url: Util.getApiUrl("GetRanking"),
            }, function (kickItem) {
                that.userId = kickItem.userId;
                $("#CountValue").html(kickItem.kickCount);
            });
            that.gameOverShow();
        },
        legLift: function () {
            if (that.starType == "0") {
                $("#star_stand").attr("src", "/static/game1_ball/picture/starClick.png");
            } else {
                $("#star_stand").attr("src", "/static/game1_ball/picture/starClick1.png");
            }
            //man.style.backgroundPosition = "100% 0";
            setTimeout(function () {
                //人物选择
                if (that.starType == "0") {
                    $("#star_stand").attr("src", "/static/game1_ball/picture/starStand.png");
                } else {
                    $("#star_stand").attr("src", "/static/game1_ball/picture/starStand1.png");
                }
                that.isKicking = false;
            }, 500);
        },
        setRandomVStart:function(){
            that.vStart = that.vMin + (that.vMax - that.vMin) * Math.random();
        },
        getDisplacement: function () {
            return that.vStart * that.t - that.g * that.t * that.t / 2;
        },
        playOrPause: function () {
            if (that.isPlayM) {
                $('#audio_btn').addClass('pause');
                document.getElementById('audioRound').pause();
            } else {
                document.getElementById('audioRound').play();
                $('#audio_btn').removeClass('pause');
            }
            that.isPlayM = that.isPlayM ? false : true;
        },
        startKick: function () {
            that.initGame();
            var container = document.getElementById("paly_tab");
            h = container.clientHeight;
            w = container.clientWidth;
            that.ball = document.getElementById("ball");
            //根据屏幕的高度，初始化初速度的允许范围，保证求不会被踢出屏幕
            that.vMax = Math.ceil(Math.sqrt((h - 70) * 2 * that.g));
            that.vMin = that.vMax / 2;//可调整
            container.addEventListener(that.touchStartOrMousedown, that.eventListener,false);
            var run = setInterval(function () {
                if (!that.isPlaying)
                    return;
                var displacement = that.getDisplacement();
                if (displacement < -10) {
                    that.isPlaying = false;
                    clearInterval(run);
                    that.gameOver();
                } else if (displacement < 0) {
                    displacement = 0;
                }
                that.ball.style.webkitTransform = "translateY(-" + displacement + "px)";
                that.t = that.t + 0.1;
            }, 10);
        },
        gameOverShow: function () {
            var container = document.getElementById("paly_tab");
            document.getElementById("pennant").style.height = "35%";
            container.removeEventListener(that.touchStartOrMousedown, that.eventListener, false);
            $("#overWord").show();
            $("#pennant").show();
            $("#wordShow").show();
            $("#kickDiv").show();
            if (that.submitFlag) {
                $("#submited").show();
                $("#submitBtn").hide();
            } else {
                $("#submitBtn").show();
                $("#submited").hide();
            }
            setTimeout(function () {
                $("#invitation").show();
                $("#rankingList").show();
                $("#playAgain").show();
                $("#btnList").show();
            },500);
        },
        submitChange: function (btn,imgs) {
            $(btn).attr("src", "/static/game1_ball/picture/"+imgs+".png");
        },
        submitGrade: function () {
            $("#submitBtn").hide();
            that.submitFlag = true;
            // 已记录用户信息，记录成绩
            if (that.userId != "0" && that.userId != "-1") {
                Util.ajax(that.$http, {
                    method: "POST",
                    data: {
                        insId:that.insId,
                        openId:that.openId,                       
                        userId: that.userId,
                        kickCount: that.count
                    },
                    url: Util.getApiUrl("insertGrade"),
                }, function (flag) {
                    $(".InfoWord").hide();
                    $(".InfoDiv").hide();
                    $("#submited").show();
                });
            } else {
                $("#kickDiv").hide();
                $("#invitation").hide();
                $("#rankingList").hide();
                $("#playAgain").hide();
                $("#submited").hide();
                $("#overWord").hide();
                $("#pennant").hide();
                //填写信息提示
                $(".InfoWord").show();
                $(".InfoDiv").show();
                $(".submitUserInfo").show();
            }
        },
        insertUserInfoShow: function () {
            var userName = $.trim($("#ip_username").val());
            var phone = $.trim($("#ip_phone").val());
            if (userName == "") {
                Util.info("请输入您的姓名！");
                return;
            }

            if (!Util.isInteger(phone)) {
                Util.info("请输入正确的电话号码！");
                return;
            }

            Util.ajax(that.$http, {
                method: "POST",
                data: {
                    insId: that.insId,
                    openId: that.openId,
                    phoneNum: phone,
                    userName: userName,
                    kickCount: that.count
                },
                url: Util.getApiUrl("insertUserInfo"),
            }, function (userId) {
                that.userId = userId;
                $(".InfoWord").hide();
                $(".InfoDiv").hide();
                that.gameOver();
                $("#submitBtn").hide();
                $("#submited").show();
            });
        },
        eventListener: function () {
            if (that.isKicking)
                return;
            that.isKicking = true;
            if (!that.isPlaying) {
                //重新开始游戏
                that.count = 0;
                that.kick();
            }
            if (that.getDisplacement() < 60) {
                that.kick();
                that.count++;
                $("#totalCount").html(that.count);

                //踢中球
                var key = 0;
                if (that.isPlaying && that.isPlayM && that.count % 5 == 0) {
                   key = parseInt(4 * Math.random());
                    document.getElementById("audio" + key).play();
                }
            }
            that.legLift();
        },
        page_load: function () {
            //加载时间-单位毫秒
            var loadCount = 2000;
            var lastTime = 0;
            var values = "0%";
            var laster = setInterval(function () {
                if (lastTime < 2000) {
                    lastTime = lastTime + 80;
                    values = Math.floor((lastTime / loadCount) * 100) + "%";
                    $("#percentage").html(values);
                } else {
                    clearInterval(laster);
                    $("#loadings").hide();
                    $("#login_tab").show();
                    that.selectLoaded();
                }
            }, 80);
        },
        intoStrategy: function () {
            Util.ajax(that.$http, {
                method: "POST",
                data: {
                    insId: that.insId,
                    openId: that.openId
                },
                url: Util.getApiUrl("GetGameRole"),
            }, function (gameRoleList) {
                if (gameRoleList) {
                    var tbody = "";
                    $.each(gameRoleList, function (n, value) {
                        var trs = "";
                        trs += "<tr><td >" + value.itemCount + "名</td><td class=\"tdStyle1\">" + value.itemDesc + "</td></tr>";
                        tbody += trs;
                    });
                    $("#strategyList").html(tbody);
                    $("#login_tab").hide();
                    $("#strategy").show();
                } else {
                    Util.info("网络中断！");
                }
            });
        },
        backLogin: function () {
            $("#login_tab").show();
            $("#strategy").hide();
        },
        toRankingList: function () {
            //未记录用户信息，显示填写用户信息层
            $("#overWord").attr("src", "/static/game1_ball/picture/rankingWord.png");
            document.getElementById("pennant").style.height = "62%";

            $("#kickDiv").hide();
            $("#btnList").hide();
            $("#submitBtn").hide();
            $("#submited").hide();
            $("#kickCountList").show();
            $("#btnPalay").show();
            that.pageCount = 1;
            that.pageChangeList();
        },
        pre: function () {
            if (that.pageCount <= 1) {
                Util.info("已是第一页");
                return;
            }
            that.pageCount--;
            that.pageChangeList("pre");
        }, next: function () {
            that.pageCount++;
            that.pageChangeList("next");
        }, pageChangeList: function (type) {
            Util.ajax(that.$http, {
                method: "POST",
                data: {
                    insId: that.insId,
                    openId: that.openId,
                    pageCount: that.pageCount
                },
                url: Util.getApiUrl("GetAwardWinningList"),
            }, function (userGradeList) {
                if (userGradeList) {
                    if (userGradeList.length > 0) {
                        that.$scope.userGradeList = userGradeList;
                        that.$scope.pageCount = that.pageCount;
                    } else {
                        if (type == "next") {
                            that.pageCount--;
                            Util.info("已到最后一页");
                        } else {
                            that.pageCount++;
                            Util.info("已是第一页");
                        }
                    }
                }else{
                     Util.info("网络中断！");
                }
            });
        }, share: function () {
            $(".fade").show();
        }, closeShare: function () {
            $("#inner_center").hide();
        }, backToOver: function () {
            that.gameOverShow();
            document.getElementById("pennant").style.height = "35%";
            $("#overWord").attr("src", "/static/game1_ball/picture/overWord.png");
            $("#overWord").show();
            $("#InfoWord").hide();
            $("#kickDiv").show();
            $("#btnList").show();
            $("#kickCountList").hide();
            $("#btnPalay").hide();
        }, limitWord: function (word) {
            if (word.length > 4) {
                return word.substring(0, 3) + "...";
            } else {
                return word;
            }
        }, helpPlay: function () {
            $("#login_tab").hide();
            $('#fade').show();
        }, backHelpPlay: function () {
            $('#fade').hide();
            $("#login_tab").show();
        }
    };

    return new obj();
})();