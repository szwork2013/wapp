var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,奖品doc
  appId:{ type: String, required:true},     //此奖品所属应用id
  name:{ type: String, required:true},      //猜图奖品的名称
  startPrice:{type:Number,default: 0},           //起拍价格
  highPrice:{type:Number,default: 0},           //当前最高出价
  highUserId:{ type: String, default: ''},      //当前最高出价的人的userid
  startTime:{ type: Date,required:true},    //开始拍卖时间
  endTime:{ type: Date,required:true},      //结束拍卖时间
  status:{type:Number,default: 1},          //此拍卖商品状态，1、未拍出 2、已拍出 3、已发货
  desc:{ type: String, default: ''},        //奖品描述
  imgUrl:{ type: String, default: ''},      //奖品的图片名称
  code1:{ type: String, default: ''},      //备用字段
  code2:{ type: String, default: ''},      //备用字段
  isShow:{ type: Number, default:1},         //0表示此奖品下架不能被查询和使用，1表示此奖品正常使用
  writeTime:{ type: Date, default: function(){return Date.now()}}, //奖品录入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findOneByObj = function(obj,cb){
      var obj = obj || {};
      return this.findOne(obj, cb);
}

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
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

module.exports = mongoose.model('wxSale', objSchema);