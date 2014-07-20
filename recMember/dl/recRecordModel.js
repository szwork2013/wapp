var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
      appId:{type:String,required:true},    		//应用id
      userId:{type:String,required:true},             //推荐人用户Id,
      //coId:{type:String,required:true}, 	            //推荐小区Id,
      buyHouse:{type:String,default:''},               //用户最终买的楼房号
      buyRoom:{type:String,default:''},                //用户最终买的房间号
      
      recName:{type:String,required:true},            //被推荐人姓名
      recSex:{type:Number,default:1},                 //被推荐人性别 0表示女性，1表示男性
      recTel:{type:String,required:true},             //被推荐人电话
      recArea:{type:String,default:''},             //被推荐人意向面积
      recPrice:{type:Number,default:0},             //被推荐人意向总价单位万
      recRoom:{type:String,default:''},             //被推荐人意向户型

      recStatus:{type:Number,default:1}, 
      //推荐状态,1表示待审核，
      //2表示不通过
      //3以上表示通过
      //3,通过表示预约
      //4带看
      //5认筹
      //6签约，只有签约，这个客户才能结佣金

      comments:[
        {content: String, date: String }
      ],      //管理员评论数组，以/n分割提交上来

	    

      isCash:{type:Number,default:0},                 //是否已经结佣金, 0表示没有结佣金，1表示已经结佣金

      recCode1:{type:String,default:''},              //预留字段1
      recCode2:{type:String,default:''},              //预留字段2
      recCode3:{type:String,default:''},              //预留字段3
      recCode4:{type:String,default:''},              //预留字段4

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

module.exports = mongoose.model('wxRecRecord', objSchema);