//微信回复图文菜单
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,奖品doc
  appId:{ type: String, required:true},        //此所属应用id
  replyTitle:{ type: String, required:true},   //回复标题
  replyUrl:{type:String, default:''},      //跳转地址
  replyDesc:{ type: String, default:''},    //回复描述

  //回复类型，1.表示关键字回复,且精准匹配，多个关键字用逗号分隔，2.表示菜单图文回复，3.表示用户关注回复，4.表示默认回复
  replyType:{type:Number,required:true,default:1}, 
  replyKey:{ type: Array, default:[]},    //关键字 逗号分隔
  
  replyKind:{type:Number,required:true,default:2}, //回复类型，1文字回复，2图文回复，3红包回复

  replyPicture:{type: String, default:''},  //回复图片地址
  
  moneyMin:{type:Number,default:1}, //最小红包金额
  moneyMax:{type:Number,default:1}, //最大红包金额
  moneyWishing:{type: String, default:''}, //红包祝福语
  moneyActName:{type: String, default:''}, //红包活动名称
  moneyRemark:{type: String, default:''}, //红包备注信息
  moneyTotalNum:{type:Number,default:1}, //红包发放总数，不修改1次
  
  isShow:{type:Number,required:true,default:1},                        //1表示启用，0表示不启用
  writeTime:{ type: Date, default: function(){return Date.now()}}, //录入时间
}

var objSchema = new Schema(obj);


objSchema.statics.findByObj = function(obj,cb){
  var obj = obj || {};
  return this.find(obj, cb);
}

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