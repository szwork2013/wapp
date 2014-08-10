var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;


var obj = { //定义结构
      userId:{ type:String,required:true,index:true}, 				   //此用户在数据库中的_id
      openId:{type:String,required:true,index:true,unique:true},				  //微信id
      appId:{type:String,required:true,index:true},                  //表示用户是从哪个微信项目绑定的
      appUserCity:{type:String,default:''},                 //用户物业所在城市
      appUserCommunity:{type:String,default:''},            //用户物业所在小区
      appUserBuilding:{type:String,default:''},             //用户物业所在楼号
      appUserRoom:{type:String,default:''},                 //用户物业所在房号
      appCardNumber:{type:String,default:''},            //用户会员卡
      appUserType:{type:Number,default:0},               //0表示用户未认证，1表示认证会员（没有填写小区），2表示vip认证会员（填写小区）
	    isNewSubmit:{type:Number,default:0},               //新的验证，1表示用户提交了信息请求验证，0表示默认或已审核，2表示用户请求了验证被驳回不通过
      lastActiveTime:{ type: Date, default: function(){return Date.now()} }, //最后一次活跃时间,用来做消息推送的时间凭证
      writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
	var obj = obj || {};
	return this.find(obj, function(err,doc){
    if(err) logger.error('DB error', err);
    cb(err,doc)
  });
}

objSchema.statics.findOneByObj = function(obj,cb){
  var obj = obj || {};
  return this.findOne(obj, function(err,doc){
    if(err) logger.error('DB error', err);
    cb(err,doc)
  });
}

objSchema.statics.insertOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.create(obj, function(err,doc){
    if(err) logger.error('DB error', err);
    cb(err,doc)
  })
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

//后台kendoui使用
objSchema.statics.getUserByIds = function (ids, cb) {
  var ids = ids || [];
  this.find({
    "userId":{
      "$in":ids
    }
  }).limit(1000).exec(function(err,docs){
    if(err) return cb(err);
    if(!docs || docs.length == 0) return cb(null,[]);
    var idsary=[]
    docs.forEach(function(v){
      idsary.push({
        appUserId:v.userId,
        appUserCity:v.appUserCity,
        appUserCommunity:v.appUserCommunity,
        appUserBuilding:v.appUserBuilding,
        appUserRoom:v.appUserRoom,
        appCardNumber:v.appCardNumber,
        appUserType:v.appUserType,
        isNewSubmit:v.isNewSubmit,
        lastActiveTime:v.lastActiveTime
      })
    });

    cb(null,idsary)
  })
}

module.exports = mongoose.model('wxUserApp', objSchema);