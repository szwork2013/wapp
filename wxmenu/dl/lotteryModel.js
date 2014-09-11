var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj =  { //定义结构,lottery抽奖活动的doc
      ename:{type: String, required:true, unique:true,index:true}, //活动唯一的名字，英文标注
      title: { type: String, required:true}, //抽奖活动标题
      interval:{type:Number,default:24}, //允许同一用户抽奖的间隔时间,单位是小时HOURS
      intervalTimes:{type:Number,default:1}, 
      startTime: { type: Date},    //活动开始时间
      endTime: { type: Date},      //活动结束时间   
      //一定时间间隔内，允许一个用户抽奖的次数，比如interval 设定1天，intervalTimes设定10次：
      //表示一个用户每天可以抽奖10次

      forwardTimes:{type:Number,default:-1}, //用户转发之后可增加次数，0或-1表示不开启额外的转发增加次数
      allowLotteryTimes:{type:Number,default:-1}, //用户每次次活动间隔，最多可以获得奖品数目，-1或0表示无限制，forward转发将重新计算
      
      desc:{type:String,default: ""},//抽奖活动的描述，比如活动规则说明的    
      isShow:{type:Number,required:true, default:0}, 
      writeTime:{ type: Date, default: function(){return Date.now()}},
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

module.exports = mongoose.model('wxLottery', objSchema);