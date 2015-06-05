var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;


//用户积分获取和消费流水表
var obj = { //定义结构
      appId:{type:String,required:true,},    		                 //应用id
      userId:{type:String,required:true, index:true},                 //用户id
      mobile:{type:String, index:true},                 //用户手机号码
      scoreGuid:{type:String,required:true,unique:true},              //交易流水号
      scoreDetail:{type:Number,default:0},  //积分获取流水，获取或者扣除的积分数目
      scoreType:{type:Number,default:1},    //积分是获取还是消费，1表示获取，2表示消费
      scoreWay:{type:String,required:true,index:true},  		    //积分获取/消费方式，枚举，比如 regist,daysign,active,forwarding,game
      scoreCode1:{type:String,default:''},  //积分获取流水，备用字段1，比如存储用户兑换的奖品Id等
      scoreCode2:{type:String,default:''},  //积分获取流水，备用字段4
      scoreCode3:{type:String,default:''},  //调积分获取流水，备用字段4
      scoreCode4:{type:String,default:''},  //积分获取流水，备用字段4
      scoreCode5:{type:String,default:''},  //积分获取流水，备用字段5
	writeTime:{ type: Date, default: function(){return Date.now()} },    //写入时间
}


//说明:
/*
1、当type为 regist 时，表示用户注册获得积分
pass

2、当type为 daysign 时，签到获得积分
scoreCode1 签到当天的0点时间戳

3、当type为 active 时，表示金数据投票或者其他活动返回积分
scoreCode1 活动的id
scoreCode2 如果是金数据返回，这里记录金数据的id
scoreCode3 如果是金数据返回，结果字符串

4、当type为 forwarding 时，表示转发获得积分
scoreCode1 为转发的条目id

5、当type为 game 时，表示玩游戏成功获得积分
scoreCode1 为游戏的id

5.1、当type为 recommend 时，表示推荐注册用户成功获得积分
scoreCode1 为推荐记录的id

5.2、当type为 comment 时，表示用户评论获得积分
scoreCode1 为评论的专刊id记录
scoreCode2 为此条获取积分的评论id

5.3、当type为 extra 时，表示由此用户的下线获得分数而获得的额外分数
scoreCode1 下线用户获得的分数的id

5.4、当type为 qrcode_tmp 时，表示此用户通过别人扫描他的二维码获取分数
scoreCode1 为二维码活动的id
scoreCode2 为那个扫描他的人的用户id

5.5、当type为 qrcode_forever 时，表示此用户通过现场永久二维码获取分数
scoreCode1 为二维码活动的id

5.6、当type为 investigate 时，表示此用户通过调查问卷获取的分数
scoreCode1 调查问卷的id

6、购房抵房款 buyhouse 消费
scoreCode1 记录购买楼盘号
scoreCode2 记录购买房号

7、兑换下线商品 exchange 消费
scoreCode1 记录购买商品名称或Id

8、消费开发商的服务 service 消费
scoreCode1 记录购买服务名称或Id

9、拍卖竞拍品消费 sale
scoreCode1 记录竞拍品的id

10、type为 manual 表示手工
scoreCode1 为手工添加记录备注


*/

var objSchema = new Schema(obj);


objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
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

module.exports = mongoose.model('wxScoreGet', objSchema);