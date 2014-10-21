var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
  activeId: { type: String, required:true}, //此奖品所属活动id
  name:{ type: String, required:true},      //奖品的名称
 
  imgUrl:{ type: String, default: ''},      //奖品的图片名称
  price:{type:Number,default: 0},           //兑换奖品所需支持数
  
  totalNumber:{type: Number, default:0},  //奖品数量，本次活动总共设定此类奖品数量，对完为止
  countNum:{type: Number, default:0},      //此奖品次数，计数用
  desc:{ type: String, default: ''},        //奖品描述
  isShow:{ type: Number, default:1},        //0表示此奖品下架不能被查询和使用，1表示此奖品正常使用
  code1:{type: String, default: ''},      //备用字段1
  code2:{type: String, default: ''},      //备用字段2
  writeTime:{ type: Date, default: function(){return Date.now()}}, //奖品录入时间
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

//后台kendoui使用
objSchema.statics.getPrizeByIds = function (ids, cb) {
  var ids = ids || [];
  this.find({
    "_id":{
      "$in":ids
    }
  }).limit(100000).exec(function(err,docs){
    if(err) return cb(err);
    if(!docs || docs.length == 0) return cb(null,[]);
    cb(null,docs)
  })
}

module.exports = mongoose.model('wxActivePrize', objSchema);