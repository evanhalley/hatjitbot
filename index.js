'use strict';

const { RTMClient } = require('@slack/rtm-api');
const puppeteer = require('puppeteer');
const express = require('express');

const MAGIC_WORDS = [ 'size', 'groom', 'grooming' ];
const rtm = new RTMClient(process.env.BOT_TOKEN);

// for heroku deployment, bind to the port and do nothing
if (process.env.PORT) {
    const app = express();
    app.listen(process.env.PORT, console.log('Bind successful'));
}

rtm.on('message', async (event) => {

    if (new RegExp(MAGIC_WORDS.join("|")).test(event.text)) {
        console.log('New grooming request!');
        await rtm.sendTyping(event.channel);
        let url = await getGroomRoomUrl();

        if (url) {
            console.log(`Grooming request fulfilled ${url}`);
            await rtm.sendMessage(`Your new story sizing room awaits ${url}`, event.channel);
        } else {
            console.log('Some bad happened');
            await rtm.sendMessage('Something went wrong...embarrasing :-(', event.channel);
        }
    } else {
        await rtm.sendTyping(event.channel);
        await rtm.sendMessage(`I'm not much of a conversationalist, but you can use any of the following words to get a new hatjitsu room: ${MAGIC_WORDS}`, event.channel);
    }
});

rtm.on('error', event => console.error(event));

(async () => {
    // Connect to Slack
    const { self, team } = await rtm.start();
})();

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