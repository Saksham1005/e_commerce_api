const sendgrid=require('@sendgrid/mail')

// const API_key=''

sendgrid.setApiKey(process.env.API_key)

function welcomeEmail(email){
sendgrid.send({
    to:email,
    from:'Saksham1005@gmail.com',
    subject:'Welcome to e_commerce API',
    html:"<strong>This api is setup in nodejs!<strong>"
})
}

function DeleteAccountEmail(email){
    sendgrid.send({
        to:email,
        from:'Saksham1005@gmail.com',
        subject:'It"s hard to see you go',
        html:"<strong>Hope to see you soon !!<strong>"
    })  
}
module.exports={welcomeEmail,DeleteAccountEmail}