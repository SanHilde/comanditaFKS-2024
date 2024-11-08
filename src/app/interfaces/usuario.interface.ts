export type TipoDeUsuario =
  | 'Cliente'
  | 'Mozo'
  | 'Maître'
  | 'Dueño'
  | 'Supervisor'
  | 'Cocinero'
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
