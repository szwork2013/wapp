var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
	  appId: {type:String,required:true},    //菜单的json字符串
    menuTitle:{type:String,required:true}, //菜单标题
    menuType:{type:Number,required:true, default:1},      //1表示一级菜单，2表示二级菜单
	  parentId:{type:String,required:true, default:'0'},  //父菜单id，如果是一级菜单，则此处是0
    replyId:{type:String,required:true, default:'0'},   //关联的微信回复id
    menuOrder:{type:Number,required:true, default:1},   //越大排序越前
	  writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findAll = function (obj,skip,pagesize,cb) { 
       return this.find(obj)
             .limit(pagesize)
             .skip(skip)
             .sort({"menuOrder":-1, "_id":-1})
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

module.exports = mongoose.model('wxMenu', objSchema);