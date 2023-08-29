import browser from "webextension-polyfill";
console.log("Hello from content script!");

const timer = async (timeout: number) => {
    await new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
};

const getSingleElementByXpath = (path: string): Node | null => {
    return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
    ).singleNodeValue;
};
// todo: test for not premium user with ads

let oldURL = window.location.href;
let changedQuality = false;

async function changeQuality() {
    const response = await browser.storage.local.get(["isTurnedOn"]);
    const ads = getSingleElementByXpath(
        '//*[contains(@id, "simple-ad-badge") and contains(text(), "Ad ")]',
    );

    if (!response.isTurnedOn || changedQuality || ads != null) return;
    await timer(500);

    const settingsButton = document.querySelector(
        ".ytp-settings-button",
    ) as HTMLButtonElement;
    settingsButton?.click();

    const qualityMenu = getSingleElementByXpath(
        '//div[text()="Quality"]',
    ) as HTMLDivElement;
    qualityMenu?.click();

    const qualityMenuItemsContainer = document.querySelector(
        ".ytp-quality-menu .ytp-panel-menu",
    ) as HTMLDivElement;

    const qualityMenuItems = qualityMenuItemsContainer?.querySelectorAll("div");
    if (qualityMenuItems != null && qualityMenuItems.length > 0) {
        qualityMenuItems[0].click();
        changedQuality = true;
    }
}

async function start() {
    const response = await browser.storage.local.get(["isTurnedOn"]);
    if (response.isTurnedOn == null) {
        await browser.storage.local.set({ isTurnedOn: true });
    }

    setInterval(async () => {
        if (window.location.href != oldURL) {
            oldURL = window.location.href;
            changedQuality = false;
        }
        if (!changedQuality) {
            await changeQuality();
        }
    }, 1000);
}

try {
    await start();
} catch (err) {
    console.log("error during start", err);
}

export {};
