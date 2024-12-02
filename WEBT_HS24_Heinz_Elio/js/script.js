document.addEventListener("DOMContentLoaded", function () {
    // Initially show the information section and hide the calculator section
    const infoSection = document.getElementById("info-section");
    const calculatorSection = document.getElementById("calculator-section");

    infoSection.style.display = "block";
    calculatorSection.style.display = "none";

    // Add event listeners to the navigation links
    const infoLink = document.querySelector('a[href="#info-section"]');
    const calculatorLink = document.querySelector('a[href="#calculator-section"]');

    infoLink.style.textDecoration = "underline";

    function updateLinkStyles(activeLink, inactiveLink) {
        activeLink.style.textDecoration = "underline";
        inactiveLink.style.textDecoration = "none";
    }

    infoLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent the default link behavior
        infoSection.style.display = "block";
        calculatorSection.style.display = "none";
        updateLinkStyles(infoLink, calculatorLink);
    });

    calculatorLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent the default link behavior
        infoSection.style.display = "none";
        calculatorSection.style.display = "block";
        updateLinkStyles(calculatorLink, infoLink);
    });
});
