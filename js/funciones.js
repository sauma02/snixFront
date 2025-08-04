function listarProductos() {
fetch("https://localhost:1000/home/productos", {
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

    data.forEach(dtos => {
        console.log("Producto:", dtos.nommbre)
    });
})
.catch(error => {
    console.error("Error al traer los productos:", error);
});


}
listarProductos();