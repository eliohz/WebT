document.addEventListener("DOMContentLoaded", function () {
    // Navigation between Info and Calculator sections
    const infoSection = document.getElementById("info-section");
    const calculatorSection = document.getElementById("calculator-section");

    infoSection.style.display = "block";
    calculatorSection.style.display = "none";

    const infoLink = document.querySelector('a[href="#info-section"]');
    const calculatorLink = document.querySelector('a[href="#calculator-section"]');

    infoLink.style.textDecoration = "underline";

    function updateLinkStyles(activeLink, inactiveLink) {
        activeLink.style.textDecoration = "underline";
        inactiveLink.style.textDecoration = "none";
    }

    infoLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        infoSection.style.display = "block";
        calculatorSection.style.display = "none";
        updateLinkStyles(infoLink, calculatorLink);
    });

    calculatorLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        infoSection.style.display = "none";
        calculatorSection.style.display = "block";
        updateLinkStyles(calculatorLink, infoLink);
    });

    // Permission calculation
    const calculateButton = document.getElementById("calculate-button");
    const textPermissions = document.getElementById("text-permissions");
    const numericPermissions = document.getElementById("numeric-permissions");
    const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");

    calculateButton.addEventListener("click", function () {
        const symbolicInput = textPermissions.value.trim();
        const numericInput = numericPermissions.value.trim();
        const checkboxData = {};

        // Collect checkbox data
        checkboxes.forEach(checkbox => {
            checkboxData[checkbox.id] = checkbox.checked;
        });

        // Send data to backend.php
        fetch("../backend.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                symbolic: symbolicInput,
                numeric: numericInput,
                checkboxes: checkboxData
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update fields with returned data
                textPermissions.value = data.symbolic;
                numericPermissions.value = data.numeric;
                alert(`Symbolisch: ${data.symbolic}\nNumerisch: ${data.numeric}`);
            } else {
                alert(`Fehler: ${data.error}`);
            }
        })
        .catch(error => console.error("AJAX-Fehler:", error));
    });
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded.");

    const calculateButton = document.getElementById("calculate-button");
    const textPermissions = document.getElementById("text-permissions");
    const numericPermissions = document.getElementById("numeric-permissions");
    const checkboxes = document.querySelectorAll("#checkbox-section input[type='checkbox']");

    // Track the last input source and double-click state
    let lastInputSource = null;
    let noInputClickCount = 0; // Tracks consecutive clicks with no input

    // Event listeners to track the user's input
    textPermissions.addEventListener("input", function () {
        lastInputSource = "symbolic";
        noInputClickCount = 0; // Reset no-input count on valid input
    });

    numericPermissions.addEventListener("input", function () {
        lastInputSource = "numeric";
        noInputClickCount = 0;
    });

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            lastInputSource = "checkbox";
            noInputClickCount = 0;
        });
    });

    // Map checkbox IDs to symbolic permission positions
    const permissionMap = {
        "owner-read": 0,
        "owner-write": 1,
        "owner-execute": 2,
        "group-read": 3,
        "group-write": 4,
        "group-execute": 5,
        "others-read": 6,
        "others-write": 7,
        "others-execute": 8,
    };

    calculateButton.addEventListener("click", function () {
        // Clear all fields on second no-input click
        if (!lastInputSource) {
            noInputClickCount++;
            if (noInputClickCount >= 2) {
                clearAllFields();
                console.log("All fields cleared after double click with no input.");
                noInputClickCount = 0; // Reset the count after clearing
                return;
            }
        }

        // Determine input based on lastInputSource
        let data = null;
        if (lastInputSource === "symbolic") {
            const symbolicInput = textPermissions.value.trim();
            if (!symbolicInput) {
                noInputClickCount++;
                return;
            }
            data = { symbolic: symbolicInput };
        } else if (lastInputSource === "numeric") {
            const numericInput = numericPermissions.value.trim();
            if (!numericInput) {
                noInputClickCount++;
                return;
            }
            data = { numeric: numericInput };
        } else if (lastInputSource === "checkbox") {
            const checkboxInput = getCheckboxInput();
            if (!checkboxInput) {
                noInputClickCount++;
                return;
            }
            data = { symbolic: checkboxInput };
        } else {
            noInputClickCount++;
            return;
        }

        // Reset noInputClickCount on valid input
        noInputClickCount = 0;

        // Send data to the backend
        fetch("backend.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Response data:", data);

                if (data.success) {
                    // Update fields based on the response
                    updateAllFields(data.symbolic, data.numeric);
                } else {
                    console.error("Error from backend:", data.error);
                }
            })
            .catch((error) => {
                console.error("Fetch error:", error);
            });
    });

    function clearAllFields() {
        // Clear all fields
        textPermissions.value = "";
        numericPermissions.value = "";
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
        lastInputSource = null; // Reset the input source tracker
    }

    function getCheckboxInput() {
        // Build a symbolic string based on the checkboxes
        let symbolic = "";
        for (const [checkboxId, position] of Object.entries(permissionMap)) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox && checkbox.checked) {
                symbolic += ["r", "w", "x"][position % 3];
            } else {
                symbolic += "-";
            }
        }
        return symbolic === "---------"
            ? "" // Return an empty string if all checkboxes are unchecked
            : symbolic;
    }

    function updateAllFields(symbolic, numeric) {
        // Update symbolic field
        textPermissions.value = symbolic || "";

        // Update numeric field
        numericPermissions.value = numeric || "";

        // Update checkboxes
        if (symbolic) {
            updateCheckboxes(symbolic);
        }

        // Reset the lastInputSource to avoid reusing stale data
        lastInputSource = null;
    }

    function updateCheckboxes(symbolic) {
        // Ensure symbolic is valid and has 9 characters
        if (!symbolic || symbolic.length !== 9) {
            console.error("Invalid symbolic permissions:", symbolic);
            return;
        }

        // Update checkboxes based on symbolic permission string
        for (const [checkboxId, position] of Object.entries(permissionMap)) {
            const permissionChar = symbolic[position];
            const isChecked = permissionChar !== '-';
            const checkbox = document.getElementById(checkboxId);

            if (checkbox) {
                checkbox.checked = isChecked;
            }
        }
    }
});
