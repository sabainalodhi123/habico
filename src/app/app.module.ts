import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getAuth } from 'firebase/auth';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import firebase from 'firebase/compat/app';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { Tab1PageModule } from './tab1/tab1.module';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { AdminService } from './admin.service';
import { FcmService } from './services/fcm.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Tab1PageRoutingModule } from './tab1/tab1-routing.module';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
const firebaseConfig = {
  apiKey: 'AIzaSyBjFH2M1NFO3Hz4Qtw63BW348kRIobqeKs',
  authDomain: '<AUTH_DOMAIN>',
  projectId: 'crm-5784d'}

const app = initializeApp(firebaseConfig);
const db =  getDatabase(app);
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,Tab1PageModule, ReactiveFormsModule, Tab1PageRoutingModule],
  providers: [FcmService,{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy},Insomnia,AdminService, ScreenOrientation],
  bootstrap: [AppComponent],
})

export class AppModule {}
