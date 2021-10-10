// jshint esversion:8

const puppeteer = require('puppeteer-extra');
const fs = require('fs');


// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


// Define functions for each step of getting the files:
// 1. Log in
// 2. Navigate to the Activities page
// 3. Filter by date range
// 4. For each filtered activity, download the fit file to the temp folder

async function logInGConnect(details, page) {
    const email = details.email;
    const pwd = details.pwd;
    await page.goto('https://connect.garmin.com/signin/', {
      waitUntil: 'networkidle2',
    });
    await page.viewport({
      width: 1920,
      heigh: 1080
    });
    await page.waitForSelector("iframe");

    // Select the iframe for the login (I think there's only one iframe on the sign in page)
    const elementHandle = await page.$('iframe');

    // Set frame to handle the iframe content
    const frame = await elementHandle.contentFrame();

    // Set username and password field elements within the login iframe
    await frame.waitForSelector('#username');
    const username = await frame.$('input#username');
    const password = await frame.$('input#password');

    // Type login details into the login fields
    await username.type(email);
    await password.type(pwd);

    // Pressing Enter on the password line seemed more reliable than trying to click the login button
    await page.keyboard.press('Enter');

    await frame.waitForNavigation({
      waitUntil: 'networkidle0'
    });
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded'
    });

    await page.screenshot({
      path: './example.png',
      fullPage: true
    });

    // await browser.close();
  }
async function navToActivities(page) {
  await page.goto("https://connect.garmin.com/modern/activities?activityType=cycling", {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector(".slide-filter-btn.btn.btn-small");
  const advancedButton = await page.$(".slide-filter-btn.btn.btn-small");
  await advancedButton.click();

  await page.waitForSelector('#from-date-id');
  const fromDate = await page.$("#from-date-id");
  console.log(fromDate);
  // This console log seems to provide a delay so that the button click works
  // console.log(advancedButton);
  await fromDate.type("10/04/2021");







  // const fromDate = await page.$eval('#from-date-id', el => el.value);

  // const toDate = page.$("#to-date-id");


  // await toDate.type("10/07/2021");


}

async function filterActivitiesByDate( page) {
  await page.waitForSelector("#from-date-id");
  await page.waitForSelector("#to-date-id");

  const fromDate = page.$("#from-date-id");
  const toDate = page.$("#to-date-id");

  await fromDate.type("10/04/2021");
  await toDate.type("10/07/2021");
}


    (async function downloadEachFilteredActivity() {})();

// Wrapper function for the above steps
async function wrapper() {
  // --start-fullscreen allows me to see what puppeteer is actually doing which helps
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--start-fullscreen']
  });
  const page = await browser.newPage();

  const details = {
    email: "will.haynes@virgin.net",
    pwd: "Herbalife24"
  };
  await logInGConnect(details, page);
  await navToActivities(page);
  // await filterActivitiesByDate(page);
}

// Export wrapper function
wrapper();

exports.scrapeFiles = wrapper;
