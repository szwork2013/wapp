var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj =  { //定义结构,投票抽奖活动，被投票项分组group的doc
      appId:{type:String,required:true}, //应用id
      voteId:{type:String,required:true,index:true}, //所属投票id
      ename:{type: String, required:true, unique:true,index:true}, //分组唯一的名字，英文标注
      title: { type: String, required:true}, //分组显示的名字

      isFreez:{type:Number,default:0},
      //是否冻结，如果冻结，则改分组所有的被投票项都被冻结，无法被投票
      isShow:{type:Number,default:1}, 
      //分组是否显示，如果不显示，则改分组所有的被投票项都不被显示
      //如果此投票不分组，那么只需要建一个组即可
      
      
      code1:{type: String, default:''}, //备用字段1
      code2:{type: String, default:''}, //备用字段2
      code3:{type: String, default:''}, //备用字段3
      code4:{type: String, default:''}, //备用字段4
      writeTime:{ type: Date, default: function(){return Date.now()}},
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
}

objSchema.statics.findOneByObj = function(obj,cb){
      var obj = obj || {};
      return this.findOne(obj, cb);
}


objSchema.statics.insertOneByObj = function (obj,cb) {
	var obj = obj || {};
 	return this.create(obj,cb)
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

//后台kendoui使用
objSchema.statics.getByIds = function (ids, cb) {
  var ids = ids || [];
  this.find({
    "_id":{
      "$in":ids
    }
  }).limit(100000).exec(function(err,docs){
    if(err) return cb(err);
    if(!docs || docs.length == 0) return cb(null,[]);
    cb(null,docs)
  })
}


module.exports = mongoose.model('wxVoteGroup', objSchema);