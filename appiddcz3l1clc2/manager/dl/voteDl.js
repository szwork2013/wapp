
var mongoose =require('./db_conn.js');
var model = require('../../widget/vote/v1/dl/voteModel.js');
var	Schema = mongoose.Schema;

var WidgetVoteSchema = new Schema(model);


WidgetVoteSchema.statics.findAll = function (obj,skip,pagesize,cb) {
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"_id":-1})
             .exec(cb);
}

WidgetVoteSchema.statics.countAll = function (obj,cb) {
       return this.count(obj, cb);
}

WidgetVoteSchema.statics.createOneOrUpdate = function (query, update, cb) {
    return this.findOneAndUpdate(query, update, {"upsert":true}, cb); 
  }

WidgetVoteSchema.statics.destroy = function (query, cb) { 
    return this.remove(query, cb); 
}
module.exports =  mongoose.model('WidgetVote', WidgetVoteSchema);

