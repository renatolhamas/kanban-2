require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  console.log('Testing domain:', process.env.RESEND_FROM_EMAIL);
  
  const response = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: 'renatolhamas@gmail.com',
    subject: 'Test from atendimento@renatolhamas.com.br',
    html: '<p>Domain test from real domain! ✅</p>',
  });

  if (response.error) {
    console.error('❌ Error:', response.error);
  } else {
    console.log('✅ SUCCESS!', response.data?.id);
  }
}

test();
