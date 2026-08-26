const express = require('express');
const router = express.Router();
const { createPreference, receiveWebhook } = require('../controllers/payment.controller');

router.post('/create-preference', createPreference);
router.post('/webhook', receiveWebhook);

module.exports = router;