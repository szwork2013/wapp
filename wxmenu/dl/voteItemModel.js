var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj =  { //定义结构,投票抽奖活动，被投票项分组group的doc
      appId:{type:String,required:true}, //应用id
      voteId:{type:String,required:true,index:true}, //所属投票id
      groupId:{type: String, required:true, index:true}, //分组id

      title: { type: String, required:true}, //分组显示的名字
      pictureThumb:{type: String, default:''},  //投票活动的缩略图片地址
      picture:{type: String, default:''},  //投票活动的图片地址

      sex:{type:Number,default:1}, //0表示女性，1表示男性
      age:{type:Number,default:18},//年龄
      number:{type: String, default:''},//工号或者编码
      desc:{type: String, default:''},//描述1
      desc2:{type: String, default:''},//描述2

      todayVoteNumber:{type:Number,default:0},
      lastdayVoteNumber:{type:Number,default:0},

      isFreez:{type:Number,default:0},
      //是否冻结，如果冻结，则此投票项都被冻结，无法被投票，0表示不冻结，1表示冻结
      isShow:{type:Number,default:1}, 
      //是否显示

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

module.exports = mongoose.model('wxVoteItem', objSchema);