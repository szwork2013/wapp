var mongoose =require('../dl/db_conn.js');
var guidDl =require('../dl/guidModel.js');
var Schema = mongoose.Schema;

var obj =  { //定义结构, 2015年3月27日，图片自动回复流水号
      openId:{type:String,required:true,unique:true,index:true}, //应用id
      guid3:{type:Number,required:true,unique:true},  //用户发送图片返回的流水号
      imgUrl:{type:String,default: ""},//用户所发图片url地址
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

objSchema.statics.getGuidByOpenid = function (openid, imgurl, cb) { 
      var that = this;
      if(!openid) return cb('openid参数错误')

      //查找这个openid是否已经存在了
      that.findOne({
            openId:openid
      },function(err, doc){
            if(err) return cb(err)
            if(doc){//如果存在，返回之前的guid2
                  return cb(null, doc.guid2)
            }
            //如果不存在，先去生成guid
            guidDl.getSpecialGuid('guid3',function(err,guid2){
                  if(err) return cb(err)
                  //然后创建记录
                  that.create({
                        openId:openid,
                        guid2:guid2,
                        imgUrl:imgurl
                  },function(err, safedoc){
                        if(err) return cb(err)
                        //返回guid
                        return cb(null, guid2)
                  })
            })
      })



}

module.exports = mongoose.model('20150327_wxpic', objSchema);