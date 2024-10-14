import { Component, OnInit ,ViewChild } from '@angular/core';
import { auth, db } from '../firebase';
import { IonMenu } from '@ionic/angular';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { NavController, AlertController, LoadingController, MenuController ,ToastController} from '@ionic/angular';
import { Subject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../admin.service';
// login.page.ts
import { ADMIN_UID } from 'capacitor.config';
import { get, ref, set } from 'firebase/database';
interface UserData {
  roles: string[];
  // ...
}
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private loginSubject = new Subject<void>();
  email: any;
  password: any;
  showMenu = false;
  @ViewChild(IonMenu)
  menu!: IonMenu;
  isAdmin: boolean=false;
   userData: UserData = {
    roles: [],
    // ...
  };
  isLoggedIn = false;

  constructor(public navCtrl: NavController,private sharedService: AdminService,private changeDetectorRef: ChangeDetectorRef, public alertCtrl: AlertController, public toast : ToastController,public menuCtrl: MenuController) {

   }
  
  auth = getAuth();

  ngOnInit() {
    this.checkAdminStatus();
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }
  async login() {
    try {
      const user = await signInWithEmailAndPassword(auth, this.email, this.password);
      console.log(user);
      const uid = user.user.uid;
      console.log('UID:', uid);
  
      // Store the UID in local storage
      localStorage.setItem('uid', uid);
      localStorage.setItem('isLoggedIn', 'true');
  
      // Store the user's data in the Firebase Realtime Database
      const userRef = ref(db, `users/${uid}`);
      const userData = {
        uid: uid,
        email: this.email,
        roles: []
      };
  
      if (typeof uid === 'string' && uid === 'UgM5pL3JqPRNW6AuVbtptZRpW313') {
        this.userData.roles.push('admin');
        try {
          localStorage.setItem('isAdmin', 'true');
        } catch (error) {
          console.error('Error setting local storage item:', error);
        }
      } else {
        this.userData.roles.push('user');
        try {
          localStorage.setItem('isAdmin', 'false');
        } catch (error) {
          console.error('Error setting local storage item:', error);
        }
      }
  
      set(userRef, userData);
  
      const toast = await this.toast.create({
        message: 'Login successful!',
        duration: 2000,
        color: 'success'
      });
      toast.present();
  
      if (uid === 'UgM5pL3JqPRNW6AuVbtptZRpW313') {
  
        this.navCtrl.navigateRoot('/menu', {
          queryParams: {
            refresh: true
          }
        });
      } else {
  
        this.navCtrl.navigateRoot('/menu');
      }
    } catch (error: any) {
      console.error(error);
  
      const toast = await this.toast.create({
        message: 'Login failed: ' + error.message,
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }
  getLoginEvent() {
    return this.loginSubject.asObservable();
  }
  async checkAdminStatus() {
    const uid = localStorage.getItem('uid');
    const userRef = ref(db, `users/${uid}`);
    const userSnap = await get(userRef);
  
    if (userSnap.exists()) {
      const userData = userSnap.val();
      if (userData.roles.includes('admin')) {
        this.isAdmin = true;
        this.sharedService.setAdmin(true);
      } else {
        this.isAdmin = false;
        this.sharedService.setAdmin(false);
      }
    } else {
      console.log('User data not found');
    }
  }
}
