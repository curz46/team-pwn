window.browser = (() => window.msBrowser || window.browser || window.chrome)();
window.browser = wrapAPIs(window.browser);

const OPGG_URL = 'https://euw.op.gg/summoner/userName=';

function asArray(nodeList) {
    return [].slice.call(nodeList);
}

browser.browserAction.onClicked.addListener(async () => {
    const [currentTab] = await browser.tabs.query({active: true, currentWindow: true});
    let names;
    try {
        names = await browser.tabs.sendMessage(currentTab.id, {text: 'get_players'});
    } catch (e) {
        console.log(e);
        return;
    }
    if (! names) {
        return;
    }

    // Open multi-query OP.GG in new tab
    const targetURL = OPGG_URL + names.join(',');
    const _newTab = browser.tabs.create({active: true, url: targetURL});
});