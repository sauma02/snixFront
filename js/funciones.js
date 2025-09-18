document.charset = "UTF-8";
let csrfToken;
const params = new URLSearchParams(window.location.search);
let id = params.get("id");
const productosPorPagina = 12;
let productos = [];
let paginaActual = 1;
const descuento = 2;
let producto;
let carro = [];


function obtenerCarrito() {

    const carroGuardado = JSON.parse(localStorage.getItem("carro")) || [];
    if (carroGuardado && carroGuardado.length > 0) {
        carro = carroGuardado;
        mapearCarrito(carro);
        return;
    }



    fetch("http://localhost:1000/home/carrito", {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error inesperados encontrado ${response.status}`)
        }
        return response.json();
    }).then(data => {
        carro = data.carrito;
        console.log(carro);
        localStorage.setItem("carro", JSON.stringify(carro));



        mapearCarrito(carro);
    }).catch(error => {
        console.error("Error: ", error);
    })
}
function actualizarContador() {
    const contador = document.getElementById("contadorCarro");
    contador.textContent = carro.length;
}
function mostrarPagina(productos, pagina) {
    const contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML = "";
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach(p => {

        const div = document.createElement("div");
        div.className = "col-4";
        div.innerHTML = `
        <a class="aProductos" href="detallesProducto.html?id=${p.id}">
        <img class="imagenProductos" src="${p.imageUrl[0]}" alt="${p.nombre}">
        </a>
        <h4>${p.nombre}</h4>
        <div class="rating">
        ${generarEstrellas(p.rating)}
        </div>
        <p style="text-decoration: line-through !important; color: red !important;">$${p.precio * descuento} Antes</p>
        <p>$${p.precio} Ahora</p>
        
        <a style="display: block;     
    margin-bottom: 3px;
    margin-top:3px; 
    text-align: center;" id="botonTituloContraentrega" data-id="${p.id}" onclick="mostrarForm(this)" class="btn">Comprar ya contraentrega</a>        
        <a style="display: block;     
    margin-bottom: 3px; 
     margin-top:5px; 
    text-align: center;" href="#" id="botonAñadirAlCarrito" data-id="${p.id}" onclick="anadirAlCarrito(${p.id})" href="" class="btn">Añadir al carrito</a>
        
        `;

        contenedor.appendChild(div)
    });
    paginaActual = pagina;
}
function textEmoji(mensaje) {
    const emojiMap = {
        '👋': '👋',
        '🚚': '🚚',
        '📋': '📋',
        '📞': '📞',
        '📍': '📍',
        '🏙': '🏙',
        '🌆': '🌆',
        '🛍': '🛍',
        '💰': '💰',
        '⚡': '⚡',
        '🚀': '🚀',
        '👉': '👉',
        '👇': '👇',
        '❤️': '❤️'
    };

    return mensaje;
}
async function hacerPedidoCarrito(carrito) {
    const form = document.getElementById('formularioPedidoWhatsApp');
    carrito = carro;


    console.log(carrito);
    const formData = new FormData(form);


    if (formData.get("autorizacion") === "1") {
        formData.set("autorizacion", "autorizado");

    }
    formData.append("productoId", carrito[0].id)

    fetch(`http://localhost:1000/home/producto/pedido/form`, {
        method: "POST",
        body: formData
    }).then(response => {
        if (!response.ok) {
            console.error(`Error inesperado: ${response.status}`);
        }

        return response.json();
    }).then(data => {
        if (data.clase === "error") {
            console.error(`Error: ${data.mensaje}`);
        }

        let mensaje = `¡Hola ${formData.get("nombre")}! 👋

Tu pedido ya está listo para ser empacado 🚚

📋 *DATOS DE ENTREGA:*
📞 Celular: ${formData.get("contacto")}
📍 Dirección: ${formData.get("direccion")}
🏙 Departamento: ${formData.get("depto")}
🌆 Ciudad: ${formData.get("ciudad")}

🛍 *TUS PRODUCTOS:*`;

        carrito.forEach(producto => {
            mensaje += `
- ${producto.nombre} (x${producto.cantidad}) - $${(producto.cantidad * producto.precio).toLocaleString()}
  Talla: ${producto.talla}`;
        });

        const total = carrito.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

        mensaje += `

💰 *TOTAL A PAGAR: $${total.toLocaleString()}*

⚡ *¡CONFIRMA AHORA!* Tu pedido será prioritario en el despacho 🚀

👉 Si todo está correcto, escribe CONFIRMAR 👇

Gracias por confiar en *SNIX.CO* ❤️`;


        mensaje = encodeURIComponent(mensaje);

        const urlWhatsApp = `https://api.whatsapp.com/send/?phone=573127764576&text=${mensaje}`;

        alert("¡Pedido realizado exitosamente! Te estamos redirigiendo a WhatsApp.");
        window.open(urlWhatsApp, "_blank");
        cerrarForm();
        return;




    }).catch(error => {
        console.error(`Error: ${error}`);
    })
}



