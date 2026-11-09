const selectorSucursal = document.getElementById("sucursal");
const nombreSucursal = document.getElementById("nombreSucursal");
const tituloSeccion = document.getElementById("tituloSeccion");
const panel = document.getElementById("panel");
const nombresSecciones = {
    resumen: "Resumen",
    mesas: "Mesas",
    ventas: "Ventas",
    gastos: "Gastos",
    caja: "Corte de caja",
    empleados: "Empleados"
};

const modalFondo = document.getElementById("modalFondo");
const modalTitulo = document.getElementById("modalTitulo");
const modalCuerpo = document.getElementById("modalCuerpo");
const modalCerrar = document.getElementById("modalCerrar");
const modalCancelar = document.getElementById("modalCancelar");
const modalGuardar = document.getElementById("modalGuardar");

let accionModalActual = null;
let seccionActual = 'resumen';

function mostrarSeccion(seccion) {
    if (!nombresSecciones[seccion]) {
        return;
    }

    seccionActual = seccion;

    if (seccion === "mesas") {
        tituloSeccion.textContent = "Mesas";
        mostrarMesas();
        return;
    }

    tituloSeccion.textContent = nombresSecciones[seccion];

    panel.replaceChildren();

    const mensaje = document.createElement("p");

    mensaje.textContent =
        "Estás en " + nombresSecciones[seccion] +
        " de la sucursal " + selectorSucursal.value + ".";
    
    panel.appendChild(mensaje);
}

selectorSucursal.addEventListener("change", function() {

    nombreSucursal.textContent =
        "Sucursal: " + selectorSucursal.value;

    mostrarSeccion(seccionActual);
});

mostrarSeccion("resumen")

class Mesa {
    
    constructor(id, nombre, sucursal, numeroPersonas = 0,
            posicionX = 20, posicionY = 20) {

        this.id = id;
        this.nombre = nombre;
        this.sucursal = sucursal;

        this.numeroPersonas = numeroPersonas;

        this.posicionX = posicionX;
        this.posicionY = posicionY;

        this.estado = numeroPersonas > 0 ? "ocupada" : "libre";
    }


    cambiarNombre(nuevoNombre) {
        this.nombre = nuevoNombre;
    }

    cambiarNumeroPersonas(cantidad) {
        if (Number.isInteger(cantidad) && cantidad >= 0) {
            this.numeroPersonas = cantidad;

            if (cantidad === 0) {
                this.estado = "libre";
            } else if (this.estado !== "pagando") {
                this.estado = "ocupada";
            }
        }
    }

    
    marcarPagando() {
        if (this.numeroPersonas > 0) {
            this.estado = "pagando";
            return true;
        }

        return false;
}


    cambiarEstado(nuevoEstado) {
        const estadosValidos = ["libre", "ocupada", "pagando"];

        if (estadosValidos.includes(nuevoEstado)) {
            this.estado = nuevoEstado;
        }
    }

    getEstado() {
        return this.estado;
    }
}
const mesas = [];

const cuentasMesa = [];

let siguienteIdCuenta = 1;
let mesaSeleccionadaId = null;
let editandoPlano = false;
let siguienteIdMesa = 1;


function crearMesa(nombre, sucursal) {

    nombre = nombre.trim();

    if (nombre === "") {
        alert("La mesa debe tener un nombre.");
        return;
    }

    const existe = mesas.some(mesa =>
        mesa.sucursal === sucursal &&
        mesa.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
        alert("Ya existe una mesa con ese nombre.");
        return;
    }

    const cantidad = mesas.filter(
        mesa => mesa.sucursal === sucursal
    ).length;

    const x = 20 + (cantidad % 4) * 145;
    const y = 20 + Math.floor(cantidad / 4) * 105;

    const nuevaMesa = new Mesa(
        siguienteIdMesa,
        nombre,
        sucursal,
        0,
        x,
        y
    );

    mesas.push(nuevaMesa);

    siguienteIdMesa++;

    mostrarMesas();
}


function crearElemento(etiqueta, clase, texto = "") {
    const elemento = document.createElement(etiqueta);

    elemento.className = clase;
    elemento.textContent = texto;

    return elemento;
}


