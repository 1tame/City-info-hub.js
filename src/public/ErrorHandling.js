
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('errorMessage');
    if (errorMessage) {
        const errorDiv = document.getElementById("errorDiv");
        errorDiv.innerHTML = "<p style='color:red;'>" + errorMessage + "</p>";
    }
};
