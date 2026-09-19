const form = document.getElementById("loginForm");
const error = document.getElementById("error");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/api/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.success) {

        window.location.href = "index.html";

    } else {

        error.textContent = data.message;

    }
});