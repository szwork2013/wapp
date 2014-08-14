var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,银行卡doc
  userId:{ type: String, required:true},         //此银行卡信息所属用户Id
  cardNo:{ type: String, required:true},         //银行卡号
  bankName:{ type: String, required:true},       //开户行
  trueName::{ type: String, required:true},      //真实姓名
  idNumber:{ type: String, required:true},        //身份证号码
  isShow:{ type: Number, default:1}, 			        //0不启用，1表示启用
  writeTime:{ type: Date, default: function(){return Date.now()}}, //录入时间
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

module.exports = mongoose.model('wxPrize', objSchema);