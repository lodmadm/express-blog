var mongodb=require('./db');

function Post(name,title,post){
	this.name=name;
	this.title=title;
	this.post=post;
}
module.exports=Post;

//存储一篇文章及相关信息
Post.prototype.save=function(callback){
	var date=new Date();
	//存储各种时间格式，方便以后拓展
	var time={
		data:date,
		year:date.getFullYear(),
		month:date.getFullYear()+'-'+(date.getMonth()+1),
		day:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
		minute:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+" "+date.getHours()+':'+(date.getMinutes()<10 ? ('0' +date.getMinutes()):date.getMinutes())
	};
	//要存入数据库的文档
	var post={
		name:this.name,
		title:this.title,
		time:time,
		post:this.post
	};
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//将文档插入post集合
			collection.insert(post,{safe:true},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//读取文章及相关信息
Post.get=function(name,callback){
	//打开数据库
	mongodb.open(function(err,db){
		if(err){
			return callback(err);
		}
		//读取posts集合
		db.collection('posts',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			var query={};
			if(name){
				query.name=name;
			}
			//根据query对象查询文章
			collection.find(query).sort({
				time:-1,
			}).toArray(function(err,docs){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,docs);
			});
		});
	});
};