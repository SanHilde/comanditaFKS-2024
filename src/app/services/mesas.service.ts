import { Injectable } from '@angular/core';
import { Mesa } from '../interfaces/mesa.interface';
import { DatosServiceService } from './datos/datos-service.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MesasService {
  nombreDeColeccion = 'Mesa';
  listaDeEsperaDelCliente: Mesa[] = [];

  constructor(private datosServices: DatosServiceService) {}

  obtenerMesas(): Observable<Mesa[]> {
    return this.datosServices.ObtenerDatos(this.nombreDeColeccion);
  }
}
