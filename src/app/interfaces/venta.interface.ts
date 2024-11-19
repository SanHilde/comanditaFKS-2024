import { Producto } from './producto.interface';
export type EstadoPedido = 'pendiente' | 'en proceso' | 'listo';
export interface Ventas {
  usuarioId: string;
  mesaId: string;
  productosSeleccionados: Producto[];
  pago: boolean; // True si el usuario pagó la cuenta
  importeTotal: number;
  validacionMozo: boolean;
  completoEncuesta: boolean;
  confirmarRecepcion: boolean;
  estadoCocinero: EstadoPedido;
  estadoBartender: EstadoPedido;
  id: string;
  mesaNumero: string;
  seEntregoElPedido?: boolean;
  pidioLaCuenta?: boolean;
  tieneLaCuenta?: boolean;
}
