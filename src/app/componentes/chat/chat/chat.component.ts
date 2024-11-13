import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, limit, orderBy, query, where } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { query } from 'express';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
// import { LocalNotifications } from '@capacitor/local-notifications';
// import { MessagingService } from 'src/app/services/messaging/messaging.service';
import { doc, onSnapshot } from 'firebase/firestore';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
// import { LoaderComponent } from '../loader/loader.component';




@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [ReactiveFormsModule, ModulosComunesModule, RouterOutlet, NgxSpinnerModule],
  standalone:true
})
export class ChatComponent   implements OnInit {
  // public mail="a@gmail.com";
  public mensaje="";
  private sub!: Subscription;
  public bandera = true;
  public chatCollection: any[]=[];
  private col:any;
  public chatName!: string;
  public chatNumero: string | null=null;

  constructor(private firestore:Firestore, public auth: AuthService, private datosService: DatosServiceService, private route: ActivatedRoute, private router:Router,public spinner: NgxSpinnerService)
  {
  }
  

   ngOnInit() {
    this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      this.chatNumero = params.get('chatNumero');
    });
    let chat = "Chat" + this.chatNumero;
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.col = collection(this.firestore, chat);
    this.cargarMensajes();
    // set.setTimeout
  }


  insertarMensaje(mensajes: any): void {
    // Obtener el chat donde se insertarán los mensajes
    let chat = document.getElementById('chat') as HTMLElement;
    let chatCompleto = document.getElementById('chatCompleto') as HTMLElement;
    // Verificar si el chat existe
    if (chat) {
      chat.innerHTML = '';
  
      // Iterar sobre cada mensaje del array
      mensajes.forEach((objeto:any)=> {
        // Crear un elemento div para el mensaje
        let divMensaje = document.createElement('div');
        let pMensaje = document.createElement('p');
        let divFecha = document.createElement('div');
        divFecha.classList.add('timestamp');
        if (objeto.user === this.auth.usuarioLogeado?.nombre) {
          pMensaje.classList.add('message-personal');
          divMensaje.classList.add('derecha');
        } else{
          let pUser = document.createElement('p');
          pUser.classList.add('usuario');
          pMensaje.classList.add('message');
          divMensaje.classList.add('izquierda');
          pUser.textContent = objeto.user;
          divMensaje.appendChild(pUser);
        }
        // divMensaje.classList.add('new');

        const fecha = new Date(objeto.fecha.seconds * 1000 + objeto.fecha.nanoseconds / 1000000);
        let dia = fecha.getDate().toString().padStart(2, '0'); // Día del mes (no del día de la semana)
        let mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Mes (sumar 1 porque los meses comienzan en 0)
        let horas = fecha.getHours().toString().padStart(2, '0'); // Formato 2 dígitos
        let minutos = fecha.getMinutes().toString().padStart(2, '0'); // Formato 2 dígitos
        const horaFormateada = `${dia}/${mes} - ${horas}:${minutos}`;
        
        
        pMensaje.textContent = objeto.mensaje;
        divFecha.textContent =horaFormateada;
  
        // Insertar los elementos de mensaje en el div del mensaje

        divMensaje.appendChild(pMensaje);
        divMensaje.appendChild(divFecha);
  
        // Insertar el div del mensaje en el chat
        chat.appendChild(divMensaje);
      });
    } else {
      console.error('No se encontró el chat de mensajes.');
    }
    this.scrollToBottom(); 
  }
  
  
  cargarMensajes() {
    // this.bandera=false;
    // if (this.bandera) {
      const filteredQuery = query(
        this.col, 
        orderBy('fecha', 'asc')
      );
  
      const obs = collectionData(filteredQuery);
      this.sub = obs.subscribe((respuesta: any) => {
        this.chatCollection = respuesta;
        this.insertarMensaje(respuesta);
        this.spinner.hide();

      });
    // }

  }
  volverAtras(){
    if(this.auth.tipoUsuario=="Mozo"){
      this.router.navigate(['/salaDeChats']);
    }else{
      if(this.auth.tipoUsuario=="Cliente" || this.auth.tipoUsuario=="Anónimo"){
        this.router.navigate(['/login']); //configurar bien esta ruta
      } else{
        this.router.navigate(['/home']); //configurar bien esta ruta
      }
    }
  }

  scrollToBottom() {
    const chat = document.getElementById('chat') as HTMLElement;
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
    this.bandera=true;
  }

  async enviarMensaje(){
    
    let nuevoMjs= {fecha: new Date, "user": this.auth.usuarioLogeado?.nombre, "mensaje":this.mensaje};
    addDoc (this.col,nuevoMjs);
    this.mensaje = "";
  }

}
