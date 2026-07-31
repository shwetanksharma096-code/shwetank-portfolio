const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  // Set session storage to bypass login
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    sessionStorage.setItem('shwetank_admin_auth', '1');
    window.location.href = '/admin';
  });
  
  // Wait a bit for it to crash
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await browser.close();
})();
