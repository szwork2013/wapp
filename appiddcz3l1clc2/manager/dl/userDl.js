
var mongoose =require('./db_conn.js');
var model = require('../../widget/user/v1/dl/userModel.js');
var	Schema = mongoose.Schema;

var WidgetUserSchema = new Schema(model);


WidgetUserSchema.statics.findAll = function (obj,skip,pagesize,cb) {
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetUserSchema.statics.countAll = function (obj,cb) { 
       return this.count(obj, cb);
}

WidgetUserSchema.statics.createOneOrUpdate = function (query, update, cb) {
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
}

WidgetUserSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}
module.exports =  mongoose.model('WidgetUser', WidgetUserSchema);

