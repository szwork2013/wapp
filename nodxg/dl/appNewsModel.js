//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			  //应用id
      title:{type:String,required:true},           //标题
      content:{type:String,required:true},           //内容
      picture:{type:String,required:true},           //缩略图
      url:{type:String,default:''},                   //咨询热线
      type:{type:Number,default:1},                   //1新闻公告, 2推荐说明
      code1:{type:String,default:''},                 //副标题
      code2:{type:String,default:''},                 //用于记录房地产开发商的类型Id
      code3:{type:String,default:''},                 //售楼处地址
      sort:{type:Number,default:1},                  //排序
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