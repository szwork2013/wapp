//新闻优惠活动
var mongoose =require('./db_conn.js');
var moment = require('moment')
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    			   //应用id
      title:{type:String,required:true},             //标题
      content:{type:String,required:true},           //内容
      picture:{type:String,required:true},           //缩略图
      access:{type:Number,default:1},                //访问次数
      type:{type:Number,default:1},                  //1专刊新闻，2专刊人文，3专刊生活，4专刊娱乐，5专刊专题
      code1:{type:String,default:''},                //备用字段1
      code2:{type:String,default:''},                //备用字段2
      isShow:{type:Number,default:1},             
	writeTime: { type: Date, default: function(){return Date.now()} },    //写入时间
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

objSchema.statics.getByIds = function (ids, cb) {
      var ids = ids || [];
      this.find({
            "_id":{
                  "$in":ids
            }
      }).limit(1000).exec(function(err,docs){
            if(err) return cb(err);
            if(!docs || docs.length == 0) return cb(null,[]);
            var idsary=[]
            docs.forEach(function(v){
                  idsary.push({
                        _id:v._id.toString(),
                        title:v.title,
                        picture:v.picture.split(','),
                        type:v.type,
                        writeTime:moment(v.writeTime).format('YYYY-MM-DD hh:mm:ss'),
                  })
            });

            cb(null,idsary)
      })
}


module.exports = mongoose.model('wxSpecial', objSchema);