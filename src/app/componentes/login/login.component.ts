import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonInputPasswordToggle,
  IonToast,
} from '@ionic/angular/standalone';
import { FirebaseError } from '@angular/fire/app';
import { authErrors } from 'src/app/services/auth.errors';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { AltaUsuariosComponent } from '../alta/alta-usuarios/alta-usuarios.component';
import { CorreoService } from 'src/app/services/correo.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToast,
    IonToolbar,
    IonInput,
    IonInputPasswordToggle,
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    AltaUsuariosComponent,
  ],
})
export class LoginComponent implements OnInit{
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  errorMessage: string = '';
  registrarse: boolean = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public spinner: NgxSpinnerService, private CorreoService: CorreoService
  ) {
    
  }
  ngOnInit(): void {
    //this.enviarCorreo();
  }

  iniciarSesion() {
    this.spinner.show();

    if (this.form.invalid) {
      this.errorMessage = '';

      if (this.form.controls['email'].invalid) {
        this.errorMessage = 'El correo electrónico es inválido.';
      }
      if (this.form.controls['password'].invalid) {
        this.errorMessage += this.errorMessage ? ' ' : '';
        this.errorMessage += 'La contraseña es requerida.';
      }
      if (!this.errorMessage) {
        this.errorMessage =
          'Por favor, complete todos los campos correctamente.';
      }

      this.spinner.hide();
      return;
    }

    const { email, password } = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.spinner.hide();
        this.errorMessage = '';
        this.form.controls['email'].setValue('');
        this.form.controls['password'].setValue('');
        this.router.navigateByUrl('home');
      },
      error: (err: FirebaseError) => {
        let errorMessage = 'Se produjo un error desconocido.';
        for (const error of authErrors) {
          if (error.code === err.code) {
            errorMessage = error.message;
            break;
          }
        }
        this.errorMessage = errorMessage;
        this.spinner.hide();
      },
    });
  }

  quererRegistrarse() {
    this.registrarse = true;
    // this.formularioAnonimo=!this.formularioAnonimo;
  }

  rutearCliente(option: string) {
    this.registrarse = false;
    this.router.navigate(['/altaUsuarios', option]);
  }

  rutearAnonimo(option: string) {
    this.registrarse = false;
    this.router.navigate(['/altaUsuarios', option]);
  }

  ingresoAnonimo() {
    this.router.navigateByUrl('home');
    this.authService.usuarioLogeado = {
      id: 'Juan Anónimo',
      tipoUsuario: 'Anónimo',
      aprobado: 'anónimo',
      nombre: 'Juan',
      foto: 'https://firebasestorage.googleapis.com/v0/b/comanda-597db.appspot.com/o/Fotos%20de%20perfil%20anonimas%2FJuan-FotoDePerfil?alt=media&token=e1f51d01-225d-41b8-8f2e-54dfb308daaa',
    };
  }
  handleQuickAccess(email: string, password: string) {
    this.errorMessage = '';
    this.form.controls['email'].setValue(email);
    this.form.controls['password'].setValue(password);
  }

  onInputChange() {
    this.errorMessage = '';
  }
  enviarCorreo() {
    const to = 'kervinstilver1991@gmail.com'; 
    const subject = 'Asunto de prueba';
    const message = 'mensaje';

    this.CorreoService.sendEmail(to, subject, message)
      .then(response => console.log('Correo enviado con éxito'))
      .catch(error => console.error('Error al enviar el correo:', error));
  }
}
