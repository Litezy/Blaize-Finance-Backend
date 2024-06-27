const nodemailer = require("nodemailer");

const sendMail = ({ from: emailFrom, to: emailTo, subject: subject, html: html }) => {
    const transporter = nodemailer.createTransport({
        host: "mail.secureinvest.org",
        port: 465,
        secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: "support@secureinvest.org",
            pass: "secureinvest.org",
        },
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: emailFrom, // sender address
            to: emailTo, // list of receivers
            subject: subject, // Subject line
            text: "Hello world?", // plain text body
            html: html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    }

    main().catch(console.error);

}
module.exports = sendMail