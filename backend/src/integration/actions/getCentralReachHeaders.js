/**************************************************************************
 *  CentralReach auth helper                                              *
 *  • Caches session HEADERS per user (3-hour TTL)                         *
 *  • Re-uses existing Axios + mini-browser login flow                     *
 **************************************************************************/

const axios = require('axios').default;
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const logger = require('../../services/logger/logger');

// Add plugins for better bot detection avoidance and reCAPTCHA solving
puppeteer
  .use(StealthPlugin())
  .use(
    RecaptchaPlugin({
      provider: { id: '2captcha', token: config.twoCaptcha.apiKey },
      visualFeedback: true,
    }),
  );

const BASE = 'https://login.centralreach.com';
const ROOT = 'https://members.centralreach.com/';
const LOGIN = `${BASE}/login`;
const PING = 'https://members.centralreach.com/crxapieks/reporting/reports/me';

const HEADERS_DB = path.join(__dirname, 'cr-headers.json');

// Load headers from cache
function loadHeadersDB() {
  if (!fs.existsSync(HEADERS_DB)) return [];
  try {
    const arr = JSON.parse(fs.readFileSync(HEADERS_DB, 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Save headers to cache
function saveHeadersDB(arr) {
  fs.writeFileSync(HEADERS_DB, JSON.stringify(arr, null, 2), 'utf8');
}

// Get cached headers for this user (if still valid by TTL).
function getCachedHeaders(email) {
  const db = loadHeadersDB();
  const now = Date.now();

  // purge expired
  const fresh = db.filter(({ exp }) => exp > now);
  if (fresh.length !== db.length) saveHeadersDB(fresh);

  const rec = fresh.find((r) => r.email === email.toLowerCase());
  return rec ? rec.headers : null;
}

// Store (or replace) headers for this user.
function setCachedHeaders(email, headers) {
  const ttlMs = 3 * 60 * 60 * 1000;
  const db = loadHeadersDB().filter((r) => r.email !== email.toLowerCase());

  db.push({
    email: email.toLowerCase(),
    exp: Date.now() + ttlMs,
    headers,
  });
  saveHeadersDB(db);
}

// Probe function (is session alive?)
async function headersStillOK(headers) {
  if (!headers) return false;
  try {
    await axios.get(PING, {
      headers,
      validateStatus: (s) => s === 200,
    });
    return true;
  } catch {
    return false;
  }
}

// Login helpers
function params($form) {
  const p = new URLSearchParams();
  $form.find('input[name]').each((_, el) => {
    const { name, value = '' } = el.attribs;
    p.append(name, value);
  });
  return p;
}

// Handle common popups that appear after login
async function handlePostLoginPopups(page, email) {
  const popupSelectors = [
    '.logged-in-single-device-continue-to-login',
    '.modal-dialog .btn-primary',
    '.alert-dismiss',
    '.notification-close',
    '[data-dismiss="modal"]',
    '.close',
    '.btn-continue',
    '.btn-accept'
  ];

  try {
    // Wait a bit for any popups to appear
    await page.waitForTimeout(2000);

    for (const selector of popupSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        // Ignore individual selector errors and continue
        logger.centralReach('warn', 'Popup selector not found or not clickable', { error, user: { email } });
      }
    }
  } catch (error) {
    logger.centralReach('warn', 'Error handling popups', { error, user: { email } });
  }
}

// Finish with browser
async function finishWithBrowser(
  cbURL,
  jar,
  email,
) {
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: '/usr/bin/google-chrome-stable',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-namespace-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1280,800',
        '--start-maximized'
      ],
    });
    
    [page] = await browser.pages();
    
    // Set user agent to avoid detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Set cookies from jar with improved error handling
    const jarCookies = jar.getCookiesSync(BASE);
    
    for (const c of jarCookies) {
      try {
        await page.setCookie({
          name: c.key, 
          value: c.value,
          domain: c.domain.replace(/^\./, ''), 
          path: c.path,
          httpOnly: c.httpOnly, 
          secure: c.secure,
        });
      } catch (cookieError) {
        logger.centralReach('warn', 'Failed to set cookie', { error: cookieError, user: { email } });
      }
    }

    // Navigate to OAuth callback URL with retry logic
    let navigationSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!navigationSuccess && retryCount < maxRetries) {
      try {
        await page.goto(cbURL, { 
          waitUntil: 'networkidle2', 
          timeout: 45_000
        });
        
        navigationSuccess = true;
        
      } catch (navError) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to navigate after ${maxRetries} attempts: ${navError.message}`);
        }
        
        await page.waitForTimeout(2000); // Wait before retry
      }
    }

    // Wait for page to stabilize
    await page.waitForTimeout(3_000);

    // Handle any popups that might appear
    await handlePostLoginPopups(page, email);

    // Solve any reCAPTCHAs that might appear
    try {
      await page.solveRecaptchas();
    } catch (recaptchaError) {
      logger.centralReach('warn', 'reCAPTCHA solving failed or not needed', { error: recaptchaError, user: { email } });
    }

    // Wait for any final redirects or loading
    await page.waitForTimeout(2000);

    // Get all cookies from all domains
    const newCookies = await page.cookies();

    // Process and store cookies with improved error handling
    for (const c of newCookies) {
      try {
        /* 1. normalise the domain (strip leading dot) */
        const host = c.domain.replace(/^\./, '');

        /* 2. make sure the path starts with "/" */
        const path = c.path.startsWith('/') ? c.path : `/${c.path}`;

        /* 3. always use https – CentralReach cookies are Secure anyway */
        const cookieUrl = `https://${host}${path}`;

        /* 4. write into tough-cookie jar with proper formatting */
        const cookieString = `${c.name}=${c.value}; Domain=${c.domain}; Path=${c.path};` +
          (c.secure ? ' Secure;' : '') +
          (c.httpOnly ? ' HttpOnly;' : '') +
          (c.sameSite ? ` SameSite=${c.sameSite};` : '');

        jar.setCookieSync(cookieString, cookieUrl);
        
      } catch (cookieError) {
        logger.centralReach('warn', 'Failed to store cookie', { error: cookieError, user: { email } });
      }
    }

  } catch (error) {
    throw error;
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.centralReach('warn', 'Error closing browser', { error: closeError, user: { email } });
      }
    }
  }
}

