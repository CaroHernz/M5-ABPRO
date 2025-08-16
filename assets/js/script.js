var Producto = function(id, imagen, nombre, descripcion, precio, stock) {
  this.id = id;
  this.imagen = imagen;
  this.nombre = nombre;
  this.descripcion = descripcion;
  this.precio = precio;
  this.stock = stock;
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
          //arrProductos = dataProductos.productos; // Asigna directamente
          arrProductos = dataProductos.productos.map(function(p) { return new Producto(p.id, p.imagen, p.nombre, p.descripcion, p.precio, p.stock); });// Asigna los productos a la clase Producto

          console.log("Productos cargados:", arrProductos);

          // ✅ Ahora sí: renderiza las cards
          novedadesProductos(arrProductos);
          mostrarProductos(arrProductos);

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

function actualizarDisponibilidadEnCards() {
  for (var i = 0; i < arrProductos.length; i++) {
    var producto = arrProductos[i];
    var existente = null;
    for (var j = 0; j < carrito.length; j++) {
      if (String(carrito[j].id) === String(producto.id)) { existente = carrito[j]; break; }
    }
    var enCarrito = existente ? existente.cantidad : 0;
    var disponible = Math.max(0, producto.stock - enCarrito);
    var agotado = producto.stock <= 0 || disponible <= 0;

    var input = document.getElementById('cinput-' + producto.id);
    if (input) {
      input.max = String(disponible);
      if (agotado) {
        input.value = '0';
        input.setAttribute('disabled', '');
      } else {
        input.removeAttribute('disabled');
      }
    }

    var btnAgregar = document.querySelector('[data-id="' + producto.id + '"]');
    if (btnAgregar) {
      if (agotado) {
        btnAgregar.setAttribute('disabled', '');
      } else {
        btnAgregar.removeAttribute('disabled');
      }
    }

    var indicador = document.getElementById('stock-indicator-' + producto.id);
    if (indicador) {
      var stockMsg = '';
      if (agotado) {
        stockMsg = '<span class="badge bg-secondary">Agotado</span>';
      } else if (producto.stock === 1 || disponible === 1) {
        stockMsg = '<small class="text-danger">¡Último producto!</small>';
      } else if (producto.stock < 4) {
        stockMsg = '<small class="text-warning">Quedan ' + producto.stock + ' en stock</small>';
      }
      indicador.innerHTML = stockMsg;
    }
  }
}
addEventListener('DOMContentLoaded', function () {
  LeerJSON()
})

var carrito = JSON.parse(localStorage.getItem('carrito')) || [];
var carritoItems = null;

var carritoSummary = document.getElementById('carrito-summary');
var productList = document.getElementById('catalogo_productos');

// Bienvenida al sitio web
var bienvenida = document.getElementById("bienvenida");
if (bienvenida) {
  if (localStorage.getItem("user")) {
    var user = localStorage.getItem("user");
    bienvenida.innerHTML = "Bienvenido " + user + " a nuestra tienda digital.";
  }
  else {
    var user = prompt("Ingrese su nombre y apellido.");
    bienvenida.innerHTML = "Bienvenido " + user + " a nuestra tienda digital.";
    localStorage.setItem("user", user);
  }

}
//Productos en Novedades
var novProductos = document.getElementById('novedades_productos');

function novedadesProductos(productos) {
  var novProductos = document.getElementById('novedades_productos');

  if (!novProductos) {
    console.error('No se encontró #novedades_productos');
    return;
  }
  while (novProductos.firstChild) {
    novProductos.removeChild(novProductos.firstChild);
  }

  var ultimosProductos = productos.slice(-3);
  for (var i = 0; i < ultimosProductos.length; i++) {
    var producto = ultimosProductos[i];
    var col = document.createElement('div');
    col.className = 'col-sm-12 col-md-4 mb-4';

    var card = document.createElement('div');
    card.className = 'card h-100';

    var img = document.createElement('img')
    img.src = producto.imagen
    img.className = 'card-img-top'
    img.alt = producto.nombre

    var cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    var cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = producto.nombre;

    var cardText = document.createElement('p');
    cardText.className = 'card-text';
    cardText.textContent = producto.descripcion;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    var cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer bg-white border-0';

    var cardPrecio = document.createElement('h4');
    cardPrecio.className = 'text-primary mt-3';
    cardPrecio.textContent = '$' + producto.precio.toLocaleString('es-CL');

    var btnContenedor = document.createElement('div');
    btnContenedor.className = 'd-flex justify-content-end align-items-center';

    var btnVermas = document.createElement('a');
    btnVermas.href = 'productos.html?id=' + producto.id;
    btnVermas.className = 'btn btn-outline-primary';
    btnVermas.textContent = 'Ver más...'

    cardFooter.appendChild(cardPrecio);
    cardFooter.appendChild(btnContenedor)
    btnContenedor.appendChild(btnVermas)

    card.appendChild(img);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    col.appendChild(card);
    novProductos.appendChild(col)
  }
};

// Card para Productos
function mostrarProductos(productos) {
  var productList = document.getElementById('catalogo_productos');
  carritoItems = document.getElementById('carrito-items')

  if (!productList) {
    console.error('No se encontró #catalogo_productos');
    return;
  }

  if (!carritoItems) {
    console.error('No se encontró #carrito-items');
    return;
  }
  if (productList) {
    productList.innerHTML = '';
    productos.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-sm-12 col-md-4 mb-4';
      var existenteEnCarrito = carrito.find(function (item) { return String(item.id) === String(producto.id); });
      var enCarrito = existenteEnCarrito ? existenteEnCarrito.cantidad : 0;
      var disponible = Math.max(0, producto.stock - enCarrito);
      var agotado = producto.stock <= 0 || disponible <= 0;
      var stockMsg = '';
      if (agotado) {
        stockMsg = '<span class="badge bg-secondary">Agotado</span>';
      } else if (producto.stock === 1 || disponible === 1) {
        stockMsg = '<small class="text-danger">¡Último producto!</small>';
      } else if (disponible < 4 || producto.stock < 4) {
        stockMsg = '<small class="text-warning">Quedan ' + disponible + ' en stock</small>';
      }

      col.innerHTML = col.innerHTML =
        '<div class="card h-100">' +
          '<img src="' + producto.imagen + '" class="card-img-top" alt="' + producto.nombre + '">' +
        '<div class="card-body">' +
          '<h5 class="card-title">' + producto.nombre + '</h5>' +
          '<p class="card-text">' + producto.descripcion + '</p>' +
        '</div>' +
        '<div class="card-footer bg-white border-0">' +
          '<h4 class="text-primary mt-3">$' + producto.precio.toLocaleString('es-CL') + '</h4>' +
          '<div id="stock-indicator-' + producto.id + '" class="mt-2">' + stockMsg + '</div>' +
        '<div class="d-flex justify-content-between align-items-center">' +
        '<div class="input-group" style="width: 9.7rem;">' +
        '<button class="btn btn-outline-secondary minus-btn" type="button"' + (agotado ? ' disabled' : '') + '>-</button>' +
        '<input type="number" class="form-control text-center quantity-input" id="cinput-' + producto.id + '" value="0" min="0" max="' + disponible + '" step="1"' + (agotado ? ' disabled' : '') + '>' +
        '<button class="btn btn-outline-secondary plus-btn" type="button"' + (agotado ? ' disabled' : '') + '>+</button>' +
        '</div>' +
        '<button type="button" class="btn btn-primary" onclick="agregaCarrito(\'' + producto.id + '\')" data-id="' + producto.id + '" data-toggle="tooltip" data-placement="top" title="Añadir al carrito"' + (agotado ? ' disabled' : '') + '>Agregar</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      productList.appendChild(col);

      // Selecciona todos los grupos de cantidad dentro de este producto
      col.querySelectorAll('.input-group').forEach(function (group) {
        var minusBtn = group.querySelector('.minus-btn');
        var plusBtn = group.querySelector('.plus-btn');
        var input = group.querySelector('.quantity-input');

        minusBtn.addEventListener('click', function () {
          var step = (input.step && input.step !== 'any') ? Number(input.step) : 1;
          var min = input.min !== '' ? Number(input.min) : 0;
          var current = isFinite(Number(input.value)) ? Number(input.value) : 0;
          var next = Math.max(min, current - step);
          input.value = next;
          validarDecimalPositivo(input);
        });

        plusBtn.addEventListener('click', function () {
          var step = (input.step && input.step !== 'any') ? Number(input.step) : 1;
          var current = isFinite(Number(input.value)) ? Number(input.value) : 0;
          var max = input.max !== '' ? Number(input.max) : Infinity;
          var next = Math.min(max, current + step);
          input.value = next;
          validarDecimalPositivo(input);
        });
      });
    });
    if (typeof actualizarDisponibilidadEnCards === 'function') {
      actualizarDisponibilidadEnCards();
    }
  }
};
// Validar input de cantidad para que no se pueda ingresar un numero negativo u otro caracter
function validarDecimalPositivo(inputEl) {
  var valor = String(inputEl.value).replace(',', '.').trim();
  var num = Number(valor);
  var minValue = inputEl.min !== '' ? Number(inputEl.min) : 0;
  var maxValue = inputEl.max !== '' ? Number(inputEl.max) : Infinity;
  var esEntero = Number.isInteger(num);
  var esValido = valor !== '' && isFinite(num) && esEntero && num >= minValue && num <= maxValue;
  inputEl.classList.toggle('is-invalid', !esValido);
  return esValido;
}