function crearCuenta(mesa, apodo, numeroPersonas) {

    if (mesa.numeroPersonas === 0) {
        alert("Primero debes abrir la mesa.");
        return false;
    }

    if (!Number.isInteger(numeroPersonas) ||
        numeroPersonas < 0) {

        alert("Número de personas inválido.");
        return false;
    }

    const cuentasAbiertas = cuentasMesa.filter(
        cuenta =>
            cuenta.mesaId === mesa.id &&
            cuenta.estado === "abierta"
    );

    const personasAsignadas = cuentasAbiertas.reduce(
        (total, cuenta) => total + cuenta.numeroPersonas,
        0
    );

    if (personasAsignadas + numeroPersonas >
        mesa.numeroPersonas) {

        alert("Las personas asignadas superan el total de la mesa.");
        return false;
    }

    const nombreCuenta = apodo.trim() ||
        "Cuenta " + (cuentasAbiertas.length + 1);

    const nuevaCuenta = new CuentaMesa(
        siguienteIdCuenta,
        mesa.id,
        nombreCuenta,
        numeroPersonas
    );

    cuentasMesa.push(nuevaCuenta);

    siguienteIdCuenta++;

    return true;
}

function editarCuenta (cuenta, mesa) {
    abrirModal({
        titulo: "Editar cuenta",
        campos: [
            {
                nombre: "apodo",
                label: "Apodo interno",
                valorInicial: cuenta.apodo
            },
            {
                nombre: "numeroPersonas",
                label: "Número de personas",
                type: "number",
                valorInicial: cuenta.numeroPersonas
            }
        ],

        onGuardar: function(datos) {
            const nuevoApodo = datos.apodo || cuenta.apodo;
            const nuevaCantidad = Number(datos.numeroPersonas);

            if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 0) {
                alert("Cantidad inválida.");
                return;
            }

            const otrasCuentas = cuentasMesa.filter(c =>
                c.mesaId === mesa.id &&
                c.estado === "abierta" &&
                c.id !== cuenta.id
            );

            const personasOtras = otrasCuentas.reduce(
                (total, c) => total + c.numeroPersonas,
                0
            );

            if (personasOtras + nuevaCantidad > mesa.numeroPersonas) {
                alert ("Las personas asignadas superan el total de la mesa.");
                return;
            }

            cuenta.cambiarApodo(nuevoApodo);
            cuenta.cambiarNumeroPersonas(nuevaCantidad);

            cerrarModal();
            mostrarMesas();
        }
    });
}

function cerrarModal() {
    modalFondo.classList.add("oculto");
    modalCuerpo.replaceChildren();
    accionModalActual = null;
}

function abrirModal(config) {
    modalTitulo.textContent = config.titulo;
    modalCuerpo.replaceChildren();

    const referencias = {};

    config.campos.forEach(function(campo) {
        const contenedor = document.createElement("div");
        contenedor.className = "ac-modal-campo";

        const label = document.createElement("label");
        label.textContent = campo.label;

        const input = document.createElement("input");
        input.type = campo.type || "text";
        input.value = campo.valorInicial ?? "";
        input.placeholder = campo.placeholder || "";

        contenedor.appendChild(label);
        contenedor.appendChild(input);
        modalCuerpo.appendChild(contenedor);

        referencias[campo.nombre] = input;
    });

    accionModalActual = function() {
        const datos = {};

        for (const nombre in referencias) {
            datos[nombre] = referencias[nombre].value.trim();
        }

        config.onGuardar(datos);
    };

    modalFondo.classList.remove("oculto");
}

modalCerrar.addEventListener("click", cerrarModal);
modalCancelar.addEventListener("click", cerrarModal);

modalGuardar.addEventListener("click", function() {
    if (accionModalActual) {
        accionModalActual();
    }
});

