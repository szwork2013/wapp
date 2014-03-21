
var mongoose =require('./db_conn.js');
var model = require('../../dl/clientModel.js');
var	Schema = mongoose.Schema;

var WidgetClientSchema = new Schema(model);


WidgetClientSchema.statics.findAll = function (obj,skip,pagesize,cb) { //查询商户信息
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetClientSchema.statics.countAll = function (obj,cb) { //计算商户数量
       return this.count(obj, cb);
}


WidgetClientSchema.statics.createOneOrUpdate = function (query, update, cb) { //创建或修改商户信息
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
  }

WidgetClientSchema.statics.destroy = function (query, cb) { //删除商户信息
    return this.remove(query, cb); 
}

WidgetClientSchema.statics.findClientByName = function (userName,cb) { //根据id查找client记录
	  return this.findOne({"userName":userName}, cb);	
}

module.exports =  mongoose.model('WidgetClient', WidgetClientSchema);

