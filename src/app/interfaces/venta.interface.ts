import { Producto } from "./producto.interface";
export type EstadoPedido = 'pendiente' | 'en proceso' | 'listo';
export interface Ventas {
    usuarioId: string;         
    mesaId: string;              
    productosSeleccionados: Producto[]; 
    pago: boolean;      
    importeTotal: number;
    validacionMozo:boolean;       
    completoEncuesta:boolean; 
    confirmarRecepcion:boolean;
    estadoCocinero: EstadoPedido;
    estadoBartender: EstadoPedido;
    id:string;
    mesaNumero:string;
  }
  
