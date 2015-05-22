var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
    lotteryId: { type: String, required:true, index:true}, //此次猜图所属猜图活动id
    prizeId:{ type: String, default:0},      //猜图奖品的id号，如果是'0'，表示此次抽奖未中奖
    userId:{ type: String, required:true, index:true},      //用户的id号
    truename:{ type: String, required:true},      //真实姓名
    mobile:{ type: String, required:true, index:true},      //联系电话
    recordIp:{type:String,default: '127.0.0.1'},           //用户抽奖时的ip地址
    giftId:{ type: Number, default:0, unique:true, index:true},        //用户领奖的6位id号码,0表示未中奖
    isForward:{ type: Number, default:0},                  //是否是转发额外的奖励，是否转发控制由前端处理
    code1:{type:String,default: ''}, //是否手工已经发奖，1表示发奖，0表示未发奖
    code2:{type:String,default: ''}, //投票的是什么奖，lv0是特等奖，lv1是一等奖，lv2是二等奖，lv3是三等奖，lv4是建筑影响奖
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

module.exports = mongoose.model('wxLotteryRecord', objSchema);