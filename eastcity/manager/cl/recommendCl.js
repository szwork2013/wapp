var dl = require('../../dl/recommendModel.js');
var userdl = require('../../dl/userModel.js');
var guidModel = require('../../dl/guidModel.js');
var scoreGetModel = require('../../dl/scoreGetModel.js');
var utils = require('../../lib/utils.js');

var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
  res.render('recommend_list', {session:req.session});
}


obj.read = function(req, res){
  var filter =  utils.kendoToMongoose(req.body.filter,req.session.clientId);
  var skip = req.body.skip || 0;
  var pageSize = req.body.pageSize || 20;
  var resObj = {"Data":[],"Total":0};



  dl.findAll(filter, skip, pageSize, function(err,doc){
    if(err) return res.send(500,err);
    if(!doc) return res.json(resObj);
    resObj["Data"] = doc;
    
    var ids = []
    doc.forEach(function(v){
      ids.push(v.userId)
    })

    dl.countAll(filter,function(err,count){
      if(err) return res.send(500,err);

        resObj["Total"] = count
        
        res.json(resObj);
      
    })
    
  })

}
obj.update = obj.create = function(req, res){
  var query;
  if(req.models[0]["_id"]){
    query = {"_id": req.models[0]["_id"]};
  }
  else{
    query = {'writeTime':new Date('1970/1/1')}
  } 
  delete req.models[0]["_id"];

  dl.createOneOrUpdate(query, req.models[0], function(err, doc){
    if(err) return res.send(500,err);
    if(!doc) return res.json([])
    res.json(doc);
  })
}


obj.destroy = function(req, res){
  var query = {"_id": req.models[0]["_id"]};
  dl.destroy(query, function(err, doc){
    if(err) return res.send(500,err);
    if(!doc) return res.json([])
    res.json(doc);
  })
}


var recommendScore = 20;
obj.check = function(req,res){//通过他人推荐注册审核
  var recommendid = req.body.recommendid;
  //if(!mobile) return res.json({'error':1,'data':'被推荐人手机号无效'})

  dl.findOneByObj({_id:recommendid},function(err,recdoc){//根据id查找推荐记录
      if(err) return res.json({'error':1,'data':err})
      var mobile = recdoc.recommendMobile;

      userdl.findOneByObj({ //查找手机是否存在
        'appUserMobile':mobile
      },function(err,udoc){
          if(err) return res.json({'error':1,'data':err})
          if(!udoc) return res.json({'error':1,'data':'未找到被推荐人'})

          dl.findOneByObj({ //查找被推荐人是否已经被推荐过
            recommendMobile:mobile,
            status:2
          },function(err,doc){
              if(err) return res.json({'error':1,'data':err})
              if(doc) return res.json({'error':1,'data':'被推荐人已推荐'})
              //res.json({'error':0,'data':'用户已找到，且未被推荐'})

              userdl.createOneOrUpdate({ //判断成功，更新推荐人积分
                  _id:recdoc.userId
                },{
                  $inc:{appUserScore:recommendScore} //推荐他人注册成功，+20分

                },function(err,udoc){ //开始写入积分获取流水
                   if(err) return res.json({'error':1,'data':err});
                   if(!udoc) return res.json({'error':1,'data':'推荐人未找到'});
                   var qobj={
                      appId:recdoc.appId,
                      userId:recdoc.userId,
                      mobile:udoc.appUserMobile,
                      scoreDetail:recommendScore,
                      scoreType:1,
                      scoreWay:'recommend',
                      scoreCode1:recdoc._id
                   }
                    guidModel.getGuid(function(err,guid){ //生成guid
                        if(err) return cb(err);
                        qobj.scoreGuid = guid;
                        
                        scoreGetModel.insertOneByObj(//插入获取积分流水
                            qobj,
                            function(err,doc){
                                if(err) return res.json({'error':1,'data':err})
                                    dl.createOneOrUpdate({_id:recommendid}, {status:2}, function(err, doc){ //更新推荐状态
                                        if(err) return res.json({'error':1,'data':err});
                                        res.json({'error':0,'data':'推荐他人注册成功'})
                                    })                                    
                                  })
                    })              
                  })
                })
            })
      })
}



module.exports = obj;