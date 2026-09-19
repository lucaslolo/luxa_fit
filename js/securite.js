const form = document.getElementById("loginForm");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "Lucas" && password === "1234") {

        window.location.href = "luxa_fit.html";

    } else {

        document.getElementById("error").textContent =
            "Nom d'utilisateur ou mot de passe incorrect.";

    }

});