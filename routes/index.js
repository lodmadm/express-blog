
/*
 * GET home page.
 */
var crypto=require('crypto'),
User=require('../models/user.js');
Post=require('../models/post.js');

//页面权限控制
function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error','未登录');
		res.redirect('/login');
	}
	next();
}
function checkNoLogin(req,res,next){
	if(req.session.user){
		req.flash('error','已登录');
		res.redirect('back');
	}
	next();
}

module.exports=function(app){
	app.get('/',function(req,res){
		Post.get(null,function(err,posts){
			if(err){
				posts=[];
			}
			res.render('index',{
			  title:'主页',
			  posts:posts,
			  user:req.session.user,
			  success:req.flash('success').toString(),
			  error:req.flash('error').toString()
		    });
		});
	});
	app.get('/reg',checkNoLogin);
	app.get('/reg',function(req,res){
		res.render('reg',{
			title:'注册',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.get('/reg',checkNoLogin);
	app.post('/reg',function(req,res){
		var name=req.body.name,
		password=req.body.password,
		password_re=req.body['password-repeat'];
		//检测两次输入是否一致
		if(password!=password_re){
			req.flash('err','两次输入密码不一致');
			return res.redirect('/reg');//返回注册页
		}
		//生成密码的MD5值
		var md5=crypto.createHash('md5');
		password=md5.update(req.body.password).digest('hex');
		var newUser=new User({
			name:req.body.name,
			password:password,
			emial:req.body.email
		});
		//检查用户是否存在
		User.get(newUser.name,function(err,user){
			if(user){
				req.flash('error','用户已存在');
				return res.redirect('/reg');
			}
			//如果不存在则新增用户
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				req.session.user=user;
				req.flash('success','注册成功');
				res.redirect('/');
			});
		});
	});
	app.get('/login',checkNoLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title:'登录',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.get('/login',checkNoLogin);
	app.post('/login',function(req,res){
	  var md5=crypto.createHash('md5');
	  var password=md5.update(req.body.password).digest('hex');
	  //检查用户是否存在
      User.get(req.body.name,function(err,user){
      	if(err){
      		err.flash('error','用户名不存在！');
      		return res.redirect('/login');
      	}
      	//检查密码是否一致
      	if(password!=user.password){
      		err.flash('error','密码！');
      		return res.redirect('/login');
      	}
      	//用户名和密码匹配后，将用户信息存入session
      	req.session.user=user;
      	req.flash('success','登录成功');
      	res.redirect('/');
      });
	});
	app.get('/post',checkLogin);
	app.get('/post',function(req,res){
		res.render('post',{
			title:'发表文章',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
	app.post('/post',checkLogin);
	app.post('/post',function(req,res){
		var currentUser=req.session.user,
		post=new Post(currentUser.name,req.body.title,req.body.post);
		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			req.flash('success','发布成功');
			res.redirect('/');
		});
	});
	app.get('/logout',function(req,res){
		req.session.user=null;
		req.flash('success','登出成功');
		res.redirect('/');
	});
};