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
      code1:{type:String,default:''},                 //备用字段1
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