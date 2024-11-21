import { Injectable } from '@angular/core';
import { DatosServiceService } from './datos/datos-service.service';
import {
  EstadoListaDeEspera,
  ListaDeEsperaInterface,
} from '../interfaces/listaDeEspera.interface';
import { AuthService } from './auth.service';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListaDeEsperaService {
  nombreDeColeccion = 'listaDeEspera';
  listaDeEsperaDelCliente: ListaDeEsperaInterface[] = [];

  constructor(
    public authService: AuthService,
    private datosServices: DatosServiceService,
    public firestore: Firestore
  ) {}

  obtenerListaDeEspera(): Observable<ListaDeEsperaInterface[]> {
    return this.datosServices.ObtenerDatos(this.nombreDeColeccion);
  }

  obtenerListaDeEsperaCliente(): Observable<ListaDeEsperaInterface[]> {
    return this.datosServices.ObtenerDatos(this.nombreDeColeccion).pipe(
      map((data: ListaDeEsperaInterface[]) => {
        return data.filter(
          (item) => item.idCliente === this.authService.usuarioLogeado?.id
        );
      })
    );
  }

  async agregarAListaDeEspera(cantidad: number): Promise<boolean> {
    const idUsuarioLogueado = this.authService.usuarioLogeado?.id;
    if (!idUsuarioLogueado) return false;

    const datos: ListaDeEsperaInterface = {
      idCliente: idUsuarioLogueado,
      estado: 'PENDIENTE',
      cantidadDePersonas: cantidad,
      horaEntrada: `${new Date()}`,
    };

    try {
      return this.datosServices.guardarDatos(this.nombreDeColeccion, datos);
    } catch (error) {
      console.error('Error inesperado:', error);
      return false;
    }
  }

  async sacarDeListaDeEspera(): Promise<boolean> {
    const idUsuarioLogueado = this.authService.usuarioLogeado?.id;
    if (!idUsuarioLogueado) return false;

    try {
      // Buscar el documento en la colección donde idCliente sea igual al idUsuarioLogueado
      const col = collection(
        this.datosServices.firestore,
        this.nombreDeColeccion
      );
      const q = query(col, where('idCliente', '==', idUsuarioLogueado));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(
        doc(
          this.datosServices.firestore,
          this.nombreDeColeccion,
          docToDelete.id
        )
      );
      return true;
    } catch (error) {
      console.error('Error al eliminar de la lista de espera: ', error);
      return false;
    }
  }
  eliminarDeListaDeEspera(id: string){
    this.datosServices.eliminarDato(id,this.nombreDeColeccion);
  }

  modificarListaDeEspera(id: string, estado: EstadoListaDeEspera): void {
    const itemListaRef = doc(this.firestore, this.nombreDeColeccion, id);

    // Realiza la actualización del estado de la lista de espera

    updateDoc(itemListaRef, {
      estado: estado,
    })
      .then(() => {
        if(estado=="LISTO"){
          setTimeout(()=>{this.eliminarDeListaDeEspera(id)},300000);
        }
        return true;
      })
      .catch((error) => {
        console.error('Error al actualizar los datos de la mesa:', error);
        return false;
      });
  }
}
