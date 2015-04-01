var mongoose =require('./db_conn.js');
var Schema = mongoose.Schema;

var obj = { //定义结构
    openid:{type: String,required:true,index:true},
    token:{type: String,default:''}, 
    code1:{type: String,default:''},
    code2:{type: String,default:''},
}

var objSchema = new Schema(obj);

objSchema.statics.insertOneByObj = function (obj,cb) {
  var obj = obj || {};
  return this.create(obj, function(err,doc){
      if(err) console.log('DB error', err);
      cb(err,doc)
    })
}

objSchema.statics.findOneByObj = function (obj,cb) {
  var obj = obj || {};
  return this.findOne(obj, function(err,doc){
      if(err) console.log('DB error', err);
      cb(err,doc)
    })
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



module.exports = mongoose.model('wxOAuth', objSchema);