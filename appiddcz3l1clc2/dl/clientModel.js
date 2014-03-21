var count = 0;

module.exports ={ //定义结构
	  authorId: { type:String},   //预留该client权限的id
	  clientKey: { type:String, required:true, unique:true},     //加密密钥
	  userName:{ type:String, required:true, unique:true}, //商业用户后台登陆名
	  password:{ type:String, required:true},//商业用户后台登陆密码
	  desc:{ type:String},
	  writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}