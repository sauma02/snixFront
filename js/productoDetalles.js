
const params = new URLSearchParams(window.location.search);

const id = params.get("id");
let recomendados = [];
const desc = 2;
let produ;
let carro = JSON.parse(localStorage.getItem("carro")) || [];


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
function actualizarContador() {
    const contador = document.getElementById("contadorCarro");
    contador.textContent = carro.length;
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

function todosLosProductos() {

    fetch(`http://localhost:1000/home/productos/recomendados/${id}`, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error inesperado: ${response.status}`);
        }

        return response.json();
    }).then(data => {
        if (data.clase == "error") {
            console.error(data.mensaje);
        }


        productosRecomendados(data);
        mapearCarrito(carro);

    }).catch(error => {
        console.error("Error: ", error);
    });

}
function detallesProducto() {

    if (!id) {
        console.error("La id es null");
        return;
    }

    fetch(`http://localhost:1000/home/productos/detallesProducto/${id}`, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error inesperado: ${response.status}`);
        }

        return response.json();

    }).then(data => {

        console.log(data.dto);
        produ = data.dto;


        producto(produ);




    }).catch(error => {
        console.log("Error inesperado", error);
    });
}

function anadirAlCarrito(element, cantidadNueva) {
    const id = element.getAttribute("data-id");
    const cantidad = parseInt(cantidadNueva) || 1;

    if (!produ.id === id) {
        console.error("No existe este producto");
        return;
    }
    const itemExistente = carro.find(item => item.id === id);
    itemExistente.cantidad = parseInt(itemExistente.cantidad);
    console.log(id);
    console.log(cantidad, typeof cantidad);
    console.log(itemExistente.cantidad, typeof itemExistente.cantidad);

    if (itemExistente) {

        itemExistente.cantidad += cantidad;
        console.log("Cantidad aumentada");

    } else {
        carro.push({ ...produ, cantidad: cantidad });
        console.log("Producto añadido con exito");

    }
    console.log(carro);
    localStorage.setItem("carro", JSON.stringify(carro));
    mapearCarrito(carro);
    return carro;

}
async function hacerPedidoCarrito() {
    const form = document.getElementById('formularioPedidoWhatsApp');
    

    const color = document.getElementById("color");
    console.log("id", carro[0].id);
    const formData = new FormData(form);


    if (formData.get("autorizacion") === "1") {
        formData.set("autorizacion", "autorizado");

    }
    producto.color=color;
    formData.append("productoId", carro[0].id)

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

        carro.forEach(producto => {
            mensaje += `
- ${producto.nombre} (x${producto.cantidad}) - $${(producto.cantidad * producto.precio).toLocaleString()}
  Talla: ${producto.talla}
  Color: ${producto.color}`;
        });

        const total = carro.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

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




function producto(p) {
    const contenedor = document.getElementById("rowProducto");
    contenedor.innerHTML = "";

    const div = document.createElement("div");
    const div2 = document.createElement("div");
    div.className = "col-2";
    div2.className = "col-2";
    div.innerHTML = `
                <div class="imagen-principal">
                <img class="main-image" id="imagenProducto" src="${p.imageUrl[0]}" data-index="1" alt="">
                </div>
                <div class="small-image-row">
                    <div class="small-img-col active">
                        <img src="${p.imageUrl[0]}" data-index="1" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[1]}" data-index="2" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[2]}" data-index="3" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[3]}" data-index="4" alt="">
                    </div>
                  
                    
                    
                </div>`;
    div2.innerHTML = `
                <p>${p.categoria} - ${p.marca}</p>
                <h1>${p.nombre}</h1>
                <h4 style="text-decoration: line-through 
                !important; color: red !important;">
                $${p.precio * desc} Antes</h4>
                <h4>$${p.precio} Ahora</h4>
                <p>Talla<p>
                <select name="talla" id="tall">
                    <option>38</option>
                    <option>39</option>
                    <option>40</option>
                    <option>41</option>
                    <option>42</option>
                    <option>43</option>
                </select>
                <select name="color" id="color">
                    <option>Rojo</option>
                    <option>Verde</option>
                    <option>Azul</option>
                    <option>Negro</option>
                </select>
                <br>
                <input id="cantidad" type="number" name="cantidad" value="1">
                <a style="cursor:pointer;" id="botonAñadirAlCarrito" data-id="${p.id}" onclick="anadirAlCarrito(this, this.previousElementSibling.value)" class="btn">Añadir al carrito</a>
                <br>
                 <a style="cursor:pointer;"id="botonTituloContraentrega" data-id="${p.id}" onclick="mostrarForm(this)" class="btn">Comprar ya contraentrega</a>
                 <br> 
                 
                <br>
                <br>
                <h3>Detalles del producto<i class="fa fa-indent"></i></h3>
                <br>
                <p>${p.detalles}
                <div class="small-image-row"
                <div class="small-image-col">
                    <img id="guiaTallas" src="images/guiaTallas.png">
                </div>
                </div>
                </p>

    `;


    contenedor.appendChild(div);
    contenedor.appendChild(div2);
    return contenedor;

}

function productosRecomendados(rec) {
    const contenedor = document.getElementById("rowRecomendados");
    contenedor.innerHTML = "";
    if (rec.clase == "error") {
        const div = document.createElement("div");

        div.className = "col-4";

        div.innerHTML = `
        
        <h4>${rec.mensaje}</h4>
    `;
        contenedor.appendChild(div);
        return contenedor;
    }
    rec.recomendados.forEach(p => {
        const div = document.createElement("div");
        div.className = "col-4";
        div.innerHTML = `
        <a href="detallesProducto.html?id=${p.id}">
        <img src="${p.imageUrl[0]}"  alt="${p.nombre}">
        </a>
        <h4>${p.nombre}</h4>
    `;
        contenedor.appendChild(div);
    });
    return contenedor;

}
async function hacerPedido(element) {
    const form = document.getElementById('formularioPedidoWhatsApp');


    const productoId = element.getAttribute("data-id");
    const talla = document.getElementById("tall").value;
    const cantidad = document.getElementById("cantidad").value;
    const color = document.getElementById("color").value;
    const formData = new FormData(form);


    for (let [key, value] of formData.entries()) {

        console.log(key, value);
    }
    formData.append("nombreProducto: ", produ.nombre);
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
        let mensaje = `*¡Hola ${formData.get("nombre")}* 👋

Tu pedido ya está listo para ser empacado 🚚

📋 *DATOS DE ENTREGA*:
📞 Celular: ${formData.get("contacto")}
📍 Dirección: ${formData.get("direccion")}
🏙 Departamento: ${formData.get("depto")}
🌆 Ciudad: ${formData.get("ciudad")}

🛍 *TUS PRODUCTOS*:
- ${produ.nombre} (${cantidad}) - $${produ.precio * cantidad}
  Talla: ${talla};
  Color: ${color};

💰 TOTAL A PAGAR: $${produ.precio * cantidad}

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

detallesProducto();
todosLosProductos();
