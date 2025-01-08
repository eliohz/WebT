// DOM-Elemente
const calculateButton = document.getElementById("calculate-button");
const textPermissions = document.getElementById("text-permissions");
const numericPermissions = document.getElementById("numeric-permissions");
const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");
let lastInputSource = "checkbox";

// MAPPING für Berechtigungen
const permissionMap = {
    "owner-read": 0, "owner-write": 1, "owner-execute": 2,
    "group-read": 3, "group-write": 4, "group-execute": 5,
    "others-read": 6, "others-write": 7, "others-execute": 8,
};

// Funktion zum Lesen der Cookies
const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
};

// Funktion zur Aktualisierung der Felder
const updateFields = (symbolic = "", numeric = "") => {
    textPermissions.value = symbolic;
    numericPermissions.value = numeric;
    symbolic.split("").forEach((char, i) => {
        const checkbox = document.getElementById(Object.keys(permissionMap).find(id => permissionMap[id] === i));
        if (checkbox) checkbox.checked = char !== "-";
    });
};

// Funktion zum Zurücksetzen der Felder
const resetFields = () => {
    textPermissions.value = numericPermissions.value = "";
    checkboxes.forEach(checkbox => checkbox.checked = false);
};

// Funktion zum Ermitteln, welche Checkboxen aktiviert sind
const getCheckboxInput = () =>
    Array.from(checkboxes).map((checkbox, i) => checkbox.checked ? ["r", "w", "x"][i % 3] : "-").join("");

// Funktion für die API-Anfrage
const sendDataToBackend = (data) => {
    return fetch("backend.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .catch(err => {
        console.error("Fetch-Fehler:", err);
        throw err;
    });
};

// Funktion zum Laden der Felder aus Cookies
const populateFieldsFromCookie = () => {
    const lastPermission = getCookie('lastPermission'); // Lesen des Cookies
    if (lastPermission) {
        // Anfrage an das Backend senden, um Felder zu aktualisieren
        sendDataToBackend({ symbolic: lastPermission })
            .then(({ success, symbolic, numeric }) => {
                if (success) {
                    updateFields(symbolic, numeric);
                } else {
                    console.error("Fehler beim Laden der Felder aus Cookies.");
                }
            });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let lastInputSource = null, noInputClickCount = 0;

    // Felder beim Laden der Seite aus Cookies auffüllen
    populateFieldsFromCookie();

    // Event-Listener für Änderungen der Eingabefelder (text und numerisch)
    [textPermissions, numericPermissions].forEach(input =>
        input.addEventListener("input", () => lastInputSource = input.id.includes("text") ? "symbolic" : "numeric")
    );

    // Event-Listener für Änderungen der Checkboxen
    checkboxes.forEach(checkbox =>
        checkbox.addEventListener("change", () => lastInputSource = "checkbox")
    );

    // Funktion zur Validierung symbolischer Berechtigungen
const isValidSymbolicPermission = (input) => {
    const regex = /^$|^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/;
    return regex.test(input);
};

// Funktion zur Validierung numerischer Berechtigungen
const isValidNumericPermission = (input) => {
    const regex = /^$|^[0-7][0-7][0-7]$/;
    return regex.test(input);
};

// Funktion zur Überprüfung und Anzeige von Fehlern
const validateInput = (lastInputSource, value) => {
    if (!value && (lastInputSource === "symbolic" || lastInputSource === "numeric")) { // Prüft auf leere Eingabe
        alert("Bitte Eingabe machen.");
        return false;
    }
    if (lastInputSource === "symbolic" && !isValidSymbolicPermission(value)) {
        alert("Die Eingabe muss eine gültige symbolische Linux-Berechtigung sein");
        return false;
    }
    if (lastInputSource === "numeric" && !isValidNumericPermission(value)) {
        alert("Die Eingabe muss eine gültige numerische Linux-Berechtigung sein.");
        return false;
    }
    return true;
};

    // Event-Listener für den Berechnen Button
    calculateButton.addEventListener("click", () => {
        const data = lastInputSource === "symbolic"
            ? { symbolic: textPermissions.value.trim() }
            : lastInputSource === "numeric"
                ? { numeric: numericPermissions.value.trim() }
                : { symbolic: getCheckboxInput() };

        // Eingabe validieren
        const inputValue = Object.values(data)[0];
        if (!validateInput(lastInputSource, inputValue)) return;

        // Anfrage an das Backend senden und mit der Antwort weiterarbeiten
        sendDataToBackend(data)
            .then(({ success, symbolic, numeric, error }) => {
                if (success) {
                    updateFields(symbolic, numeric);

                    // Letzten symbolischen Wert als Cookie setzen
                    document.cookie = `lastPermission=${encodeURIComponent(symbolic)}; path=/; max-age=3600`;
                } else {
                    console.error("Backend-Fehler:", error);
                }
            });
    });
});