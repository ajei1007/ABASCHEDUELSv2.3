const axios = require('axios');

const serverURL = 'https://api.theralytics.net';
const OriginURL = 'https://adastra.theralytics.net';
const Businesstoken = '9t1oMeOtmoCOg96/DJNjmQ==';

const reqHeaders = {
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'en-US,en;q=0.9',
  Connection: 'Keep-Alive',
  'Content-Type': 'application/json',
  Host: 'api.theralytics.net',
  LocationID: '0',
  Offset: '-240',
  Origin: OriginURL,
  Referer: OriginURL,
  Businesstoken: Businesstoken,
}

module.exports = class AuthTheralytics {
  static async doLogin(userCreds) {
    try {
      const config = {
        headers: {
          ...reqHeaders,
          IPAddress: userCreds.ipaddress,
        },
      };

      const payload = {
        userName: userCreds.username,
        password: userCreds.password,
        ipaddress: userCreds.ipaddressm,
        macaddress: 'ec:aa:a0:2d:dc:67', // TODO Get mac address from the user
      }

      let loginResponse = null;
      if (userCreds?.QuestionID && userCreds?.Answer) {
        payload.QuestionID = userCreds?.QuestionID;
        payload.Answer = userCreds?.Answer;

        loginResponse = await axios.post(`${serverURL}/Login/CheckQuestionAnswer`, payload, config);
      } else {
        loginResponse = await axios.post(`${serverURL}/Login/login`, payload, config);
      }
      
      const resData = loginResponse?.data
      if (!resData) {
        throw new Error('Something went wrong!')
      }

      if (resData?.statusCode !== 200 && resData?.statusCode !== 0) {
        const errorMsg = resData?.message;
        if (errorMsg) {
          throw new Error(errorMsg)
        }
        throw new Error('Invalid credentials!')
      }

      if (resData?.message && Array.isArray(resData.data)) {
        return {
          question: resData.message,
          answers: resData.data
        }
      }

      // Check if login was successful and a token was received
      const token = resData?.access_token ?? null;

      return { token };
    } catch (error) {
      throw error;
    }
  }
};
