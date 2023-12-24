const appointment = require('../models/appointments');
const storage = require('node-sessionstorage');

const createApt = async (req, res) => {
    let {sdate, stime} = req.body;
    console.log(sdate+ " time :" +stime );
    appointment.findOne({Date:sdate,Time:stime}, (err,result)=>{
        console.log(result);
        if(result){
            res.render("appointment",
            {
             message:"Slot already added",
             color:'danger'
             })
        }
        else{
            appointment.create({
                Date: sdate,
                Time: stime
              });
              res.render('appointment',{message:"Slot Added.", color:'info'})
        }
    })
}

module.exports = {
    createApt
}