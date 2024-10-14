import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WehbookPageRoutingModule } from './wehbook-routing.module';

import { WehbookPage } from './wehbook.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WehbookPageRoutingModule
  ],
  declarations: [WehbookPage]
})
export class WehbookPageModule {}
