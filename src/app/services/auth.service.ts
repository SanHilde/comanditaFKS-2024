import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { Observable, from, map, of, switchMap } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { DatosServiceService } from './datos/datos-service.service';
import { FirebaseError } from '@angular/fire/app';
import {
  TipoDeAccionesUsuario,
  TipoDeUsuario,
  UsuarioInterface,
} from '../interfaces/usuario.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firestore = inject(Firestore);
  firebaseAuth = inject(Auth);

  public tipoUsuario: TipoDeUsuario = 'Anónimo'; // de defecto va a ser Anónimo
  public accionActual: TipoDeAccionesUsuario = 'INGRESO';
  public verificado = false;
  // public datosTraidos:Observable<any[]>;
  public datosTraidos: any = [];
  public usuarioLogeado: UsuarioInterface | undefined;

  userCollectionName = 'usuarios';
  historyCollectionName = 'loginHistory';
  constructor(
    private router: Router,
    private datosService: DatosServiceService
  ) {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.datosService
      .ObtenerDatos('usuarios')
      .subscribe((listaUsuarios: UsuarioInterface[]) => {
        this.datosTraidos = listaUsuarios;
        if (this.firebaseAuth.currentUser?.email) {
          this.buscarUsuario(this.firebaseAuth.currentUser?.email);
        }
      });
  }

  buscarUsuario(email: string) {
    const usuarioEncontrado: UsuarioInterface | undefined =
      this.datosTraidos.find(
        (usuario: UsuarioInterface) => usuario.correo === email
      );
    if (!usuarioEncontrado) return undefined;
    if (usuarioEncontrado.aprobado == 'pendiente') {
      throw new FirebaseError(
        'no validado',
        'Usuario no validado por dueño/supervisor'
      );
    } else {
      if (usuarioEncontrado.aprobado == 'rechazado') {
        throw new FirebaseError(
          'rechazado',
          'Usuario rechazado por dueño/supervisor'
        );
      }
    }
    if (usuarioEncontrado) {
      this.usuarioLogeado = usuarioEncontrado;
      this.verificado = this.usuarioLogeado.aprobado === 'aprobado';
      this.tipoUsuario = this.usuarioLogeado.tipoUsuario;
    }
  }

  login(email: string, password: string) {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      this.buscarUsuario(email);
    });
    return from(promise);
  }

  logout() {
    this.tipoUsuario = 'Sin asignar';
    this.verificado = false;
    this.usuarioLogeado = undefined;
    this.firebaseAuth
      .signOut()
      .then(() => this.router.navigate(['login']))
      .catch((err) => {
        console.log(err, 'errorrrrr');
      });
  }

  getCurrentUser(): Observable<UsuarioInterface | undefined> {
    return authState(this.firebaseAuth).pipe(
      switchMap((user) => {
        if (user) {
          return this.getUserByEmail(user.email!).pipe(
            map((userData) => userData)
          );
        } else {
          return of(undefined);
        }
      })
    );
  }

  getUserByEmail(email: string): Observable<UsuarioInterface | undefined> {
    const usersRef = collection(this.firestore, this.userCollectionName);
    const q = query(usersRef, where('correo', '==', email));

    return new Observable<UsuarioInterface | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as UsuarioInterface;
            const userData = { ...data, id: doc.id };
            observer.next(userData);
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