async function freshLogin(email, password, maxRetries = 3) {
  let lastError;
  let lastResponse;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      
      const jar = new CookieJar();
      const client = wrapper(axios.create({ 
        jar, 
        withCredentials: true,
        timeout: 30_000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }));

      // E-mail step
      const { data: html1 } = await client.get(LOGIN);
      const $1 = cheerio.load(html1);
      const form1 = $1('form').first();
      
      if (!form1.length) {
        throw new Error('No login form found on the page');
      }
      
      const p1 = params(form1);
      p1.set('Username', email);

      const r1 = await client.post(
        new URL(form1.attr('action') || LOGIN, BASE).href,
        p1,
        { maxRedirects: 0, validateStatus: () => true },
      );
      
      if (!r1.headers.location && !r1.headers.Location) {
        throw new Error('No redirect after email submission - possible invalid email');
      }
      
      const pwURL = new URL(r1.headers.location || r1.headers.Location, BASE).href;

      // Password step
      const { data: html2 } = await client.get(pwURL);
      const $2 = cheerio.load(html2);
      const form2 = $2('form').first();
      
      if (!form2.length) {
        throw new Error('No password form found on the page');
      }
      
      const p2 = params(form2);
      p2.set('Username', email);
      p2.set('Password', password);
      
      const r2 = await client.post(
        new URL(form2.attr('action'), BASE).href,
        p2,
        { maxRedirects: 0, validateStatus: () => true }, // Capture all responses
      );

      // Store the response for error logging
      lastResponse = r2;

      if (!r2.headers.location && !r2.headers.Location) {
        const error = new Error('No redirect after password submission - possible invalid credentials');
        error.response = r2;
        throw error;
      }
      

      // Follow OAuth callback chain inside a *browser*
      const cbURL = new URL(
        r2.headers.location || r2.headers.Location,
        BASE,
      ).href;
      
      await finishWithBrowser(cbURL, jar, email);

      // Build headers object we need to return & cache
      const cookies = jar.getCookiesSync(ROOT);
      
      if (!cookies || cookies.length === 0) {
        throw new Error('No cookies received after login - authentication may have failed');
      }
      
      const cookieStr = cookies.map((c) => `${c.key}=${c.value}`).join('; ');
      const csrf = cookies.find((c) => c.key.toLowerCase() === 'csrf-token');

      const headers = {
        Cookie: cookieStr,
        'X-Requested-With': 'XMLHttpRequest',
        Referer: ROOT,
        'x-crapi-clientsource': 'members-spa',
        ...(csrf ? { 'x-csrf-token': decodeURIComponent(csrf.value) } : {}),
      };

      return {
        headers,
        axios: client, // optional, unused by cache
      };

    } catch (error) {
      lastError = error;
      
      // Attach response data to error if available
      if (lastResponse && !error.response) {
        error.response = lastResponse;
      }
      
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  const finalError = new Error(`Login failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  finalError.originalError = lastError;
  if (lastError?.response) {
    finalError.response = lastError.response;
  }
  throw finalError;
}

// Public helper
async function getCentralReachHeaders(email, password, options = {}) {
  const { 
    maxRetries = 3, 
    skipCache = false,
  } = options;

  try {

    // Try cache first (unless explicitly skipped)
    if (!skipCache) {
      let headers = getCachedHeaders(email);
      if (headers) {
        if (await headersStillOK(headers)) {
          return { headers, source: 'cache' };
        }
      }
    }

    // Cache miss or expired → fresh login
    const { headers: freshHeaders } = await freshLogin(email, password, maxRetries);
    
    // Cache fresh headers
    setCachedHeaders(email, freshHeaders);
    return { headers: freshHeaders, source: 'fresh_login' };
  } catch (error) {
    // Include more context in the error
    const enhancedError = new Error(
      `Failed to get CentralReach headers for ${email}: ${error.message}`
    );
    enhancedError.originalError = error;
    enhancedError.email = email;
    enhancedError.timestamp = new Date().toISOString();
    
    // Pass through response data if available
    if (error.response) {
      enhancedError.response = error.response;
    }
    
    throw enhancedError;
  }
}

module.exports = { getCentralReachHeaders };
