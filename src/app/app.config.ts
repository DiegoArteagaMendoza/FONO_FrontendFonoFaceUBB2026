import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';
import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

// Locale de Chile para el pipe 'date'. Hace falta para los formatos con nombres
// (EEEE, MMMM) que usa la agenda de citas: sin registrarlo, Angular cae en
// en-US y mostraría "Thursday 20 of August" en una interfaz en español.
// Las fechas del resto de la aplicación usan formatos numéricos explícitos
// ('dd/MM/yyyy'), que no dependen del locale y por lo tanto no cambian.
registerLocaleData(localeEsCl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-CL' },
    // importProvidersFrom(RecaptchaModule),
    // {
    //   provide: RECAPTCHA_SETTINGS,
    //   useValue: {
    //     siteKey: '6LfRpCUtAAAAAEEbYTL48Oj_c8UdDKK8OBG64IDu',
    //     language: 'es'
    //   } as RecaptchaSettings,
    // }
  ]
};
