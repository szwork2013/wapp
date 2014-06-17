var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},
      userId:{type:String,required:true,index:true},    			     //评论用户的Id
      specialId:{type:String,required:true,index:true},            //专刊的Id
      content:{type:String,default:''},                            //评论的内容
      type:{type:Number,default:1},                                //1表示评论，2表示收藏
      code1:{type:String,default:''},                              //备用字段1
      code2:{type:String,default:''},                              //备用字段2
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj).sort({"_id":1}).exec(function(err,doc){
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