import browser from "webextension-polyfill";

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
    const response = await browser.storage.local.get([
        "isTurnedOn",
        "isPaidUser",
    ]);
    const ads = document.querySelector(".ytp-ad-player-overlay, .ytp-ad-message-container, #simple-ad-badge") || getSingleElementByXpath(
        '//*[contains(@id, "simple-ad-badge")]',
    );

    if (!response.isTurnedOn || changedQuality || ads != null) return;
    await timer(500);

    const settingsButton = document.querySelector(
        ".ytp-settings-button",
    ) as HTMLButtonElement;

    // check if settings button is visible
    if (!settingsButton || settingsButton.offsetHeight === 0 || settingsButton.offsetWidth === 0)
        return;

    // Only click if the menu is not already open to prevent looping
    const isMenuOpen = settingsButton.getAttribute("aria-expanded") === "true";
    if (!isMenuOpen) {
        settingsButton.click();
        await timer(200);
    }

    // Find the Quality menu item in a language-independent way
    const menuItems = document.querySelectorAll(".ytp-menuitem");
    let qualityMenu: HTMLDivElement | null = null;

    for (const item of Array.from(menuItems) as HTMLDivElement[]) {
        const label = item.querySelector(".ytp-menuitem-label")?.textContent;
        const content = item.querySelector(".ytp-menuitem-content")?.textContent;

        if (
            label === "Quality" ||
            label === "画質" || // Japanese
            (content && (/^\d+p|Auto|自動/.test(content)))
        ) {
            qualityMenu = item;
            break;
        }
    }

    if (!qualityMenu) return;
    qualityMenu.click();

    const qualityMenuItemsContainer = document.querySelector(
        ".ytp-quality-menu .ytp-panel-menu",
    ) as HTMLDivElement;

    const qualityMenuItems = qualityMenuItemsContainer?.querySelectorAll(
        "div.ytp-menuitem",
    ) as unknown as HTMLDivElement[];

    if (qualityMenuItems != null && qualityMenuItems.length > 0) {
        if (response.isPaidUser) {
            qualityMenuItems[0].click();
        } else {
            for (const qualityMenuItem of [...qualityMenuItems]) {
                if (!qualityMenuItem.textContent?.includes("Premium") && !qualityMenuItem.textContent?.includes("プレミアム")) {
                    qualityMenuItem.click();
                    break;
                }
            }
        }

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
