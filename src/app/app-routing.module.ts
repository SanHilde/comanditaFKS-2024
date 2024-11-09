import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashScreenComponent } from './componentes/splash-screen/splash-screen.component';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./componentes/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./componentes/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./componentes/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'ingreso',
    loadComponent: () =>
      import('./componentes/ingreso/ingreso.component').then(
        (m) => m.IngresoComponent
      ),
  },
  {
    path: 'asignarMesas',
    loadComponent: () =>
      import('./componentes/asignar-mesas/asignar-mesas.component').then(
        (m) => m.AsignarMesasComponent
      ),
  },
  {
    path: 'listaClientes',
    loadComponent: () =>
      import('./componentes/listaClientes/lista-clientes.component').then(
        (m) => m.ListaClientesComponent
      ),
  },
  {
    path: 'altaUsuarios/:tipoUsuario',
    loadComponent: () =>
      import('./componentes/alta/alta-usuarios/alta-usuarios.component').then(
        (m) => m.AltaUsuariosComponent
      ),
  },
  // {
  //   path: 'play-k',
  //   loadComponent: () => import('./play-k/play-k.page').then(m => m.PlayKPage)
  // },
  { path: 'custom-splash', component: SplashScreenComponent },
  {
    path: 'encuesta-empleado',
    loadChildren: () =>
      import('./encuesta-empleado/encuesta-empleado.module').then(
        (m) => m.EncuestaEmpleadoPageModule
      ),
  },
  {
    path: 'alta-mesa',
    loadChildren: () =>
      import('./alta-mesa/alta-mesa.module').then((m) => m.AltaMesaPageModule),
  },
  {
    path: 'alta-producto',
    loadChildren: () =>
      import('./alta-producto/alta-producto.module').then(
        (m) => m.AltaProductoPageModule
      ),
  },
  {
    path: 'encuesta-supervisor',
    loadChildren: () =>
      import('./encuesta-supervisor/encuesta-supervisor.module').then(
        (m) => m.EncuestaSupervisorPageModule
      ),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
