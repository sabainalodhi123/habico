import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import '@angular/compiler'; // Add this line
console.log('Angular application initializing...');
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
