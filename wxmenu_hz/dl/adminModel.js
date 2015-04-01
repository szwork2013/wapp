var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  admin:{ type:String, required:true, unique:true},
	  password:{ type:String, required:true},
    appId:{ type:String, default:'1'}, //这个管理员是否属于某一个特定的微信号
    //如果是属于某一个特定微信号，后台只能看到这个appid的数据
	  isShow:{ type:Number, default:1}, //是否启用这个用户,1表示启用，0表示未启用
	  writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}


var objSchema = new Schema(obj);

objSchema.statics.findAll = function(obj,skip,pagesize,cb) {
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

module.exports = mongoose.model('wxAdmin', objSchema);
