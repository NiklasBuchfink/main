const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

exports.handler = async (event, context) => {

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (event.url === null) {
    return { statusCode: 400, body: 'Bad Request' };
  }

  // extract linkkedIn profil handle for the given url
  const extractLinkedInProfilHandle = (url) => {
    const urlSplit = url.split('/');
    return urlSplit[urlSplit.length - 2];
  }
  const profileHandle = extractLinkedInProfilHandle(event.url);

  puppeteer.launch({ headless: false, devtools: false })
    .then(async (browser) => {
      let page = await browser.newPage()
      page.setViewport({ width: 1366, height: 768 });

      // diasble javascript
			await page.setRequestInterception(true);
			page.on('request', request => {
				if (request.resourceType() === 'script' || request.isNavigationRequest() && request.redirectChain().length !== 0)
					request.abort();
				else
					request.continue();
			});
      
      // go on google
      await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('input[name="q"]')

      // click cookie denied button
      await page.click('button[id="W0wltc"]');
      
      // click input search
      await page.click('input[name="q"]');
      await page.type('input[name="q"]', `site:linkedin.com/in/${profileHandle}`)
      await page.keyboard.press('Enter')
      await page.waitForSelector('.yuRUbf > a > .LC20lb')

      // click on the first result in the search
      await page.click('.yuRUbf > a > .LC20lb')    
      let selector = await page.$('.yuRUbf > a > .LC20lb');
      if (selector!=null) {
          let element = selector.asElement();
          await element.click();
      }
      
      // get the data
      await page.waitForSelector('.hidden-summary__summary-items')
        .then(() => {
          const content = page.content();
          console.log(content);
          content
            .then((success) => {
              const $ = cheerio.load(success)
							const name = $('.top-card-layout__title').text().trim();
							const tagline = $('.top-card-layout__headline').text().trim();
							const proileImage = $('.top-card-layout__entity-image').attr('data-delayed-url');
							const bio = $('section.summary div.core-section-container__content p').text();

							// lists
							let experience = [];
							let education = [];
							let volunteeringExperience = [];
							let certifications = [];
							let patents = [];
							let languages = [];
							let recommendations = [];

							experience = $('li.experience-item').map((i, el) => {
								const title = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const company = $(el).find('.profile-section-card__subtitle').text().replace(/\s\s+/g, '').trim();
								const companyImage = $(el).find('.artdeco-entity-image').attr('data-delayed-url');
								const startdate = $(el).find('.date-range time:nth-child(1)').text().trim();
								let enddate = $(el).find('.date-range time:nth-child(2)').text().trim();
								const duration = $(el).find('.date-range__duration').text().trim();
								if (!enddate) {
									let fulldate = $(el).find('.date-range').text().replace(/\s\s+/g, '').trim();
									enddate = fulldate.replace(startdate, '').replace(duration, '').substring(1).trim();
								}
								const daterange = startdate + '-' + enddate;
								const date = {
									startdate,
									enddate,
									daterange,
									duration
								}
								const location = $(el).find('.experience-item__location').text().replace(/\s\s+/g, '').trim();
								const description = $(el).find('.show-more-less-text__text--less').text().replace(/\s\s+/g, '').trim();
								return { title, company, companyImage, date, location, description };
							}).get();

							education = $('li.education__list-item').map((i, el) => {
								const title = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const educationImage = $(el).find('.artdeco-entity-image').attr('data-delayed-url');
								const degree = $(el).find('.profile-section-card__subtitle span:nth-child(1)').text().trim();
								const subject = $(el).find('.profile-section-card__subtitle span:nth-child(2)').text().trim();
								const grade = $(el).find('.profile-section-card__subtitle span:nth-child(3)').text().trim();
								const startdate = $(el).find('.date-range time:nth-child(1)').text().trim();
								const enddate = $(el).find('.date-range time:nth-child(2)').text().trim();
								const daterange = $(el).find('.date-range').text().trim();
								const date = {
									startdate,
									enddate,
									daterange
								}
								const description = $(el).find('div.education__item--details').text().replace(/\s\s+/g, '').replace(/\n/g,'. ').replace('Mehr anzeigenWeniger anzeigen','').trim();
								return { title, educationImage, degree, subject, grade, date, description };
							}).get();

							volunteeringExperience = $('ul.volunteering__list li.profile-section-card').map((i, el) => {
								const title = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const volunteering = $(el).find('.profile-section-card__subtitle').text().trim();
								const volunteeringImage = $(el).find('.artdeco-entity-image').attr('data-delayed-url');
								const startdate = $(el).find('.date-range time:nth-child(1)').text().trim();
								let enddate = $(el).find('.date-range time:nth-child(2)').text().trim();
								const duration = $(el).find('.date-range__duration').text().trim();
								if (!enddate) {
									let fulldate = $(el).find('.date-range').text().replace(/\s\s+/g, '').trim();
									enddate = fulldate.replace(startdate, '').replace(duration, '').substring(1).trim();
								}
								const daterange = startdate + '-' + enddate;
								const date = {
									startdate,
									enddate,
									daterange,
									duration
								}
								const field = $(el).find('.volunteering__item--cause').text().trim();
								const description = $(el).find('.show-more-less-text__text--less').text().replace(/\s\s+/g, '').trim();
								return { title, volunteering, volunteeringImage, date, field, description };
							}).get();

							certifications = $('ul.certifications__list li.profile-section-card').map((i, el) => {
								const title = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const certification = $(el).find('.profile-section-card__subtitle').text().trim();
								const certificationImage = $(el).find('.artdeco-entity-image').attr('data-delayed-url');
								const issued = $(el).find('span.certifications__start-date time').text().trim();
								const validUntil = $(el).find('span.certifications__end-date time').text().trim();
								return { title, certification, certificationImage, issued, validUntil };
							}).get();

							patents = $('ul.patents__list li.profile-section-card').map((i, el) => {
								const title = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const location = $(el).find('.profile-section-card__subtitle span:nth-child(1)').text().trim();
								const number = $(el).find('.profile-section-card__subtitle span:nth-child(2)').text().trim();
								return { title, location, number };
							}).get();

							languages = $('ul.languages__list li.profile-section-card').map((i, el) => {
								const language = $(el).find('.profile-section-card__title').text().replace(/\s\s+/g, '').trim();
								const proficiency = $(el).find('.profile-section-card__subtitle').text().replace(/\s\s+/g, '').trim();
								return { language, proficiency };
							}).get();

							recommendations = $('li.recommendations__list-item').map((i, el) => {
								const person = $(el).find('h3.base-main-card__title').text().replace(/\s\s+/g, '').trim();
								const recommendation = $(el).find('.endorsement-card__content').text().replace(/\s\s+/g, '').trim();
								return { person, recommendation };
							}).get();

							const profile = {
								profileHandle,
								name,
								tagline,
								proileImage,
								bio,
								experience,
								education,
								volunteeringExperience,
								certifications,
								patents,
								languages,
								recommendations
							}

              return {
                statusCode: 200,
                body: JSON.stringify(profile)
              }
            })
            .catch((error) => {
              console.log(error);
              return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to scrape LinkedIn profile.'})
              }
            })
            .then(() => {
              browser.close()
              console.log('Browser closed');
            })
        })
    })
    .catch((err) => {
      console.log(" CAUGHT WITH AN ERROR ", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to scrape LinkedIn profile.'})
      }
    }
  )
}
