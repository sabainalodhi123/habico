import { Component ,OnInit, ViewChild} from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { AdminService } from '../admin.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  selectTab: any;
  @ViewChild('tabs')
  tabs!: IonTabs;
  uid: any;
  isAdmin: boolean = false;
  constructor(private sharedService: AdminService) {

    
  }
 setCurrentTab(event: any) {
    console.log(event);    
    this.selectTab = this.tabs.getSelected();
  }
 
ngOnint(){

}

}
