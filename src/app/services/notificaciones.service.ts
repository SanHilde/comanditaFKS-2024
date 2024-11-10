import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private appId: string = '6c7862cc-4153-40fa-aa8b-ceb9d42d6dd4';
  private apiKey: string = 'YWFiMGQwZDktYmFhNi00MTQ0LThiYzAtYzkxYTk3YjZkZDk1';
  private apiUrl: string = 'https://onesignal.com/api/v1/notifications';

  constructor(private http: HttpClient) {}

  enviarNotificacion(titulo: string, mensaje: string, usuarioId: string) {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   Authorization: `Basic ${this.apiKey}`,
    // });
    // const body = {
    //   app_id: this.appId,
    //   include_external_user_ids: [usuarioId], // ID del usuario al que se enviará la notificación
    //   headings: { en: titulo },
    //   contents: { en: mensaje },
    // };
    // return this.http.post(this.apiUrl, body, { headers });
  }
}
