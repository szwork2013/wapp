var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //评分流水表
    toUserId:{ type: String, required:true, index:true},  //用户的id号
    fromUserId:{type: String, required:true, index:true},  //谁给出的评分
    logIp:{type:String,default: '127.0.0.1'},            //评分用户的ip地址
    starScore:{type: Number,default:1},                   //本次评分评了多少分

    code1:{type:String,default: ''}, //备用字段
    code2:{type:String,default: ''}, //备用字段
    code3:{type:String,default: ''}, //备用字段
    code4:{type:String,default: ''}, //备用字段
    writeTime:{ type: Date, default: function(){return Date.now()}}, //抽红包的世界
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

module.exports = mongoose.model('wxStarLog', objSchema);