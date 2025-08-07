const productosPorPagina = 12;
let productos = [];
let paginaActual = 1;

function mostrarPagina(pagina){
    const contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML="";
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productos.slice(inicio, fin);

    productosPagina.forEach(p => {
        const div = document.createElement("div");
        div.className = "col-4";
        div.innerHTML=`
        <a class="aProductos" href="home/productos/detallesProducto/${p.id}">
        <img class="imagenProductos" src="${p.imageUrl}" alt="${p.nombre}">
        </a>
        <h4>${p.nombre}</h4>
        <div class="rating">
        ${generarEstrellas(p.rating)}
        </div>
        <p>$${p.precio}</p>        
        `;

        contenedor.appendChild(div)
    });
    paginaActual = pagina;
}

function generarEstrellas(rating){
    let estrellas ="";
    const enteras = Math.floor(rating);
    const media = rating % 1 >= 0.5;

    for(let i = 0; i < enteras; i++) estrellas += `<i class="fa-solid f-star"></i>`;
    if(media) estrellas += `<i class="fa-solid fa-star-half-stroke"></i>`;
    const vacias = 5 - enteras - (media ? 1: 0);
    for(let i = 0; i< vacias;i++) estrellas += `<i class="fa-regular fa-star"></i>`;

    return estrellas;
}

function crearPaginacion(){
    const contenedorPag = document.getElementById("paginacion");
    contenedorPag.innerHTML="";

    const totalPag = Math.ceil(productos.length / productosPorPagina);
    for (let i = 0; i < totalPag; i++) {
        const span = document.createElement("span");
        span.textContent = i + 1;
        if(i === paginaActual) span.classList.add("activo");
        span.addEventListener("click", () =>{
            mostrarPagina(i);
            crearPaginacion();
        });
        contenedorPag.appendChild(span);
        
    }
}











function listarProductos() {
fetch("http://localhost:1000/home/productos", {
    method:"GET",
    headers:{
        "Content-Type":"application/json"
    }
})
.then(response =>{
    if(!response.ok){
        console.error("Error al obetener productos");
    }
   
    return response.json();
})
.then(data =>{
        console.log(data);
      productos = data.dtos;  
    
    
    mostrarPagina(1);
    crearPaginacion();
   
    
})
.catch(error => {
    console.error("Error al traer los productos:", error);
});


}
listarProductos();