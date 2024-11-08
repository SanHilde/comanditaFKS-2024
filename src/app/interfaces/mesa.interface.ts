export interface Mesa {
    numero: number;                // Número de mesa
    cantidadComensales: number;    // Cantidad de personas que pueden sentarse en la mesa
    tipo: 'VIP' | 'Discapacitados' | 'Estándar' | string; // Tipo de mesa (VIP, discapacitados, estándar, etc.)
    fotoUrl?: any;              // URL de la foto de la mesa (opcional, si la foto se guarda en un servidor)
    codigoQR?: string;             // Código QR generado para la mesa
    estado?: 'Disponible' | 'Ocupada' | 'Reservada'; // Estado de la mesa (disponible, ocupada, reservada)
    fechaCreacion?: Date;          // Fecha en que se creó la mesa
    asignadaPor?: string;          // ID o nombre del usuario que asignó/creó la mesa (dueño o supervisor)
    id: string;
    idCliente: string;
  }