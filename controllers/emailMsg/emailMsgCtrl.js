const expressAsyncHandler = require("express-async-handler");
const EmailMsg = require("../../model/EmailMessaging/EmailMessaging");
const sgMail = require('@Sendgrid/mail');
const Filter = require('bad-words');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// Send Email and save to our database
const sendEmailMsgCtrl = expressAsyncHandler( async (req, res) => {
    const { to, subject, message } = req?.body;
    const { email, _id } = req?.user;

    if(!to || !subject || !message || !email) throw new Error(`Invalid parameters passed.`);

    filter = new Filter();
    isProfane = filter.isProfane(subject, message);
    if(isProfane) {
        await EmailMsg.create({
            to,
            from: email,
            subject,
            message,
            sentBy: _id,
            isFlagged: true
        });

        throw new Error(`Email sent failed because it contains profane words.`);
    }

    try {
        const msg = {
            to,
            from: process.env.SEND_GRID_FROM_MAIL,
            subject,
            text: message
        };

        await sgMail.send(msg);

        // Save the data into our database
        await EmailMsg.create({
            from: email,
            to,
            subject,
            message,
            sentBy: _id
        });
        
        res.json("Email sent successfully");
    } catch (error) {
        res.json(error);
    }
});


module.exports = { sendEmailMsgCtrl };