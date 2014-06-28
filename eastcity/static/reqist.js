(function(w, doc){
	// 工具方法
	function $(id){
		return doc.getElementById(id);
	}
	function hasClass(elem, cls){
		var reg = new RegExp('(^|\\s)' + cls + '($|\\s)');
		return reg.test(elem.className);
	}

	function removeClass(elem, cls){
		var reg = new RegExp('(^|\\s)' + cls + '($|\\s)', 'g');
		elem.className = elem.className.replace(reg, ' ');
	}

	function addClass(elem, cls){
		if(!hasClass(elem, cls)){
			elem.className += ' ' + cls;
		}
	}

	// 为dom元素绑事件
	var addEvent = doc.addEventListener ?
		function(elem, type, fn){
			elem.addEventListener(type, fn, false);
		} : function(elem, type, fn){
			elem.attachEvent('on' + type, fn);
		};
	// 为fn绑定this指针
	function bind(fn, context){
		return function(){
			fn.call(context);
		};
	}
	function utf8_to_b64(str){
		return w.btoa(w.encodeURIComponent(trim(str)));
	}
	function trim(str){
		return (!str) ? '' : str.toString().replace(/^\s+|\s+$/g, '');
	}
	
	function extend(obj1, obj2){
		for(var key in obj2){
			obj1[key] = obj2[key];
		}
	}
	function parseJSON(str){
		if(typeof(str) === 'object') {
			return str;
		} else {
			if(window.JSON){
				return JSON.parse(str);
			} else {
				return eval('(' + str + ')');
			}
		}
	}
	function encodeData(obj){
		var pairs = [];
		for(var key in obj){
			pairs.push(key + '=' + obj[key]);
		}
		return pairs.join('&');
	}
	// 工具方法 end
	
	
	var PASSWORD_BLACK_LIST = '000000,111111,11111111,112233,123123,123321,\
		123456,654321,666666,888888,abcdef,abcabc,\
		abc123,a1b2c3,aaa111,123qwe,qwerty,qweasd,admin,\
		password,p@ssword,passwd,iloveyou,5201314';
	
	var CHECK_USER_EXIST = '/signup/ajcheckuser';
	var REGISTER_URL = '/signup/ajsignup';

	var SIGN_URL = '/signin/signin?username=';
	
		
	var CHINA_PHONE_REG = /^(13|14|15|17|18)[0-9]{8}[0-9]$/;
	var SBC_CASE_REG = /[\uFE30-\uFFA0]/gi;
	var EMAIL_REG = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
	
	// 请正确输入手机号码
	var ERROR_MSG_WRONG_PHONE = '\u8BF7\u6B63\u786E\u8F93\u5165\u624B\u673A\u53F7\u7801';
	// 密码中不能包含空格
	var BLANK_PASSWORD = '\u5BC6\u7801\u4E2D\u4E0D\u80FD\u5305\u542B\u7A7A\u683C';
	// 密码与用户名过于相似
	var PASSWORD_IN_NAME = '\u5BC6\u7801\u4E0E\u7528\u6237\u540D\u8FC7\u4E8E\u76F8\u4F3C';
	// 密码过于简单
	var PASSWORD_IN_BLACK_LIST = '\u5BC6\u7801\u8FC7\u4E8E\u7B80\u5355';
	// 密码长度不得少于6个字符
	var TOO_SHORT_PASSWORD = '\u5BC6\u7801\u957F\u5EA6\u4E0D\u5F97\u5C11\u4E8E6\u4E2A\u5B57\u7B26';
	// 密码长度不得多于16个字符
	var TOO_LONG_PASSWORD = '\u5BC6\u7801\u957F\u5EA6\u4E0D\u5F97\u591A\u4E8E16\u4E2A\u5B57\u7B26';
	// 密码不能包含全角字符
	var WITH_SBC_PASSWORD = '\u5BC6\u7801\u4E0D\u80FD\u5305\u542B\u5168\u89D2\u5B57\u7B26';
	// 密码不能为空
	var ERROR_PASSWORD_EMPTY = '\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A';
	
	// 请阅读并同意协议
	var READ_RULE_UN = '\u8BF7\u9605\u8BFB\u5E76\u540C\u610F\u534F\u8BAE';
	
	// 邮箱格式不正确
	var ERROR_MSG_WRONG_EMAIL = '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E';
	
	// 该帐号已注册，您可直接
	var ERROR_MSG_EXISTED = '\u8BE5\u5E10\u53F7\u5DF2\u6CE8\u518C\uFF0C\u60A8\u53EF\u76F4\u63A5';
	
	// 请您使用
	var ERROR_MSG_PLEASE_USE = '\u8BF7\u60A8\u4F7F\u7528';
	
	// 直接
	var ERROR_MSG_LOGIN_DIRECT = '\u76F4\u63A5';
	
	// 登录
	var ERROR_MSG_LOGIN_TEXT = '\u767B\u5F55';
	
	
	
	// 父类
	var Register = function(){
		// 共用一个错误信息容器
		this.error = $('errorMessage');
	};
	Register.prototype = {
		// 重置表单：清空数据，清空错误提示等
		reset: function(){
			removeClass(this.nameInput.parentNode, 'error');
			this.nameInput.value = '';
			removeClass(this.passwordInput.parentNode, 'error');
			this.passwordInput.value = '';
			this.readRule.class = 'checked';
			this.togglePassword.style.display = 'none';
			this.hideError();
		},
		// 显示错误信息
		showError: function(errorMsg){
			this.error.innerHTML = errorMsg;
			this.error.style.display = 'block';
		},
		// 隐藏错误信息
		hideError: function(){
			this.error.style.display = 'none';
		},
		// 是否选择了“已阅读”
		isReadRule: function(){
			return this.readRule.className == 'checked';
		},
		// 已阅读开关动作
		toggleReadRule: function(){
			if(this.isReadRule()){
				this.readRule.className = '';
			} else {
				this.readRule.className = 'checked';
			}
		},
		// 显示该注册模块
		show: function(){
			this.dom.style.display = 'block';
		},
		// 隐藏该注册模块
		hide: function(){
			this.dom.style.display = 'none';
		},
		// 当密码框有内容的时候，显示togglePassword按钮
		checkPasswordLength: function(){
			if(trim(this.passwordInput.value).length == 0){
				this.togglePassword.style.display = 'none';
			} else {
				this.togglePassword.style.display = 'block';
			}
			
		},
		// 密码框明文/暗文开关
		doTogglePassword: function(){
			if(this.togglePassword.className == 'toggle-password show'){
				this.togglePassword.className = 'toggle-password hide';
				this.passwordInput.type = 'password';
			} else {
				this.togglePassword.className = 'toggle-password show';
				this.passwordInput.type = 'text';
			}
			this.passwordInput.focus();
		},
		// 绑定手机注册和邮箱注册都需要到的事件
		bindCommenEvent: function(){
			// “已阅读”开关
			addEvent(this.readRule, 'click', bind(this.toggleReadRule, this));
			
			// 当密码框内容改变时，检测其内容长度来决定是否显示togglePassword按钮
			addEvent(this.passwordInput, 'keyup', bind(this.checkPasswordLength, this));
			// 当点击togglePassword按钮时，更改password的明文/暗文类型
			addEvent(this.togglePassword, 'click', bind(this.doTogglePassword, this));
			
			// 当用户名（邮箱或者手机号）输入完成之后，进行校验
			addEvent(this.nameInput, 'blur', bind(this.onNameInputBlur, this));
			// 当用户名（邮箱或者手机号）内容改变时，进行校验
			addEvent(this.nameInput, 'keyup', bind(this.onNameInputChange, this));
			
			// 当密码框开始输入时，如果上次密码输入不合规范，则置空输入框
			addEvent(this.passwordInput, 'focus', bind(this.onPasswordInputFocus, this));
		},
		isPasswordValid: function(){
			// check whether ' ' is in the password
			var number = trim(this.nameInput.value);
			var password = this.passwordInput.value;
			if(password.indexOf(' ') >= 0){
				addClass(this.passwordInput.parentNode, 'error');
				this.showError(BLANK_PASSWORD);
				return false;
			} else {
				// check whether the password is in the number
				if(password.length == 0){
					addClass(this.passwordInput.parentNode, 'error');
					this.showError(ERROR_PASSWORD_EMPTY);
					return false;
				}
				if(number.indexOf(password) >= 0){
					addClass(this.passwordInput.parentNode, 'error');
					this.showError(PASSWORD_IN_NAME);
					return false;
				} else {
					// check whether the password is in the black list
					if(PASSWORD_BLACK_LIST.indexOf(password) >= 0){
						addClass(this.passwordInput.parentNode, 'error');
						this.showError(PASSWORD_IN_BLACK_LIST);
						return false;
					} else {	
						// check the password's length
						if(password.length < 6){
							addClass(this.passwordInput.parentNode, 'error');
							this.showError(TOO_SHORT_PASSWORD);
							return false;
						} else if(password.length > 16){
							addClass(this.passwordInput.parentNode, 'error');
							this.showError(TOO_LONG_PASSWORD);
							return false;
						} else {
							// check the password's SBC
							if(SBC_CASE_REG.test(password)){
								addClass(this.passwordInput.parentNode, 'error');
								this.showError(WITH_SBC_PASSWORD);
								return false;
							}
							
							removeClass(this.passwordInput.parentNode, 'error');
							this.hideError();
							return true;
						}
					}
				}
			}
		},
		onPasswordInputFocus: function(){
			if(hasClass(this.passwordInput.parentNode, 'error')){
				removeClass(this.passwordInput.parentNode, 'error');
				this.hideError();
				this.togglePassword.style.display = 'none';
				this.passwordInput.value = '';
			}
		},
		checkUsernameExist: function(){
			var that = this;
			ajax({
				url: CHECK_USER_EXIST,
				type: 'POST',
				data: {
					user: trim(that.nameInput.value),
					r: that.hiddenRValue,
					entry: that.hiddenEntryValue
				},
				onsuccess: function(ret){
					var result = parseJSON(ret);
					if(result.retcode != 20000000){
						switch(result.retcode){
							case 50011001:
								var url = SIGN_URL + trim(that.nameInput.value);
								that.showError(ERROR_MSG_EXISTED + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
								break;
							case 50011002:
								var url = SIGN_URL + trim(that.nameInput.value);
								that.showError(ERROR_MSG_PLEASE_USE + trim(that.nameInput.value) + ERROR_MSG_LOGIN_DIRECT + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
								break;
							default:
								that.showError(result.msg);
						}
						addClass(that.nameInput.parentNode, 'error');
					}
				}
			});
		}
	};
	
	var PhoneRegister = function(){
		// 手机注册大容器
		this.dom = $('phoneRegister');
		
		// 是否阅读
		this.readRule = $('pr-readRule');
		
		
		// 手机号输入框
		this.nameInput = $('pr-nameInput');
		// 密码输入框
		this.passwordInput = $('pr-passwordInput');
		// 更改password 明/暗 文按钮
		this.togglePassword = $('pr-togglePassword');
		
		this.hiddenRValue = $('pr-hiddenR').value;
		this.hiddenEntryValue = $('pr-hiddenEntry').value;
		
		this.init();
	};
	
	// 继承 Register
	PhoneRegister.prototype = new Register();
	
	extend(PhoneRegister.prototype,{
		init: function(){
			this.bindCommenEvent();
			
			// 绑定事件
			this.bindEvent();
		},
		bindEvent: function(){
			// 提交按钮点击事件处理
			addEvent($('pr-submit'), 'click', bind(this.onSubmit, this));
			addEvent(this.nameInput, 'focus', bind(this.onPhoneFocus, this));
		},
		onPhoneFocus: function(){
			this.nameInput.type = 'tel';
		},
		onNameInputBlur: function(){
			this.nameInput.type = 'text';
			// 当手机号输入完成之后，检测格式
			if(CHINA_PHONE_REG.test(trim(this.nameInput.value))){
				removeClass(this.nameInput.parentNode, 'error');
				this.hideError();
				
				this.checkUsernameExist();
			} else {
				addClass(this.nameInput.parentNode, 'error');
				this.showError(ERROR_MSG_WRONG_PHONE);
			}
		},
		onNameInputChange: function(){
			// 当手机号正在输入的时候，检测格式
			if(CHINA_PHONE_REG.test(trim(this.nameInput.value))){
				removeClass(this.nameInput.parentNode, 'error');
				this.hideError();
			}
		},
		onSubmit: function(){
			var that = this;
			if(that.validate()){
				this.hideError();
				ajax({
					url: REGISTER_URL,
					data: {
						user: trim(that.nameInput.value),
						password: that.passwordInput.value,
						r: that.hiddenRValue,
						entry: that.hiddenEntryValue,
						way: 'phone'
					},
					type: 'POST',
					onsuccess: function(ret){
						var result = parseJSON(ret);
						if(result.retcode != 20000000){
							switch(result.retcode){
								case 50011001:
									var url = SIGN_URL + trim(that.nameInput.value);
									that.showError(ERROR_MSG_EXISTED + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
									break;
								case 50011002:
									var url = SIGN_URL + trim(that.nameInput.value);
									that.showError(ERROR_MSG_PLEASE_USE + trim(that.nameInput.value) + ERROR_MSG_LOGIN_DIRECT + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
									break;
								default:
									that.showError(result.msg);
							}
							addClass(that.nameInput.parentNode, 'error');
						} else {
							w.location.href = result.data.url + '?' + encodeData(result.data);
						}
					}
				});
			}
		},
		validate: function(){
			var number = trim(this.nameInput.value);
			
			// check the number
			if(CHINA_PHONE_REG.test(number)){
				
				// check the password
				if(this.isPasswordValid()){
					
					if(this.isReadRule()){
						return true;
					} else {
						this.showError(READ_RULE_UN);
						return false;
					}
				}
				
				return false;
			} else {
				addClass(this.nameInput.parentNode, 'error');
				this.showError(ERROR_MSG_WRONG_PHONE);
				return false;
			}
		}
	});
	
	var EmailRegister = function(){
		this.dom = $('emailRegister');
		
		this.readRule = $('er-readRule');
		
		this.nameInput = $('er-nameInput');
		this.passwordInput = $('er-passwordInput');
		this.togglePassword = $('er-togglePassword');
		
		this.hiddenRValue = $('pr-hiddenR').value;
		this.hiddenEntryValue = $('pr-hiddenEntry').value;
		
		this.init();
	};
	
	EmailRegister.prototype = new Register();
	
	extend(EmailRegister.prototype,{
		init: function(){
			this.bindCommenEvent();
			this.bindEvent();
		},
		bindEvent: function(){
			addEvent($('er-submit'), 'click', bind(this.onSubmit, this));
		},
		
		onNameInputBlur: function(){
			var email = trim(this.nameInput.value);
			if(EMAIL_REG.test(email)){
				removeClass(this.nameInput.parentNode, 'error');
				this.hideError();
				
				this.checkUsernameExist();
			} else {
				addClass(this.nameInput.parentNode, 'error');
				this.showError(ERROR_MSG_WRONG_EMAIL);
			}
		},
		onNameInputChange: function(){
			var email = trim(this.nameInput.value);
			if(EMAIL_REG.test(email)){
				removeClass(this.nameInput.parentNode, 'error');
				this.hideError();
			}
		},
		onSubmit: function(){
			var that = this;
			if(this.validate()){
				this.hideError();
				ajax({
					url: REGISTER_URL,
					data: {
						user: trim(that.nameInput.value),
						password: that.passwordInput.value,
						r: that.hiddenRValue,
						entry: that.hiddenEntryValue,
						way: 'email'
					},
					type: 'POST',
					onsuccess: function(ret){
						var result = parseJSON(ret);
						if(result.retcode != 20000000){
							switch(result.retcode){
								case 50011001:
									var url = SIGN_URL + trim(that.nameInput.value);
									that.showError(ERROR_MSG_EXISTED + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
									break;
								case 50011002:
									var url = SIGN_URL + trim(that.nameInput.value);
									that.showError(ERROR_MSG_PLEASE_USE + trim(that.nameInput.value) + ERROR_MSG_LOGIN_DIRECT + '<a href="' + url + '">' + ERROR_MSG_LOGIN_TEXT + '</a>');
									break;
								default:
									that.showError(result.msg);
							}
							addClass(that.nameInput.parentNode, 'error');
						} else {
							w.location.href = result.data.url + '?' + encodeData(result.data);
						}
					}
				});
			}
		},
		validate: function(){
			var email = trim(this.nameInput.value);
			
			// check the email
			if(EMAIL_REG.test(email)){
				
				// check the password
				if(this.isPasswordValid()){
					
					if(this.isReadRule()){
						return true;
					} else {
						this.showError(READ_RULE_UN);
						return false;
					}
				}
				
				return false;
			} else {
				addClass(this.nameInput.parentNode, 'error');
				this.showError(ERROR_MSG_WRONG_EMAIL);
				return false;
			}
		}
	});
	
	
	var phoneRegister = new PhoneRegister();
	var emailRegister = new EmailRegister();
	
	
	var segment = $('segment');
	addEvent(segment, 'click', function(){
		if(hasClass(segment, 'segment-c1')){
			segment.className = 'segment segment-c2';
			phoneRegister.hide();
			emailRegister.reset();
			emailRegister.show();
		} else {
			segment.className = 'segment segment-c1';
			phoneRegister.reset();
			phoneRegister.show();
			emailRegister.hide();
		}
	});
	
	addEvent(doc, 'keydown', function(e){
		e = e || window.event;
		if(e.keyCode == 13){
			if(hasClass(segment, 'segment-c1')){
				phoneRegister.onSubmit();
			} else {
				segment.className = 'segment segment-c1';
				emailRegister.onSubmit();
			}
		}
	});
})(window, document);