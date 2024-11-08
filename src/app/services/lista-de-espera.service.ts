import { Injectable } from '@angular/core';
import { DatosServiceService } from './datos/datos-service.service';
import { ListaDeEsperaInterface } from '../interfaces/listaDeEspera.interface';
import { AuthService } from './auth.service';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ListaDeEsperaService {
  nombreDeColeccion = 'listaDeEspera';
  listaDeEsperaDelCliente: ListaDeEsperaInterface[] = [];

  constructor(
    public authService: AuthService,
    private datosServices: DatosServiceService
  ) {
    this.obtenerListaDeEsperaCliente();
  }

  obtenerListaDeEsperaCliente() {
    this.datosServices
      .ObtenerDatos(this.nombreDeColeccion)
      .subscribe((data: ListaDeEsperaInterface[]) => {
        console.log(data, 'dataa');

        this.listaDeEsperaDelCliente = data.filter(
          (item) => item.idCliente === this.authService.usuarioLogeado?.id
        );
        console.log(this.listaDeEsperaDelCliente, 'clientee');
        
      });
  }

  async agregarAListaDeEspera(): Promise<boolean> {
    const idUsuarioLogueado = this.authService.usuarioLogeado?.id;
    if (!idUsuarioLogueado) return false;

    const datos: ListaDeEsperaInterface = {
      idCliente: idUsuarioLogueado,
      estado: 'PENDIENTE',
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

      console.log('Usuario eliminado de la lista de espera');
      return true;
    } catch (error) {
      console.error('Error al eliminar de la lista de espera: ', error);
      return false;
    }
  }
}
