var mail = require('nodemailer');

Mailer = {
    init() {
        this.SMTP = mail.createTransport({
            service: 'gmail'
            ,auth: {
                user: 'serehactka@gmail.com'
                ,pass: 'S1e2r3e4g5a6'
            }
        });

        return this;
    }

    ,send(options) {
        this.SMTP.sendMail(options, (err, info) => {
            if (err) console.log(err)
            else
                console.log('Email send ' + info.response);
        });
    }
}

module.exports = Mailer;