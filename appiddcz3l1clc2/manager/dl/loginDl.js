
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var adminSchema = new Schema({ //定义结构
	  username: { type: String, required:true, unique: true},   //管理员名称
	  password: { type: String, required:true},     //管理员密码
	  clientId: {type: String, required:true},   //管理员所属渠道
	  writeTime: { type: Date, default: function(){return Date.now()} },    //用户注册时间
	  LastLoginTime: { type: Date, default: function(){return Date.now()} }    //上一次登录时间
})


adminSchema.statics.findByusername = function (username,cb) { //插入用户注册信息
  if(username === global.app.get('widgetadmin')){
  		return cb(null, {"username":username, "password": 'abc123!@#'})
  }
  else return cb(null, null) 	
}




module.exports = mongoose.model('WidgetAdmin', adminSchema);




