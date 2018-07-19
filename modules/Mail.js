var mail = require('nodemailer');
var request = require('request');

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
    	request.post({
            url: "https://retarcorp.by/api/mybrandmailer.php"
            ,form: options
        },function(err, http_r, body) {
            console.log(err, body);
            //res.send({mail: true, error: err});
        });
    	
        // request({
        //     method: 'POST',
        //     url: 'https://api.sendpulse.com/oauth/access_token',
        //     headers: { 'content-type': 'application/json' },

        //     body: {
        //             grant_type: 'client_credentials',
        //             client_id: '85a943acf5aa7ba88512b40d193a0e5f',
        //             client_secret: 'b2db7a77b876ec9b7afd4a83a78692e7'
        //         },

        //     json: true
        //     },

        //     function (err, httpResponse, body) {
        //         console.log(err, body);

        //         const ContentHeader = ` ${body.token_type} ${body.access_token}`

        //         console.log(options);

        //         request({
        //             method: "POST",
        //             url: "https://api.sendpulse.com/smtp/emails",
        //             headers: {
        //                 'content-type': 'application/json',
        //                 'Authorization': ContentHeader
        //             },

        //             body: {email: JSON.stringify(options)},
        //             json: true
        //         }, function(err, httpResponse, body) {
        //             console.log(err, body);
        //         });
        //     });
        
        // this.SMTP.sendMail(options, (err, info) => {
        //     if (err) console.log(err)
        //     else
        //         console.log('Email send ' + info.response);
        // });
    }
}

module.exports = Mailer;