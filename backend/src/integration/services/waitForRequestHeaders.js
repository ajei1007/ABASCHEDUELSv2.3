const waitForRequestHeaders = (page, urlToIntercept) => {
  return new Promise((resolve) => {
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();

      if (url.includes(urlToIntercept)) {
        const headers = interceptedRequest.headers();
        resolve(headers);
      }
    });
    page.on('error', (error) => {
      console.error('ERR', error);
    });
  });
};

module.exports = waitForRequestHeaders;
