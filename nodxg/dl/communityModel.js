var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,银行卡doc
  communityName:{ type: String, required:true},       //楼盘中文名
  sortNum:{ type: Number, required:true},      //排序，越大越靠前
  code1:{ type: String},              //备用1
  code2:{ type: String},               //备用2
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




module.exports = mongoose.model('wxCommunity', objSchema);