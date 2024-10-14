import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuPageRoutingModule } from './menu-routing.module';
import { Tab1Page } from '../tab1/tab1.page';
import { Tab3Page } from '../tab3/tab3.page';
import { MenuPage } from './menu.page';
import { LoginPage } from '../login/login.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuPageRoutingModule
  ],
  providers: [Tab1Page,Tab3Page,LoginPage],
  declarations: [MenuPage]
})
export class MenuPageModule {}
