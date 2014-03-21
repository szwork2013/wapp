
var clientModel = require('./clientModel.js')

module.exports = function(widget){

	var mongoose = widget.db.mongoose,
		Schema = mongoose.Schema;
	var WidgetClientSchema = new Schema(clientModel)

	WidgetClientSchema.statics.findClientById = function (id,cb) { //根据id查找client记录
		  return this.findOne({"_id":id}, cb);	
	}

	return mongoose.model('WidgetClient', WidgetClientSchema);

}