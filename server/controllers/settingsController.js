const mongoose = require('mongoose');
const Settings = require('../models/Settings');

// Helper to check DB connectivity
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get platform settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: {
          companyName: 'Joy Guru Tours & Travels (Offline Mode)',
          supportPhone: '+91 94350 12345',
          supportWhatsapp: '+91 94350 12345',
          supportEmail: 'info@joygurutravels.com',
          officeAddress: 'Club Road, Silchar, Assam - 788001',
          refundPolicy: 'No refund within 24 hours of scheduled travel date.',
          promoCouponCode: 'JOYGURU10',
          minAdvancePercent: 25
        }
      });
    }

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings (Admin View)
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: req.body
      });
    }

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }

    settings.companyName = req.body.companyName !== undefined ? req.body.companyName : settings.companyName;
    settings.supportPhone = req.body.supportPhone !== undefined ? req.body.supportPhone : settings.supportPhone;
    settings.supportWhatsapp = req.body.supportWhatsapp !== undefined ? req.body.supportWhatsapp : settings.supportWhatsapp;
    settings.supportEmail = req.body.supportEmail !== undefined ? req.body.supportEmail : settings.supportEmail;
    settings.officeAddress = req.body.officeAddress !== undefined ? req.body.officeAddress : settings.officeAddress;
    settings.refundPolicy = req.body.refundPolicy !== undefined ? req.body.refundPolicy : settings.refundPolicy;
    settings.promoCouponCode = req.body.promoCouponCode !== undefined ? req.body.promoCouponCode : settings.promoCouponCode;
    settings.minAdvancePercent = req.body.minAdvancePercent !== undefined ? parseInt(req.body.minAdvancePercent) : settings.minAdvancePercent;

    settings.updatedAt = Date.now();
    const updatedSettings = await settings.save();

    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
