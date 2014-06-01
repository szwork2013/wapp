var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			//应用id
      userId:{type:String,required:true},               //留言人id
      openId:{type:String,required:true},                 //微信id
      suggestGuid:{type:String,default:'-1'},          //服务请求的流水号，留言和建议投诉为-1
      suggestContent:{type:String,required:true},           //留言内容
      suggestType:{type:String,default:1},                  //建议类型，1表示维修服务请求，2表示意见建议投诉，3表示用户留言，4表示新客户推荐
      suggestProcess:{type:String,default:1},               //1表示待受理，2表示受理中，3表示处理完毕，4表示不处理
      suggestMsg:{type:String,default:''},                 //官方对此案件的处理结果反馈
      suggestCode1:{type:String,default:''},              //预留建议字段，暂时保存用户真实姓名
      suggestCode2:{type:String,default:''},              //预留建议字段，暂时保存联系电话
      suggestCode3:{type:String,default:''},              //预留字段，暂时保存楼房编号
      suggestCode4:{type:String,default:''},              //预留字段，暂时保存房间号
  	  isShow:{type:Number, default:1},                        //是否显示给前台，1表示显示，2表示隐藏
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
  var obj = obj || {};
  return this.find(obj).limit(100).sort({"_id":-1}).exec(cb);
}

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