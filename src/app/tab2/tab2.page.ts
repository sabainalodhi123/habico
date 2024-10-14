import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {auth, db} from '../firebase';
import 'firebase/database';
import { HttpClient ,HttpHeaders, HttpParams } from '@angular/common/http';
import { getAuth, signInWithEmailAndPassword ,signOut} from 'firebase/auth';

import { Database, getDatabase,ref,get, update,remove,onValue, set } from 'firebase/database';
import { NavController, AlertController, LoadingController, MenuController ,ToastController,} from '@ionic/angular';
import 'firebase/database';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  userInfos:any[] = [];
  uid: any;
  // private apiUrl = 'https://business-api.tiktok.com/open_api/v1.3/page/lead/get/';
  private advertiserId = '7369105163988008977';
  private pageId = '7413752438819193096';
  leads: any[]=[];
   apiUrl = 'https://business-api.tiktok.com/open_api/v1.3/';
   accessToken: any;
  userData: any;
  key:any;
  isLoading = false;
  ngOnInit(): void {
  this.fetchleads();
  }
  constructor(private route: ActivatedRoute,public navc:NavController,public toast:ToastController,public http:HttpClient) {
this.userInfos=[];

  }
 
  ionViewWillEnter() {
    this.fetchUserInfo();
  }
  deleteUserInfo = async (userInfos: any) => {
    // ...
    const uid = localStorage.getItem('uid');
    remove(ref(db, `contacts/${uid}/`+userInfos.id)).then((res: any) => {
      console.log('User info deleted successfully!', res);
      this.fetchUserInfo();
      this.ionViewWillEnter();
    });
    console.log('del');
  };
  async fetchUserInfo() {
    this.isLoading = true;
    const uid = localStorage.getItem('uid');
    const userInfoRef = ref(db, `contacts/${uid}/`);
  
    try {
      const snapshot = await get(userInfoRef);
      if (snapshot.exists()) {
        const userInfo = snapshot.val();
        console.log('User info fetched successfully:', userInfo);
  
        // Update the userInfos array
        this.userInfos = Object.keys(userInfo).map(key => {
          return {
            id: key,
            FirstName: userInfo[key].firstName,
            LastName: userInfo[key].lastName,
            Address: userInfo[key].address,
            Description: userInfo[key].description,
            Email: userInfo[key].email,
            Designation: userInfo[key].designation,
            MobileNumber: userInfo[key].mobileNumber,
            AltNumber: userInfo[key].altNumber,
            Website: userInfo[key].website,
            Notes: []
          };
        });
        console.log('info', this.userInfos);
      } else {
        console.log('No user info found');
        this.userInfos = []; // Reset the userInfos array if no data is found
      }
      this.isLoading = false;
    } catch (error) {
      console.log('Error fetching user info:', error);
      this.isLoading = false;
    }
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
      this.navc.navigateForward('/login');
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
fetchleads(){

  const apiUrl: string = 'https://business-api.tiktok.com/open_api/v1.3/page/lead/get/';
  const advertiserId: string = '7369105163988008977';
  const pageId: string = '7413752438819193096';
  const fields: string = 'name,email,phone';
  const accessToken: string = '038cab566c848f85f7f4896036533b5495d80e9c';
  
  const headers: { [key: string]: string } = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  
  const params: { [key: string]: string } = {
    advertiser_id: advertiserId,
    page_id: pageId,
    fields: fields
  };
  
  const url: string = `${apiUrl}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;
  
  fetch(url, {
    headers,
    mode: 'no-cors'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    })
    .then(data => console.log(data))
    .catch(error => console.error(error));
}
}




  