// Validar mientras se escribe y al salir del campo
document.addEventListener('input', (e) => {
  if (e.target.matches('.quantity-input')) validarDecimalPositivo(e.target);
});
document.addEventListener('blur', (e) => {
  if (e.target.matches('.quantity-input')) validarDecimalPositivo(e.target);
}, true);


//filtro
var filtroProductos = document.getElementById("filtroProductos");
if (filtroProductos) {
  filtroProductos.addEventListener("input", (e) => {
    var productosFiltrados = arrProductos.filter(producto => {
      return producto.nombre.toLowerCase().includes(e.target.value.toLowerCase())
    });
    mostrarProductos(productosFiltrados);
  });
}

//tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

// offcanvas
var btnCarrito = document.getElementById("btnCarrito");
var offcanvascarrito = new bootstrap.Offcanvas(document.getElementById("offcanvasCarrito"));
btnCarrito.addEventListener("click", () => {
  offcanvascarrito.toggle();
});

// Carrito
function agregaCarrito(productId) {
  var cantidadProducto = document.getElementById(`cinput-${productId}`);
  if (!cantidadProducto) {
    console.error(`Input cinput-${productId} no encontrado`);
    return;
  }

  var valor = String(cantidadProducto.value).replace(',', '.').trim();
  var cantidad = Number(valor);

  if (!isFinite(cantidad) || !Number.isInteger(cantidad) || cantidad < 1) {
    cantidadProducto.classList.add('is-invalid');
    cantidadProducto.focus();
    return;
  }

  cantidadProducto.classList.remove('is-invalid');

  // Lógica mínima de agregado (no solicitada, pero útil): sumar al carrito en memoria
  var producto = arrProductos.find(p => String(p.id) === String(productId));
  if (!producto) return;

  var existente = carrito.find(item => String(item.id) === String(productId));
  var enCarrito = existente ? existente.cantidad : 0;
  var disponible = Math.max(0, producto.stock - enCarrito);

  if (producto.stock <= 0 || disponible <= 0) {
    mostrarNotificacion('Producto sin stock');
    return;
  }

  if (cantidad > disponible) {
    cantidadProducto.classList.add('is-invalid');
    cantidadProducto.value = String(disponible);
    cantidadProducto.focus();
    mostrarNotificacion('Solo ' + disponible + ' disponible(s)');
    return;
  }
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  // Reiniciar el input después de agregar (opcional)
  cantidadProducto.value = '0';

  renderCarrito();

  if (typeof actualizarDisponibilidadEnCards === 'function') {
    actualizarDisponibilidadEnCards();
  }

  mostrarNotificacion("¡" + cantidad + " " + producto.nombre +" agregado(s) al carrito!");
}
function mostrarNotificacion(mensaje) {
  var notificacion = document.createElement('div');
  notificacion.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x m-3';
  notificacion.style.zIndex = '1000';
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);

  setTimeout(() => {
    notificacion.classList.add('fade-out');
    setTimeout(() => notificacion.remove(), 500);
  }, 2500);
}


