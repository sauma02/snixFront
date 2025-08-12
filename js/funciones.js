const productosPorPagina = 12;
let productos = [];
let paginaActual = 1;
const descuento = 50000;
let producto;
let carro = [];


function obtenerCarrito() {
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
        carro = data;
        document.addEventListener("DOMContentLoaded", () => {
            const contador = document.querySelector("#contadorCarro .contador");
            if (carro.carrito === null) {
                contador.textContent = 0;
            } else {
                contador.textContent = carro.carrito.length;
            }
        });

        mapearCarrito(carro);
    }).catch(error => {
        console.error("Error: ", error);
    })
}
function mostrarPagina(pagina) {
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
        <p style="text-decoration: line-through !important; color: red !important;">$${p.precio + descuento}<p>
        <p>$${p.precio}</p>
        
        <a style="display: block;     
    margin-bottom: 3px;
    margin-top:3px; 
    text-align: center;" id="botonTituloContraentrega" data-id="${p.id}" href="" class="btn">Comprar ya contraentrega</a>        
        <a style="display: block;     
    margin-bottom: 3px; 
     margin-top:5px; 
    text-align: center;" href="#" id="botonAñadirAlCarrito" data-id="${p.id}" onclick="anadirAlCarrito(this.dataset.id)" href="" class="btn">Añadir al carrito</a>
        <a style="display: block;     
    margin-bottom: 3px;
     margin-top:5px;  
    text-align: center;" id="botonTituloTarjeta" data-id="${p.id}" href="" class="btn">Comprar ya con tarjeta</a>
        
        `;

        contenedor.appendChild(div)
    });
    paginaActual = pagina;
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


            mostrarPagina(1);
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

    }else{
            let item = carro.carrito;
            const contenedor = document.getElementById("tablaCarrito");
            contenedor.innerHTML = "";
            item.forEach(p => {
                const tableHead = document.createElement("thead");
                const tableBody = document.createElement("tbody");
                tableHead.innerHTML = `
                    <tr>
                        <th>Producto:</th>
                        <th>Cantidad:</th>
                        <th>Precio:</th>
                    </tr>
                `;
                tableBody.innerHTML=`
                    <tr>
                        <td>${p.dto.nombre}</td>
                        <td>${p.cantidad}</td>
                        <td>${p.precio}</td>
                    </tr> 
                `;
            });
            

    }

}
function anadirAlCarrito(id) {

}
listarProductos();
obtenerCarrito();