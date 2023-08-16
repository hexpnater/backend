var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');
const checkAuth = require("../helper/checkAuth");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/signupuser', userController.signupuser)
router.post('/loginuser', userController.loginuser)
router.post('/loginAdmin', userController.loginAdmin)
router.get('/userlist', userController.userlist)
router.post('/sendOtp', userController.sendOtp)
router.post('/verifyOtp', userController.verifyOtp)
router.post('/changePassword', userController.changePassword)
router.post('/verifyuser', userController.verifyuser)
router.delete("/deleteuser/:id", userController.deleteuser)
router.post("/sendMail", userController.sendMail)
router.post("/contactUs", userController.contactUs)
router.get("/getContactUs", userController.getContactUs)
router.delete("/deleteContactUs/:id", userController.deleteContactUs)

module.exports = router;
