export type EstadoListaDeEspera = 'PENDIENTE' | 'LISTO';
export interface ListaDeEsperaInterface {
  id?: string;
  idCliente: string;
  estado: EstadoListaDeEspera;
  cantidadDePersonas: number;
  horaEntrada: string; // Es un Date pero se guarada como string
}
