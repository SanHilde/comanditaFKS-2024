import { Producto } from "./producto.interface";
export interface Ventas {
    usuarioId: string;         
    mesaId: string;              
    productosSeleccionados: Producto[]; 
    pago: boolean;      
    precioPaga: number;
    validacionMozo:boolean;          
  }
  