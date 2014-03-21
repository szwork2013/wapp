
var mongoose =require('./db_conn.js');
var model = require('../../widget/form/v1/dl/formModel.js');
var	Schema = mongoose.Schema;

var WidgetSchema = new Schema(model);


WidgetSchema.statics.distinctByFormName = function(cb){ //返回全部的不同formname
	return this.distinct('formName', cb);
}


WidgetSchema.statics.lastOneByFormName = function(formname, cb){ //返回某一个formname的数据，定义结构
	  return this.findOne({"formName":formname})
             .sort({"_id":-1})
             .exec(cb);
}

WidgetSchema.statics.findAll = function (obj,skip,pagesize,cb) {
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetSchema.statics.countAll = function (obj,cb) {
       return this.count(obj, cb);
}

WidgetSchema.statics.createOneOrUpdate = function (query, update, cb) {
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
  }

WidgetSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}
module.exports =  mongoose.model('WidgetForm', WidgetSchema);

