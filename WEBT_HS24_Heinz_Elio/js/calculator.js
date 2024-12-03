// DOM-Elemente
const calculateButton = document.getElementById("calculate-button");
const textPermissions = document.getElementById("text-permissions");
const numericPermissions = document.getElementById("numeric-permissions");
const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");

// MAPPING für Berechtigungen
const permissionMap = {
    "owner-read": 0, "owner-write": 1, "owner-execute": 2,
    "group-read": 3, "group-write": 4, "group-execute": 5,
    "others-read": 6, "others-write": 7, "others-execute": 8,
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

document.addEventListener("DOMContentLoaded", () => {
    let lastInputSource = null, noInputClickCount = 0;

    // Event-Listener für Änderungen der Eingabefelder (text und numerisch)
    [textPermissions, numericPermissions].forEach(input =>
        input.addEventListener("input", () => lastInputSource = input.id.includes("text") ? "symbolic" : "numeric")
    );

    // Event-Listener für Änderungen der Checkboxen
    checkboxes.forEach(checkbox =>
        checkbox.addEventListener("change", () => lastInputSource = "checkbox")
    );

    // Event-Listener für den Berechnen Button
    calculateButton.addEventListener("click", () => {
        const data = lastInputSource === "symbolic"
            ? { symbolic: textPermissions.value.trim() }
            : lastInputSource === "numeric"
                ? { numeric: numericPermissions.value.trim() }
                : { symbolic: getCheckboxInput() };

        if (!Object.values(data)[0]) return;

        noInputClickCount = 0;

        // Anfrage an das Backend senden und mit der Antwort weiterarbeiten
        sendDataToBackend(data)
            .then(({ success, symbolic, numeric, error }) => {
                if (success) updateFields(symbolic, numeric);
                else console.error("Backend-Fehler:", error);
            });
    });
});
