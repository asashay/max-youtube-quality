import React, { ChangeEvent } from "react";
import browser from "webextension-polyfill";
import css from "./styles.module.css";

export function Popup() {
    // Sends the `popupMounted` event
    const [isTurnedOn, setIsTurnedOn] = React.useState(false);
    React.useEffect(() => {
        void (async () => {
            const response = await browser.storage.local.get("isTurnedOn");
            setIsTurnedOn(
                response.isTurnedOn == null ? true : response.isTurnedOn,
            );
        })();
    }, []);

    const handleRadioClick = async (e: ChangeEvent<HTMLInputElement>) => {
        const turnedOn = e.target.value === "On";
        await browser.storage.local.set({
            isTurnedOn: turnedOn,
        });
        setIsTurnedOn(turnedOn);
    };

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                <h1 className="mb-4 font-bold" style={{ fontSize: "16px" }}>
                    Maximize your Youtube experience
                </h1>
                <p className="mb-4 text-justify" style={{ fontSize: "14px" }}>
                    Get max video quality from the get-go. When enabled it will
                    select maximum available YouTube video quaility
                    automatically
                </p>

                <div
                    className="mb-4 flex justify-center"
                    style={{ fontSize: "16px" }}
                >
                    <div className="mr-4 flex align-middle">
                        <input
                            type="radio"
                            id="on"
                            name="onoff"
                            value="On"
                            checked={isTurnedOn}
                            onChange={handleRadioClick}
                        />
                        <label htmlFor="on" className="ml-1  cursor-pointer">
                            On
                        </label>
                    </div>
                    <div className="flex align-middle ">
                        <input
                            type="radio"
                            id="off"
                            name="onoff"
                            value="Off"
                            checked={!isTurnedOn}
                            onChange={handleRadioClick}
                        />
                        <label htmlFor="off" className="ml-1 cursor-pointer">
                            Off
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
