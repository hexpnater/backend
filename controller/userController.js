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
                // const transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     service: "gmail",
                //     port: 443,
                //     secure: false,
                //     auth: {
                //         user: 'rushilkohli.expinator@gmail.com',
                //         pass: 'atpaxanpbsbzksou'
                //     },
                //     tls: { rejectUnauthorized: false },
                //     debug: true
                // });

                // // send email
                // await transporter.sendMail({
                //     from: 'rushilkohli.expinator@gmail.com',
                //     to: finduser.email,
                //     subject: 'Otp Plates Canada',
                //     text: 'Your otp for Plates Canada is 1111 '
                // });
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
            var image = req.files.image.name
            const file = req.files.image;
            const paths = path.join(__dirname, '../') + "/public/images/users" + image;

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
                // const transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     service: "gmail",
                //     port: 443,
                //     secure: false,
                //     auth: {
                //         user: 'rushilkohli.expinator@gmail.com',
                //         pass: 'atpaxanpbsbzksou'
                //     },
                //     tls: { rejectUnauthorized: false },
                //     debug: true
                // });

                // // send email
                // await transporter.sendMail({
                //     from: req.body.email,
                //     to: 'abhisheksaklaniexpinator1@gmail.com',
                //     subject: 'New Plate Message',
                //     text: 'Message sent by' + finduser.name + ' - ' + mailMessage
                // });
                let createMessage = new messageModel({
                    sendby: req.body.email,
                    sendto: 'abhisheksaklaniexpinator1@gmail.com',
                    message: mailMessage,
                    date: today,
                    image: image,
                    province: req.body.province,
                    plateno: req.body.plateno
                })
                let messagedetail = await createMessage.save()
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

}