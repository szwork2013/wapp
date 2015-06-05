var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  row:{type:Number,default:1},
	  guid: {type:Number,required:true,default:100000},    //奖品的guid，从10W起
	  guid2:{type:Number,default:0},                       //通用guid，20140921，微信返回图片使用
	  guid3:{type:Number,default:0},                       //不知道给谁用了
	  guid4:{type:Number,default:0},                       //目前给图片投票使用流水
	  guid5:{type:Number,default:0},                       //通用guid
	  guid6:{type:Number,default:0},                       //通用guid
	  guid7:{type:Number,default:0},                       //通用guid
	  guid8:{type:Number,default:0},                       //通用guid
	  guid9:{type:Number,default:0},                       //通用guid
	  guid10:{type:Number,default:0},                       //通用guid
}

var objSchema = new Schema(obj);

objSchema.statics.getGuid = function (cb) { 
    return this.findOneAndUpdate({row:1}, {
    	$inc:{guid:1}
    }, {"upsert":true}, function(err,doc){
    	if(err || !doc) return cb(err);
    	cb(null, doc.guid);
    }); 
}



//上传图片投票用编号
objSchema.statics.getGuid4 = function (cb) { 
    return this.findOneAndUpdate({row:1}, {
      $inc:{guid4:1}
    }, {"upsert":true}, function(err,doc){
      if(err || !doc) return cb(err);
      cb(null, doc.guid4);
    }); 
}


objSchema.statics.getSpecialGuid = function (guidName, cb) {
	if(Object.keys(obj).indexOf(guidName) == -1){
		return cb('no such guidname')
	}
	var incObj = {'$inc':{}}
	incObj['$inc'][guidName] = 1;

    return this.findOneAndUpdate({row:1}, incObj, {"upsert":true}, function(err,doc){
    	if(err || !doc) return cb(err);
    	cb(null, doc[guidName]);
    }); 
}

//供后台使用
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



module.exports = mongoose.model('wxGuid', objSchema);