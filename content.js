const NSE_TEAM_URL    = new RegExp('http(?:s?):\/\/tournaments.nse.gg\/tournaments\/([A-z0-9-]+)\/teams\/([A-z0-9-]+).*');
const NSE_MATCHES_URL = new RegExp('http(?:s?):\/\/tournaments.nse.gg\/tournaments\/([A-z0-9-]+)\/matches\/(\\d+).*');

function asArray(nodeList) {
    return [].slice.call(nodeList);
}

const PROFILE_URL_GETTERS = [
    [NSE_TEAM_URL, () => {
        const links = asArray(document.querySelectorAll('.table-players a'));
        return links.map(l => l.href);
    }],
    [NSE_MATCHES_URL, () => {
        // Get name of currently logger-in user
        const [{innerHTML: name}, ..._rest] = document.querySelectorAll('.nav-body-bottom .nav-item-title h4');

        const [teamATable, _middle, teamBTable] = document.querySelectorAll('.event-details-table');
        for (const table of [teamATable, teamBTable]) {
            const links = asArray(table.querySelectorAll('.match-team-player a'));
            const containsCurrentUser = links.map(l => l.innerHTML.toLowerCase().trim()).includes(name.toLowerCase().trim());
            if (! containsCurrentUser) {
                return links.map(l => l.href);
            }
        }
    }]
];

browser.runtime.onMessage.addListener   (function (msg, _sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'get_players') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
    
        for (const [regex, handler] of PROFILE_URL_GETTERS) {
            if (regex.test(window.location)) {
                const urls = handler();
                console.log(urls);
                sendResponse(urls);
                break;
            }
        }
    }
});