function cambiarCantidad(id, delta) {
  var input = document.getElementById("cinput-"+id);
  if (!input) return;
  var valor = parseInt(input.value) + delta;
  if (valor < 1) valor = 1;
  input.value = valor;
};

function renderCarrito() {
  var seccionCarrito = document.getElementById('seccion-carrito')
  var tabla = document.getElementById('tabla-carrito');
  var tbody = tabla.querySelector('tbody');
  var contadorCarrito = document.getElementById('contador-carrito');

  if (!tabla) {
    console.error('Tabla del carrito no encontrada');
    return;
  }

  tbody.innerHTML = '';

  if (carrito.length === 0) {
    seccionCarrito.style.display = 'none';
    document.getElementById('mensaje-carrito-vacio').style.display = 'block';
    return;
  } else {
    seccionCarrito.style.display = 'block';
    document.getElementById('mensaje-carrito-vacio').style.display = 'none';
  }
  for (var i = 0; i < carrito.length; i++) {
    var item = carrito[i];
    var tr = document.createElement('tr');
    tr.innerHTML =
        '<td>' + item.id + '</td>' +
        '<td class="text-center">' +
          '<div class="d-flex justify-content-center align-items-center">' +
            '<button class="btn btn-outline-secondary minus-btn" type="button" onclick="modificarCantidad(\'' + item.id + '\', -1)">-</button>' +
            '<span class="mx-2 cantidad-item">' + item.cantidad + '</span>' +
            '<button class="btn btn-outline-secondary plus-btn" type="button" onclick="modificarCantidad(\'' + item.id + '\', 1)">+</button>' +
          '</div>' + '</td>' +
        '<td>' + item.nombre + '</td>' +
        '<td>$' + (item.precio * item.cantidad).toLocaleString('es-CL') + '</td>' +
        '<td><button class="btn btn-danger" onclick="eliminarDelCarrito(\'' + item.id + '\')">' +
            '<i class="fa-solid fa-trash text-white"></i>' +
        '</button></td>';
    tbody.appendChild(tr);
  };
  // Totalizador
  var neto = carrito.reduce(function(sum, item){return sum + item.cantidad * item.precio}, 0);
  var iva = Math.trunc(neto * 0.19);
  var bruto = neto + iva;
  var despacho = bruto < 100000 ? Math.trunc(bruto * 0.05) : 0;
  bruto += despacho;

  carritoSummary.innerHTML = 
    '<p><strong>Valor Neto:</strong> $' + neto.toLocaleString('es-CL') + '</p>' +
    '<p><strong>IVA 19%:</strong> $' + iva.toLocaleString('es-CL') + '</p>' +
    (despacho > 0 
        ? '<p><strong>Despacho:</strong> $' + despacho.toLocaleString('es-CL') + '</p>' 
        : '<p><strong>Despacho: ¡Envío gratis!</strong></p>'
    ) +
    '<p><strong>Valor Bruto:</strong> $' + bruto.toLocaleString('es-CL') + '</p>' +
    '<div class="d-flex justify-content-around">' +
        '<button type="button" class="btn btn-danger mb-5" onclick="vaciarCarrito()">Vaciar Carrito</button>' +
        '<button type="button" class="btn btn-success mb-5" data-bs-toggle="modal" data-bs-target="#finalizarModal">Finalizar Compra</button>' +
    '</div>';


  localStorage.setItem('carrito', JSON.stringify(carrito));
  localStorage.setItem('resumenCompra', JSON.stringify({
    neto, iva, bruto, despacho
  }));

  //Contador carrito
  var itemsCarrito = carrito.reduce(function(sum, item){return sum + item.cantidad}, 0);
  if (contadorCarrito) {
    if (itemsCarrito > 0) {
      contadorCarrito.textContent = itemsCarrito;
      contadorCarrito.style.display = 'flex';
      if (itemsCarrito > 99) {
        contadorCarrito.textContent = '99+';
      };
    }
    else {
      contadorCarrito.style.display = 'none'
    }
  }

  if (typeof actualizarDisponibilidadEnCards === 'function') {
    actualizarDisponibilidadEnCards();
  }

}