function mostrarMesas() {
    const sucursal = selectorSucursal.value;

    const lista = mesas.filter(
        mesa => mesa.sucursal === sucursal
    );

    const seleccionada = lista.find(
        mesa => mesa.id === mesaSeleccionadaId
    );

    panel.replaceChildren();

    // Estructura de dos columnas
    const contenedor = crearElemento("div", "ac-layout");

    const plano = crearElemento("section", "ac-panel");
    const detalle = crearElemento("section", "ac-panel");

    // PANEL IZQUIERDO
    const encabezado = crearElemento(
        "div", "ac-encabezado"
    );

    const titulo = crearElemento(
        "h3", "", "Mesas de " + sucursal
    );

    const agregar = crearElemento(
        "button", "ac-agregar", "+ Nueva mesa"
    );

    agregar.addEventListener("click", function() {

        const nombre = prompt("Nombre de la nueva mesa:");

        if (nombre === null) {
            return;
        }

        crearMesa(nombre, sucursal);
    });

    
    const botonEditar = crearElemento(
        "button",
        "ac-agregar",
        editandoPlano ? "Terminar edición" : "Editar plano"
    );

    botonEditar.addEventListener("click", function() {
        editandoPlano = !editandoPlano;
        mostrarMesas();
    });

    agregar.hidden = !editandoPlano;

    encabezado.append(titulo, botonEditar, agregar);
    plano.appendChild(encabezado);

    const leyenda = crearElemento(
        "p",
        "ac-leyenda",
        "🟢 Libre     🔴 Ocupada     🔵 Pagando"
    );

    plano.appendChild(leyenda);

    // TABLERO
    const tablero = crearElemento("div", "ac-tablero");
    tablero.style.height =
        Math.max(520, Math.ceil(lista.length / 4) * 105 + 40) + "px";

    lista.forEach(function(mesa) {
        const boton = crearElemento(
            "button",
            "ac-mesa ac-" + mesa.getEstado(),
            mesa.nombre
        );

        boton.style.left = mesa.posicionX + "px";
        boton.style.top = mesa.posicionY + "px";

        if (editandoPlano) {
            boton.addEventListener("pointerdown", function(evento) {
                if (evento.button !== 0) return;

                evento.preventDefault();

                const inicioX = evento.clientX;
                const inicioY = evento.clientY;

                const originalX = mesa.posicionX;
                const originalY = mesa.posicionY;

                boton.setPointerCapture(evento.pointerId);

                function mover(e) {
                    const diferenciaX = e.clientX - inicioX;
                    const diferenciaY = e.clientY - inicioY;

                    const maxX = tablero.clientWidth - boton.offsetWidth;
                    const maxY = tablero.clientHeight - boton.offsetHeight;

                    mesa.posicionX = Math.max (
                        0, Math.min(maxX, originalX + diferenciaX)
                    );

                    mesa.posicionY = Math.max (
                        0, Math.min(maxY, originalY + diferenciaY)
                    );
                    
                    boton.style.left = mesa.posicionX + "px";
                    boton.style.top = mesa.posicionY + "px";
                }

                function terminar() {
                    boton.removeEventListener("pointermove", mover);
                    boton.removeEventListener("pointerup", terminar);
                    boton.removeEventListener("pointercancel", terminar);
                }

                boton.addEventListener("pointermove", mover);
                boton.addEventListener("pointerup", terminar);
                boton.addEventListener("pointercancel", terminar);
            });
        }

        boton.type = "button";

        if (mesa.id === mesaSeleccionadaId) {
            boton.classList.add("ac-seleccionada");
        }

        const personas = crearElemento(
            "span",
            "ac-personas",
            mesa.numeroPersonas + " personas"
        );

        boton.appendChild(personas);

        boton.addEventListener("click", function() {
            if (editandoPlano) return;
            mesaSeleccionadaId = mesa.id;
            mostrarMesas();
        });

        tablero.appendChild(boton);
    });

    const zonaPlano = crearElemento("div", "ac-zona-plano");

    zonaPlano.appendChild(tablero);
    plano.appendChild(zonaPlano);

    // PANEL DERECHO
    if (!seleccionada) {
        detalle.appendChild(
            crearElemento(
                "p",
                "ac-vacio",
                "Selecciona una mesa para ver su información."
            )
        );
    } else {
        detalle.classList.add("ac-panel-detalle");
        
        const cabeceraDetalle = crearElemento(
            "div",
            "ac-detalle-header",
            seleccionada.nombre.toUpperCase()
        );

        const subcabecera = crearElemento(
            "div",
            "ac-detalle-subheader",
            "GESTIÓN DE MESA"
        );

        const contenidoDetalle = crearElemento(
            "div",
            "ac-detalle-contenido"
        );

        detalle.append(cabeceraDetalle, subcabecera);

        contenidoDetalle.appendChild(
            crearElemento(
                "p",
                "",
                "Personas: " + seleccionada.numeroPersonas
            )
        );

        contenidoDetalle.appendChild(
            crearElemento(
                "p",
                "",
                "Estado: " + seleccionada.getEstado()
            )
        );

        const cuentasAbiertas = cuentasMesa.filter(
            cuenta =>
                cuenta.mesaId === seleccionada.id &&
                cuenta.estado === "abierta"
        );

        contenidoDetalle.appendChild(
            crearElemento(
                "h4",
                "",
                "Cuentas abiertas: " + cuentasAbiertas.length
            )
        );

        cuentasAbiertas.forEach(function(cuenta) {
            const tarjeta  = crearElemento("div", "ac-cuenta");

            const nombre = crearElemento(
                "strong",
                "",
                cuenta.apodo
            );

            const personas = crearElemento(
                "p",
                "",
                cuenta.numeroPersonas + "personas asignadas"
            );

            const accionesCuenta = crearElemento("div", "ac-cuenta-acciones");

            const botonEditarCuenta = crearElemento(
                "button",
                "",
                "Editar"
            );

            botonEditarCuenta.addEventListener("click", function() {
                editarCuenta(cuenta, seleccionada);
            });

            accionesCuenta.appendChild(botonEditarCuenta);

            tarjeta.append(nombre, personas, accionesCuenta);
            contenidoDetalle.appendChild(tarjeta);
        });

        const acciones = crearElemento(
            "div", "ac-acciones"
        );

        const btnPersonas = crearElemento(
            "button",
            "ac-accion",
            seleccionada.numeroPersonas === 0
                ? "Abrir mesa"
                : "Editar personas"
        );

        btnPersonas.addEventListener("click", function() {
            const esApertura = seleccionada.numeroPersonas === 0;

            abrirModal({
                titulo: esApertura ? "Abrir mesa" : "Editar personas",
                campos: esApertura
                    ? [
                        {
                            nombre: "personasMesa",
                            label: "¿Cuántas personas llegaron?",
                            type: "number",
                            valorInicial: 2
                        },
                        {
                            nombre: "apodo",
                            label: "Apodo interno de la primera cuenta",
                            valorInicial: ""
                        },
                        {
                            nombre: "personasCuenta",
                            label: "Personas para la primera cuenta",
                            type: "number",
                            valorInicial: 0
                        }
                    ]
                    : [
                        {
                            nombre: "personasMesa",
                            label: "¿Cuántas personas hay ahora?",
                            type: "number",
                            valorInicial: seleccionada.numeroPersonas
                        }
                    ],
                onGuardar: function(datos) {
                    const cantidad = Number(datos.personasMesa);

                    if (!Number.isInteger(cantidad) || cantidad <= 0) {
                        alert("ingresa un número válido mayor a cero.");
                        return;
                    }

                    if (esApertura) {
                        const apodo = datos.apodo || "";
                        const personasCuenta = Number(datos.personasCuenta);

                        if (!Number.isInteger(personasCuenta) ||
                            personasCuenta < 0 ||
                            personasCuenta > cantidad) {
                                alert("Cantidad inválida para la cuenta.");
                                return;
                            }
                        
                            seleccionada.cambiarNumeroPersonas(cantidad);
                            crearCuenta(seleccionada, apodo, personasCuenta);

                    } else {
                        const asignadas = cuentasMesa
                            .filter(cuenta =>
                                cuenta.mesaId === seleccionada.id &&
                                cuenta.estado === "abierta"
                            )
                            .reduce(
                                (total, cuenta) => total + cuenta.numeroPersonas,
                                0 
                            );

                        if (cantidad < asignadas) {
                            alert("Primero debes ajustar las personas de las cuentas.");
                            return;
                        }

                        seleccionada.cambiarNumeroPersonas(cantidad);
                    }

                    cerrarModal();
                    mostrarMesas();
                }
            });
        });

        const btnNuevaCuenta = crearElemento(
            "button",
            "ac-accion",
            "+ Nueva cuenta"
        );

        btnNuevaCuenta.addEventListener("click", function() {
            if (seleccionada.numeroPersonas === 0) {
                alert("Primero abre la mesa");
                return;
            }

            abrirModal({
                titulo: "Nueva cuenta",
                campos: [
                    {
                        nombre: "apodo",
                        label: "Apodo de la cuenta",
                        valorInicial: ""
                    },
                    {
                        nombre: "personas",
                        label: "¿Cuántas personas pertenecen a esta cuenta?",
                        type: "number",
                        valorInicial: 0
                    }
                ],
                onGuardar: function(datos) {
                    const apodo = datos.apodo || "";
                    const cantidad = Number(datos.personas);

                    if (crearCuenta(seleccionada, apodo, cantidad)) {
                        cerrarModal();
                        mostrarMesas();
                    }
                }
            });
        });

        const btnImprimir = crearElemento(
            "button",
            "ac-accion",
            "Preparar cuenta (prueba)"
        );

        btnImprimir.addEventListener("click", function() {
            if (seleccionada.marcarPagando()) {
                mostrarMesas();
                alert("Mesa en estado Pagando.");
            } else {
                alert("La mesa no tiene personas registradas.");
            }
        });

        acciones.appendChild(btnPersonas, btnNuevaCuenta, btnImprimir);

        contenidoDetalle.appendChild(acciones);
        detalle.appendChild(contenidoDetalle);
    }

    contenedor.append(plano, detalle);
    panel.appendChild(contenedor);
}

class CuentaMesa {
    constructor(id, mesaId, apodo, numeroPersonas) {
        this.id = id;
        this.mesaId = mesaId;
        this.apodo = apodo;
        this.numeroPersonas = numeroPersonas;
        this.estado = "abierta";
    }

    cambiarApodo(nuevoApodo) {
        this.apodo = nuevoApodo;
    }

    cambiarNumeroPersonas(cantidad) {
        if (Number.isInteger(cantidad) && cantidad >= 0) {
            this.numeroPersonas = cantidad;
        }
    }

    getEstado() {
        return this.estado;
    }
}
