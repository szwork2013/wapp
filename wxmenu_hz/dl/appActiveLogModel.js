//新闻优惠活动
var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      fromOpenId:{type:String,required:true,index:true},  //微信id，表示这个票是谁投的
      fromUserId:{type:String,required:true,index:true},  //用户id，表示这个票是谁投的
      toUserId:{type:String,required:true,index:true},   //用户id，就是这个投票是投给谁的
      activeId:{type:String,required:true,index:true},   //活动的Id
      supportScore:{ type: Number, default:0}, //获取的积分，只有在活动支持积分的情况下才会有大于0的数
      code1:{type:String,default:''},                    //ip地址
      code2:{type:String,default:''},                    //备用2
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj).sort({"_id":-1}).exec(cb);
}
objSchema.statics.findOneByObj = function(obj,cb){
      var obj = obj || {};
      return this.findOne(obj).sort({"_id":-1}).exec(cb);
}

objSchema.statics.insertOneByObj = function (obj,cb) {
  var obj = obj || {};
  if(!obj.writeTime){
      obj.writeTime = new Date()
  }
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


objSchema.statics.getActiveMaxScoreList = function (activeId, cb) {

    return this.find({
                'activeId':activeId
              })
             .limit(10)
             .skip(0)
             .sort({"supportScore":-1})
             .exec(function(err, list){
                if(err) return cb(err, list)
                if(!list || list.length == 0) return cb(null, list)

                var maxList = []
                list.forEach(function(item){
                    maxList.push(item.supportScore-0)
                })

                return cb(null, maxList)
             });
}


objSchema.statics.getRank = function (activeId, lmit, cb) {

    return this.find({
                'activeId':activeId
              })
             .limit(lmit)
             .skip(0)
             .sort({"supportScore":-1})
             .exec(cb);
}


objSchema.statics.getRankByActive = function(activeId, limit, cb){


    this.aggregate()
      .match({
            "activeId":activeId.toString(), 
        })
      .group( {
            '_id' : "$toUserId",
            'supportCount' : { $sum : 1 },
            'supportScore':{ $sum: '$supportScore'}
        })
      .sort({
        'supportCount':-1
      })
      .limit(limit||10000)
      .exec(cb)

  }




module.exports = mongoose.model('wxActiveLog', objSchema);