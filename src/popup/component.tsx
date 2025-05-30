import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

export function Popup() {
    const [isTurnedOn, setIsTurnedOn] = useState(false);
    const [isPaidUser, setIsPaidUser] = useState(false);

    // Load saved prefs
    useEffect(() => {
        (async () => {
            const { isTurnedOn: storedOn } = await browser.storage.local.get(
                "isTurnedOn",
            );
            setIsTurnedOn(storedOn == null ? true : storedOn);

            const { isPaidUser: storedPaid } = await browser.storage.local.get(
                "isPaidUser",
            );
            setIsPaidUser(storedPaid == null ? false : storedPaid);
        })();
    }, []);

    // Handlers
    const toggleSwitch = async () => {
        const next = !isTurnedOn;
        await browser.storage.local.set({ isTurnedOn: next });
        setIsTurnedOn(next);
    };
    const togglePaid = async () => {
        const next = !isPaidUser;
        await browser.storage.local.set({ isPaidUser: next });
        setIsPaidUser(next);
    };

    // Inline style objects
    const styles: { [k: string]: React.CSSProperties } = {
        container: {
            width: 300,
            padding: 16,
            fontFamily: "sans-serif",
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
        },
        header: {
            fontSize: 14,
            margin: 0,
            fontWeight: "bold",
        },
        description: {
            fontSize: 14,
            margin: 0,
            color: "#555",
            lineHeight: 1.4,
        },
        toggleContainer: {
            display: "flex",
            alignItems: "center",
        },
        switch: {
            position: "relative",
            width: 40,
            height: 20,
            borderRadius: 20,
            backgroundColor: isTurnedOn ? "#2196F3" : "#ccc",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background-color 0.4s",
            marginRight: 8,
        },
        knob: {
            position: "absolute",
            top: 2,
            left: isTurnedOn ? 22 : 2,
            width: 16,
            height: 16,
            backgroundColor: "#fff",
            borderRadius: "50%",
            transition: "left 0.4s",
        },
        toggleLabel: {
            fontSize: 14,
            color: "#333",
        },
        checkboxContainer: {
            display: "flex",
            alignItems: "center",
        },
        checkbox: {
            marginRight: 8,
            width: 16,
            height: 16,
            cursor: "pointer",
        },
        checkboxLabel: {
            fontSize: 14,
            color: "#333",
            cursor: "pointer",
            userSelect: "none",
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Maximize your YouTube experience</h1>
            <p style={styles.description}>
                Get max video quality from the get-go. When enabled, it will
                select the highest available YouTube video quality
                automatically.
            </p>

            <div style={styles.toggleContainer}>
                <div style={styles.switch} onClick={toggleSwitch}>
                    <div style={styles.knob} />
                </div>
                <span style={styles.toggleLabel}>
                    {isTurnedOn ? "Enabled" : "Disabled"}
                </span>
            </div>

            <div style={styles.checkboxContainer}>
                <input
                    type="checkbox"
                    checked={isPaidUser}
                    onChange={togglePaid}
                    style={styles.checkbox}
                />
                <label style={styles.checkboxLabel} onClick={togglePaid}>
                    I have YouTube Premium
                </label>
            </div>
        </div>
    );
}
