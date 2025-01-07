// DOM-Elemente
const calculateButton = document.getElementById("calculate-button");
const textPermissions = document.getElementById("text-permissions");
const numericPermissions = document.getElementById("numeric-permissions");
const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");
const textError = document.createElement("div");
const numericError = document.createElement("div");

// Hinzufügen der Fehlermeldungscontainer
textPermissions.insertAdjacentElement("afterend", textError);
numericPermissions.insertAdjacentElement("afterend", numericError);

// Styling für Fehlermeldungen
textError.className = numericError.className = "error-message";

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
    textError.textContent = numericError.textContent = "";
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
        // Anfrage an das Backend, um symbolische und numerische Werte zu holen
        sendDataToBackend({ symbolic: lastPermission })
            .then(({ success, symbolic, numeric, error }) => {
                if (success) {
                    updateFields(symbolic, numeric);
                } else {
                    console.error("Backend-Fehler:", error);
                }
            });
    }
};

// Validierungsfunktionen
const validateSymbolic = (value) => /^[rwx-]{0,9}$/.test(value);
const validateNumeric = (value) => /^[0-7]{0,3}$/.test(value);

document.addEventListener("DOMContentLoaded", () => {
    let lastInputSource = null;

    // Felder beim Laden der Seite aus Cookies auffüllen
    populateFieldsFromCookie();

    // Event-Listener für Änderungen der Eingabefelder (text und numerisch)
    textPermissions.addEventListener("input", () => {
        lastInputSource = "symbolic";
        const value = textPermissions.value.trim();
        if (!validateSymbolic(value)) {
            textError.textContent = "Nur die Zeichen r, w, x oder - erlaubt, maximal 9 Zeichen.";
        } else {
            textError.textContent = "";
        }
    });

    numericPermissions.addEventListener("input", () => {
        lastInputSource = "numeric";
        const value = numericPermissions.value.trim();
        if (!validateNumeric(value)) {
            numericError.textContent = "Nur Zahlen 0–7 erlaubt, maximal 3 Zeichen.";
        } else {
            numericError.textContent = "";
        }
    });

    // Event-Listener für Änderungen der Checkboxen
    checkboxes.forEach(checkbox =>
        checkbox.addEventListener("change", () => lastInputSource = "checkbox")
    );

    // Event-Listener für den Berechnen Button
    calculateButton.addEventListener("click", (e) => {
        const data = lastInputSource === "symbolic"
            ? { symbolic: textPermissions.value.trim() }
            : lastInputSource === "numeric"
                ? { numeric: numericPermissions.value.trim() }
                : { symbolic: getCheckboxInput() };

        // Finaler Validierungs-Check vor dem Absenden
        const isSymbolicValid = validateSymbolic(textPermissions.value.trim());
        const isNumericValid = validateNumeric(numericPermissions.value.trim());

        if (!isSymbolicValid) {
            textError.textContent = "Ungültige symbolische Eingabe.";
        }

        if (!isNumericValid) {
            numericError.textContent = "Ungültige numerische Eingabe.";
        }

        if (!isSymbolicValid || !isNumericValid) {
            e.preventDefault(); // Verhindere Absenden bei ungültigen Eingaben
            return;
        }

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
