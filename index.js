'use strict';

const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://github.com';

function launchChrome(){
    return chromeLauncher.launch({
        chromePath: CHROME_PATH,
        startingUrl: TARGET_URL,
        chromeFlags: ['--headless', '--disable-gpu'],
        port: 9222
    });
}

async function example(launcher) {
    try {
        // connect to endpoint
        var client = await CDP();
        // extract domains
        const {Page, DOM} = client;
        
        await Promise.all([Page.enable(), DOM.enable()]);
        await Page.navigate({url: TARGET_URL});
        await Page.loadEventFired();
        const rootDocument = await DOM.getDocument();
        const formNode = await DOM.querySelector({nodeId: rootDocument.root.nodeId, selector: 'form'});
        const formHtml = await DOM.getOuterHTML({nodeId: formNode.nodeId});
        
        console.log(formHtml.outerHTML);
    } catch (err) {
        console.error(err);
    } finally {
        if (client) {
            await client.close();
        }
        // quit chrome
        launcher.kill();
    }
}

launchChrome().then(launcher => {
    example(launcher);
}).catch(err => {
    console.error(err);
});
