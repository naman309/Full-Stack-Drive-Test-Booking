const express = require('express')
const { dirname } = require('path')
const path = require('path')
const ejs = require('ejs')
const app = express()
const eSession = require('express-session')
const user = require('./models/users')
const appointment = require('./models/appointments')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const userController = require('./controllers/user.controller')
const aptController  = require('./controllers/appointment.controller')

app.use(express.static('public'))
app.set('view engine','ejs')

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use(eSession({
  secret : 'user hiten'
}))

global.loggedIn = null;
global.userType = null


app.use("*", (req, res, next) => {
loggedIn = req.session.userId;
userType = req.session.userType;
next()
});


app.listen(4000, ()=>{
    console.log("listening on port 4000 : http://localhost:4000")
})

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.5xs63mk.mongodb.net/ServiceOntario?retryWrites=true&w=majority",
    { useNewUrlParser: true },
    (error) => {
      console.log(error, "Database connected");
    }
  );


app.get('/', (req,res) => {
    res.render('index')
})
app.get('/login', userController.redirectIfUserLogged, (req,res) => {
    res.render('login')
})
app.get('/logout', (req,res) => {
    userController.logOut(req,res);
})
app.get('/signup', userController.redirectIfUserLogged, (req,res) => {
    res.render('signup')
})
app.get('/G2_page', userController.isLogged,userController.authDriver,(req,res) => {
  user.findOne({_id:req.session.userId}, (err, result)=>{
    console.log("fname" , result.FirstName);
    res.render('G2_page', {isDefault : ( result.FirstName == 'default')})
  });
})
app.get('/G_page', userController.isLogged,userController.authDriver ,(req,res) => {
  let _id = req.session.userId;
  user.findOne({_id}, (err, user)=>{
    if(!err){
      console.log("user fetched");
      if(user.FirstName == "default"){
        return res.render('G2_page', {message : "Please add your information here."});
      }
      res.render('G_page',{ userData: user });
    }
    else{
      console.log("user fetching error: ", err);
    }
  })

})

app.get('/appointment', (req,res)=>{
  res.render('appointment');
});
app.get('/slots/', async (req,res)=>{
  console.log("query : ",req.query.date);
  var availableSlot = await appointment.find({Date: req.query.date,IsTimeSlotAvailable:true}).select('Time');
  console.log("avail : " , availableSlot);
  return res.send({availableSlot});
})


app.post('/g2/submit', userController.authDriver,(req,res) => {
    console.log("here")
    console.log(req.body);
    var query = { _id: req.session.userId};
    var newvalues = { 
      $set: {
        FirstName:req.body.FirstName,
        LastName:req.body.LastName,
        Age:req.body.Age,
        LicenseNumber:req.body.LicenseNumber,
        DateOfBirth:req.body.DateOfBirth,
        'CarDetails.Make': req.body.Make,
        'CarDetails.Model': req.body.Model,
        'CarDetails.Year': req.body.Year,
        'CarDetails.NumberPlate': req.body.NumberPlate,
      },
      };
    user.updateOne(query,newvalues , (err) => {
      if(!err){
        console.log("updated new value");
        
        return res.redirect('/G_page'); 
      }
    }
    )

 })
 
app.post('/G_page/submit', userController.authDriver,(req,res) => {
    user.findOne({ LicenseNumber: req.body.LicenseNumber }, (res)=> {
        console.log("res ==",res);
        if (!res) {
          res.render("G2_page");
        } else {
          res.render("G_page", { userData: res });
        }
      });
 })
app.post('/G/update', userController.authDriver,(req,res) => {
    user.updateOne(
        { _id: req.session.userId },
        {
          $set: {
            FirstName:req.body.FirstName,
            LastName:req.body.LastName,
            Age:req.body.Age,
            LicenseNumber:req.body.LicenseNumber,
            DateOfBirth:req.body.DateOfBirth,
            'CarDetails.Make': req.body.Make,
            'CarDetails.Model': req.body.Model,
            'CarDetails.Year': req.body.Year,
            'CarDetails.NumberPlate': req.body.NumberPlate,
          },
        },
         (err,user)=> {
          console.log("user ::: ",user);
          if(!err)
          return res.redirect("/G_page");
        }
      );
 })

 app.post("/appointment-slot", (req,res)=>{
    aptController.createApt(req,res);
 });

app.post("/appointment-slot-book",(req,res)=>{
    console.log("body :", req.body);
    let date = req.body.date;
    let sTime = req.body.sTime;

    appointment.findByIdAndUpdate(
      sTime,
      {
        IsTimeSlotAvailable:false
      },(err, result)=>{
        console.log("err : ",err);
        console.log("result : ",result);
        if(!err){
          res.redirect('/')
        }
      })
}) 
 app.post('/signup', (req,res) => {
  console.log(req.body);
    console.log("signup routed");
    userController.createUser(req,res);
})

 app.post('/login', (req,res) => {
  let timestamp = new Date().getTime();
  console.log(timestamp.toLocaleString());
  console.log(req.body);
    console.log("login routed");
    userController.loginUser(req,res)
})
