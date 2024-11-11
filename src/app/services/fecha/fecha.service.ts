import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FechaService {

  constructor() { }

  convertirFechaAlDiaYHora(fecha: Date): string {
    if (!fecha) return '';

    // Crear un objeto Date utilizando los segundos
    const fechaFormateada = fecha;

    // Aplicar el desplazamiento de UTC-3 horas
    fechaFormateada.setHours(fechaFormateada.getHours() - 3);

    // Extraer día, mes y año con dos dígitos
    const dia = ("0" + fechaFormateada.getUTCDate()).slice(-2);
    const mes = ("0" + (fechaFormateada.getUTCMonth() + 1)).slice(-2); // Enero es 0
    const año = fechaFormateada.getUTCFullYear();

    // Extraer hora y minutos con dos dígitos
    const hora = fechaFormateada.getUTCHours().toString().padStart(2, '0');
    const minutos = fechaFormateada.getUTCMinutes().toString().padStart(2, '0');

    // Formatear la fecha y la hora
    return `${dia}-${mes}-${año} - ${hora}:${minutos}`;
  }
  transform(fecha: { seconds: number; nanoseconds: number }): string {
    if (!fecha) return '';

    // Crear un objeto Date utilizando los segundos
    const fechaFormateada = new Date(fecha.seconds * 1000);

    // Aplicar el desplazamiento de UTC-3 horas
    fechaFormateada.setHours(fechaFormateada.getHours() - 3);

    // Extraer día, mes y año con dos dígitos
    const dia = ("0" + fechaFormateada.getUTCDate()).slice(-2);
    const mes = ("0" + (fechaFormateada.getUTCMonth() + 1)).slice(-2); // Enero es 0
    const año = fechaFormateada.getUTCFullYear();

    // Extraer hora y minutos con dos dígitos
    const hora = fechaFormateada.getUTCHours().toString().padStart(2, '0');
    const minutos = fechaFormateada.getUTCMinutes().toString().padStart(2, '0');

    // Formatear la fecha y la hora
    return `${dia}/${mes}/${año} - ${hora}:${minutos}`;
  }

  parseFecha(fechaStr: string): Date {
    let partes = fechaStr.split('/');
    // partes[0] -> día, partes[1] -> mes, partes[2] -> año
    return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
  }
  convertirFechaAlDia(fecha: { seconds: number, nanoseconds: number }): string {
    const date = new Date(fecha.seconds * 1000);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options); 
  }
  
}
