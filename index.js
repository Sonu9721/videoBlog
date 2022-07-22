const express = require('express')
const mongoose = require('mongoose')
const app = express();
const ejs = require('ejs');
const bcrypt = require("bcrypt");
const studentModule = require("./models/studentModule")
const emailModule = require("./models/emailmodule")
const bodyParser = require('body-parser');
const moment = require('moment')
const aws = require("aws-sdk")
const multer = require("multer");
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const path = require('path')
const { ApiGatewayV2 } = require('aws-sdk');
const { create } = require('./models/studentModule');
app.use(cookieParser())


app.use(multer().any())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'views')))

mongoose.connect("mongodb+srv://Aman300:ByXZ2qfTNQNWF7Uj@cluster0.o4rcy.mongodb.net/Video-vlog-Db?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))



//------------------ [ erro page ] ------------------------------------------
app.get("/error", function (req, res) {
    res.sendFile(__dirname + '/public/error.html')
})
//------------------ [ erro page end] ------------------------------------------



//------------------ [ index page 1] ------------------------------------------

app.get("/", async function (req, res) {

    let allData = await studentModule.find({isDeleted: false}).sort({ _id: -1 })
    if (allData) {
        res.render("index", { details: allData })
    } else {
        console.log("error")
    }

})
//------------------ [ index page 1 end] ------------------------------------------



//------------------ [ index page 2 ] ------------------------------------------
app.get("/loginIndex", async function (req, res) {
    let cook = req.cookies.jwt
    console.log(cook)
    if (!cook) {
        res.redirect('/error')
    } else {
        let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });
        let login = decodedToken.login
        console.log(login)
        if (decodedToken) {
            let allData = await studentModule.find({userId:login, isDeleted: false}).populate("userId").sort({ _id: -1 })
            if (allData) {
                res.render("loginIndex", { details: allData })
            } else {
                console.log("error")
            }
        }else{
            res.redirect('/error');
        }
    }


})
//------------------ [ index page 2 end] ------------------------------------------



//------------------ [ delete blog  ] ------------------------------------------
app.get('/delete/:del', async (req, res) => {

    let del = req.params.del
    let cook = req.cookies.jwt
    if (!cook) {
        res.redirect('/error')
    }
    let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });    
    if(!decodedToken){
        res.redirect('/error')
    }else{
        let time = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
        await studentModule.findByIdAndUpdate({ _id: del, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time} }, { new: true,upsert:true })
        res.redirect('/loginIndex');
    }
    
})
//------------------ [ delete blog end] ------------------------------------------



//------------------ [ get edit blog start  ] ------------------------------------------
app.get('/edit/:edit', async (req, res) => {

    let edit = req.params.edit
    let cook = req.cookies.jwt
    if (!cook) {
        res.redirect('/error')
    }
    let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });    
    if(!decodedToken){
        res.redirect('/error')
    }else{
        //let time = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
        let allData = await studentModule.find({ _id: edit, isDeleted: false })
        res.render("edits", { details: allData })
        //res.send({getEdit : allData})
    }
    
})
//------------------ [ get edit blog end] ------------------------------------------



//------------------ [ create edit blog  ] ------------------------------------------
app.post('/edit/:edit', async (req, res) => {

    let edit = req.params.edit
    let data = req.body
    let cook = req.cookies.jwt
    if (!cook) {
        res.redirect('/error')
    }
    let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });    
    if(!decodedToken){
        res.redirect('/error')
    }else{
           
            await studentModule.findByIdAndUpdate({ _id: edit }, data, { new: true })
            res.redirect('/loginIndex')
        }
    
})
//------------------ [ create edit blog end] ------------------------------------------



//------------------ [ create blog verify ] ------------------------------------------
app.get('/createBlog', (req, res) => {
    let cook = req.cookies.jwt
    if (!cook) {
        res.redirect('/error')
    }

    let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });
    if (decodedToken) {
        res.sendFile(__dirname + '/public/index.html')
    } else {
        res.redirect('/error')
    }
})
//------------------ [ blog verify  end] ------------------------------------------




app.get("/signUp", function (req, res) {
    res.sendFile(__dirname + '/public/signUp.html')
})
app.get("/login", async function (req, res) {
    res.render('login')
   
})







app.post('/emailSignUp', async function (req, res) {
    let bodyData = req.body
    //let password = bodyData.password

    // const saltRounds = 10;
    // const hash = bcrypt.hashSync(password, saltRounds);
    // bodyData.password = hash;

    await emailModule.create(bodyData)
    res.redirect('/login')
})







app.post('/isLogin', async function (req, res) {

    let email = req.body.email
    let password = req.body.password

    let checkEmail = await emailModule.findOne({ email: email, password: password})
    

    // let checkPassword = await bcrypt.compare(password, checkEmail.password)

    if (checkEmail) {

        let token = jwt.sign({
            login: checkEmail._id.toString(),
            orgnization: "Blog_post_Aman",

        }, "key@$%&*0101")

        res.setHeader(token, "Blog_post_Aman")
        res.cookie("jwt", token, { expires: new Date(new Date().getTime() + 60 * 60 * 1000), httpOnly: true });

        res.redirect('/loginIndex')
    } else {
        //res.send(`<script>alert('Please check email or password')</script>`)
        res.redirect('/error')
    }
})

app.get('/userdata' , async (req,res)=>{
    let findData = await emailModule.find()
    res.send({allUserData:{findData}})
})








app.post('/create', async function (req, res) {
    let data = req.body
    
        //upload to s3 and get the uploaded link
        // res.send the link back to frontend/postman

        let cook = req.cookies.jwt
        if (!cook) {
            res.redirect('/error')
        } else {
           let decodedToken = jwt.verify(cook, "key@$%&*0101", { ignoreExpiration: true });
           let login = decodedToken.login
            data.userId = login
            data.createAt = moment().format('MMMM Do YYYY, h:mm:ss a');
            await studentModule.create(data);
            res.redirect('/loginIndex')
        }
})


app.get('/blogdata',async (req,res)=>{
    let allData = await studentModule.find()
    res.send({alldata:allData})
})


app.get('/blogdata2',async (req,res)=>{
    let allData = await studentModule.find().populate("userId")
    res.send({alldata:allData})
})

app.get('/deleteOne',async (req,res)=>{
    await studentModule.deleteOne()
    res.redirect('/')
})

app.get('/deleteMany',async (req,res)=>{
    await studentModule.deleteMany()
    res.redirect('/')
})







//------------------ [ logout start  ] ------------------------------------------
app.get('/logout', function (req, res) {
    let cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    res.redirect('/')
});
//------------------ [ logout end  ] ------------------------------------------










app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
