browser.browserAction.onClicked.addListener(() => {
    const tab  = browser.tabs.getCurrentTab();
    const urls = await browser.tabs.sendMessage(tab.id, {text: 'get_players'});

    const window = browser.window.createWindow();
    const newTab = browser.tabs.create({windowId: window.id});
    browser.tabs.update(newTab.id, {url: urls.join(', ')});
    
    const summonerNames = urls.map(url => {
        // 1. Get request using fetch
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.send();
        let profileHTML = xhr.responseText;

        // 2. Create fake DOM object & get summoner name
        let fakeDOM = document.createElement('html');
        fakeDOM.innerHTML = profileHTML;

        const allDataRows = fakeDom.querySelectorAll('.event-details-table-row div');
        for (const dataRow of allDataRows) {
            if (dataRow.querySelector('.event-details-table-title').innerText == "Summoner Name") {
                return dataRow.querySelector('.event-details-table-value').innerText;
            }            
        }

        // In theory we should never reach here but life is life kekw
        return ""; //topdrunk fixp later
    });

    // Open multi-query OP.GG in new tab
});