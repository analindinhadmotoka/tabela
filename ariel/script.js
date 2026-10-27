// =========================
// ANIMAÇÃO DAS SEÇÕES
// =========================

const elementos = document.querySelectorAll(
    ".secao, .projeto, .habilidade, .card, .favorito"
);

const observer = new IntersectionObserver(
    (entradas) => {

        entradas.forEach((entrada) => {

            if (entrada.isIntersecting) {

                entrada.target.classList.add("aparecer");

            }

        });

    },
    {
        threshold: 0.15
    }
);


elementos.forEach((elemento) => {

    observer.observe(elemento);

});