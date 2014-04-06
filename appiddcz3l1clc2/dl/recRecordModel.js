var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			  //应用id
      coId:{type:String,required:true}, 	          //所属小区Id,
      userId:{type:String,required:true}, 	          //用户Id,
      openId:{type:String,required:true},                 //微信id
      recName:{type:String,required:true},            //推荐人姓名
      recSex:{type:Number,required:true,default:1},   //推荐人性别
      recTel:{type:String,required:true},             //推荐人电话
      recStatus:{type:Number,required:true,default:0},           //推荐状态,1表示待审核，2表示成功，3表示未成功，
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
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

module.exports = mongoose.model('wxRecRecord', objSchema);