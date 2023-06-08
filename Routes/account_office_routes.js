const AccontOfficerModel = require('../Models/AccountOfficerModel')
const FeechallanModel = require('../Models/FeechalanModel')
const StudentModel = require('../Models/StudentModel')
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer')
const teacherModel = require('../Models/TeacherModel')
const AcademicOfficerModel = require('../Models/AcademicOfficerModel')

const fs = require('fs');
const hbs = require('hbs');
const puppeteer = require('puppeteer-core');
const htmlPDF = require('puppeteer-html-pdf');
const readFile = require('util').promisify(fs.readFile);

const app = require("express")


require("dotenv").config()
const jwt = require('jsonwebtoken');
const Teacher = require('../Models/TeacherModel');
const Accounts = require("express").Router()




const disperseSalary = async (req, res, next) => {
    const { email } = req.body;
    if(req.token.role === "AccountOfficer"){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.email,
                pass: process.env.password
            },
        });
    
        const mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Salary Dispersion',
            text: `This is an automated email.\nDear Recipient,\nYour monthly salary cheque is here. Kindly visit accounts office to pick it up :).`
        };
    
        transporter.sendMail(mailOptions, function (error, message) {
            if (error) {
                res.status(500).json({ "error": 'Email unsuccessful' });
            } else {
                res.status(200).json({ "message": 'Email sent successfully' });
            }
        });
    }
    else{
        res.send("User not authorized")
    }

    
};



const auth = (req, res, next) => {
    const token = req.headers["token"];
    console.log(token)  
    if (!token) {
    res.status(200).json({
    success: false,
    message: "Error! Token was not provided."
    });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        req.token = decodedToken;
        next();
    } catch (err) {
        res.status(401).json({
        success: false,
        message: err.message
        });
    }
}

let login = (req,res)=>{
    let {employeeId , password} = req.body;
    try{
        AccontOfficerModel.findOne({employeeId:employeeId}).then((user)=>{
        if(user===null){
            res.status(500).json({"Message":"User Not Logged In (Invalid Credentials)"})

        }    else
        if(user.password === password){
            let token = jwt.sign({
                id:user._id,
                user:user,
                role:user.role
            },process.env.SECRET_KEY,{
                expiresIn:process.env.EXPIRES_IN
            }    
            )
            res.status(200).json({"Message":"User Logged In" , user:user,token})
        }else{
            res.status(500).json({"Message":"User Not Logged In (Invalid Credentials)"})
        }
    })}
    catch{
        (err=>{
        res.status(500).json({"Message":"User Not Logged In" , err:err})
    })
}
}

const generateChallan = async (req,res) =>{
    let {studentID} = req.body
    const invoice = {
        Student_info: {
            studentId: studentID
        },
        items: [
            {
                item: 'Fee',
                description: 'Fee for this month',
                amount: 20000,
            },
            {
                item: 'Accounts Office',
                description: 'Charges',
                quantity: 1,
                amount: 500,
            },
            {
                item: 'FBR',
                description: 'Charges',
                quantity: 1,
                amount: 1,
            }
        ],
        subtotal: 20501,
        paid: 0,
        invoice_nr: 1234,
    };


    if(req.token.role==="AccountOfficer"){
        try {
            createInvoice(invoice,`./FeeChallans/${studentID}.pdf`)
            //create new feechallan and save it in db

            //check if a challan for this student already exists
            let challan = await FeechallanModel.findOne({studentID:studentID})
            if(challan){
                res.status(500).json({"Message":"Fee Challan Already Exists"})
                return
            }
            let newFeeChallan = new FeechallanModel({
                studentID:studentID,
                isPaid:false,
                pathToFile:`challans/FeeChallans/${studentID}.pdf`
            })

            newFeeChallan.save().then((doc)=>{
                //send the generated pdf to the frontend

                //find the student and update the challan in his/her account
                StudentModel.updateOne({rollNumber:studentID},{feeChalan:[doc]}).then((doc)=>{

                }).catch((err)=>{
                    res.status(500).json({"Message":"Fee Challan Not Generated"})
                })

            
                
                res.status(200).json({"Message":"Fee Challan Generated", "data":doc})
            }
            ).catch((err)=>{
                res.status(500).json({"Message":"Fee Challan Not Generated"})
            }
            )


        } catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
    }
    else{
        res.send("User not authenticated")
    }
}





function createInvoice(invoice, path) {
	let doc = new PDFDocument({ margin: 50 });

	generateHeader(doc); // Invoke `generateHeader` function.
    generateCustomerInformation(doc, invoice)
    generateInvoiceTable(doc, invoice)
	generateFooter(doc); // Invoke `generateFooter` function.

	doc.end();
    if (!fs.existsSync(path)) {
        fs.createWriteStream(path, {flags: 'w'});
    }
	doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
	doc.image('logo.png', 50, 45, { width: 50 })
		.fillColor('#444444')
		.fontSize(20)
		.text('FAST school of computing', 110, 57)
		.fontSize(10)
		.text('123 Main Street', 200, 65, { align: 'right' })
		.text('New York, NY, 10025', 200, 80, { align: 'right' })
		.moveDown();
}

