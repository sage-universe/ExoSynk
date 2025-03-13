let cartCount = 0;
const cartElements = document.querySelectorAll('.exo-cart-count');

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        cartCount++;
        cartElements.forEach(el => el.textContent = cartCount);
    });
});