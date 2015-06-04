var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构,调查问卷的db
  title:{ type: String, required:true},      //调查问卷标题
  desc:{ type: String, default: ''},        //调查问卷描述
  startTime:{ type: Date, default: function(){return Date.now()}},
  endTime:{ type: Date, default: function(){return Date.now()}},
  totalNumber:{type: Number, default:0},    //总参与人
  questionJson:{ type: String, required:true}, //题目的json格式数据
  imgUrl:{ type: String, default: ''},      //图片 
  code1:{ type: String, default: ''},      //备用字段
  code2:{ type: String, default: ''},      //备用字段
  isShow:{ type: Number, default:1},        //0表示此奖品下架不能被查询和使用，1表示此奖品正常使用
  writeTime:{ type: Date, default: function(){return Date.now()}}, //奖品录入时间
}

var objSchema = new Schema(obj);

objSchema.statics.findOneByObj = function(obj,cb){
      var obj = obj || {};
      return this.findOne(obj, cb);
}

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

//后台kendoui使用
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
        _id:v._id,
        title:v.title,
        desc:v.desc,
        startTime:v.startTime,
        endTime:v.endTime,
        totalNumber:v.totalNumber,
        imgUrl:v.imgUrl, 
        questionJson:v.questionJson,
        code1:v.code1,
        code2:v.code2,
        writeTime:v.writeTime,
      })
    });

    cb(null,idsary)
  })
}


module.exports = mongoose.model('wxInvestigate', objSchema);