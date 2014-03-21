
var mongoose =require('./db_conn.js');
var model = require('../../widget/platuser/v1/dl/platUserModel.js');
var	Schema = mongoose.Schema;

var WidgetPlatUserSchema = new Schema(model);

WidgetPlatUserSchema.statics.findAll = function (obj,skip,pagesize,cb) {
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetPlatUserSchema.statics.countAll = function (obj,cb) { 
       return this.count(obj, cb);
}

WidgetPlatUserSchema.statics.createOneOrUpdate = function (query, update, cb) {
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
}

WidgetPlatUserSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}
module.exports =  mongoose.model('WidgetPlatUser', WidgetPlatUserSchema);

