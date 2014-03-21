
var guidModel = require('./guidModel.js')

module.exports = function(widget){

	var mongoose = widget.db.mongoose,
		Schema = mongoose.Schema;
	var WidgetClientSchema = new Schema(guidModel)

	WidgetClientSchema.statics.findAndUpdateGuid = function (id, cb) { //查找guid并且将guid+1
		  return this.findOneAndUpdate({"_id":id}, {"$inc": { "guid": 1 }}, cb);
	}

	WidgetClientSchema.statics.findAndUpdateGuid2 = function (id, cb) { //查找guid2并且将guid2+1
		  return this.findOneAndUpdate({"_id":id}, {"$inc": { "guid2": 1 }}, cb);
	}

	WidgetClientSchema.statics.findOneGuid = function (cb) { //count guid 文档
		  return this.findOne({})
		  			 .sort({"_id":1})
		  			 .exec(cb);
	}

	WidgetClientSchema.statics.saveGuid = function (cb) { //初始化 guid 表
		  return this.create({
		  	"guid":100000,
		  	"guid2":1
		  }, cb);
	}

	return mongoose.model('WidgetGuid', WidgetClientSchema);

}