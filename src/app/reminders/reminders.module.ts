import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RemindersPageRoutingModule } from './reminders-routing.module';

import { RemindersPage } from './reminders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RemindersPageRoutingModule, FormsModule,ReactiveFormsModule,
  ],
 
  declarations: [RemindersPage]
})
export class RemindersPageModule {}
