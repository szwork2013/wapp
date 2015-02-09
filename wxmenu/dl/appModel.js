var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appName:{ type:String,required:true,unique:true},
      appEname:{ type:String,required:true,unique:true},
      appTelphone:{type:String,required:true},
      appCustomTel:{type:String,required:true},
      appPicture:{ type:String,required:true,default:''},
      appIntro:{ type:String,required:true,default:''},
      wxAppId:{type:String,required:true,default:''},  //微信的appid
      wxAppSecret:{type:String,required:true,default:''},  //微信的appsecret
      wxAppToken:{type:String,required:true,default:''},  //微信的 token
      useOAuth:{type:Number,default:0},  //只能一个，使用这个app的OAuth跳转
      oauthScope:{type:String,default:'snsapi_base'},

      accessToken:{type:String, default:''},//accesstoken 字符串
      accessTokenDate:{type: Date, default: function(){return Date.now()}},//accesstoken生成时间
      jsapiTicket:{type:String, default:''},//jsapiticket
      jsapiTicketDate:{type: Date, default: function(){return Date.now()}},//jsapiticket生成时间

      //snsapi_base 自动跳转，只获取opendi
      //snsapi_userinfo 用户授权，获取用户昵称，头像，位置等信息
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findOneByObj = function(obj,cb){
	var obj = obj || {};
	return this.findOne(obj, function(err,doc){
    if(err) logger.error('DB error', err);
    cb(err,doc)
  });
}

objSchema.statics.findAll = function (obj,skip,pagesize,cb) { 
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

objSchema.statics.countAll = function (obj,cb) { 
       return this.count(obj, cb);
}

objSchema.statics.createOneOrUpdate = function (query, update, cb) { 
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
}

objSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}


module.exports = mongoose.model('wxApp', objSchema);