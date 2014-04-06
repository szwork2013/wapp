//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			  //应用id
      coId:{type:String,required:true,default:'0'}, 	   //所属小区Id,不属于某一个小区为‘0’
      appNewsTitle:{type:String,required:true},           //优惠活动的标题
      appNewsContent:{type:String,required:true},           //优惠活动的内容
      appNewsPicture:{type:String,required:true},           //优惠活动的缩略图
      appNewsType:{type:Number,required:true, default:1},    //1表示新闻，2表示楼盘活动，3表示楼盘优惠
      isShow:{type:Number,required:true, default:0},  
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
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