
var mongoose =require('./db_conn.js');
var model = require('../../widget/puzzle/v1/dl/puzzleRecordModel.js');
var	Schema = mongoose.Schema;

var WidgetSchema = new Schema(model);


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
module.exports =  mongoose.model('WidgetPuzzleRecord', WidgetSchema);

