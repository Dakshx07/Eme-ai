const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['ambulance', 'police', 'fire', 'poison', 'suicide', 'domestic'],
    required: true 
  },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  description: { type: String },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);

// controllers/emergencyContactController.js
const EmergencyContact = require('../models/EmergencyContact');

exports.createDefaultContacts = async () => {
  const defaultContacts = [
    {
      type: 'ambulance',
      name: 'National Ambulance',
      phoneNumber: '102',
      description: 'Emergency Medical Services',
      isDefault: true
    },
    {
      type: 'police',
      name: 'Police Emergency',
      phoneNumber: '100',
      description: 'Police Helpline',
      isDefault: true
    },
    {
      type: 'fire',
      name: 'Fire Department',
      phoneNumber: '101',
      description: 'Fire Emergency Services',
      isDefault: true
    },
    {
      type: 'poison',
      name: 'Poison Control',
      phoneNumber: '1-800-222-1222',
      description: 'National Poison Control Helpline',
      isDefault: true
    },
    {
      type: 'suicide',
      name: 'Suicide Prevention Helpline',
      phoneNumber: '988',
      description: 'National Suicide Prevention Helpline',
      isDefault: true
    },
    {
      type: 'domestic',
      name: 'Domestic Violence Helpline',
      phoneNumber: '1-800-799-7233',
      description: 'Support for Domestic Violence Victims',
      isDefault: true
    }
  ];

  try {
    // Check if default contacts already exist
    const existingContacts = await EmergencyContact.countDocuments({ isDefault: true });
    if (existingContacts === 0) {
      await EmergencyContact.insertMany(defaultContacts);
      console.log('Default emergency contacts created');
    }
  } catch (error) {
    console.error('Error creating default emergency contacts:', error);
  }
};

exports.getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ 
      $or: [
        { isDefault: true },
        { country: req.user.country } // Assuming user's country is stored
      ]
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency contacts', error });
  }
};

exports.addCustomContact = async (req, res) => {
  try {
    const { name, phoneNumber, type } = req.body;
    const newContact = new EmergencyContact({
      name,
      phoneNumber,
      type,
      country: req.user.country, // User's country
      isDefault: false
    });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Error adding contact', error });
  }
};

// routes/emergencyContactRoutes.js
const express = require('express');
const router = express.Router();
const emergencyContactController = require('../controllers/emergencyContactController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, emergencyContactController.getEmergencyContacts);
router.post('/custom', authMiddleware, emergencyContactController.addCustomContact);

module.exports = router;

// In app.js, add the route
app.use('/api/emergency-contacts', emergencyContactRoutes);

// In server startup (e.g., after database connection)
const emergencyContactController = require('./controllers/emergencyContactController');
emergencyContactController.createDefaultContacts();
