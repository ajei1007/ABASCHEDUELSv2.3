const axios = require('axios');

async function sendToSlack(webhookUrl, text) {
  const payload = {
    text: text
  };

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status != 200) {
      console.error(`Slack API responded with status ${response.status}`);
    }

  } catch (error) {
    console.error('Error sending message to Slack:', error.response?.data || error.message);
  }
}

module.exports = {
  sendToSlack,
};