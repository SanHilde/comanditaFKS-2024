import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  getDocs,
  limit,
  orderBy,
} from '@angular/fire/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatosServiceService {
  collection: any[] = [];
  constructor(public firestore: Firestore) {}

  async guardarDatos(
    nombreDeRegistro: string,
    objetoAGuardar: any
  ): Promise<boolean> {
    try {
      const col = collection(this.firestore, nombreDeRegistro);
      const doc = await addDoc(col, objetoAGuardar);

      this.modificarDatoAsync(doc.id, nombreDeRegistro, { id: doc.id });
      return typeof doc.id == 'string' ? true : false;
    } catch (error) {
      console.error('Error guardando los datos: ', error);
      return false;
    }
  }

  async subirImagenAsync(
    carpeta: string,
    nombreImagen: string,
    file: any
  ): Promise<any> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `/${carpeta}/${nombreImagen}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  async getImagenAsync(carpeta: string, nombreImagen: string): Promise<string> {
    try {
      const storage = getStorage();
      const imagesRef = ref(storage, `/${carpeta}/${nombreImagen}`);
      const url = await getDownloadURL(imagesRef);
      return url;
    } catch (error) {
      console.error('Error al obtener la URL de la imagen:', error);
      throw error;
    }
  }

  async GetId(nombreDeRegistro: string): Promise<number> {
    const col = collection(this.firestore, nombreDeRegistro);
    const q = query(col, orderBy('id', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return 0; // Si no hay documentos, comenzamos desde 0
    } else {
      const doc = snapshot.docs[0];
      return doc.data()['id'] || 0;
    }
  }

  ObtenerDatos(nombreDeRegistro: string): Observable<any[]> {
    const col = collection(this.firestore, nombreDeRegistro);
    return collectionData(col, { idField: 'id' }) as Observable<any[]>;
  }

  async ObtenerDatosAsync(nombreDeRegistro: string): Promise<any[]> {
    const col = collection(this.firestore, nombreDeRegistro);
    const snapshot = await getDocs(col);
    return snapshot.docs.map((doc) => doc.data());
  }

  modificarDato(
    id: string,
    nombreDeRegistro: string,
    objeto: any
  ): Promise<void> {
    const datoRef = doc(this.firestore, nombreDeRegistro, id);
    return updateDoc(datoRef, objeto);
  }

  async modificarDatoAsync(
    id: string,
    nombreDeRegistro: string,
    objeto: any
  ): Promise<void> {
    const datoRef = doc(this.firestore, nombreDeRegistro, id);
    try {
      await updateDoc(datoRef, objeto);
    } catch (error) {
      console.error(
        'Error al actualizar los datos en la base de datos:',
        error
      );
      throw error;
    }
  }

  async eliminarDato(id: string, nombreDeRegistro: string): Promise<boolean> {
    const datoRef = doc(this.firestore, nombreDeRegistro, id);
    try {
      await deleteDoc(datoRef);
      return true; // Retorna true si se eliminó correctamente
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      return false; // Retorna false si hubo un error
    }
  }
}
