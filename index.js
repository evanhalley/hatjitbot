'use strict';

//const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

//dotenv.config()

const app = express();
app.use(bodyParser.json());

app.post('/groom', async (req, res) => {
    console.log('New grooming request!');

    try {
        console.log(req.body);
        const userName = req.body.user_name;
        const url = await getGroomRoomUrl();
        const reply = {
            "text": `Hello ${userName} here is your new Hatjitsu room as requested: ${url}`
        };
        res.json(reply);
    } catch (e) {
        console.error('Error getting a Hatjitsu room', e);
        res.status(500).send('Something bad happened. Check the logs!');
    }
});

async function getGroomRoomUrl() {
    let url = null;
    let browser = null;
    let page = null;

    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        page = await browser.newPage();
        console.log('Opening hatjitsu...');
        await page.goto('http://hatjitsu.herokuapp.com/');
        await page.waitForSelector('#createRoom');
        console.log('Creating new room...');
        await page.click('#createRoom');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        url = page.url();
        console.log(`Url to new room ${url}`);
    } catch (e) {
        console.log(e);
    } finally {
        if (page) await page.close();
        if (browser) await browser.close();
    }
    return url;
}

const listener = app.listen(process.env.PORT || 3000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});