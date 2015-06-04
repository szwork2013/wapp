var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;


//二维码生成
var obj = { //定义结构
      userId:{type:String,required:true, index:true},//用户id，如果是后台生成的为0
      openId:{type:String,required:true, index:true},//用户的openid，后台生成的为0            
      type:{type:String,default:1}, //二维码类型，1表示个人临时二维码，2表示系统生成永久二维码
      qrcodeGuid:{type:String,required:true,unique:true}, //二维码流水号
      qrcodeUrl:{type:String,required:true},    //二维码图片url地址
      createTimeStamp:{type:String,required:true}, //二维码生成时间，时间戳，主要用来判断用户的二维码是否过期 
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

module.exports = mongoose.model('wxQrCodeLog', objSchema);