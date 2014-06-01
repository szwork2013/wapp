var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,小区物业
      coId:{type:String,required:true},    				  					//小区id
      coServiceName:{type:String,required:true},                		    //小区服务条目
      coServicePrice:{type:Number,required:true,default:0},      			//小区服务价格
      coServiceDesc:{type:String,required:true},            		     	//小区服务描述
      coServiceType:{type:Number,required:true,default:1},            			    //小区服务分类，1表示收费，2表示免费
      isShow:{type:Number,required:true,default:1},                        //1表示启用，0表示不启用
	    writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

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

module.exports = mongoose.model('wxService', objSchema);