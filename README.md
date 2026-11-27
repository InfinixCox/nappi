# Ñappi

**Siempre con ñapa.**

Ñappi es una aplicación web de domicilios en Cali con varios restaurantes. El cliente se registra con su barrio, ve qué restaurantes le entregan, busca platos, arma su carrito, hace el pedido y lo sigue en vivo en un mapa. Cada restaurante atiende su cola de pedidos en tiempo real y administra su menú con fotos.

Proyecto final de **Estructuras de Datos y Algoritmos 2** (Grupo 1), Universidad Autónoma de Occidente, profesor Jonathan López Londoño.

## Enlaces

- **Aplicación publicada (Netlify):** https://nappi-cali.netlify.app
- **Propuesta gráfica (Figma):** https://www.figma.com/design/iLlsHBYhhJGIUYeMyFgpLO
- **Repositorio:** https://github.com/InfinixCox/nappi
- **Documento final (Google Docs):** https://docs.google.com/document/d/1brA90GsgPHwCUDl2QjKDCEQMM4ZutmspH5aHdYaaHZI/edit?usp=sharing
- *Documento final (en el repositorio):* [docs/DOCUMENTO-FINAL.md](docs/DOCUMENTO-FINAL.md)

## Integrantes

| Integrante | GitHub | Rama | Aportes |
|---|---|---|---|
| Juan David Álvarez | [InfinixCox](https://github.com/InfinixCox) | `juan-david` | Planeación y base de datos en Supabase; base del proyecto, autenticación y guards; catálogo con grafo, trie, max heap, árbol n-ario y árbol binario; carrito con lista enlazada y pila; checkout con Nominatim; panel con cola en tiempo real; seguimiento con mapa y OSRM; mapa de cobertura; panel de menú con Storage; imágenes de 5 restaurantes |
| Juan Steban Burbano Hidalgo | [Steban-B](https://github.com/Steban-B) | `juan-steban` | Imágenes de Tinto y Cuento; propuesta gráfica en Figma; página "Mi perfil"; ajustes para celular; publicación en Netlify; README y documento final |

## Tecnologías

- **Frontend:** Angular 21 (componentes standalone, signals, Angular Router con guards), TypeScript y SCSS.
- **Backend:** Supabase: autenticación con correo y contraseña, base de datos PostgreSQL con políticas RLS, Realtime y Storage.
- **Mapas:** Leaflet con teselas de OpenStreetMap.
- **APIs externas:** Nominatim (dirección a coordenadas) y OSRM (ruta del domiciliario), consumidas con `fetch`.
- **Publicación:** Netlify.

## Cómo correrlo en local

Requisitos: Node 20 o superior y Angular CLI 21.

```bash
git clone https://github.com/InfinixCox/nappi.git
cd nappi
npm install
ng serve -o
```

La aplicación abre en `http://localhost:4200`. Para generar la versión de producción se usa `ng build`, que deja los archivos en `dist/nappi/browser`.

## Cuentas de prueba

Los clientes se crean desde la página **Crear cuenta**. Para entrar como restaurante hay una cuenta por cada uno:

- `burguesia@nappi.test` (La Burguesía)
- `masacritica@nappi.test` (Masa Crítica)
- `sancocho@nappi.test` (Sancocho y Sentimiento)
- `rollo@nappi.test` (Roll-o Caleño)
- `pollo@nappi.test` (El Pollo Mensajero)
- `tintoycuento@nappi.test` (Tinto y Cuento)

Las contraseñas no se publican en el repositorio: se le piden a los autores.

## Atribuciones

- Mapas y búsqueda de direcciones: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), servicio Nominatim.
- Rutas: [OSRM](https://project-osrm.org/) (servidor de demostración).
- Las fotos de los platos y restaurantes fueron generadas con IA para este proyecto.
