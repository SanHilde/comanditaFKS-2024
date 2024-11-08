export type TipoDeUsuario =
  | 'Cliente'
  | 'Mozo'
  | 'Maître'
  | 'Dueño'
  | 'Supervisor'
  | 'Cocinero'
  | 'Anónimo';

export type EstadoUsuario = 'pendiente' | 'rechazado' | 'aprobado' | 'anónimo';

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
