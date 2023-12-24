const user = require('../models/users')
const storage = require('node-sessionstorage')
const bcrypt = require('bcrypt');


 const createUser = async (req, res) => {
    console.log("controller req body", req.body);
  let { username, password, userType } = req.body;
  console.log("Creating User",username,userType,password)
  let userFields = {
//     FirstName: 'default',
//   LastName: 'default',
//   Age: 0,
//   LicenseNumber: 'default',
//   DateOfBirth: 'default',
//   'CarDetails.Make': 'default',
//   'CarDetails.Model': 'default',
//   'CarDetails.Year': 0,
//   'CarDetails.NumberPlate': 'default',
  }
  const hashedPassword = bcrypt.hashSync(password, 5);
  console.log(hashedPassword);
   user.create({
     UserType: userType,
     Username: username,
     Password: hashedPassword,
     ...userFields,
   });
  return res.render('login');
};

const loginUser = async(req,res)=> {
    console.log("Login user Controller");

    let { username, password } = req.body;
    // console.log("login user : "+req.body.Username +" "+ req.body.Password);
    // console.log("login user : "+username +" "+ password);
    // console.log(req.body);
    user.findOne({Username:username},(error,user)=>{
        if(user){
            console.log("match : ",bcrypt.compareSync(password, user.Password) );
            console.log("user fetched ", user.Password);
            bcrypt.compare(password, user.Password, (err,result)=>{
                if(result){
                    req.session.userId = user._id;
                    req.session.userType = user.UserType;
                    // console.log("userid :",user._id);
                    // console.log("userType :",user.UserType);
                    // console.log("looged");
                    // console.log(req.session);
                    return res.redirect('/');
                }
                else{
                        console.log("error in ",err);
                        return res.render('login', {error : "User credentials not matched"})
                    }
            });
            // if(user.Password == password){
            //     req.session.userId = user._id;
            //     req.session.userType = user.UserType;
            //         console.log("userid :",user._id);
                //         console.log("userType :",user.UserType);
                //         console.log("looged");
                //         console.log(req.session);
                //         res.redirect('/')
                // }
                // else{
                //     res.render('login', {error : "User credentials not matched"})
                // }
                // bcrypt.compare(password, user.Password, (error, same) =>{
                //     if(same){
                //     req.session.userId = user._id
                //     console.log("looged");
                //     console.log(req.session);
                //     res.redirect('/')
                //     }
                //     else{
                //     res.redirect('/login1')
                //     }
                //     })
        }
        else{
            res.render('login',{error: "Username is not registered with this name."})
        }
    })


    // Using Try and catch block
//     try{
//         const userExist =  await user.findOne({Username: username});
//         // console.log("userExist ", userExist);
//         if(!userExist){ 
//             req.session.error = "User is not registered"
//             return res.render("signup")}
//         else{
//             const isMatch = await (userExist.Password == password)
//             if(!isMatch){
//                 console.log("login credentials are incorrect");
//                 req.session.error = "Authentication Error"
//                 return res.render("login", {"error": "User credentials are incorrect"})
//             }
//             else{
//                 console.log("User Authenticated");
//                 req.session.authenticated = true;
//                 console.log(req.session);
//                 return res.render('index')
//             }
//         }

//     }
//     catch (error) {
//         console.log(error)
//         return res.render("login", {"error" : "Unknown error occured"})
//         // return done(error, false);
// }
}

const authUser = async (password, dbPassword) => {
    return await bcrypt.compare(password,dbPassword)
}

const authMiddleware = async(req,res,next) =>{
    console.log(req.session);
    user.findById(req.session.userId, (error, user ) =>{
        if(error || !user ){
            console.log("redirecting");
            return res.render('index')
        }
        else{
            console.log("User logged");
            return res.render('index', {data : 'Driver'})
        }
    })
}

const authDriver = async(req,res,next)=>{
    console.log("authorizing driver");
    if(req.session.userType == "Driver"){

        next()
    }
    else{
        res.redirect('/')
    }
}

const authAdmin = async(req,res,next)=>{
    console.log("authorizing admin");
    if(req.session.userType == "Admin"){
        next()
    }
    else{
        res.redirect('/')
    }
}
// const driverAuth = async(req,res) => {
//     console.log("authorizing driver");
// }

const getUserType = async(req,res,next)=>{
    let username = req.body.username;
    

}

const redirectIfUserLogged =  (req, res, next) =>{
    if(req.session.userId){
    return res.redirect('/') // if user logged in, redirect to home page
    }
    next()
}   

const logOut = (req, res) =>{
    delete req.session.userId;
    res.redirect('/')
    // req.session.destroy(()=>{
    //     console.log("deleted");
    // })
}

const isLogged = (req,res,next)=> {
    if(req.session.userId){
        console.log("logged islog");
        next()
    }
    else{
        return res.redirect('/login')
    }
}

module.exports = {
    createUser,
    loginUser,
    authMiddleware,
    logOut,
    redirectIfUserLogged,
    isLogged,
    authDriver,
    authAdmin
}