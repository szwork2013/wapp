var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;
var voteItemDl= require('./voteItemModel.js');
var voteGroupDl = require('./voteGroupModel.js');

var obj = { //定义结构
    appId:{ type: String, required:true}, //投票活动所属应用id
    voteId: { type: String, required:true, index:true}, //投票活动id
    itemId: { type: String, required:true, index:true}, //被投票对象的id
    userId:{ type: String, required:true, index:true},      //用户的id号
    recordIp:{type:String,default: '127.0.0.1'},           //用户抽奖时的ip地址 
    isForward:{ type: Number, default:0},                  //是否是转发后奖励的额外投票记录
    code1:{type:String,default: ''}, //是否手工已经发奖，1表示发奖，0表示未发奖
    code2:{type:String,default: ''}, //备用字段.投票类型
    code3:{type:String,default: ''}, //备用字段
    code4:{type:String,default: ''}, //备用字段
    writeTime:{ type: Date, default: function(){return Date.now()}, index:true}, //用户抽奖的时间
}


var objSchema = new Schema(obj);

objSchema.statics.findByObj = function(obj,cb){
      var obj = obj || {};
      return this.find(obj, cb);
}


objSchema.statics.countByItemIds = function(itemIds, writetime, cb){
      var itemIds = itemIds || [];
      this.count({
        "itemId":{
          "$in":itemIds
        },
        writeTime:{'$gte': writetime}
      }).exec(function(err,count){
        if(err) return cb(err);
        cb(null,count)
      })

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



objSchema.statics.aggregateUser = function(query, cb){

    if(!query.groupId){
       var writeQ = {}
    }
    else{
       var writeQ = {
             groupId:query.groupId
          }
    }

     return this.aggregate()
      .match(
            {'$and': [
              {"voteId":query.voteId},
              writeQ
            ]}
        )
      .group( {
            '_id' : "$userId",
            'supportCount' : { $sum : 1 },
        })
      .sort({
        'supportCount':-1
      })
      .exec(function(err,list){
          return cb(err, list)
      })
}

//获得参与人数
objSchema.statics.aggregateUserJoin = function(query,cb){
    var limit = query.limit || 10000000;
    var that = this;
    var groupid = query.groupid;
    var itemIds = query.itemIds || []


    var aggregateUserJoinDeal = function(){
        if(!query.s || !query.e){
           var writeQ = {}
        }
        else{
          var writeQ = {
                    "writeTime":{
                        "$gte":query.s, 
                        "$lte":query.e, 
                      }
                  }
        }
        if(itemIds.length>0){
              writeQ['itemId'] = { '$in' : itemIds}
        }

        return that.aggregate()
          .match(
                {'$and': [
                  {"voteId":query.voteId},
                  writeQ
                ]}
            )
          .group( {
                '_id' : "$userId",
                'supportCount' : { $sum : 1 },
            })
          .sort({
            'supportCount':-1
          })
          .limit(limit)
          .exec(function(err,list){
            if(err || list.length == 0){
              cb(err,list)
              return;
            }

            return cb(null, list)

          })
      }//end define function

    if(!groupid){//如果参数有groupid
      //根据分区id查找所有item
        voteItemDl.findByObj({
          groupId:groupid,
          isShow:1
        }, function(err, itemList){
          if(err) return cb(err)
          itemList.forEach(function(iObj){
              itemIds.push(iObj._id.toString())
          })//生成id数组

          aggregateUserJoinDeal()

        })
    }
    else{
        aggregateUserJoinDeal()
    }
}

//分组itemid，获取用户投票记录
objSchema.statics.aggregateRecord = function(query, cb){
  var that = this;
  //console.log(query)
  return this.aggregate()
      .match(
            {'$and': [
              {"voteId":query.voteId},
              {"userId":query.userId},
            ]}
        )
      .group( {
            '_id' : "$itemId",
            'voteType':'$code2',
            'supportCount' : { $sum : 1 },
        })
      .sort({
        'supportCount':-1
      })
      .exec(function(err,list){
        if(err || list.length == 0){
          cb(err,list)
          return;
        }
        cb(null, list);
  })


}


objSchema.statics.aggregateOrder = function (query, cb) { 
    var limit = query.limit || 10000000;
    var that = this;
    if(!query.s || !query.e){
       var writeQ = {}
    }
    else{
      var writeQ = {
                "writeTime":{
                    "$gte":query.s, 
                    "$lte":query.e, 
                  }
              }
    }
/*
    this.findByObj({
                "voteId":query.voteId,
                "writeTime":{
                    "$gte":query.s, 
                    "$lte":query.e,
                  }
              },function(err,list){
                console.log(err,list)

              })
    return;

    console.log(query.s)
    console.log(query.e)

*/
  
    return this.aggregate()
      .match(
            {'$and': [
              {"voteId":query.voteId},
              writeQ
            ]}
        )
      .group( {
            '_id' : "$itemId",
            'supportCount' : { $sum : 1 },
        })
      .sort({
        'supportCount':-1
      })
      .limit(limit)
      .exec(function(err,list){
        if(err || list.length == 0){
          cb(err,list)
          return;
        }
        

        var itemsId = []
        var groupsId = []
        var tempObj = []
        list.forEach(function(lobj){
            itemsId.push(lobj._id.toString());
        })

        //根据itemId查找item项
        voteItemDl.getByIds(itemsId, function(err,itemlist){
          if(err) return cb(err);
          
          list.forEach(function(lobj){
              itemlist.forEach(function(iobj){
                  if(lobj._id.toString() == iobj._id.toString()){
                      tempObj.push({
                        _id:lobj._id.toString(),
                        supportCount:lobj.supportCount,
                        groupId:iobj.groupId
                      })
                      groupsId.push(iobj.groupId);
                  }
              })//end 1 foreach
              
          })//end 2 foreach

          //根据groupId查找groupName
          //console.log(groupsId)

          voteGroupDl.getByIds(groupsId, function(err, glist){
              if(err) return cb(err);
              //console.log(glist)
              tempObj.forEach(function(tobj){
                  glist.forEach(function(gobj){
                      if(tobj.groupId == gobj._id.toString()){
                          tobj.groupName = gobj.title;
                      }
                  })
              })//end temp foreach

              //根据是否有groupId筛选
              
              if(!query.groupId) return cb(null, tempObj)
              tempObj = tempObj.filter(function(tobj){
                    if(tobj.groupId == query.groupId) return true
                    return false;
              })
            
              return cb(null, tempObj)
          })//end voteGroupDl.getByIds


        })//end voteItemDl.getByIds


      })//end aggregate
}




module.exports = mongoose.model('wxVoteRecord', objSchema);