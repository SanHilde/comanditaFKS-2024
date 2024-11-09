import { Injectable } from '@angular/core';
import { EstadoMesaTipo, Mesa } from '../interfaces/mesa.interface';
import { DatosServiceService } from './datos/datos-service.service';
import { Observable } from 'rxjs';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class MesasService {
  nombreDeColeccion = 'Mesa';
  listaDeEsperaDelCliente: Mesa[] = [];

  constructor(
    private datosServices: DatosServiceService,
    public firestore: Firestore
  ) {}

  obtenerMesas(): Observable<Mesa[]> {
    return this.datosServices.ObtenerDatos(this.nombreDeColeccion);
  }

  modificarMesa(
    idMesa: string,
    idCliente: string,
    estado: EstadoMesaTipo
  ): void {
    const mesaRef = doc(this.firestore, this.nombreDeColeccion, idMesa);

    // Realiza la actualización de los campos idCliente y estado
    updateDoc(mesaRef, {
      idCliente: idCliente,
      estado: estado,
    })
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar los datos de la mesa:', error);
        return false;
      });
  }

  obtenerMesaPorCliente(idCliente: string): Observable<Mesa | undefined> {
    return new Observable((observer) => {
      this.obtenerMesas().subscribe(
        (mesas: Mesa[]) => {
          const mesaEncontrada = mesas.find(
            (mesa) => mesa.idCliente === idCliente
          );

          if (mesaEncontrada) {
            observer.next(mesaEncontrada);
          } else {
            observer.next(undefined);
          }
          observer.complete();
        },
        (error) => {
          console.error('Error al obtener mesas desde Firestore:', error);
          observer.next(undefined);
          observer.complete();
        }
      );
    });
  }
}
