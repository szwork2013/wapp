var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			//应用id
      userId:{type:String,required:true},               //留言人id
      openId:{type:String,required:true},                 //微信id
      suggestGuid:{type:String,required:true},          //服务请求的流水号
      suggestContent:{type:String,required:true},           //留言内容
      suggestType:{type:String,required:true,default:1},    //建议类型，1表示维修服务请求，2表示意见建议投诉，3表示用户留言
      suggestProcess:{type:String,required:true,default:1},   //1表示待受理，2表示受理中，3表示处理完毕，4表示不处理
      suggestMsg:{type:String,required:true,default:''},                 //官方对此案件的处理结果反馈
      suggestCode1:{type:String,required:true,default:''},   //预留建议字段，暂时保存用户真实姓名
      suggestCode2:{type:String,required:true,default:''},   //预留建议字段，暂时保存联系电话
      suggestCode3:{type:String,required:true,default:''},  
      suggestCode4:{type:String,required:true,default:''},  
  	  isShow:{type:Number, default:1},                        //是否显示给前台，1表示显示，2表示隐藏
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);


objSchema.statics.findOneByObj = function(obj,cb){
	var obj = obj || {};
	return this.findOne(obj, cb);
}

objSchema.statics.insertOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.create(obj,cb)
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

module.exports = mongoose.model('wxSuggest', objSchema);