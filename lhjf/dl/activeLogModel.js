var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  appId:{type:String, required:true,index:true},                 //appId表示用户第一次绑定的app应用id 
	  activeId:{type:String, required:true},        		//活动id
	  userid:{type:String, required:true},					//报名人uid
	  username:{type:String, required:true},                //报名人姓名
	  mobile:{type:String, required:true},                  //报名人手机
	  code1:{type:String,default:''},                 		//备用字段1
      code2:{type:String,default:''},                 		//备用字段2
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

objSchema.statics.scoreRank = function (obj,limit,cb) {
       return this.find(obj)
             .limit(limit)
             .sort({"appUserScore":-1})
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


module.exports = mongoose.model('wxActiveLog', objSchema);
