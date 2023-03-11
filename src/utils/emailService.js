import nodemailer from "nodemailer";

let gmail_server = null;

export async function connectGmail() {
  const { EMAIL_USER, EMAIL_PWD } = process.env

  if ( !EMAIL_PWD || !EMAIL_PWD ) {
    throw new Error('Cannot find email configuration.')
  }
  
  gmail_server = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PWD
    }
  })
}

export async function sendVfEmail(sid = 0, vf_code = 0) {
  if ( !gmail_server ) throw new Error('Email Server Not Found')

  const email = await gmail_server.sendMail({
    from: `Space Station<${process.env['EMAIL_USER']}>`,
    to: sid + "@learner.hkuspace.hku.hk",
    subject: "Verify your Student ID",
    html: temple.replace('{sid}', sid.toString()).replace('{code}', vf_code.toString())
  })
}

const temple = 
`<div style="font-family: 'Source Sans Pro', sans-serif; margin: 0;">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;900&display=swap');
  </style>
  <div style="background-color: #7c8ec1; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; padding:15px;">
      <h1 style="color: white; letter-spacing: 2px; text-align: center;">SPACE STATION</h2>
    </div>
  </div>
  <div style="max-width: 600px; height: 500px; margin: 0 auto; padding: 30px 15px; text-align: justify;">
    <span style="font-size: 20px; margin-bottom: 5px; display: block;">Hi {sid},</span>
    Thank you for registering with Space Station, here is your verification code.
    Please enter this code to verify your identity and sign in.
    <h2 style="text-align: center; font-size: 40px; letter-spacing: 10px;">{code}</h2>
  </div>
</div>`