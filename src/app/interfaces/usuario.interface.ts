import { Producto } from './producto.interface';
import { EstadoPedido } from './venta.interface';

export type TipoDeUsuario =
  | 'Cliente'
  | 'Mozo'
  | 'Maître'
  | 'Dueño'
  | 'Supervisor'
  | 'Cocinero'
  | 'Bartender'
  | 'Anónimo'
  | 'Sin asignar';

export type EstadoUsuario = 'pendiente' | 'rechazado' | 'aprobado' | 'anónimo';

export type TipoDeAccionesUsuario = 'INGRESO' | 'MESA' | 'PROPINA';
export interface UsuarioInterface {
  id: string;
  apellido?: string;
  aprobado: EstadoUsuario;
  clave?: string;
  correo?: string;
  cuil?: string;
  dni?: string;
  foto: string;
  nombre: string;
  tipoUsuario: TipoDeUsuario;
}

export interface TareaCocineroYBartender {
  listaProductos: Producto[];
  numeroDeMesa: string;
  estadoPedido: EstadoPedido;
  idDeLaVenta: string;
}
