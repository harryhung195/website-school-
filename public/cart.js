const payBtn = document.querySelector(".btn-buy");

payBtn.addEventListener("click", () => {
    fetch("/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: cart.map(item => ({
                title: item.title,
                price: `$${item.price}`, // Ensure price is formatted with a "$" sign
                productImg: item.image,
                quantity: 1 // Assuming each item is added individually
            })),
        }),
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error("Invalid URL received from the server:", data.url);
        }
    })
    .catch((err) => console.error(err));
});