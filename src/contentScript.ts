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

const QUALITY_TRANSLATIONS = [
    "Quality",
    "Gehalte",
    "Keyfiyyət",
    "Kualitas",
    "Kualiti",
    "Kvalitet",
    "Qualitat",
    "Kvalita",
    "Qualität",
    "Kvaliteet",
    "Calidad",
    "Kalitate",
    "Kalidad",
    "Qualité",
    "Calidade",
    "Kvaliteta",
    "Ikhwalithi",
    "Gæði",
    "Qualità",
    "Ubora",
    "Kvalitāte",
    "Kokybė",
    "Minőség",
    "Sifat",
    "Jakość",
    "Qualidade",
    "Calitate",
    "Cilësi",
    "Kakovost",
    "Laatu",
    "Chất lượng",
    "Kalite",
    "Якасць",
    "Качество",
    "Сапат",
    "Сапа",
    "Квалитет",
    "Чанар",
    "Якість",
    "Ποιότητα",
    "איכות",
    "معیار",
    "الجودة",
    "کیفیت",
    "गुणस्तर",
    "गुणवत्ता",
    "গুণমান",
    "ਗੁਣਵੱਤਾ",
    "ગુણવત્તા",
    "ଗୁଣମାନ",
    "தரம்",
    "నాణ్యత",
    "ಗುಣಮಟ್ಟ",
    "ഗുണമേന്മ",
    "ගුණාත්මකභාවය",
    "คุณภาพ",
    "ຄຸນນະພາບ",
    "အရည်အသွေး",
    "ხარისხი",
    "ጥራት",
    "គុណភាព",
    "画质",
    "畫質",
    "画質",
    "화질",
    "Որակ",
];

let oldURL = window.location.href;
let changedQuality = false;
let settingsButtonClicked = false;

async function changeQuality() {
    const response = await browser.storage.local.get([
        "isTurnedOn",
        "isPaidUser",
    ]);
    const ads =
        document.querySelector(".ad-showing") ||
        document.querySelector('[class*="ad-showing"]') ||
        document.querySelector('[class*="ytp-ad-"][class*="overlay"]') ||
        document.querySelector('[class*="ad-skip"]') ||
        document.querySelector(".video-ads [class*='ytp-ad']");

    if (
        !response.isTurnedOn ||
        changedQuality ||
        ads != null ||
        settingsButtonClicked
    )
        return;
    await timer(500);

    const settingsButton = document.querySelector(
        ".ytp-settings-button",
    ) as HTMLButtonElement;

    // check if settings button is visible
    if (settingsButton.offsetHeight === 0 || settingsButton.offsetWidth === 0)
        return;

    settingsButton?.click();
    settingsButtonClicked = true;

    const qualityXPath = QUALITY_TRANSLATIONS.map((t) => `text()="${t}"`).join(
        " or ",
    );
    const qualityMenu = getSingleElementByXpath(
        `//div[${qualityXPath}]`,
    ) as HTMLDivElement;
    qualityMenu?.click();

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
                if (!qualityMenuItem.textContent?.includes("Premium")) {
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
            settingsButtonClicked = false;
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
