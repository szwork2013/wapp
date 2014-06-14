var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},
      coName:{type:String,required:true},    			  //小区名称
      coCity:{type:String,required:true},                  //小区所在城市
      coLoc: { type: [Number], index: { type: '2dsphere', sparse: true } },    //小区所在经纬度
      coAddr: {type:String,required:true,default:''},                          //小区所在地理位置
      coDesc:{type:String,required:true},            			  //小区描述
      coPictrue:{type:String,default:''},           //小区介绍图片地址
      coLogo:{type:String,required:true,default:''},           //小区Logo
      coUrl: {type:String,required:true,default:''},              //楼盘的官网地址
      coTelphone: {type:String,default:''},                   //楼盘售楼电话
      busTelphone: {type:String,default:''},                   //商业电话
      serviceTelphone: {type:String,default:''},                   //物业电话
      isShow:{type:Number,required:true,default:1},                        //1表示启用，0表示不启用
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj,  function(err,doc){
        if(err) logger.error('DB error', err);
        cb(err,doc)
      });
}

objSchema.statics.findOneByObj = function(obj,cb){
      var obj = obj || {};
      return this.findOne(obj,  function(err,doc){
        if(err) logger.error('DB error', err);
        cb(err,doc)
      });
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

module.exports = mongoose.model('wxCommunity', objSchema);