import 'zone.js'; 

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // Aponta para a classe App que renomeamos

// 2. Dando a partida no Front-end
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));