function generarEstrellas(rating) {
    let estrellas = "";
    const enteras = Math.floor(rating);
    const media = rating % 1 >= 0.5;

    for (let i = 0; i < enteras; i++) estrellas += `<i class="fa-solid fa-star"></i>`;
    if (media) estrellas += `<i class="fa-solid fa-star-half-stroke" ></i>`;
    const vacias = 5 - enteras - (media ? 1 : 0);
    for (let i = 0; i < vacias; i++) estrellas += `<i class="fa-solid fa-star" style="color: grey;" ></i>`;

    return estrellas;
}

function crearPaginacion() {
    const contenedorPag = document.getElementById("paginacion");
    contenedorPag.innerHTML = "";

    const totalPag = Math.ceil(productos.length / productosPorPagina);
    for (let i = 0; i < totalPag; i++) {
        const span = document.createElement("span");
        span.textContent = i + 1;
        if (i === paginaActual) span.classList.add("activo");
        span.addEventListener("click", () => {
            mostrarPagina(i);
            crearPaginacion();
        });
        contenedorPag.appendChild(span);

    }
}

function eliminarProducto(id) {
    const item = carro.find(i => i.id == id);
    if (!item) {
        console.error("El producto no existe");
    }

    if (item) {
        carro = carro.filter(c => c.id !== item.id);
        localStorage.setItem("carro", JSON.stringify(carro));
        console.log("producto eliminado con exito");
        mapearCarrito(carro);
    }




}


