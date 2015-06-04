var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;


//用户积分获取和消费流水表
var obj = { //定义结构
      userId:{type:String,required:true, index:true},        //用户id
      investigateId:{type:String,required:true, index:true}, //调查问卷id
      investigateResultJson:{type:String,required:true,},//此用户参与调查问卷的结果记录json
      code1:{type:String,default:''},  //积分获取流水，备用字段1，比如存储用户兑换的奖品Id等
      code2:{type:String,default:''},  //积分获取流水，备用字段2
	writeTime:{ type: Date, default: function(){return Date.now()} },    //写入时间
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

module.exports = mongoose.model('wxInvestigateLog', objSchema);