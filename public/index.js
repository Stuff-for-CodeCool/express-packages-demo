const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { name, description, release } = e.target;

    const req = await fetch(window.location.href, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
            name: name.value,
            description: description.value,
            release: release.value
        })
    });

});
