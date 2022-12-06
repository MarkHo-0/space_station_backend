import nodemailer from "nodemailer";

let gmail_server = null;

export async function connectGmail() {
  const { EMAIL_USER, EMAIL_PWD } = process.env

  if ( !EMAIL_PWD || !EMAIL_PWD ) {
    throw new Error('Cannot find emial configuration.')
  }
  
  gmail_server = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PWD
    }
  })
}

export async function sendVfEmail(sid, vf_code) {
  if ( !gmail_server ) throw new Error('Email Server Not Found')

  const email = await gmail_server.sendMail({
    from: process.env['EMAIL_USER'],
    to: sid + "@learner.hkuspace.hku.hk",
    subject: "Verify your Student ID",
    text: "This is the verification code: " + vf_code
  })
}