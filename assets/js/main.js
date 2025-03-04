document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
    const text = button.getAttribute('data-text') || 
    button.closest('.col-12, .col-md-6, .col-lg-4, .col-lg-6')?.querySelector('p')?.textContent.trim();

    if (text) {
        navigator.clipboard.writeText(text)
        .then(() => {
            const originalText = button.textContent; // Guarda el texto original del botón
            button.textContent = '¡Copiado!'; // Cambia el texto del botón temporalmente
            setTimeout(() => button.textContent = originalText, 2000); // Restaura el texto original después de 2 segundos
        })
        .catch(err => console.error('Error al copiar:', err));
    } else {
        console.error('No se encontró texto para copiar.');
    }
    });
});
window.onscroll = function() {
    var scrollButton = document.getElementById("scroll-button");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollButton.style.display = "block";
        setTimeout(function() {
            scrollButton.style.opacity = "1";
        }, 10); // Pequeño retraso para permitir que el cambio de estilo ocurra
    } else {
        scrollButton.style.opacity = "0";
        setTimeout(function() {
            scrollButton.style.display = "none";
        }, 500); // Coincide con la duración de la transición de opacidad
    }
};