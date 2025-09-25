import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'credit@ladybuglending.com',
    pass: 'pioz fing bxoz efrn', 
  },
});

export default transporter;
