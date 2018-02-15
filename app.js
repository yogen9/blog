var express = require("express"),
    bodyParser = require("body-parser"),
    mongo = require("mongoose"),
    methodOverride = require("method-override");
var app = express();

//mongo.connect("mongodb://localhost/blog");
mongo.connect(process.env.DB);

var blogSchema = new mongo.Schema({
        title: String,
        author : String,
        article : String,
        comments : [{
            type : mongo.Schema.Types.ObjectId,
            ref : "comment"
        }],
        created : {
            type : Date,
            default : Date.now
        }
})
var blogs = mongo.model("blog",blogSchema);

var commentsSchema  = new mongo.Schema({
    description : String,
    name : String,
     created: {
         type: Date,
         default: Date.now
     }
})
var comments = mongo.model("comment", commentsSchema);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.listen(process.env.PORT || 5000, () => {
    console.log("Start...");
})

app.get("/",(req,res)=>{
    blogs.find({},(err,blogs)=>{
        if (err) {
            console.log("Error Home : ")
        }
        else{
            res.render("home",{blogs:blogs});   
        }
    });
});

app.get("/new",(req,res)=>{
    res.render("new");
})

app.post("/new",(req,res)=>{
    blogs.create(req.body,(err,blog)=>{
        if (err) {
            console.log("error in new post : ")
        } else {
            console.log(blog);
            res.redirect("/")
        }
    })
})

app.get("/show/:id",(req,res)=> { 
    blogs.findById(req.params.id).populate("comments").exec((err, blogwithComments) => {
        if (err) {
            res.redirect("/");
            console.log(err);
        } else {
            res.render("show", {blog: blogwithComments});
        }        
    })
})

app.post("/show/:id/commentNew", (req,res)=>{
    comments.create(req.body,(err,comment)=>{
        if (err) {
            console.log("error in new comment post :");
        } else {
            blogs.findById(req.params.id,(err,blog)=>{
                console.log(blog);
                blog.comments.push(comment);
                blog.save((err,arrayComments)=>{
                    if(err){
                        console.log("err in post commentNew")
                    }else{
                         console.log(arrayComments);
                         res.redirect("/show/"+req.params.id)
                    }
                })
            })
        }
    })
})

app.get("/show/:id/update",(req,res)=>{
    blogs.findById(req.params.id,(err,blog)=>{ 
        if (err) {
            console.log("error in update get :");
        } else {
            res.render("update", { blog: blog});
        }
    })
})
app.put("/show/:id/update", (req, res) => {
    blogs.findByIdAndUpdate(req.params.id, req.body, (err, upBlog) => {
        if (!err)
            res.redirect("/show/" + req.params.id);
    })
})

app.delete("/show/:id",(req,res)=>{
    blogs.findByIdAndRemove(req.params.id,(err,r)=>{
            if (err) {
                console.log("error in del :")
            }
            else{
                res.redirect("/")
            }
    })
})