var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;


//用户积分获取和消费流水表
var obj = { //定义结构
      appId:{type:String,required:true},    		    //应用id
      openId:{type:String,required:true},                 //微信id
      userId:{type:String,required:true},                 //用户id
      scoreGuid:{type:String,required:true},              //交易流水号
      scoreDetail:{type:Number,required:true,default:0},  //积分获取流水，获取或者扣除的积分数目
      scoreType:{type:Number,required:true,default:1},    //积分是获取还是消费，1表示获取，2表示消费
      scoreWay:{type:String,required:true},  		    //积分获取方式，枚举，比如login等
      scoreCode1:{type:String,required:true,default:''},  //积分获取流水，备用字段1，比如存储用户兑换的奖品Id等
      scoreCode2:{type:String,required:true,default:''},  //积分获取流水，备用字段2
      scoreCode3:{type:String,required:true,default:''},  //积分获取流水，备用字段3
      scoreCode4:{type:String,required:true,default:''},  //积分获取流水，备用字段4
      scoreCode5:{type:String,required:true,default:''},  //积分获取流水，备用字段5
	writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);


objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
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

module.exports = mongoose.model('wxScoreGet', objSchema);