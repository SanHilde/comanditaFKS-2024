import { Injectable } from '@angular/core';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  
  private userId = 'FgcA4-gBLe5PbgFZh'; 
  private serviceId = 'service_8o3dwuw'; 
  private templateId = 'template_x1312id';

  constructor() {
    emailjs.init(this.userId); 
  }

  sendEmail(toEmail: string, subject: string, message: string): Promise<EmailJSResponseStatus> {
    const templateParams = {
      to_email: toEmail,
      subject: subject,
      message: message,
    };

    return emailjs.send(this.serviceId, this.templateId, templateParams)
      .then(response => {
        console.log('Correo enviado con éxito!', response.status, response.text);
        return response;
      })
      .catch(error => {
        console.error('Error al enviar el correo:', error);
        throw error;
      });
  }

  sendForm(formElement: HTMLFormElement): Promise<EmailJSResponseStatus> {
    const serviceID = 'default_service';
    const templateID = 'template_x1312id';

    return emailjs.sendForm(serviceID, templateID, formElement)
      .then(response => {
        console.log('Correo enviado con éxito!', response.status, response.text);
        return response;
      })
      .catch(err => {
        console.error('Error al enviar el correo:', err);
        throw err;
      });
  }
}