function listarProductos() {
    fetch("http://localhost:1000/home/productos", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                console.error("Error al obetener productos");
            }

            return response.json();
        })
        .then(data => {
            console.log(data);
            productos = data.dtos;
            if (id) {
                console.log(id);
                filtrarPorCategoria();
            }

            obtenerCarrito();
            
            mostrarPagina(productos, 1);

            crearPaginacion();


        })
        .catch(error => {
            console.error("Error al traer los productos:", error);
        });


}
function redirigirProducto(id) {
    fetch(`http://localhost:1000/home/productos/detallesProducto/${id}`, {


        method: "GET",
        headers: {
            "Content-type": "application/json"

        }
    }
    )
        .then(response => {
            if (!response.ok) {
                console.error("Error al obtener datos");
            }
            return response.json();
        })
        .then(data => {
            producto = data;
            mostrarProducto(producto);
        })
        .catch(error => {
            console.log("Error al mostrar el producto: ", error);
        });
}
function mapearCarrito(carro) {

    if (carro.clase == "error") {
        console.error(carro.mensaje);
        if (carro.carrito.length === 0) {

            const contenedor = document.getElementById("tablaCarrito");
            contenedor.innerHTML = "";

            const tableHead = document.createElement("thead");
            const tableBody = document.createElement("tbody");
            tableHead.innerHTML = `
            

            <tr>
                <th>No hay productos registrados</th>
            </tr>
        `;
            tableBody.innerHTML = `
            <tr>
                <td>No hay productos registrados</td>
            </tr>
        `;

            contenedor.appendChild(tableHead);
            contenedor.appendChild(tableBody);
            return contenedor;


        }

    } else {

        const contenedor = document.getElementById("tablaCarrito");
        contenedor.innerHTML = "";
        const tableHead = document.createElement("thead");


        tableHead.innerHTML = `
                    <a id="botonCarrito" type="button" onclick="mostrarForm()" href="#">Hacer pedido</a>
                    <tr>
                        <th>Producto:</th>
                        <th>Cantidad:</th>
                        <th>Subtotal:</th>
                        <th>Accion:</th>

                    </tr>
                `;
        const tableBody = document.createElement("tbody");
        let total = 0;
        carro.forEach(p => {
            const subTotal = p.precio * p.cantidad;
            total += subTotal;


            tableBody.innerHTML += `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>
                        <input
                            type="number"
                            min="1"
                            value="${p.cantidad}"
                            onchange="cambiarCantidad(${p.id}, this.value)"
                            style="width: 50px; 
        height: 30px; 
        padding: 5px; 
        text-align: center; 
        font-size: 16px;
        border: 1px solid #ccc; 
        border-radius: 5px;"
                        >
                        </td>
                        <td>${subTotal.toLocaleString()}</td>
                        <td><a style="display: inline-block;
    align-items: center;
    flex-wrap: wrap;
    color: black;
    padding: 8px 30px;
    margin: 30px 0;
    border-radius: 30px;
    justify-content: space-around;
    transition: transform 0.5s;
    background: red;
    cursor: pointer;
    " onclick="eliminarProducto(${p.id})">Eliminar</a></td>
                    </tr>
                    
                        
                `;

        });
        tableBody.innerHTML += `
                   <tr>
                        <td>Total: </td>
                        <td>${total.toLocaleString()}</td>
                    </tr> `;

        contenedor.appendChild(tableHead);
        contenedor.appendChild(tableBody);

        actualizarContador();



    }

}
function cambiarCantidad(id, cantidad) {
    nuevaCantidad = parseInt(cantidad);
    if (nuevaCantidad < 1 || isNaN(nuevaCantidad)) {
        console.error("La cantidad no puede ser menor a 1");
        return;
    }

    const producto = carro.find(pro => pro.id == id);

    if (producto) {
        producto.cantidad = nuevaCantidad;

    }

    localStorage.setItem("carro", JSON.stringify(carro));
    mapearCarrito(carro);

}
function anadirAlCarrito(id) {


    const producto = productos.find(p => p.id == id);

    if (!producto) {
        console.error("El producto no existe o esta vacio");
    }

    const itemExistente = carro.find(item => item.id == id);
    if (itemExistente) {
        itemExistente.cantidad++;
        console.log("Cantidad aumentada");
    } else {
        carro.push({ ...producto, cantidad: 1 });
        console.log("Producto añadido con exito");
    }
    console.log(carro);
    localStorage.setItem("carro", JSON.stringify(carro));
    mapearCarrito(carro);
    return carro;


}

function filtrarProductos() {
    const orden = document.getElementById("ordenar");
    const value = orden.value;
    console.log("Filtro: ", value);
    let productosFiltrados = [...productos];
    switch (value) {
        case "precioAsc":
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case "precioDesc":
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
        case "rating":
            productosFiltrados.sort((a, b) => b.rating - a.rating);
            break;
        case "nike":
        case "skecher":
        case "puma":
        case "newBalance":
        case "converse":
        case "caterpillar":
        case "adidas":
        case "oncloud":
            productosFiltrados = productosFiltrados.filter(p => p.marca.toLowerCase() === value.toLowerCase());
            break;
        case "todasLasMarcas":
            productosFiltrados;
            break;
        default:

            console.warn("Filtro no encontrado", value);
            return;
    }
    mostrarPagina(productosFiltrados, 1);
    crearPaginacion();

}

