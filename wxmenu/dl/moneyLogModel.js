var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
    appId: { type: String, required:true, index:true},   //此次猜图所属猜图活动id
    openId:{ type: String, required:true, index:true, default:''},                  //用户的openid
    userId:{ type: String, required:true, index:true},   //用户的id号
    replyId:{type: String, required:true},               //回复id，用来区分哪次红包活动
    logIp:{type:String,default: '127.0.0.1'},            //拿红包时的ip地址
    moneyVal:{type: Number,default:0},                   //拿到多少红包，单位是人民币分

    code1:{type:String,default: ''}, //备用字段
    code2:{type:String,default: ''}, //备用字段
    code3:{type:String,default: ''}, //备用字段
    code4:{type:String,default: ''}, //备用字段
    writeTime:{ type: Date, default: function(){return Date.now()}}, //抽红包的世界
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

module.exports = mongoose.model('wxMoneyLog', objSchema);