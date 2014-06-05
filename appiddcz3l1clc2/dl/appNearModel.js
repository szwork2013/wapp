var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      coId:{type:String,required:true},    				  					//小区id
      coNearName:{type:String,required:true},                		        //配套名称
      coNearAddr:{type:String,required:true},      						//配套地址
      coNearDesc:{type:String,required:true},            		     	//配套描述
      coNearTel:{type:Number,required:true},            			    //配套电话
      isShow:{type:Number,default:1},                        //1表示启用，0表示不启用
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

module.exports = mongoose.model('wxNear', objSchema);