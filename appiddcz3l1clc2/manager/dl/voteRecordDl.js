
var mongoose =require('./db_conn.js');
var model = require('../../widget/vote/v1/dl/recordModel.js');
var	Schema = mongoose.Schema;

var WidgetVoteRecordSchema = new Schema(model);


WidgetVoteRecordSchema.statics.findAll = function (obj,skip,pagesize,cb) { //查询商户信息
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetVoteRecordSchema.statics.countAll = function (obj,cb) { //计算商户数量
       return this.count(obj, cb);
}

WidgetVoteRecordSchema.statics.createOneOrUpdate = function (query, update, cb) {
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
  }

WidgetVoteRecordSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}
module.exports =  mongoose.model('WidgetVoteRecord', WidgetVoteRecordSchema);

