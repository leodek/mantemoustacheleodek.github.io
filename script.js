function comprar(productoId) {
    // Simulación de pago con PayPal
    const productos = {
        producto1: { nombre: "Ebook Marketing Digital", precio: 10, archivo: "ebook.pdf" },
        producto2: { nombre: "Plantilla PowerPoint", precio: 8, archivo: "plantilla.pptx" }
    };

    const producto = productos[productoId];
    const linkPago = `https://www.paypal.com/paypalme/tuusuario/${producto.precio}USD`;

    // Redirigir a PayPal (luego el cliente volverá a la página)
    alert(`Redirigiendo a PayPal para pagar ${producto.nombre} (${producto.precio} USD)`);
    window.open(linkPago, '_blank');

    // En un caso real, aquí integrarías la API de PayPal para generar links de descarga automáticos.
}