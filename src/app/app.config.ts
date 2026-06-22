import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
// import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
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