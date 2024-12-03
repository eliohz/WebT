// Definition der Navigationsbereiche
const sections = {
    info: document.getElementById("info-section"),
    calculator: document.getElementById("calculator-section"),
};

// Definition der Underline (Damit dem User angezeigt wird wo er gerade ist)
const links = {
    info: document.querySelector('a[href="#info-section"]'),
    calculator: document.querySelector('a[href="#calculator-section"]'),
};

// Funktion für Ein- oder Ausblenden der jeweiligen Bereiche
const showSection = (active, inactive) => {
    sections[active].style.display = "block";
    sections[inactive].style.display = "none";
    links[active].style.textDecoration = "underline";
    links[inactive].style.textDecoration = "none";
};

document.addEventListener("DOMContentLoaded", () => {
    // Standardmässig on Load Info Section anzeigen
    showSection("info", "calculator");

    // Wenn Info bereich gewählt
    links.info.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("info", "calculator");
    });
    // Wenn Rechner bereich gewählt
    links.calculator.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("calculator", "info");
    });
});
