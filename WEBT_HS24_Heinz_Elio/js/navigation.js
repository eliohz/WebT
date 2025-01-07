const sections = {
    info: document.getElementById("info-section"),
    calculator: document.getElementById("calculator-section"),
};

const links = {
    info: document.querySelector('a[href="#info-section"]'),
    calculator: document.querySelector('a[href="#calculator-section"]'),
};

const showSection = (active, inactive) => {
    sections[active].style.display = "block";
    sections[inactive].style.display = "none";
    links[active].style.textDecoration = "underline";
    links[inactive].style.textDecoration = "none";
};

document.addEventListener("DOMContentLoaded", () => {
    showSection("info", "calculator");

    links.info.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("info", "calculator");
    });
    links.calculator.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("calculator", "info");
    });
});
