var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  appId:{type:String, required:true},                 //appId表示用户第一次绑定的app应用id
	  openId: { type:String, required:true, unique:true}, //微信用户绑定的openid,	 
	  wxName:{type:String, default:''},                   //微信用户昵称
	  wxAvatar:{type:String, default:''},                //微信用户头像
	  wxLoc: { type: [Number], index: { type: '2dsphere', sparse: true } },    //用户最近一次经纬度保存
	  wxGroup:{type:String, default:'cf'},                 //用户分组，默认是cf常发
	  appUserName:{type:String, required:true,default:'未认证会员'},         //会员姓名
	  appUserMobile:{type:Number, required:true,default:''},       //会员手机号
	  appUserSex:{type:Number, required:true,default:1}, //0表示女性，1表示男性
	  appUserBirth:{type: Date, default: function(){return new Date('1970/1/1')} }, //会员生日
	  appUserScore:{type:Number,default:0},
	  isShow:{ type:Number, default:1}, //是否启用这个用户,1表示启用，0表示未启用
	  writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);


objSchema.statics.insertOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.create(obj, function(err,doc){
	    if(err) logger.error('DB error', err);
	    cb(err,doc)
    })
}

objSchema.statics.findOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.findOne(obj, function(err,doc){
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
		"_id":{
			"$in":ids
		}
	}).limit(1000).exec(function(err,docs){
		if(err) return cb(err);
		if(!docs || docs.length == 0) return cb(null,[]);
		var idsary=[]
		docs.forEach(function(v){
			idsary.push({
				text:v.appUserName,
				value:v._id,
				name:v.appUserName,
				sex:v.appUserSex,
				mobile:v.appUserMobile,
			})
		});

		cb(null,idsary)
	})
}


module.exports = mongoose.model('wxUserInfo', objSchema);
