import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreCargaimgService {

  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.loadImage(url)));
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(`Error al cargar la imagen ${url}`);
      img.src = url;
    });
  }
}
