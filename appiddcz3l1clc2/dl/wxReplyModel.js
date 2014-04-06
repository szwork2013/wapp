//微信回复图文菜单
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,奖品doc
  appId:{ type: String, required:true},        //此所属应用id
  replyTitle:{ type: String, required:true},   //回复标题
  replyPicture:{type: String, required:true},  //回复图片地址
  replyDesc:{ type: String, required:true},    //回复描述
  replayBinder:{type:String, required:true},   //绑定的菜单名称
  replayUrl:{type:String, required:true},      //跳转地址
  writeTime:{ type: Date, default: function(){return Date.now()}}, //奖品录入时间
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