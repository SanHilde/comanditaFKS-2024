export interface ListaDeEsperaInterface {
  id?: string;
  idCliente: string;
  estado: 'PENDIENTE' | 'LISTO';
  cantidadDePersonas: number;
  horaEntrada: string; // Es un Date pero se guarada como string
}
