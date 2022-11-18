const nodeMailer = require("nodemailer");
const {google} = require('googleapis')
const config = require('./config.js');
const { refreshToken } = require("./config.js");
const OAuth2 = google.auth.OAuth2 

const  OAuth2_client = new OAuth2(config.clientId, config.clientSecret)
OAuth2_client.setCredentials({refresh_token: config.refreshToken})


function sendEmail(options){

    const accessToken = OAuth2_client.getAccessToken()

    const transporter = nodeMailer.createTransport({
        service: 'gmail',

        auth:{
            type: 'OAuth',
            user: config.user,
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            refreshToken: config.refreshToken,
            accessToken: accessToken
           
        }
    })

    const mailOptions = {
        form:  process.env.SMTP_MAIL,
        to: options.email,
        subject:options.subject,
        text: options.message,
    };

   transporter.sendMail(mailOptions, function(error, result){

        if(error){
            console.log('Error', error);
        }else{
            console.log('Success', result);
        }
        transporter.close()

   });

}


module.exports = sendEmail;



