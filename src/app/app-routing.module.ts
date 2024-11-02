import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SplashScreenComponent } from './componentes/splash-screen/splash-screen.component';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  // },
 {
    path: '', 
    loadComponent: () => import('./componentes/home/home.component').then(m=>m.HomeComponent),
  },
  { path: 'login', loadComponent: () => import('./componentes/login/login.component').then(m=>m.LoginComponent)},
  { path: 'home', loadComponent: () => import('./componentes/home/home.component').then(m=>m.HomeComponent)},
  { path: 'alta', loadComponent: () => import('./componentes/alta/alta-usuarios/alta-usuarios.component').then(m=>m.AltaUsuariosComponent)},
  { path: 'custom-splash', component: SplashScreenComponent },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
