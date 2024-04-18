const nodemailer = require('nodemailer');

async function sendEmail({from, to, subject, text, html}) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from,   // Qui envoie l'email
        to,     // À qui
        subject,  // Sujet de l'email
        text,   // Corps de l'email en texte simple
        html    // Corps de l'email en HTML (optionnel)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, message: 'Email sent', info: info };
    } catch (error) {
        console.error('Error sending email: ', error);
        return { success: false, message: 'Failed to send email', error: error };
    }
}

module.exports = { sendEmail };
