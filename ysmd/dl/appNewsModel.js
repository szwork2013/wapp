//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			  //应用id
      title:{type:String,required:true},           //标题
      content:{type:String,required:true},           //内容
      picture:{type:String,required:true},           //缩略图
      url:{type:String,default:''},               //跳转地址，投票金数据用
      type:{type:Number,default:1},    //1乐活空间公告(投票)，2表示乐活空间公告，3表示物语空间活动
      code1:{type:String,default:''},                 //初始参与活动人数
      code2:{type:String,default:''},                 //备用字段2
      isShow:{type:Number,default:1},             
	writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
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

module.exports = mongoose.model('wxNews', objSchema);