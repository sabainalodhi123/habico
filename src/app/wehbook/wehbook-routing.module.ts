import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WehbookPage } from './wehbook.page';

const routes: Routes = [
  {
    path: '',
    component: WehbookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WehbookPageRoutingModule {}
