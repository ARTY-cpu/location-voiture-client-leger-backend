import { Emails } from "./emails/emails";
const nodemailer = require("nodemailer");

function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: Number(process.env.EMAIL_PORT) == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PWD,
        },
    });
}

async function SendMail(mail: string, to: string, subject: string): Promise<boolean> {
    try{
        let transporter = getTransporter();
        await transporter.sendMail({
            from: process.env.EMAIL_USER??"arthur.magnette.sio@gmail.com",
            to: to,
            subject: subject,
            text: mail,
        });
        return true;
    }catch (e) {
        return false;
    }
}

export async function SendContactMail(name:string, email:string, message:string): Promise<boolean>{
    return SendMail(Emails.Contact(name, email, message), process.env.EMAIL_USER??"arthur.magnette.sio@gmail.com", "[Prestige AUTO]New Contact Form Submission");
}