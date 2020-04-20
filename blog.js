const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressSanitizer=require("express-sanitizer");
const app = express();
const methodOverride=require("method-override");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());            //always below bodyparser
app.use(express.static('public'));
app.use(methodOverride("_method"));     // we send post request from the html form and by                                              // using method override we get as a put or delete 
                                         // request..

var url=process.env.DATABASEURL||'mongodb://localhost/blog_post';



mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});

var Blog = mongoose.model('Blog', blogSchema);

// var blog= {
// 	title: 'How to Update window!!',
// 	image: 'https://farm7.staticflickr.com/6057/6234565071_4d20668bbd.jpg',
// 	body: "it's an amazing journey"
// };

// Blog.create(blog, (err, blog) => {
// 	if (err) return handleError(err);
// 	else {
// 		console.log(blog);
// 	}
// });

app.get('/', (req, res) => {
	res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
	Blog.find({}, (err, allBlogs) => {
		if (err) console.log('something went wrong in database');
		else {
			res.render('index', { blogs: allBlogs });
		}
	});
});

app.post("/blogs",(req,res) => {
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,(err,blog) => {
		 if(err) res.render("new");
		else {
			res.redirect("/blogs");
		}
	});
});

app.get('/blogs/new', (req, res) => {
	res.render('new');
});

app.get('/blogs/:id',(req,res) => {
	Blog.findById(req.params.id,(err ,foundBlog) => {
		if(err) res.redirect('/blogs');
		else {
			res.render('show',{blog:foundBlog});
		}
	});
});

app.get('/blogs/:id/edit', (req, res) => {
	Blog.findById(req.params.id,(err ,foundBlog) => {
		if(err) res.redirect('/blogs');
		else {
			console.log(foundBlog);
			res.render('edit',{blogs:foundBlog});
		}
	});
});

app.put('/blogs/:id', (req, res) => {
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.findOneAndUpdate(req.params.id,req.body.blog,(err,updatedBlog) => {
		if(err) res.redirect('/blogs');
		else {
			res.redirect('/blogs/'+req.params.id);
		}
	});
});

app.delete('/blogs/:id',(req,res) => {
	Blog.findByIdAndRemove(req.params.id,(err) => {
		res.redirect("/blogs");
	});
});



app.listen(3000, () => {
	console.log('server is running');
});