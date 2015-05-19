var dl = require('../../dl/saleModel.js');
var userdl = require('../../dl/userModel.js');
var guidModel = require('../../dl/guidModel.js');
var scoreGetModel = require('../../dl/scoreGetModel.js');
var utils = require('../../lib/utils.js');
var obj = {}
var salt = global.app.get('salt');


obj.list = function(req, res){
  res.render('sale_list', {session:req.session});
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


obj.complete = function(req, res){
  var saleid = req.body.saleid;

  dl.findOneByObj({
        _id:saleid
      },function(err,saleobj){
          if(err) return res.json({'error':1,'data':err});
          if(!saleobj) return res.json({'error':1,'data':'没找到拍品'});
          userdl.findOneByObj({
            _id:saleobj.highUserId
          },function(err,uobj){
                dl.createOneOrUpdate({
                   _id:saleid
                 }, {status:2}, function(err, doc){
                    if(err) return res.json({'error':1,'data':err});

                    var qobj={
                            appId:saleobj.appId,
                            userId:saleobj.highUserId,
                            mobile:saleobj.highMobile,
                            scoreDetail:saleobj.highPrice,
                            scoreType:2,
                            scoreWay:'sale',
                            scoreCode1:saleobj._id
                         }

                    guidModel.getGuid(function(err,guid){ //生成guid
                            if(err) return cb(err);
                            qobj.scoreGuid = guid;
                            
                            scoreGetModel.insertOneByObj(//插入获取积分流水
                                qobj,
                                function(err,doc){
                                    if(err) return res.json({'error':1,'data':err})
                                    res.json({'error':0,'data':'竞拍品拍出成功'})
                            }) //插入流水
                      })//获得流水号
                })//更新竞拍品状态
            })//查找用户状态
      })//查找竞拍品状态

}

obj.getOne = function(req, res){
  var id = req.body.id;

  dl.findOneByObj({
    _id:id
  }, function(err, doc){
    if(err) return res.json({'error':1,data:err})
    if(!doc) return res.json({'error':1,data:'未找到信息'})
    res.json({'error':0,data:doc.name});
  })
}



module.exports = obj;