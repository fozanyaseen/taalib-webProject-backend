const express = require('express');
const app = express()
const cors = require('cors')
const fs = require('fs')

// app.use(upload())
app.use(cors({origin:"https://taalib-accountofficer.onrender.com"}))

require("dotenv").config()

app.use(express.json())

const AccontOfficerModel = require('./Models/AccountOfficerModel')
const FeeChallanModel = require('./Models/FeechalanModel')
const StudentModel = require('./Models/StudentModel')
const accountofficeroute = require('./Routes/account_office_routes')
app.use('/accountOffice',accountofficeroute)
app.use('/challans',express.static('FeeChallans'))
// const userroutes = require('./Routes/userRoutes')
// app.use('/user',userroutes)
// const studentroutes = require('./Routes/studentRoutes')
// app.use('/student',studentroutes)
// const jobroutes = require('./Routes/jobRoutes')
// app.use('/job',jobroutes)
// app.use(express.urlencoded({ extended: true }))
const mongoose = require('mongoose')

app.listen(process.env.PORT,()=>{
    console.log('Server is running on port 3000')
})

// app.get('/file/:path', (req, res) => {
//     //store :path in a variable called filepath
//     const filePath = "../"+req.params.path;
  
//     // Read the file asynchronously
//     fs.readFile(filePath, 'utf8', (err, data) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Error reading the file');
//         return;
//       }
  
//       // Send the file content as the response
//       res.send(data);
//     });
//   });

mongoose.connect(process.env.MONGO).then(()=>{
    console.log("Connected")
}).catch(err=>{
    console.log(err)
})