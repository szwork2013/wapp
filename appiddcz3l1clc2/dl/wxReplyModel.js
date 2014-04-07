//微信回复图文菜单
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,奖品doc
  appId:{ type: String, required:true},        //此所属应用id
  replyTitle:{ type: String, required:true},   //回复标题
  replyUrl:{type:String, required:true},      //跳转地址
  replyDesc:{ type: String, required:true,default:''},    //回复描述

  replyType:{type:Number,required:true,default:1}, //回复类型，1表示关键字回复，2表示菜单回复
  replyKey:{ type: String, required:true,default:''},    //关键字
  
  replyKind:{type:Number,required:true,default:1}, //回复类型，1文字回复，2图文回复

  replyPicture:{type: String, required:true,default:''},  //回复图片地址
   
  
  isShow:{type:Number,required:true,default:1},                        //1表示启用，0表示不启用
  writeTime:{ type: Date, default: function(){return Date.now()}}, //录入时间
}

var objSchema = new Schema(obj);


objSchema.statics.findOneByObj = function(obj,cb){
	var obj = obj || {};
	return this.findOne(obj, cb);
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

module.exports = mongoose.model('wxReply', objSchema);