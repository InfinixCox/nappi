# Ñappi: documento final

**Materia:** Estructuras de Datos y Algoritmos 2, Grupo 1, Universidad Autónoma de Occidente.

**Profesor:** Jonathan López Londoño.

**Integrantes:** Juan David Álvarez (InfinixCox) y Juan Steban Burbano Hidalgo (Steban-B).

**Aplicación publicada:** [https://nappi-cali.netlify.app](https://nappi-cali.netlify.app)

**Propuesta gráfica:** [https://www.figma.com/design/iLlsHBYhhJGIUYeMyFgpLO](https://www.figma.com/design/iLlsHBYhhJGIUYeMyFgpLO)

**Repositorio:** [https://github.com/InfinixCox/nappi](https://github.com/InfinixCox/nappi)

# Alcance del sistema

Ñappi es una aplicación web de domicilios en Cali con seis restaurantes: La Burguesía, Masa Crítica, Sancocho y Sentimiento, Roll-o Caleño, El Pollo Mensajero y Tinto y Cuento. Tiene dos roles: cliente y restaurante.

## Cliente

- Se registra con su nombre, barrio, correo y contraseña, y puede cambiar su nombre y barrio en Mi perfil.
- En el inicio ve primero los restaurantes que le entregan (su barrio y los barrios vecinos) y luego los demás en gris, el Top 5 de platos más pedidos y un buscador que sugiere platos y restaurantes mientras escribe.
- En cada restaurante ve el menú por categorías y subcategorías y puede filtrar los platos por rango de precio.
- Arma un carrito (agregar, cambiar cantidades, quitar) con un botón para deshacer la última acción.
- En el checkout elige el barrio de entrega, solo entre los que cubre el restaurante, y busca su dirección en el mapa.
- Sigue su pedido en vivo: línea de estados, mapa con la ruta y el domiciliario moviéndose, y la ñapa del restaurante.
- En Cobertura ve el mapa de barrios como un grafo y hasta dónde llega cada restaurante.

## Restaurante

- Atiende una cola de pedidos en tiempo real: los pedidos nuevos llegan solos y se toman por orden de llegada con el botón "Tomar siguiente".
- Avanza cada pedido de en cocina a en camino y luego a entregado. Mientras está en camino, el domiciliario avanza de 25 % en 25 %.
- Administra su menú: crea categorías y subcategorías, crea y edita platos con foto y oculta los que ya no vende.

## Rutas

Cada pantalla tiene su ruta en Angular Router, y las privadas están protegidas con guards:

| Ruta | Acceso | Qué hay |
| :---- | :---- | :---- |
| / | Pública | Bienvenida, buscador, selector de barrio, restaurantes y Top 5 |
| /restaurante/:id | Pública | Portada, filtro de precio y menú en árbol |
| /cobertura | Pública | Mapa con el grafo de barrios |
| /login y /registro | Solo sin sesión (invitadoGuard) | Inicio de sesión y registro |
| /carrito y /checkout | Cliente (clienteGuard) | Carrito con deshacer y confirmación del pedido |
| /pedidos y /pedidos/:id | Cliente (clienteGuard) | Historial y seguimiento en vivo |
| /perfil | Cliente (clienteGuard) | Cambiar nombre y barrio |
| /panel/pedidos y /panel/menu | Restaurante (restauranteGuard) | Cola de pedidos y administración del menú |
| ** | Cualquiera | Página 404 |

## Lo que no incluye

- Pagos reales: el pago es contra entrega.
- GPS real: la posición del domiciliario la avanza el restaurante desde el panel.
- Un rol de domiciliario aparte.
- Notificaciones por correo.
- Otras ciudades distintas de Cali.

# Tecnologías y arquitectura

Estas son las tecnologías que usa el proyecto:

| Capa | Tecnología |
| :---- | :---- |
| Frontend | Angular 21 con componentes standalone, signals, Angular Router y guards, TypeScript 5.9 y SCSS con variables y mixins |
| Backend | Supabase: Auth con correo y contraseña, PostgreSQL con políticas RLS, Realtime y Storage |
| Mapas | Leaflet 1.9 con teselas de OpenStreetMap |
| APIs externas | Nominatim (dirección a coordenadas) y OSRM (ruta en carro), consumidas con fetch |
| Publicación | Netlify, con el archivo _redirects para que las rutas de Angular funcionen al recargar |

La aplicación corre en el navegador y se comunica directamente con estos servicios:

- **Supabase Auth:** registro, inicio de sesión y manejo de la sesión.
- **Supabase PostgreSQL:** restaurantes, platos, carrito y pedidos, protegidos con políticas RLS.
- **Supabase Realtime:** avisa los cambios en la tabla de pedidos.
- **Supabase Storage:** guarda las fotos de platos y restaurantes.
- **Nominatim:** convierte la dirección del cliente en coordenadas.
- **OSRM:** calcula la ruta del restaurante a la dirección del cliente.

# Estructuras de datos

El proyecto usa ocho estructuras de datos: tres lineales (lista enlazada, pila y cola), cuatro jerárquicas (árbol n-ario, árbol binario de búsqueda, trie y max heap) y un grafo. Todas están en la carpeta `src/app/models/`.

## Lista enlazada simple: carrito

**Archivos:** `models/lista-carrito.ts` y `models/nodo-carrito.ts`.

**Dónde se usa:** el servicio Carrito guarda los ítems en una ListaCarrito. Cada nodo tiene el plato, la cantidad y el enlace next al siguiente nodo.

**Operaciones:** append (agrega al final usando tail), buscar (recorre desde head), eliminar, total, aArreglo (para pintar la lista con @for) y vaciar.

**Por qué se eligió:** un carrito crece y se reduce en cualquier posición. Quitar un plato solo cambia un enlace, sin mover el resto de elementos.

```ts
// Quita el nodo enlazando el anterior con el siguiente
if (actual.value.plato.id === platoId) {
  anterior.next = actual.next;
  if (actual === this.tail) {
    this.tail = anterior;
  }
  this.length--;
  return true;
}
```

## Pila: deshacer en el carrito

**Archivo:** `models/pila.ts`.

**Dónde se usa:** cada acción del carrito (agregar, cambiar cantidad o quitar) se apila con lo necesario para revertirla. El botón "Ups, mejor no" hace pop y aplica la acción contraria, y peek arma el texto del botón, por ejemplo "deshacer quitar Pollo Asado Entero".

**Por qué se eligió:** deshacer es LIFO: lo último que hiciste es lo primero que se deshace.

```ts
push(item: T): void { this.items.push(item); }
pop(): T | undefined { return this.items.pop(); }
peek(): T | undefined { return this.items[this.items.length - 1]; }
```

## Cola: pedidos del restaurante

**Archivo:** `models/cola.ts`.

**Dónde se usa:** en el panel de pedidos. Al cargar, los pedidos pendientes se encolan por orden de llegada, y cada pedido nuevo que llega por Realtime hace enqueue. El botón "Tomar siguiente" hace dequeue y pasa el pedido a cocina.

**Por qué se eligió:** atender por orden de llegada es FIFO, y así es justo con los clientes.

```ts
enqueue(item: T): void { this.items.push(item); }
dequeue(): T | undefined { return this.items.shift(); }
```

## Árbol n-ario: menú de cada restaurante

**Archivos:** `models/arbol-menu.ts` y `models/nodo-menu.ts`. Se pinta con el componente recursivo `components/nodo-menu-vista`.

**Dónde se usa:** la raíz "Menú" tiene como hijos las categorías principales, cada categoría puede tener subcategorías y cada nodo guarda sus platos. El componente nodo-menu-vista se llama a sí mismo para cada hijo, en un recorrido en profundidad. En el panel del restaurante el menú se recorre en preorden para listar los platos por categoría.

**Por qué se eligió:** un menú es jerárquico y cada categoría puede tener cualquier número de hijos.

```ts
for (let categoria of categorias) {
  const padre = categoria.padre_id === null ? this.raiz : nodos[categoria.padre_id];
  padre.agregarHijo(nodos[categoria.id]);
}
```

## Árbol binario de búsqueda: filtro por precio

**Archivos:** `models/arbol-precios.ts` y `models/nodo-precio.ts`.

**Dónde se usa:** en la página de cada restaurante se insertan los platos por precio. El filtro de mínimo y máximo llama al método rango, que hace un recorrido inorden con corte.

**Operaciones:** insertar, buscar y rango.

**Por qué se eligió:** el recorrido inorden de un árbol binario de búsqueda sale ordenado de menor a mayor, y el corte evita entrar a ramas que no pueden tener precios del rango.

```ts
if (nodo.valor > min) this.inordenRango(nodo.izquierda, min, max, resultado);
if (nodo.valor >= min && nodo.valor <= max) resultado.push(...nodo.platos);
if (nodo.valor < max) this.inordenRango(nodo.derecha, min, max, resultado);
```

## Trie: buscador

**Archivos:** `models/trie.ts` y `models/nodo-trie.ts`.

**Dónde se usa:** en el inicio se inserta cada palabra del nombre de los restaurantes y de los platos. Mientras el usuario escribe, searchPrefix baja por las letras del prefijo y recolecta todos los resultados que están debajo.

**Por qué se eligió:** encontrar todo lo que empieza por un prefijo es exactamente para lo que sirve un trie. El costo depende del largo del prefijo, no de cuántos platos hay.

```ts
searchPrefix(prefix: string): ResultadoBusqueda[] {
  let current = this.root;
  for (let character of this.normalizar(prefix)) {
    if (current.children[character] === undefined) return [];
    current = current.children[character];
  }
  const resultado: ResultadoBusqueda[] = [];
  this.recolectar(current, resultado);
  return resultado;
}
```

## Max Heap: Top 5 de platos más pedidos

**Archivo:** `models/max-heap.ts`.

**Dónde se usa:** en el inicio se hace push de los platos que se han pedido alguna vez, comparando por veces_pedido, y luego se hace pop cinco veces. El contador veces_pedido se suma cuando el restaurante marca un pedido como entregado.

**Por qué se eligió:** permite sacar los K mayores sin ordenar toda la lista, porque la raíz siempre es el máximo.

```ts
const heap = new MaxHeap();
for (let plato of platos) {
  if (plato.veces_pedido > 0) heap.push(plato);
}
const top: Plato[] = [];
while (top.length < 5 && heap.size() > 0) top.push(heap.pop()!);
```

## Grafo no dirigido: barrios y cobertura

**Archivo:** `models/grafo.ts`.

**Dónde se usa:** los 13 barrios son los nodos y las 19 relaciones de vecindad son las aristas, guardadas en una lista de adyacencia. Un restaurante entrega en su barrio y en sus vecinos directos. Se usa en el inicio (qué restaurantes te entregan), en el checkout (barrios de entrega permitidos) y en la página Cobertura, donde el grafo se dibuja sobre el mapa.

**Por qué se eligió:** la cercanía entre barrios es una red, no una jerarquía, y los vecinos de un barrio salen directo de su lista de adyacencia.

```ts
addEdge(id1: string, id2: string): boolean {
  // ...validaciones...
  this.adjList[id1].push(id2);
  this.adjList[id2].push(id1);
  return true;
}

barriosConCobertura(id: string): string[] {
  const vecinos = this.adjList[id];
  if (!vecinos) return [];
  return [id, ...vecinos];
}
```

# Adaptaciones frente a lo visto en clase

- **Leaflet** es una librería nueva para el mapa. Se usa directamente desde el componente, igual que d3 en el Challenge 11.
- **Árbol binario de búsqueda:** se agregó el método rango (inorden con corte), y cada nodo guarda una lista de platos porque varios platos pueden tener el mismo precio.
- **Trie:** cada nodo final guarda varios resultados, porque un plato aparece por cada palabra de su nombre, y el texto se normaliza sin tildes para que escribir "burguesia" encuentre "La Burguesía".
- **Grafo:** la cobertura usa los vecinos directos de la lista de adyacencia. No se usa BFS sobre el grafo, porque en clase el BFS se vio en árboles.
- **Max Heap:** compara por veces_pedido (en el Challenge 12 comparaba popularity y en el Parcial 03, reproducciones).
- **Ciclo de vida:** se usa effect() en lugar de ngOnChanges, y ngOnDestroy solo para quitar los canales de Realtime y los mapas.
- **Permisos por columna en la base de datos:** para que el usuario edite su nombre y su barrio sin poder cambiar su rol, la tabla profiles solo permite actualizar esas dos columnas (GRANT UPDATE (nombre, barrio_id)). Es una configuración de PostgreSQL, no código de Angular.

# Tiempo real

Se usa Supabase Realtime sobre la tabla pedidos, con un filtro distinto según quién escucha (método escuchar de `services/pedidos.ts`):

| Quién escucha | Filtro | Qué pasa |
| :---- | :---- | :---- |
| Restaurante en /panel/pedidos | restaurante_id = su restaurante | Los pedidos nuevos entran a la cola sin recargar |
| Cliente en /pedidos | cliente_id = el cliente | El estado de cada pedido cambia en vivo |
| Cliente en /pedidos/:id | id = ese pedido | Avanza la línea de estados y la moto se mueve en el mapa |

Al salir de cada página, el canal se cierra con removeChannel en ngOnDestroy.

# Seguridad

- **Autenticación:** Supabase Auth con correo y contraseña. Al registrarse se crea la fila del usuario en la tabla profiles con el rol cliente.
- **Guards:** clienteGuard y restauranteGuard consultan el rol del usuario y lo redirigen si no corresponde, e invitadoGuard impide entrar a login y registro con la sesión iniciada.
- **Políticas RLS:** el catálogo (restaurantes, categorías, platos y barrios) lo puede leer cualquiera; cada restaurante solo puede modificar sus propias categorías, platos y pedidos; el carrito y los pedidos solo los ven el cliente dueño y el restaurante del pedido; y un usuario puede cambiar su nombre y su barrio, pero no su rol (solo tiene permiso de actualizar esas dos columnas).
- **Clave publicable:** en el frontend solo va la clave publicable de Supabase. Está pensada para ser pública, porque por sí sola no da permisos: lo que se puede leer o escribir lo deciden las políticas RLS. La clave de servicio nunca está en el código.
- **Storage:** el bucket imagenes es público para leer, y cada restaurante solo puede subir archivos a su propia carpeta.

# Organización del código

```text
src/app/
  app.routes.ts    rutas, rutas hijas de /panel y guards
  guards/          clienteGuard, restauranteGuard, invitadoGuard
  services/        supabase, auth, barrios, catalogo, carrito, pedidos, mapa
  models/          interfaces y las 8 estructuras de datos
  pages/           una carpeta por ruta (componentes padre)
  components/      componentes hijos reutilizables
src/styles/        variables, mixins y estilos de las tarjetas de acceso
```

- **Componentes padre e hijo:** cada página es un componente padre que carga los datos y se los pasa a sus hijos con @Input o input(), y los hijos avisan con @Output. Por ejemplo, Inicio usa Buscador, TarjetaRestaurante y TopPlatos; Restaurante usa FiltroPrecio, NodoMenuVista y TarjetaPlato; y PanelPedidos usa TarjetaPedido.
- **Rutas hijas:** /panel tiene las rutas hijas pedidos y menu, que se muestran en su propio router-outlet.
- **Rutas dinámicas:** /restaurante/:id y /pedidos/:id leen el parámetro con input() gracias a withComponentInputBinding().
- **Estilos:** la paleta "Aguacate y mango" está en variables de Sass, con los mixins tarjeta, boton, aviso y chip. La aplicación se adapta a celular con @media.

# Aportes de cada integrante

## Juan David Álvarez (rama juan-david)

- Planeación y diseño de la base de datos en Supabase.
- Base del proyecto, autenticación y guards.
- Catálogo con grafo, trie, max heap, árbol n-ario y árbol binario.
- Carrito con lista enlazada y pila, y checkout con Nominatim.
- Panel con cola en tiempo real.
- Seguimiento con mapa y OSRM, y mapa de cobertura.
- Panel de menú con Storage.
- Imágenes de 5 restaurantes.

## Juan Steban Burbano Hidalgo (rama juan-steban)

- Imágenes de Tinto y Cuento.
- Propuesta gráfica en Figma.
- Página "Mi perfil".
- Ajustes para celular.
- Publicación en Netlify.
- README y documento final.

# Fuentes

- Política de uso de Nominatim: [https://operations.osmfoundation.org/policies/nominatim/](https://operations.osmfoundation.org/policies/nominatim/)
- Política del servidor de demostración de OSRM: [https://github.com/Project-OSRM/osrm-backend/wiki/API%20Usage%20Policy](https://github.com/Project-OSRM/osrm-backend/wiki/API%20Usage%20Policy)
- Datos del mapa: © OpenStreetMap contributors.
