import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { Observable, from, map, of, switchMap } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { User } from '../types/user.type';
import { DatosServiceService } from './datos/datos-service.service';
import { FirebaseError } from '@angular/fire/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firestore = inject(Firestore);
  firebaseAuth = inject(Auth);

  public tipoUsuario="";
  public accionActual="";
  public verificado=false;
  // public datosTraidos:Observable<any[]>;
  public datosTraidos : any = [];
  public usuarioLogeado:any=[];

  userCollectionName = 'usuarios';
  historyCollectionName = 'loginHistory';
  constructor(private router: Router, private datosService: DatosServiceService) {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(){
      this.datosService.ObtenerDatos("usuarios").subscribe((listaUsuarios:any)=>{
        this.datosTraidos=listaUsuarios
        if(this.firebaseAuth.currentUser?.email){
          this.buscarUsuario(this.firebaseAuth.currentUser?.email);
        }
    });
  }

  buscarUsuario(email:string){
    const usuarioEncontrado = this.datosTraidos.find((usuario: any) => 
      usuario.correo === email
    );
    if(usuarioEncontrado.aprobado=="pendiente"){
        this.firebaseAuth.signOut();
      throw new FirebaseError ("no validado",'Usuario no validado por dueño/supervisor');
    } else{
      if(usuarioEncontrado.aprobado=="rechazado"){
        this.firebaseAuth.signOut();
        throw new FirebaseError ("rechazado",'Usuario rechazado por dueño/supervisor');
      } 
    }
    if (usuarioEncontrado) {
      this.usuarioLogeado = usuarioEncontrado;
      this.verificado = this.usuarioLogeado.aprobado;
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
     this.tipoUsuario="";
     this.verificado=false;
     this.usuarioLogeado=[];
    this.firebaseAuth.signOut().then(() => this.router.navigate(['login']));
  }

  getCurrentUser(): Observable<User | undefined> {
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

  getUserByEmail(email: string): Observable<User | undefined> {
    const usersRef = collection(this.firestore, 'usuarios');
    const q = query(usersRef, where('email', '==', email));

    return new Observable<User | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as User;
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
