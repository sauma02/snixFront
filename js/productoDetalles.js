const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let recomendados = [];
const desc = 50000.00;
let produ;

function todosLosProductos(){

    fetch(`http://localhost:1000/home/productos/recomendados/${id}`, {
        method: "GET",
        headers: {
            "Content-type":"application/json"
        }
    }).then(response =>{
        if(!response.ok){
            throw new Error(`Error inesperado: ${response.status}`);
        }
        
        return response.json();
    }).then(data => {
        if(data.clase == "error"){
            console.error(data.mensaje);
        }
        
        
        productosRecomendados(data);

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





function producto(p) {
    const contenedor = document.getElementById("rowProducto");
    contenedor.innerHTML = "";

    const div = document.createElement("div");
    const div2 = document.createElement("div");
    div.className = "col-2";
    div2.className = "col-2";
    div.innerHTML = `
        
                <img id="imagenProducto" src="${p.imageUrl[0]}" alt="" width="100%">
                <div class="small-image-row">
                    <div class="small-img-col">
                        <img src="${p.imageUrl[1]}" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[2]}" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[3]}" alt="">
                    </div>
                    <div class="small-img-col">
                        <img src="${p.imageUrl[4]}" alt="">
                    </div>
                </div>`;
    div2.innerHTML = `
                <p>${p.categoria} - ${p.marca}</p>
                <h1>${p.nombre}</h1>
                <h4 style="text-decoration: line-through 
                !important; color: red !important;">
                ${p.precio - desc}</h4>
                <h4>${p.precio}</h4>
                <select name="" id="">
                    <option></option>
                    <option></option>
                    <option></option>
                    <option></option>
                </select>
                <br>
                <input type="number" value="1">
                <a id="botonAñadirAlCarrito" data-id="${p.id}" href="" class="btn">Añadir al carrito</a>
                <br>
                 <a id="botonTituloContraentrega" data-id="${p.id}" href="" class="btn">Comprar ya contraentrega</a>
                 <br> 
                 
                <br>
                <br>
                <h3>Detalles del producto<i class="fa fa-indent"></i></h3>
                <br>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
                    Deleniti assumenda id perferendis libero, consectetur nihil 
                    quasi magnam cum soluta recusandae earum necessitatibus quam 
                    quod facilis nemo odit excepturi. Maxime, nihil?</p>

    `;

    
    contenedor.appendChild(div);
    contenedor.appendChild(div2);
    return contenedor;

}

function productosRecomendados(rec){
    const contenedor = document.getElementById("rowRecomendados");
    contenedor.innerHTML="";
    if(rec.clase == "error"){
    const div = document.createElement("div");

    div.className="col-4";

    div.innerHTML=`
        
        <h4>${rec.mensaje}</h4>
    `;
    contenedor.appendChild(div);
    return contenedor;
    }
    rec.recomendados.forEach(p => {
    const div = document.createElement("div");
    div.className="col-4";
    div.innerHTML=`
        <a href="detallesProducto.html?id=${p.id}">
        <img src="${p.imageUrl[0]}"  alt="${p.nombre}">
        </a>
        <h4>${p.nombre}</h4>
    `;
    contenedor.appendChild(div);
    });
    return contenedor;
    
}

detallesProducto();
todosLosProductos();
