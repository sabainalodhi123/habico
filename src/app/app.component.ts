import { Component, ViewChild } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { IonContent } from '@ionic/angular';
import { Routes } from '@angular/router';
import { Router } from '@angular/router'; 
const { LocalNotifications } = Plugins;
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AdminService } from './admin.service';
import { NavController, AlertController, IonMenu,LoadingController, MenuController ,ToastController} from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
const ADMIN_UID = 'UgM5pL3JqPRNW6AuVbtptZRpW313';

export class Tab1PageModule {}
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  [x: string]: any;
  @ViewChild(IonMenu) menu: IonMenu | undefined;
  @ViewChild(IonContent, { static: true })
  // menuContent!: IonContent;
  public appPages = [
    { title: 'Login', url: 'login', icon: 'mail' },
    // { title: 'Register-Account', url: 'register-user', icon: 'paper-plane' },
    // { title: 'Favorites', url: 'all-users', icon: 'heart' },

  ];
  filteredLeads:any= [];
  leads: any;
  searchTerm: any;
  itemClicked!: string;
  filterBy: any;

  routes: Routes = [];
  isAdmin: boolean = false;
  constructor(public navCtrl: NavController,private screenOrientation: ScreenOrientation,private menuController: MenuController, private router: Router,private insomnia: Insomnia,private alert:AlertController,private toast:ToastController,private sharedService: AdminService) {
 
    this.checkLoginStatus();
   this.keepScreenAwake();
  

  }

  checkLoginStatus() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      // User is already logged in, redirect to main page and enable menu
      this.navCtrl.navigateRoot('/menu');
      this.menuController.enable(true);
      this.checkAdminStatus();
    } else {
      // User is not logged in, redirect to login page and disable menu
      this.navCtrl.navigateRoot('/login');
      this.menuController.enable(false);
      if (this.router.url === '/login') {
        this.menuController.enable(false);
      }
    }
  }
  checkAdminStatus() {
    const uid = localStorage.getItem('uid');
    if (uid === ADMIN_UID) {
      this.isAdmin = true;
      this.sharedService.setAdmin(true);
    } else {
      this.isAdmin = false;
      this.sharedService.setAdmin(false);
    }
  }
  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  applyFilter() {
    this.filteredLeads = this.leads.filter((lead: { leads: { data: any[]; }; }) => {
      // Your filtering logic here
      // For example:
      const field = lead.leads.data.find((field: { name: any; }) => field.name === this.filterBy);
      return field && field.values[0].toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }
  async keepScreenAwake() {
    try {
      await this.insomnia.keepAwake();
      console.log('Screen will stay awake');
      const toast = await this.toast.create({
        message: 'The screen will stay awake while the app is running.',
        duration: 2000
      });
      toast.present();
    } catch (error) {
      console.error('Error keeping screen awake:', error);
      const toast = await this.toast.create({
        message: 'Failed to keep screen awake. Please try again.',
        duration: 2000
      });
      toast.present();
    }
  }
  
  navigate(url: string) {
    this.menuController.toggle(); // close the menu
    this.router.navigateByUrl(url);
  }

  async logout() {
    try {
      await signOut(auth);
      console.log('Logged out successfully!');
      
      // Remove the UID and isLoggedIn from local storage
      localStorage.removeItem('uid');
      localStorage.removeItem('isLoggedIn');
      
      const toast = await this.toast.create({
        message: 'Logged out successfully!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
      this.navCtrl.navigateForward('/login');
    } catch (error: any) {
      console.error(error);
      
      const toast = await this.toast.create({
        message: 'Logout failed: ' + error.message,
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }


}
