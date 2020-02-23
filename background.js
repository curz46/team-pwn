window.browser = (() => window.msBrowser || window.browser || window.chrome)();

const OPGG_URL = 'https://euw.op.gg/summoner/userName=';

function asArray(nodeList) {
    return [].slice.call(nodeList);
}

browser.browserAction.onClicked.addListener(async () => {
    const [currentTab] = await browser.tabs.query({active: true, currentWindow: true});
    const urls  = await browser.tabs.sendMessage(currentTab.id, {text: 'get_players'});

    alert();
    console.log(urls);
    
    const names = [];

    for (const url of urls) {
        // 1. Get request using fetch
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        let profileHTML = xhr.responseText;
        
        // 2. Create fake DOM object & get summoner name
        let fakeDOM = document.createElement('html');
        fakeDOM.innerHTML = profileHTML;

        // Note: NSE-specific, need to refactor
        const allDataRows = fakeDOM.querySelectorAll('.event-details-table-row');
        for (const dataRow of asArray(allDataRows)) {
            if (dataRow.querySelector('.event-details-table-title').innerText == "Summoner Name") {
                const name = dataRow.querySelector('.event-details-table-value').innerText;
                names.push(name);
                break;
            }
        }
    }

    // Open multi-query OP.GG in new tab
    const targetURL = OPGG_URL + names.join(',');
    const _newTab = browser.tabs.create({active: true, url: targetURL});
});