function generateFooter(doc) {
	doc.fontSize(
		10,
	).text(
		'Payment is due within 15 days. Thank you for your business.',
		50,
		780,
		{ align: 'center', width: 500 },
	);
}

module.exports = {
	createInvoice,
};

function generateCustomerInformation(doc, invoice) {
	const Student_info = invoice.Student_info;

	doc.text(`Invoice Number: ${invoice.Student_info.studentId}`, 50, 200)
		.text(`Invoice Date: ${new Date()}`, 50, 215)
		.text(`Balance Due: ${invoice.subtotal}`, 50, 130)

		.text(Student_info.studentId, 300, 200)
		.text("XYZ School", 300, 215)
		.moveDown();
}

function generateTableRow(doc, y, c1, c2, c3) {
	doc.fontSize(10)
		.text(c1, 50, y)
		.text(c2, 150, y)
		.text(c3, 0, y, { align: 'right' });
}


function generateInvoiceTable(doc, invoice) {
	let i,
		invoiceTableTop = 330;

	for (i = 0; i < invoice.items.length; i++) {
		const item = invoice.items[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.item,
			item.description,
			item.amount
		);
	}
}


const pdfData = (token,studentId,req) => {
   let items = { invoiceItems: [
        { item: 'Fee', amount: 20000 },
        { item: 'Account office fee', amount: 500 },
        { item: 'FBR charges', amount: 1 },
    ],
    invoiceData: {
        officername: token.user.name,
        studentId: studentId, 
        invoice_id: 123,
        transaction_id: 1234567,
        payment_method: 'Any',
        creation_date: Date.now,
        total_amount: 20501,
    },
    baseUrl: `${req.protocol}://${req.get('host')}` // http://localhost:3000
}
return items;
    
}

const options = (studentID) =>{
    return( {
	format: 'A4',
	path: `storage/FeeChallans/${studentID}.pdf` 
})
}


//create a route named pay challan which takes student ID as req and changes the status to true

const payChallan = async (req,res) =>{
    let {studentID} = req.body
    if(req.token.role==="AccountOfficer"){
        try {
            FeechallanModel.find(

                {studentID:studentID}
            ).then((doc)=>{
                if(doc.length===0){
                    res.status(500).json({"Message":"Fee Challan Not Found"})
                }
                else{
                    FeechallanModel.updateOne({studentID:studentID},{isPaid:true}).then((doc)=>{
                        res.status(200).json({"Message":"Fee Challan Paid"})
                    }).catch((err)=>{
                        res.status(500).json({"Message":"Fee Challan Not Paid"})
                    })
                }
            }

            )}
        catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
     }
    else{
        res.send("User not authenticated")
    }
}

const getallemployees = async (req,res) =>{
    if(req.token.role==="AccountOfficer"){
        try {
            teacherModel.find({}).then((doc)=>{
                //res.status(200).json(doc)
                res.send(doc)
            }
            ).catch((err)=>{
                res.status(500).json({"Message":"No Employees Found"})
            }
            )
        } catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
    }
    else{
        res.send("User not authenticated")
    }
}

const changeSalaryStatus = async (req,res) =>{
    let {employeeId} = req.body
    if(req.token.role==="AccountOfficer"){
        try {
            teacherModel.find(

                {employeeId:employeeId}
            ).then((doc)=>{
                if(doc.length===0){
                    res.status(500).json({"Message":"Employee Not Found"})
                }
                else{
                    teacherModel.updateOne({employeeId:employeeId},{$set: {isSalaryPaid:true} } ).then((doc)=>{
                        res.status(200).json({"Message":"Salary Paid"})
                    }).catch((err)=>{
                        res.status(500).json({"Message":"Salary Not Paid"})
                    })
                }
            }

            )}
        catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
    }
    else{
        res.send("User not authenticated")
    }
}


const getAllUnpaidStudents = async (req,res) =>{
    if(req.token.role==="AccountOfficer"){
        try {
//isFeePaid = false
            StudentModel.find({isFeePaid:false}).then((doc)=>{
                res.status(200).json(doc)
                //res.send(doc)
            }
            ).catch((err)=>{
                res.status(500).json({"Message":"No Students Found"})
            }
            )
        } catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
    }
    else{
        res.send("User not authenticated")
    }
}

const findChallan = (req,res) =>{
    let {studentID} = req.body
    if(req.token.role==="AccountOfficer"){
        try {
            FeechallanModel.find({studentID:studentID}).then((doc)=>{
                res.status(200).json(doc)
            }
            ).catch((err)=>{
                res.status(500).json({"Message":"No Challan Found"})
            }
            )
        } catch (error) {
            console.log(error);
            res.send('Something went wrong.')
        }
    }
    else{
        res.send("User not authenticated")
    }
}






Accounts.get('findchallan',auth,findChallan)
Accounts.get('/getallunpaidstudents',auth,getAllUnpaidStudents)
Accounts.post('/changeSalaryStatus',auth,changeSalaryStatus)
Accounts.get('/getallemployees',auth,getallemployees)
Accounts.post('/login',login)
Accounts.post('/paychallan',auth,payChallan)
Accounts.post('/disperseSalary',auth,disperseSalary)
Accounts.post('/generatechallan',auth,generateChallan)

module.exports = Accounts

