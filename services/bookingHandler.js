const constants = require('../constants');
const puppeteer = require('puppeteer');
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const datepicker = require('jquery-datepicker');

const isProduction = process.env.NODE_ENV === 'production' ? true : false;
const isDev = !isProduction;
const authenticationError = 'Failed the authentication process';
const bookingError = 'Failed the booking process';


async function startBrowser() {
  let browser = null;
  let context = null;
  let page = null;
  if (isProduction) {
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    page = await browser.newPage();
  } else {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      slowMo: 75,
      args: [
        '--auto-open-devtools-for-tabs',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
      ],
    });
    context = await browser.createIncognitoBrowserContext();
    page = await context.newPage();
  }
  return { browser, page };
}

async function doLogIn(page, webSiteUser, webSitePassword) {
  console.log(constants.loginEndpoint);
  await page.goto(constants.baseUrl + constants.loginEndpoint, {
    timeout: constants.timeOut,
    waitUntil: 'load',
  });
  isDev && console.log('Navigation to Landing Page Succeeded!!!');


  await page.type('#Username', webSiteUser);
  await page.type('#Password', webSitePassword);
  await page.click('#loginBtn');
  isDev && console.log('Login submitted');

  // await page.waitForSelector('#sidebar');
  isDev && (await page.screenshot({ path: 'screenshots/home-page.png' }));

  return 1;
}

async function findLink(page, endpoint) {
  const pageLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'), (a) =>
      a.getAttribute('href')
    )
  );
  return pageLinks.includes(endpoint) || null;
}

//The booking process in this case is a wizard with the following steps:
//1. Fill in the General Info
//2. Fill in the Date form a picker
//3. Fill in the Time from a list of time items
async function doBooking(page, preferTime) {
  let bookingOutcome = '';

  await fillInGeneralInfo(page).catch(
   
    (error) => (bookingOutcome = `Error on General Info:: ${error}`)
  );
  bookingOutcome === '' &&
    (await fillInDatePicker(page).catch(
      (error) => (bookingOutcome = `Error on Date Picker:: ${error}`)
    ));
  bookingOutcome === '' &&
    (await fillinAvailibity(page, preferTime).catch(
      (error) => (bookingOutcome = `Error on Times Available:: ${error}`)
    ));
  return bookingOutcome;
}

//1. Fill in the General Info
//Since the log in was succeeded, move to the wizard page
//There could be some prefilled info, use Puppeteer for filling the remaining
//in this case, there is a dropdown displayed, in it the option picked it #3
async function fillInGeneralInfo(page) {
      await page.click('#lnkNewBooking');
      await page.waitForTimeout(2000);

  // use manually trigger change event
  await page.evaluate(() => {
    document.querySelector(
      `#SelectedAmenityGroup > option:nth-child(8)`
    ).selected = true;
    element = document.querySelector('#SelectedAmenityGroup');
    const event = new Event('change', { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
  });

  
}

//2. Fill in the Date form a picker
//Wait for the date picker to be displayed, in this example the auto-booking
//is performed a week from today, so assemble the date with a "+7"
//At the end, pick the date a week from today and click on it
//Note: the logic for excluding, for instance, weekends, can be added here or
//in a cronjob, service, node job, etc
async function fillInDatePicker(page) {

  
  await page.evaluate(() => {
    var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var day =(currentDate.getDate());
    var month =(currentDate.getMonth() + 1);
    var year = (currentDate.getFullYear());
    var tomDate =(month.toString() + '/' + day.toString() + '/' + year.toString());
    console.log(tomDate);
      $('#TimeSlotDateOption').val(tomDate);
  });

    

  await page.waitForTimeout(1000);
}

//3. Fill in the Time from a list of time items
//Wait for the next(or last in this case) step of the wizard
//In case of having a preferred time for the bookings, and it is available
//take it, otherwise, take the very first matching element
//Note: this scenario is flexible(if slot not available pick the first available),
//in case it is required exactly at a time, some checking additional logic could be included here
async function fillinAvailibity(page) {
    await page.click(`#btnCheckAvailability`);
    await page.waitForTimeout(2000);
    // await page.click(`.ui-button-text-only`);
    await page.click(`#amenity4157`);
    await page.waitForTimeout(500);
     // use manually trigger change event
  await page.evaluate(() => {
    // var value = $('#timeSlotDropdown option').eq(1).val();
    // $(`#timeSlotDropdown option[value="${value}"]`).attr('selected','selected');
    document.querySelector(
      '#timeSlotDropdown option:nth-child(3)'
    ).selected = true;
    element = document.querySelector('#timeSlotDropdown');
    const event = new Event('change', { bubbles: true });
    event.simulated = true;
    element.dispatchEvent(event);
    
  });
    await page.click(`#SendReminder`);
    await page.click(`#btnConfirmDetailsNext`);
  await page.waitForTimeout(2000);
}
async function getTomorrowsDate(){
  var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  var day = currentDate.getDate()
  var month = currentDate.getMonth() + 1
  var year = currentDate.getFullYear()
    return  month.toString() + '/' + day.toString() + '/' + year.toString();
}


async function closeBrowser(browser) {
  return browser.close();
}

async function bookMe(webSiteUser, webSitePassword) {
  try {
    const { browser, page } = await startBrowser();
    const isLoggedIn = await doLogIn(page, webSiteUser, webSitePassword);
    isDev && console.log(`Is user logged in?:: ${isLoggedIn}`);


    closeBrowser(browser);
    return isLoggedIn;
  } catch (err) {
    console.log(`Puppeteer Error Detected -> ${err}`);
    return `Error:: ${err}`;
  }
}

async function myBookings(webSiteUser, webSitePassword, preferTime) {
  try {
    const { browser, page } = await startBrowser();
    const isLoggedIn = await doLogIn(page, webSiteUser, webSitePassword);
    isDev && console.log(`Is user logged in?:: ${isLoggedIn}`);
    let upcomingBookings = '';

    if (isLoggedIn) {
      await page.goto(constants.baseUrl + constants.bookingEndpoint);
      await page.waitForTimeout(2000);

      upcomingBookings = await doBooking(page, preferTime);
      isDev && (await page.screenshot({ path: 'screenshots/booking.png' }));
      isProduction && (await page.click(`#btnFinalize`));
    
      isDev && console.log('Booking submitted');
      
    }
    isProduction && closeBrowser(browser);
    return upcomingBookings;
  } catch (err) {
    console.log(`Puppeteer Error Detected -> ${err}`);
    return `Error:: ${err}`;
  }
}

module.exports = {
  bookMe,
  myBookings,
};
