var Producto = function(id, imagen, nombre, descripcion, precio, stock,categoria) {
    this.id = id;
    this.imagen = imagen;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.stock = stock;
    this.categoria = categoria
  }
  var arrProductos = [];
  
  function LeerJSON() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'assets/data/data.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var dataProductos = JSON.parse(xhr.responseText);
            arrProductos = dataProductos.productos.map(function(p) { return new Producto(p.id, p.imagen, p.nombre, p.descripcion, p.precio, p.stock, p.categoria); });  
            console.log("Productos cargados:", arrProductos);
  
            // Aplicar overrides de stock persistidos tras finalizar compra
            var almacenStocks = localStorage.getItem('stocks');
            if (almacenStocks) {
              var overrides = {};
              try { overrides = JSON.parse(almacenStocks); } catch (err) { overrides = {}; }
              for (var si = 0; si < arrProductos.length; si++) {
                var pr = arrProductos[si];
                if (overrides && overrides[String(pr.id)] != null) {
                  pr.stock = overrides[String(pr.id)];
                }
              }
            }
          } catch (e) {
            console.error('Error JSON', e);
          }
        } else {
          console.error('Error al cargar el archivo:', xhr.statusText);
        }
      }
    };
    xhr.send();
  }

// Listado de Productos
function cargarListadoProductos() {
    const tablaProductos = document.getElementById('tablaProductos');
    tablaProductos.innerHTML='';

    if (arrProductos.length > 0) {
        tablaProductos.innerHTML = listadoProductos(arrProductos)
    }else {
        LeerJSON()
            .then(() => {
                tablaProductos.innerHTML = listadoProductos(arrProductos);
            })
            .catch(error => {
                tablaProductos.innerHTML = `
                    <div class="alert alert-danger">
                        <h4>Error al cargar productos</h4>
                        <p>${error.message}</p>
                        <button class="btn btn-primary mt-2" onclick="cargarListadoProductos()">Reintentar</button>
                    </div>
                `;
            });
    }
}

function listadoProductos(productos) {
    if(productos.length === 0) {
        return `
        <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                No hay productos disponibles
            </div>
        `
    };

    let tablaHTML = `
    <div class="table-responsive">
    <table class="table table-striped table-hover">
    <thead class="table-dark">
        <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th></th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    `;
    productos.forEach(producto => {
        tablaHTML+= `
        <tr>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion}</td>
        <td>$${producto.precio}</td>
        <td>${producto.categoria}</td>
        <td>${producto.stock}</td>
        <td><button class="btn btn-secondary" onclick="editarProducto()">
            <i class="fa-solid fa-edit text-white"></i></button>
        </td>
        <td>
            <button class="btn btn-danger" onclick="eliminarProducto()">
                <i class="fa-solid fa-trash text-white"></i></button>
        </td>
        </tr>
        `
    });
    tablaHTML += `
    </tbody>
</table>
</div>
`;    
return tablaHTML;
}
    
function editarProducto() {
    console.log('Editar producto')
}
function eliminarProducto() {
    console.log('Borrar producto')
}
