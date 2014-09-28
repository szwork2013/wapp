var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
    appId:{ type: String, required:true}, //投票活动所属应用id
    voteId: { type: String, required:true, index:true}, //投票活动id
    itemId: { type: String, required:true, index:true}, //被投票对象的id
    userId:{ type: String, required:true, index:true},      //用户的id号
    recordIp:{type:String,default: '127.0.0.1'},           //用户抽奖时的ip地址 
    isForward:{ type: Number, default:0},                  //是否是转发后奖励的额外投票记录
    code1:{type:String,default: ''}, //是否手工已经发奖，1表示发奖，0表示未发奖
    code2:{type:String,default: ''}, //备用字段
    code3:{type:String,default: ''}, //备用字段
    code4:{type:String,default: ''}, //备用字段
    writeTime:{ type: Date, default: function(){return Date.now()}}, //用户抽奖的时间
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



objSchema.statics.aggregateOrder = function (query, cb) { 
    return this.aggregate()
      .match({
            "voteId":query.voteId
            "writeTime":{"gte":query.s},
            "writeTime":{"lte":query.e},
        })
      .group( {
            '_id' : "$itemId",
            'supportCount' : { $sum : 1 },
        })
      .sort({
        'supportCount':-1
      })
      .limit(limit||100000)
      .exec(cb)
}




module.exports = mongoose.model('wxVoteRecord', objSchema);