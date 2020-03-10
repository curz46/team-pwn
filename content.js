window.browser = (() => window.msBrowser || window.browser || window.chrome)();

const OPGG_URL = 'https://euw.op.gg/summoner/userName=';

const NSE_TEAM_URL    = new RegExp('http(?:s?):\/\/tournaments.nse.gg\/tournaments\/([A-z0-9-]+)\/teams\/([A-z0-9-]+).*');
const NSE_MATCHES_URL = new RegExp('http(?:s?):\/\/tournaments.nse.gg\/tournaments\/([A-z0-9-]+)\/matches\/(\\d+).*');

const NUEL_BASE_URL      = 'https://thenuel.com';
const NUEL_COMPANION_URL = new RegExp('http(?:s?):\/\/thenuel.com\/companion?tournamentId=(\\d+)&.*');
const NUEL_TEAM_URL      = new RegExp('http(?:s?):\/\/thenuel.com\/team\/(\\d+).*');

function asArray(nodeList) {
    return [].slice.call(nodeList);
}

const PROFILE_URL_GETTERS = [
    [NSE_TEAM_URL, doc => {
        const links = asArray(doc.querySelectorAll('.table-players a'));
        return links.map(l => l.href);
    }],
    [NSE_MATCHES_URL, doc => {
        // Get name of currently logger-in user
        const [{innerHTML: name}, ..._rest] = doc.querySelectorAll('.nav-body-bottom .nav-item-title h4');

        const [teamATable, _middle, teamBTable] = doc.querySelectorAll('.event-details-table');
        for (const table of [teamATable, teamBTable]) {
            const links = asArray(table.querySelectorAll('.match-team-player a'));
            const containsCurrentUser = links.map(l => l.innerHTML.toLowerCase().trim()).includes(name.toLowerCase().trim());
            if (! containsCurrentUser) {
                return links.map(l => l.href);
            }
        }
    }],
    [NUEL_COMPANION_URL, doc => {
        const {href}  = doc.querySelector('.page-heading a'); // in the form '/team/xxxxxx'
        const teamURL = NUEL_BASE_URL + href;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', teamURL, false);
        xhr.send(null);
        let profileHTML = xhr.responseText;
        
        // 2. Create fake DOM object & get summoner name
        let fakeDOM = doc.createElement('html');
        fakeDOM.innerHTML = profileHTML;

        return PROFILE_URL_GETTERS[NUEL_TEAM_URL](fakeDOM);
    }],
    [NUEL_TEAM_URL, doc => {
        const links = asArray(doc.querySelectorAll('article.content-pane a[target]'));
        return links.map(link => link.href);
    }]
];

function fetchNamesFromNSE(urls) {
    return urls.map(url => {
        // 1. Get request using XMLHttpRequest()
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        let profileHTML = xhr.responseText;
        
        // 2. Create fake DOM object & get summoner name
        let fakeDOM = document.createElement('html');
        fakeDOM.innerHTML = profileHTML;

        // Note: NSE-specific, need to refactor
        const allDataRows = fakeDOM.querySelectorAll('.event-details-table-row');
        for (const dataRow of asArray(allDataRows)) {
            if (dataRow.querySelector('.event-details-table-title').innerText == 'Summoner Name') {
                return dataRow.querySelector('.event-details-table-value').innerText;
            }
        }
    });
}

function extractNamesFromNUEL(urls) {
    return urls.map(url => url.replace(OPGG_URL, '').trim());
}

browser.runtime.onMessage.addListener((msg, sender, respond) => {
    // If the received message has the expected format...
    if (msg.text === 'get_players') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        for (const [regex, handler] of PROFILE_URL_GETTERS) {
            if (regex.test(window.location.href)) {
                const urls = handler(document);
                
                let names;
                // If this is NSE, we need to scrape the OPGG urls
                const isNUEL = [NUEL_COMPANION_URL, NUEL_TEAM_URL].some(r => r.test(window.location))
                if (! isNUEL ) {
                    names = fetchNamesFromNSE(urls);
                } else {
                    names = extractNamesFromNUEL(urls);
                }

                respond(names);
                return;
            }
        }
    }
});