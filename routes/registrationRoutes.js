// routes/registrationRoutes.js

const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Register a participant
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, event } = req.body;

        // Generate unique QR code data
        const qrCodeData = `${email}-${Date.now()}`;

        // Generate QR code
        const qrCodeURL = await QRCode.toDataURL(qrCodeData);

        // Save registration to the database
        const registration = new Registration({
            name,
            email,
            phone,
            event,
            qrCodeData,
        });
        await registration.save();

        // Send email with QR code
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Registration Confirmation for ${event}`,
            html: `<h3>Thank you for registering, ${name}!</h3>
                   <p>Please find your QR code below:</p>
                   <img src="${qrCodeURL}" alt="QR Code">
                   <p>Event: ${event}</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Registration successful and email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering participant', error });
    }
});

// Check-in participant
router.post('/checkin', async (req, res) => {
    try {
        const { qrCodeData } = req.body;

        // Find participant by QR code
        const registration = await Registration.findOne({ qrCodeData });
        if (!registration) {
            return res.status(404).json({ message: 'Participant not found' });
        }

        // Update check-in status
        registration.checkedIn = true;
        await registration.save();

        res.status(200).json({ message: 'Check-in successful', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-in', error });
    }
});

// Get all registrations (Admin)
router.get('/', async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrations', error });
    }
});

module.exports = router;
