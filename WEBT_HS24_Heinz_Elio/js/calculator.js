const calculateButton = document.getElementById("calculate-button");
const textPermissions = document.getElementById("text-permissions");
const numericPermissions = document.getElementById("numeric-permissions");
const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");
const textError = document.createElement("div");
const numericError = document.createElement("div");
const allowedPermissions = ['rwxrwxrwx', 'rwxrwxrw-', 'rwxrwxr--', 'rwxrwx---','rwxrw-rw-', 'rwxrw-r--', 'rwxrw----', 'rwxr--rw-','rwxr--r--', 'rwxr-----', 'rw-rw-rw-', 'rw-rw-r--','rw-rw----', 'rw-r--rw-', 'rw-r--r--', 'rw-r-----','r--r--r--', 'r--r--rw-', 'r--rw----', 'rw-------','r--------', '---------'];
const validateSymbolic = (value) => allowedPermissions.includes(value);
const validateNumeric = (value) => /^[0-7]{0,3}$/.test(value);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.beginPath();
ctx.moveTo(15, 3);
ctx.lineTo(27, 27);
ctx.lineTo(3, 27);
ctx.closePath();
ctx.fillStyle = "yellow";
ctx.fill();
ctx.strokeStyle = "black";
ctx.stroke();
ctx.beginPath();
ctx.arc(15, 22, 2, 0, Math.PI * 2);
ctx.fillStyle = "black";
ctx.fill();
ctx.beginPath();
ctx.moveTo(15, 8);
ctx.lineTo(15, 18);
ctx.strokeStyle = "black";
ctx.lineWidth = 3;
ctx.stroke();

textPermissions.insertAdjacentElement("afterend", textError);
numericPermissions.insertAdjacentElement("afterend", numericError);

textError.className = numericError.className = "error-message";

const permissionMap = {
    "owner-read": 0, "owner-write": 1, "owner-execute": 2,
    "group-read": 3, "group-write": 4, "group-execute": 5,
    "others-read": 6, "others-write": 7, "others-execute": 8,
};

const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
};

const updateFields = (symbolic = "", numeric = "") => {
    textPermissions.value = symbolic;
    numericPermissions.value = numeric;
    symbolic.split("").forEach((char, i) => {
        const checkbox = document.getElementById(Object.keys(permissionMap).find(id => permissionMap[id] === i));
        if (checkbox) checkbox.checked = char !== "-";
    });
};

const resetFields = () => {
    textPermissions.value = numericPermissions.value = "";
    checkboxes.forEach(checkbox => checkbox.checked = false);
    textError.textContent = numericError.textContent = "";
};

const getCheckboxInput = () =>
    Array.from(checkboxes).map((checkbox, i) => checkbox.checked ? ["r", "w", "x"][i % 3] : "-").join("");


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

const populateFieldsFromCookie = () => {
    const lastPermission = getCookie('lastPermission');
    if (lastPermission) {
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

document.addEventListener("DOMContentLoaded", () => {
    let lastInputSource = null;

    populateFieldsFromCookie();

    textPermissions.addEventListener("input", () => {
        lastInputSource = "symbolic";
        const value = textPermissions.value.trim();
        if (!validateSymbolic(value)) {
            canvas.style.display = "block";
            textError.textContent = "Nur r, w, x oder - erlaubt, 9 Zeichen";

        } else {
            textError.textContent = "";
            canvas.style.display = "none";
        }
    });

    numericPermissions.addEventListener("input", () => {
        lastInputSource = "numeric";
        const value = numericPermissions.value.trim();
        if (!validateNumeric(value)) {
            canvas.style.display = "block";
            numericError.textContent = "Nur Zahlen 0–7 erlaubt, 3 Zeichen.";
        } else {
            numericError.textContent = "";
            canvas.style.display = "none";
        }
    });

    checkboxes.forEach(checkbox =>
        checkbox.addEventListener("change", () => lastInputSource = "checkbox")
    );

    calculateButton.addEventListener("click", (e) => {
        const data = lastInputSource === "symbolic"
            ? { symbolic: textPermissions.value.trim() }
            : lastInputSource === "numeric"
                ? { numeric: numericPermissions.value.trim() }
                : { symbolic: getCheckboxInput() };

        const isSymbolicValid = validateSymbolic(textPermissions.value.trim());
        const isNumericValid = validateNumeric(numericPermissions.value.trim());

        if (!isSymbolicValid) {
            textError.textContent = "Nur r, w, x oder - erlaubt, 9 Zeichen";
        }

        if (!isNumericValid) {
            numericError.textContent = "Nur Zahlen 0–7 erlaubt, 3 Zeichen.";
        }

        if (!isSymbolicValid || !isNumericValid) {
            e.preventDefault();
            return;
        }

        sendDataToBackend(data)
            .then(({ success, symbolic, numeric, error }) => {
                if (success) {
                    updateFields(symbolic, numeric);

                    document.cookie = `lastPermission=${encodeURIComponent(symbolic)}; path=/; max-age=3600`;
                } else {
                    console.error("Backend-Fehler:", error);
                }
            });
    });
});