function filtrarPorCategoria() {
    let productosFiltrados = [...productos];
    if (!id) {
        console.error("La id: es null");
        return;
    }

    switch (id.toLowerCase()) {
        case "unisex":
            productosFiltrados.filter(p => p.categoria.toLowerCase() === id.toLowerCase());
            break;
        case "tennis":
            productosFiltrados.filter(p => p.categoria.toLowerCase() === id.toLowerCase());
            break;
        case "streetwear":
            productosFiltrados.filter(p => p.categoria.toLowerCase() === id.toLowerCase());
            break;
        case "running":
            productosFiltrados.filter(p => p.categoria.toLowerCase() === id.toLowerCase());
            break;
        default:
            console.error("Error, categroia inexistente");
            break;

    }

    mostrarPagina(productosFiltrados, 1);
    crearPaginacion();
}
async function sliderProductos() {

    const sliderTracker = document.getElementById("sliderProductos");
    console.log(sliderTracker);
    sliderTracker.className = "slider-track";
    sliderTracker.innerHTML = "";
    const div = document.createElement("div");
    div.className = "slide";

    let productosFiltrados = productos.sort((a, b) => b.rating - a.rating);
    console.log(productosFiltrados);
    productosFiltrados = productosFiltrados.slice(0, 8);

    productosFiltrados.forEach(p => {
        const div2 = document.createElement("div");
        div2.className = "col-4";
        div2.innerHTML = `
                    <img src="${p.imageUrl}" alt="">
                                <h4>Zapatilla deportiva</h4>
                                <div class="rating">
                                    ${generarEstrellas(p.rating)}
                                </div>
                                <p style="text-decoration: line-through !important; color: red !important;">${p.precio - descuento * p.precio}</p>
                                <p>${p.precio}</p>
        `;
        div.appendChild(div2);
        sliderTracker.appendChild(div);
    });
    return sliderTracker;

}
/*async function getCsrfToken(){

    fetch("http://localhost:1000/home/csrf-token", {
        method: "GET",
        headers: {
            "Content-type":"applicaction/json"
        }

    }).then(response => {
        if(!response.ok){
            throw new Error(`Error al traer respuesta: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        csrfToken = data;
        console.log(csrfToken);
    }).catch(error => {
        console.log("Error inesperado: ", error);
    })
}*/

async function hacerPedido(element) {
    const form = document.getElementById('formularioPedidoWhatsApp');


    const productoId = element.getAttribute("data-id");
    const productoNombre = await fetch(`http://localhost:1000/home/productos/detallesProducto/${productoId}`, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                console.error("Error al traer producto");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            return data.dto;
        })
        .catch(error => {
            console.error("Error:", error);
        })

    const formData = new FormData(form);


    for (let [key, value] of formData.entries()) {

        console.log(key, value);
    }


    formData.append("productoId", productoId);

    if (formData.get("autorizacion") === "1") {
        formData.set("autorizacion", "autorizado");
    }
    fetch(`http://localhost:1000/home/producto/pedido/form`, {
        method: "POST",

        body: formData

    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error inesperado: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        if (data.clase === "error") {
            console.error(data.mensaje);
            return;
        }
        const mensaje = `
*¡Hola ${formData.get("nombre")}* 👋

Tu pedido ya está listo para ser empacado 🚚

📋 *DATOS DE ENTREGA*:
📞 Celular: ${formData.get("contacto")}
📍 Dirección: ${formData.get("direccion")}
🏙 Departamento: ${formData.get("depto")}
🌆 Ciudad: ${formData.get("ciudad")}

🛍 *TUS PRODUCTOS*:
- ${productoNombre.nombre} (${productoNombre.cantidad}) - $${productoNombre.precio * productoNombre.cantidad}
  Talla: ${productoNombre.talla};

💰 TOTAL A PAGAR: $${productoNombre.precio * productoNombre.cantidad}

⚡ ¡CONFIRMA AHORA! Tu pedido será prioritario en el despacho 🚀

👉 Si todo está correcto, escribe CONFIRMAR 👇

Gracias por confiar en SNIX.CO ❤️`;

        mensaje = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://api.whatsapp.com/send/?phone=573127764576&text=${mensaje}`;
        alert("¡Pedido realizado exitosamente! Te estamos redirigiendo a WhatsApp.");
        window.open(urlWhatsApp, "_blank");
        cerrarForm();
        return;


    }).catch(error => {
        console.error("Error inesperado: ", error);
    });

}

//getCsrfToken();

window.addEventListener("DOMContentLoaded", () =>{
    listarProductos();
sliderProductos();
});



