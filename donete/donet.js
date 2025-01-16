document.addEventListener("DOMContentLoaded", () => {
    console.log("ElectriX Donation Page Loaded.");

    const donateButton = document.querySelector(".custom-btn");
    donateButton.addEventListener("click", () => {
        alert("Thank you for supporting ElectriX! Your contribution makes a difference.");
    });
});
