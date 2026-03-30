import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom, isDevMode, LOCALE_ID } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { HttpClientModule } from '@angular/common/http';

// Importeer Nederlandse taalinstellingen
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Registreer de Nederlandse data
registerLocaleData(localeNl);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Forceer de hele app op Nederlands (voor datums, valuta, etc.)
    { provide: LOCALE_ID, useValue: 'nl-NL' },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(HttpClientModule),
  ],
});
