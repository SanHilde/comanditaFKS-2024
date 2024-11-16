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
    path: 'ingreso',
    loadComponent: () =>
      import('./componentes/ingreso/ingreso.component').then(
        (m) => m.IngresoComponent
      ),
  },
  {
    path: 'hacerPedido',
    loadComponent: () =>
      import('./componentes/hacer-pedido/hacer-pedido.component').then(
        (m) => m.HacerPedidoComponent
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
  { path: 'custom-splash', component: SplashScreenComponent },
  {
    path: 'encuesta-empleado',
    loadChildren: () =>
      import(
        './componentes/encuestas/encuesta-empleado/encuesta-empleado.module'
      ).then((m) => m.EncuestaEmpleadoPageModule),
  },
  {
    path: 'alta-mesa',
    loadChildren: () =>
      import('./componentes/alta/alta-mesa/alta-mesa.module').then(
        (m) => m.AltaMesaPageModule
      ),
  },
  {
    path: 'alta-producto',
    loadChildren: () =>
      import('./componentes/alta/alta-producto/alta-producto.module').then(
        (m) => m.AltaProductoPageModule
      ),
  },
  {
    path: 'encuesta-supervisor',
    loadChildren: () =>
      import(
        './componentes/encuestas/encuesta-supervisor/encuesta-supervisor.module'
      ).then((m) => m.EncuestaSupervisorPageModule),
  },
  {
    path: 'resultadosEncuestas/:idMesa',
    loadComponent: () =>
      import(
        './componentes/resultados-encuestas/resultados-encuestas.component'
      ).then((m) => m.ResultadosEncuestasComponent),
  },
  {
    path: 'encuestasClientes/:idMesa',
    loadComponent: () =>
      import(
        './componentes/encuestas/encuesta-cliente/encuesta-cliente.component'
      ).then((m) => m.EncuestaClienteComponent),
  },
  {
    path: 'salaDeChats',
    loadComponent: () =>
      import('./componentes/chat/sala-de-chat/sala-de-chat.component').then(
        (m) => m.SalaDeChatComponent
      ),
  },
  {
    path: 'chat/:chatNumero',
    loadComponent: () =>
      import('./componentes/chat/chat/chat.component').then(
        (m) => m.ChatComponent
      ),
  },
  {
    path: 'lista-productos',
    loadChildren: () =>
      import('./lista-productos/lista-productos.module').then(
        (m) => m.ListaProductosPageModule
      ),
  },
  {
    path: 'listasParaAceptar/:tipoLista',
    loadComponent: () =>
      import(
        './componentes/listas-para-aceptar/listas-para-aceptar.component'
      ).then((m) => m.ListasParaAceptarComponent),
  },
  {
    path: 'detalle/:idMesa/:porcentajePropina',
    loadComponent: () =>
      import(
        './componentes/detalle-de-cuenta/detalle-de-cuenta.component'
      ).then((m) => m.DetalleDeCuentaComponent),
  },
  {
    path: 'mesa/:idMesa',
    loadComponent: () =>
      import('./componentes/mesa/mesa.component').then((m) => m.MesaComponent),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
