//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      fromOpenId:{type:String,required:true,index:true},  //微信id，表示这个票是谁投的
      fromUserId:{type:String,required:true,index:true},  //用户id，表示这个票是谁投的
      toUserId:{type:String,required:true,index:true},   //用户id，就是这个投票是投给谁的
      activeId:{type:String,required:true,index:true},   //活动的Id
      code1:{type:String,default:''},                    //备用1
      code2:{type:String,default:''},                    //备用2
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

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

objSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}



objSchema.statics.getRankByActive = function(activeId, limit, cb){


    this.aggregate()
      .match({
            "activeId":activeId.toString(), 
        })
      .group( {
            '_id' : "$toUserId",
            'supportCount' : { $sum : 1 },
        })
      .sort({
        'supportCount':-1
      })
      .limit(limit||1000)
      .exec(cb)

  }


module.exports = mongoose.model('wxActiveLog', objSchema);