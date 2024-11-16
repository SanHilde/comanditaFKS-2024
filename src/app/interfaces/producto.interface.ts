export interface Producto {
    id: string;                     // Identificador único del producto
    nombre: string;                 // Nombre del producto
    descripcion: string;            // Descripción del producto
    tiempoElaboracion: number;      // Tiempo promedio de elaboración en minutos
    precio: number;                 // Precio del producto
    fotos: string[];                // URLs de las tres fotos del producto
    codigoQR?: string;              // Código QR generado para el producto
    categoria: 'Cocinero' | 'Bartender' | string; // Categoría asignada (quién puede crearlo: cocinero o bartender)
    creadoPor?: string;             // ID o nombre del usuario que creó el producto
    cantidad:number;
}