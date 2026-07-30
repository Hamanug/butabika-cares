const axios = require('axios');

const EGOSMS_API_URL = 'https://comms.egosms.co/api/v1/json/';

const getSenderId = (phoneNumber) => {
  try {
    if (!phoneNumber) return 'SMSAlert';
    const prefix = phoneNumber.substring(3, 5);
    const mtnPrefixes = ['77', '78', '76', '39', '31'];
    return mtnPrefixes.includes(prefix) ? 'MSG-ALERT' : 'SMSAlert';
  } catch (e) {
    return 'SMSAlert';
  }
};

const sendOTP = async (phoneNumber, code, context = 'signup') => {
  try {
    const senderId = getSenderId(phoneNumber);
    
    const payload = {
      method: "SendSms",
      userdata: {
        username: process.env.EGOSMS_USERNAME,
        password: process.env.EGOSMS_PASSWORD
      },
      msgdata: [
        {
          number: phoneNumber,
          message: context === 'signup' 
            ? `Welcome to the Butabika Cares system. Your OTP to finish your sign up is: ${code}`
            : `Your password recovery OTP for Butabika Cares is: ${code}`,
          senderid: senderId
        }
      ]
    };
    
    const response = await axios.post(EGOSMS_API_URL, payload);
    
    if (response.data && response.data.Status === 'Failed') {
      throw new Error(`EgoSMS API Error: ${response.data.Message}`);
    }

    return response.data;
  } catch (error) {
    console.error("EgoSMS Delivery Failed:", error.response?.data || error.message);
    throw error;
  }
};

const sendGenericSMS = async (phone, message) => {
  // If no SMS credentials, mock it cleanly to the console
  if (!process.env.EGOSMS_USERNAME || !process.env.EGOSMS_PASSWORD) {
    console.log('\n=== MOCK GENERIC SMS ===');
    console.log(`To: ${phone}\nMessage: ${message}`);
    console.log('========================\n');
    return { status: 'mock_success' };
  }
  
  // Execute real EgoSMS logic here if credentials exist
  const axios = require('axios');
  const payload = {
    method: "SendSms",
    userdata: {
      username: process.env.EGOSMS_USERNAME,
      password: process.env.EGOSMS_PASSWORD
    },
    msgdata: [{
      number: phone,
      message: message,
      senderid: process.env.EGOSMS_SENDER_ID || "Butabika"
    }]
  };
  return await axios.post('https://www.egosms.co/api/v1/json/', payload);
};

module.exports = { sendOTP, sendGenericSMS };
