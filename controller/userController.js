var express = require('express');
const bcrypt = require('bcrypt');
const usersModel = require('../models/user')
const jwt = require('jsonwebtoken');
// const { path } = require('../app');
const path = require('path')
const secretKey = 'platescanada';
const nodemailer = require('nodemailer');
const { Validator } = require('node-input-validator');
const helpers = require('../helper/helpers')
const messageModel = require('../models/message');
const { log } = require('console');
const moment = require('moment');
const contactModel = require('../models/contact')
module.exports = {
    signupuser: async (req, res) => {
        try {
            var v = new Validator(
                req.body, {
                email: "required|email",
                phone: "required",
                password: "required",
            }
            )
            let erroResponse = await helpers.checkValidation(v);
            if (erroResponse) {
                res.json({
                    status: false,
                    message: erroResponse,
                })
            }
            let hash = await bcrypt.hash(req.body.password, 10);
            let fullname = req.body.firstname + " " + req.body.lastname;
            // console.log(fullname);
            // return
            var image = req.files.image.name
            const file = req.files.image;
            const paths = path.join(__dirname, '../') + "/public/images/users" + image;

            file.mv(paths, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
            });

            const finduser = await usersModel.findOne({ email: { $eq: req.body.email } });
            if (finduser) {
                res.json({
                    status: false,
                    message: "User aleady exist with this mail",
                })
                return
            }
            const finduserphone = await usersModel.findOne({ phone: req.body.phone });
            if (finduserphone) {
                res.json({
                    status: false,
                    message: "User aleady exist with this phone number",
                })
                return
            }
            if (req.body.password != req.body.confirmpassword) {
                res.json({
                    status: false,
                    message: "Password and confirm password not match",
                })
                return
            }
            let createUser = new usersModel({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                name: fullname,
                email: req.body.email,
                phone: req.body.phone,
                plateno: req.body.plateno,
                plateprovince: req.body.plateprovince,
                password: hash,
                image: image,
            })
            let user = await createUser.save()
            res.json({
                status: true,
                message: "User added Successfully",
                detail: user
            })


        } catch (error) {
            console.log(error);
        }

    },
    loginuser: async (req, res) => {
        try {
            let today = moment().format("DD-MM-YYYY");
            let password = req.body.password
            let email = req.body.email
            let finduser = await usersModel.findOne({ email: { $eq: email } });
            if (finduser.isverify == false) {
                res.json({
                    status: false,
                    message: "User not verified by admin",
                })
                return
            }
            // console.log(finduser);
            // return
            if (finduser && finduser.role != "Admin") {
                let ismatch = bcrypt.compareSync(password, finduser.password)
                if (ismatch == true) {
                    const token = jwt.sign({ _id: finduser.id, email: finduser.email }, secretKey);
                    finduser.token = token;
                    finduser.save();
                    let getMessage = await messageModel.findOne({ sendby: finduser.email, date: today })
                    if (getMessage) {
                        finduser.messageAvailaibility = false;
                    } else {
                        finduser.messageAvailaibility = true;
                    }
                    res.json({
                        status: true,
                        message: "User Login Successfully",
                        detail: finduser
                    })
                } else {
                    res.json({
                        status: false,
                        message: "Wrong Password",
                    })
                    return
                }
            } else {
                res.json({
                    status: false,
                    message: "User not found",
                })
                return
            }

        } catch (error) {
            console.log(error);
        }
    },
    userlist: async (req, res) => {
        try {
            let users = await usersModel.find({ role: { $eq: "user" } });
            res.json({
                status: true,
                message: "User list",
                userlist: users
            })

        } catch (error) {
            console.log(error);
        }
    },
    sendOtp: async (req, res) => {
        try {
            const email = req.body.email
            const finduser = await usersModel.findOne({ email: { $eq: req.body.email } });
            if (finduser) {
                //abc
                //let random = Math.floor(1000 + Math.random() * 9000);
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    service: "gmail",
                    port: 443,
                    secure: false,
                    auth: {
                        user: 'testexpinator@gmail.com',
                        pass: 'qylehejecauwqcpw'
                    },
                    tls: { rejectUnauthorized: false },
                    debug: true
                });

                // send email
                await transporter.sendMail({
                    from: 'testexpinator@gmail.com',
                    to: finduser.email,
                    subject: 'Otp Plates Canada',
                    text: 'Your otp for Plates Canada is 1111 '
                });
                finduser.otp = 1111
                finduser.isotpverify = false
                finduser.save()
                res.json({
                    status: true,
                    message: "Otp send successfully",
                    email: finduser.email
                })
            } else (
                res.json({
                    status: false,
                    message: "Email is wrong",
                })
            )
        } catch (error) {
            console.log(error);
        }
    },
    deleteuser: async (req, res) => {
        try {
            const findByid = await usersModel.findById(req.params.id)
            if (findByid) {
                const findByid = await usersModel.deleteOne({ _id: req.params.id })
                res.send({ status: true, message: "data deleted Successfully" })
            } else {
                res.send({ status: false, message: "data can not deleted" })
            }
        } catch (error) {
            res.send({ status: false, message: "Something went wrong!!" })
        }
    },
    sendMail: async (req, res) => {
        try {
            let getuser = await usersModel.findOne({ plateno: { $eq: req.body.plateno }, plateprovince: { $eq: req.body.province } });
            if (getuser && getuser.isverify == true) {
                let userEmail = getuser.email;
                var image = req.files.image.name
                const file = req.files.image;
                const paths = path.join(__dirname, '../') + "/public/images/users/" + image;

                file.mv(paths, (err) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                });
                let today = moment().format("DD-MM-YYYY");
                const mailMessage = req.body.mailMessage
                const finduser = await usersModel.findOne({ email: { $eq: req.body.email } });
                if (finduser && finduser.isverify == false) {
                    res.json({
                        status: false,
                        message: "Message cannot be sent Your account must be verified first or you have no available messages.",
                    })
                    return
                }
                if (finduser) {
                    let getMessage = await messageModel.findOne({ sendby: finduser.email, date: today })
                    if (getMessage) {
                        res.json({
                            status: false,
                            message: "You already send a message today",
                        })
                        return
                    }
                    let createMessage = new messageModel({
                        sendby: req.body.email,
                        sendto: userEmail,
                        message: mailMessage,
                        date: today,
                        image: image,
                        province: req.body.province,
                        plateno: req.body.plateno
                    })
                    let messagedetail = await createMessage.save()
                    if (messagedetail) {
                        finduser.messageAvailaibility = false;
                        await finduser.save()
                    }
                    let htmlmail = `<header>
    <h1 style="font-size: 18px;">New Plates Message</h1>
     </header>
     <style>
         .mailtb tr {
             display: flex;
             margin-bottom: 15px;
         }
     
         .mailtb tr td {
             margin: 0px 5px;
             font-size: 14px;
         }
     
         img.custom-img {
             width: 100%;
             max-width: 200px;
             height: 200px;
             object-fit: cover;
         }
     </style>
     
     </html>
     
     <body>
             <table>
                 <tbody style="font-size: 22px" class="mailtb"> 
                 <tr>
                 <td>From:</td>
                 <td>${req.body.email}</td>
             </tr>             
             <tr>
                 <td>Message:</td>
                 <td>${req.body.mailMessage}</td>
             </tr>
                 </tbody>
             </table>
             <img class="custom-img" src="https://backend-plate-canada.onrender.com/images/users/${image}" alt="Girl in a jacket" width="100"
                 height="120">
     </body>`
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        service: "gmail",
                        port: 443,
                        secure: false,
                        auth: {
                            user: 'testexpinator@gmail.com',
                            pass: 'qylehejecauwqcpw'
                        },
                        tls: { rejectUnauthorized: false },
                        debug: true
                    });

                    // send email
                    await transporter.sendMail({
                        from: req.body.email,
                        to: userEmail,
                        subject: 'New Plate Message',
                        html: htmlmail
                    });
                    res.json({
                        status: true,
                        message: "Message Sent!",
                        email: messagedetail
                    })
                } else (
                    res.json({
                        status: false,
                        message: "Email is wrong",
                    })
                )
            } else {
                res.json({
                    status: false,
                    message: "User not found",
                })
            }

        } catch (error) {
            console.log(error);
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const finduser = await usersModel.findOne({ email: { $eq: req.body.email } });
            if (finduser) {
                let userotp = req.body.otp
                if (finduser.otp == userotp) {
                    finduser.otp = 0
                    finduser.isotpverify = true
                    finduser.save();
                    res.json({
                        status: true,
                        message: "Otp verified successfully",
                        email: finduser.email
                    })
                } else {
                    res.json({
                        status: false,
                        message: "Otp not match",
                    })
                }
            } else {
                res.json({
                    status: false,
                    message: "User not found",
                })
            }
        } catch (error) {
            console.log(error);
        }
    },
    changePassword: async (req, res) => {
        try {
            let hash = await bcrypt.hash(req.body.password, 10);
            if (req.body.password != req.body.confirmpassword) {
                res.json({
                    status: false,
                    message: "Password and confirm password not match",
                })
                return
            }
            const finduser = await usersModel.findOne({ email: { $eq: req.body.email }, otp: 0, isotpverify: true });

            if (finduser) {
                finduser.password = hash
                finduser.isotpverify = false
                finduser.save();
                res.json({
                    status: true,
                    message: "Password changed Successfully",
                })
            } else {
                res.json({
                    status: false,
                    message: "Otp is not verified or user not found",
                })
            }
        } catch (error) {
            console.log(error);
        }
    },
    verifyuser: async (req, res) => {
        try {
            const finduser = await usersModel.findOne({ _id: req.body.id });
            if (finduser) {
                finduser.isverify = true
                finduser.save()
                res.json({
                    status: true,
                    message: "User verified successfully",
                })
            } else {
                res.json({
                    status: false,
                    message: "User not verified",
                })
            }
        } catch (error) {
            console.log(error);
        }
    },
    loginAdmin: async (req, res) => {
        try {
            let password = req.body.password
            let email = req.body.email
            let finduser = await usersModel.findOne({ email: { $eq: email }, role: { $eq: "Admin" } });
            if (finduser) {
                let ismatch = bcrypt.compareSync(password, finduser.password)
                if (ismatch == true) {
                    const token = jwt.sign({ _id: finduser.id, email: finduser.email }, secretKey);
                    finduser.token = token;
                    finduser.save();
                    res.json({
                        status: true,
                        message: "Admin Login Successfully",
                        detail: finduser
                    })
                } else {
                    res.json({
                        status: false,
                        message: "Wrong Password",
                    })
                    return
                }
            } else {
                res.json({
                    status: false,
                    message: "User not found",
                })
                return
            }

        } catch (error) {
            console.log(error);
        }
    },
    contactUs: async (req, res) => {
        try {
            let createMsg = new contactModel({
                name: req.body.name,
                email: req.body.email,
                subject: req.body.subject,
                message: req.body.message,
            })
            let createdMsg = await createMsg.save()
            res.json({
                status: true,
                message: "Data send Successfully",
                detail: createdMsg
            })

        } catch (error) {
            console.log(error);
        }
    },
    getContactUs: async (req, res) => {
        try {
            let allMessages = await contactModel.find({});
            res.json({
                status: true,
                message: "Contact us listing",
                detail: allMessages
            })
        } catch (error) {
            console.log(error);
        }
    },
    deleteContactUs: async (req, res) => {
        try {
            let deleteData = await contactModel.deleteOne({ _id: req.params.id });
            if (deleteData) {
                res.json({
                    status: true,
                    message: "Data deleted successfully",
                })
            } else {
                res.json({
                    status: false,
                    message: "Data not deleted",
                })
            }
        } catch (error) {
            console.log(error);
        }
    },

}