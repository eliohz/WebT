document.addEventListener("DOMContentLoaded", () => {
    // Navigation sections
    const sections = {
        info: document.getElementById("info-section"),
        calculator: document.getElementById("calculator-section"),
    };
    const links = {
        info: document.querySelector('a[href="#info-section"]'),
        calculator: document.querySelector('a[href="#calculator-section"]'),
    };

    // Show only the info section initially
    const showSection = (active, inactive) => {
        sections[active].style.display = "block";
        sections[inactive].style.display = "none";
        links[active].style.textDecoration = "underline";
        links[inactive].style.textDecoration = "none";
    };

    showSection("info", "calculator");
    links.info.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("info", "calculator");
    });
    links.calculator.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("calculator", "info");
    });

    // Permission calculation logic
    const calculateButton = document.getElementById("calculate-button");
    const textPermissions = document.getElementById("text-permissions");
    const numericPermissions = document.getElementById("numeric-permissions");
    const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");
    const permissionMap = {
        "owner-read": 0, "owner-write": 1, "owner-execute": 2,
        "group-read": 3, "group-write": 4, "group-execute": 5,
        "others-read": 6, "others-write": 7, "others-execute": 8,
    };

    let lastInputSource = null, noInputClickCount = 0;

    const resetFields = () => {
        textPermissions.value = numericPermissions.value = "";
        checkboxes.forEach(checkbox => checkbox.checked = false);
        lastInputSource = null;
    };

    const getCheckboxInput = () =>
        Array.from(checkboxes).map((checkbox, i) => checkbox.checked ? ["r", "w", "x"][i % 3] : "-").join("");

    const updateFields = (symbolic = "", numeric = "") => {
        textPermissions.value = symbolic;
        numericPermissions.value = numeric;
        symbolic.split("").forEach((char, i) => {
            const checkbox = Object.keys(permissionMap).find(id => permissionMap[id] === i);
            if (checkbox) document.getElementById(checkbox).checked = char !== "-";
        });
    };

    [textPermissions, numericPermissions].forEach(input =>
        input.addEventListener("input", () => lastInputSource = input.id.includes("text") ? "symbolic" : "numeric")
    );

    checkboxes.forEach(checkbox =>
        checkbox.addEventListener("change", () => lastInputSource = "checkbox")
    );

    calculateButton.addEventListener("click", () => {
        if (!lastInputSource && ++noInputClickCount >= 2) return resetFields();

        const data = lastInputSource === "symbolic"
            ? { symbolic: textPermissions.value.trim() }
            : lastInputSource === "numeric"
                ? { numeric: numericPermissions.value.trim() }
                : { symbolic: getCheckboxInput() };

        if (!Object.values(data)[0]) return;

        noInputClickCount = 0;

        fetch("backend.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(({ success, symbolic, numeric, error }) => {
                if (success) updateFields(symbolic, numeric);
                else console.error("Backend error:", error);
            })
            .catch(err => console.error("Fetch error:", err));
    });
});
