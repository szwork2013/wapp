var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj =  { //定义结构,投票活动的doc
      appId:{type:String,required:true}, //应用id
      ename:{type: String, required:true, unique:true,index:true}, //活动唯一的名字，英文标注
      
      interval:{type:Number,default:24}, //允许同一用户投票的间隔时间，超过或等于24小时，表示使用自然天来约束
      intervalTimes:{type:Number,default:1}, //允许同一用户投票的间隔时间内投票次数，-1表示不限制
      intervalPerUserTimes:{type:Number,default:1},//允许同一用户投票的间隔时间内，投某一项的次数，-1表示不限制

      startTime: { type: Date},    //投票开始时间
      endTime: { type: Date},      //投票结束时间   
      //一定时间间隔内，允许一个用户抽奖的次数，比如interval 设定1天，intervalTimes设定10次：
      //表示一个用户每天可以抽奖10次

      forwardTimes:{type:Number,default:-1},
      //用户转发之后可增加次数，0或-1表示不开启额外的转发增加次数
      //当开启转发增加次数，约束的 intervalPerUserTimes 重新计算

      //比如活动，每人每天可以对某一个人投一票，总数不限制，转发可以对某人再多投一票
      //应该如下设置：interval 设定24，intervalTimes 设定-1，intervalPerUserTimes 设定 1
      //forwardTimes 设定 -1

      title: { type: String, required:true}, //抽奖活动标题
      picture:{type: String, default:''},  //投票活动的图片地址
      descShort:{type:String,default: ""},//抽奖活动的规则简述
      desc:{type:String,default: ""},//抽奖活动的描述，比如活动规则说明的    
      isShow:{type:Number,required:true, default:0}, 

      code1:{type: String, default:''}, //备用字段1
      code2:{type: String, default:''}, //备用字段2
      code3:{type: String, default:''}, //备用字段3
      code4:{type: String, default:''}, //备用字段4
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

module.exports = mongoose.model('wxVote', objSchema);