//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    		//应用id
      title:{type:String,required:true},              //标题
      intro:{type:String,required:true},              //简介
      picture:{type:String,required:true},            //缩略图
      url:{type:String,required:true},                //模版地址
      ename:{type:String,required:true,unique:true},  //唯一的英文名
      isPrize:{type:Number,default:0},            //0表示本活动不能兑奖，1表示本活动可以兑奖
      prizeAmount:{type:Number,default:0},        //每个用户可兑奖次数
      startTime: { type: Date},    //活动开始时间
      endTime: { type: Date},      //活动结束时间 
      //新增功能
      useScore:{type:Number,default:0}, //是否使用用户积分作为支持分数，0表示不实用，1表示使用用户积分计算
      minSupportScore:{type:Number,default:0}, //是否使用用户积分作为支持分数
      maxSupportScore:{type:Number,default:100}, //是否使用用户积分作为支持分数
      scoreList:{type:String, default:'1'},      //用户每次点赞获取的支持数，数组：1,0.8,0.6,0.7 这样以英文逗号分割的数字
      withDay:{type:Number,default:0},           //用户支持，是否按天算，每天一次，0表示不按天，活动总共1次，1表示按天算
      //新增功能
      code1:{type:String, default:'snsapi_base'},                 //Oauth方式
      //snsapi_base 自动跳转，只获取opendi
      //snsapi_userinfo 用户授权，获取用户昵称，头像，位置等信息

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

module.exports = mongoose.model('wxActive', objSchema);