var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
    lotteryId: { type: String, required:true, index:true}, //此次猜图所属猜图活动id
    prizeId:{ type: String, required:true, default:0},      //猜图奖品的id号，如果是'0'，表示此次抽奖未中奖
    userId:{ type: String, required:true, index:true},      //用户的id号
    truename:{ type: String, required:true},      //真实姓名
    mobile:{ type: String, required:true},      //联系电话
    recordIp:{type:String,default: '127.0.0.1'},           //用户抽奖时的ip地址
    giftId:{ type: Number, default:0, unique:true},        //用户领奖的6位id号码,0表示未中奖
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

module.exports = mongoose.model('wxLotteryRecord', objSchema);