function eliminarDelCarrito(productId) {
  var idProducto = Number(productId);
  var index = -1;
  for (var i=0; i < carrito.length; i++) {
    if (carrito[i].id === idProducto) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderCarrito();
  }
};
renderCarrito();

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem('carrito');
  localStorage.removeItem('resumenCompra');
  renderCarrito();
}
//Modificar Cantidad en Carrito
function modificarCantidad(productoId, delta) {
  var producto = null;
  var index = -1;

  for (var i=0; i < carrito.length; i++) {
    if (String(carrito[i].id) === String(productoId)) {
      producto = carrito[i];
      index = i;
      break
    }
  }
  if (!producto) return;

  var productoOriginal = null;
  for (var j=0; j < arrProductos.length; j++) {
    if (String(arrProductos[j].id) === String(productoId)) {
      productoOriginal = arrProductos[j];
      break;
    }
  }
  var stock = productoOriginal ? productoOriginal.stock : producto.cantidad;

  var nuevaCantidad = producto.cantidad + delta;
  if (nuevaCantidad > stock) {
    nuevaCantidad = stock;
    mostrarNotificacion('No hay stock suficiente');
  }
  if (nuevaCantidad < 0) nuevaCantidad = 0;

  if (nuevaCantidad === 0) {
    carrito.splice(index,1);
  } else {
    producto.cantidad = nuevaCantidad;
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  renderCarrito();

  if (delta > 0){
    mostrarNotificacion('Cantidad aumentada')
  } else {
    mostrarNotificacion('Cantidad disminuida')
  }
}