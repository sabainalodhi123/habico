import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FcmService } from '../services/fcm.service';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { Tab1Page } from '../tab1/tab1.page';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Tab3Page } from '../tab3/tab3.page';
import { Subject } from 'rxjs';
import { timer } from 'rxjs';
import { AdminService } from '../admin.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, onValue, remove, set ,Database, child} from 'firebase/database';
import { NavController, AlertController, LoadingController, Platform,MenuController ,ToastController} from '@ionic/angular';
import { db } from '../firebase';
interface FollowUp {
  key: string;
  campaignName: string;
  followUp: string;
  fullname: string;
  leadId: string;
  leadSource: string;
  // Add other properties as needed
  timeLeft: string;
}
@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  timeLeft: any;
  totalLeads!: Observable<number>;
  totalLead!: Observable<number>;
  firstName: any;
  private followUpCalled = false;
  private timeLeftSubject = new Subject<number>();
  email: any;
  isTablet: boolean = false;
  uid: any;
  showOverdueFollowUps = false;
  showUpcomingFollowUps = false;
  showCompFollowUp = false;
   overdueFollowUpsSubject = new BehaviorSubject<FollowUp[]>([]);
 completedFollowUpsSubject = new BehaviorSubject<FollowUp[]>([]);
  completedFollowUps:any[] = [];
  movedFollowUps: any[] = [];
  followUpNotifications: any[] = [];
  public adminLeadIndexesLength: number | undefined;
  leadIndexesLength!: Observable<number>;
  uncontactedLeadsLength!: Observable<number>;
  completedLeadsLength!: Observable<number>;
  isAdmin: boolean = false;
  todoList = [
    { text: 'Item 1', done: false },
    { text: 'Item 2', done: false },
    { text: 'Item 3', done: false }
  ];
  newItem: string = '';
  reminderTime: Date = new Date();
  showReminder: boolean = false;
  todoItem: any;
  followUpOptions = [
    '1 day',
    '2 days',
    '3 days',
    '1 week'
  ];
  followUps: any[] = [];
  overdueFollowUps:any[] = [];
  upcomingFollowUps:any[] = [];
  isUserFound: boolean = false;
  timer: any;
  
  
  constructor(private http: HttpClient,private route: ActivatedRoute,public toast:ToastController,private leadService: FcmService,private sharedService: AdminService, private router: Router,public tab1:Tab1Page,public tab3:Tab3Page,public menuCtrl:MenuController,public platform: Platform,private cdr: ChangeDetectorRef,
    private cd: ChangeDetectorRef) {
      this.isUserFound = false;

    }
    ngOnInit() {
      this.leadService.getLeadIndexLengths().subscribe((length) => {
        this.adminLeadIndexesLength = length;
      });
      this.retrieveCompletedFollowUps();
      this.getTodoList().then((list) => {
        this.todoList = list;
        this.todoList.forEach((item) => {
          item.done = !!item.done; // Ensure item.done is a boolean value
        });
      });
      
      
      
      this.isTablet = this.platform.is("tablet");
      
      
      this.uid = localStorage.getItem('uid');
      
      
    }

    async  ionViewWillEnter() {
      
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (this.isAdmin) {
        this.sharedService.setAdmin(true);
        // Update the menu page for admin role
      } else {
        this.sharedService.setAdmin(false);
      }
      
    }
    
    async getUserData(): Promise<void> {
      try {
        console.log('Getting user data...');
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        console.log('Users reference:', usersRef);
        const snapshot = await get(usersRef);
        console.log('Snapshot:', snapshot);
        if (snapshot.exists()) {
          const users = snapshot.val();
          console.log('Users:', users);
          const storedUid = localStorage.getItem('uid');
          Object.keys(users).forEach((key) => {
            const user = users[key];
            console.log('User  data:', user);
            if (user.uid === storedUid && user.firstName) {
              console.log('Found matching user...');
              this.firstName = user.firstName;
              this.email = user.email;
              console.log('Updated first name and email:', this.firstName, this.email);
              this.isUserFound = true;
              return;
            }
          });
        } else {
          console.log('No users found...');
        }
        this.cd.detectChanges();
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    }
    
    toggleCompletedFollowUps() {
      this.showCompFollowUp = !this.showCompFollowUp;
      
    }
    
    toggleOverdueFollowUps() {
      this.showOverdueFollowUps = !this.showOverdueFollowUps;
      
    }
    
    toggleUpcomingFollowUps() {
      this.showUpcomingFollowUps = !this.showUpcomingFollowUps;
      
    }
    async checkAdminStatus() {
      const uid = localStorage.getItem('uid');
      const userRef = ref(db, `users/${uid}`);
      const userSnap = await get(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.val();
        if (userData.roles.includes('admin')) {
          console.log('User is an admin');
          // Add admin-specific logic here
        } else {
          console.log('User  is not an admin');
          // Add non-admin-specific logic here
        }
      } else {
        console.log('User data not found');
      }
    }
    
    
    public getAdminLeadIndexesLength(): Observable<number> {
      return this.leadService.getLeadIndexLengths();

    }
   
    async ionViewDidEnter() {
      
      await this.getUserData();
      await this.getUserData().then(() => {
        console.log('menu');
        this.cdr.detectChanges();
        this.totalLeads = this.leadService.getTotalLeads();
        this.totalLead = this.leadService.getTotalLead();
   
        this.getAdminLeadIndexesLength();
        this.leadIndexesLength = this.leadService.getLeadIndexLengthsU();
        
        this.tab1.get();
        this.tab1.get2();
        this.tab3.ionViewWillEnter();
        // Update completed follow-ups in Firebase Realtime Database
        const db = getDatabase();
        const completedFollowUpsRef = ref(db, `completedFollowUps/${localStorage.getItem('uid')}`);
        set(completedFollowUpsRef, this.completedFollowUps);
        
      });
    }
    
    async addTodoItemm(item: string) {
      this.todoList.push({ text: item, done: false });
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    }
    
    async deleteTodoItemm(index: number) {
      this.todoList.splice(index, 1);
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    }
    showReminderInput(item: any) {
      this.showReminder = true;
      this.todoItem = item;
    }
    
    async updateTodoItem(index: number, item: string) {
      this.todoList[index].text = item;
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    }
    async getTodoList() {
      const storedList = localStorage.getItem('todoList');
      return storedList ? JSON.parse(storedList) : [];
    }
    
    addTodoItem(): void {
      this.addTodoItemm(this.newItem);
      this.newItem = '';
    }
    
    deleteTodoItem(index: number): void {
      this.deleteTodoItemm(index);
    }
    private saveTodoList() {
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    }
    ngAfterViewInit() {
      if (!this.followUpCalled) {
        this.followUp();
        this.followUpCalled = true;
      }
      this.timer = timer(0, 1000).subscribe(() => {
        try {
          this.updateTimeLeft();
          this.cdr.markForCheck(); // Trigger change detection
        } catch (error) {
          console.error('Error updating time left:', error);
        }
      });
      
    }
    ngOnDestroy() {
      if (this.timer) {
        this.timer.unsubscribe();
        console.log('Timer unsubscribed');
      }
    }
 
    followUp() {
      if (this.followUps.length === 0) {
        console.log('Fetching follow-ups...');
        this.followUps = [];
        this.upcomingFollowUps = [];
        const completedFollowUps = localStorage.getItem('completedFollowUps');
        if (completedFollowUps) {
          this.completedFollowUps = JSON.parse(completedFollowUps);
        }
        const db = getDatabase();
        const followUpsRef = ref(db, `followUps/${localStorage.getItem('uid')}`);
        
        onValue(followUpsRef, (snapshot) => {
          console.log('Follow-ups snapshot:', snapshot);
          const followUps = snapshot.val();
          if (followUps) {
            console.log('Follow-ups data:', followUps);
            Object.keys(followUps).forEach((key) => {
              const followUpData = followUps[key];
              console.log('Follow-up data:', followUpData);
              if (followUpData.key) { // Check if the follow-up has a key
                if (this.completedFollowUps.find((followUp) => followUp.key === followUpData.key)) {
                  console.log('Follow-up already completed, skipping...');
                  return;
                }
                if (followUpData.timeLeft === 'Overdue') {
                  // Check if the follow-up is actually completed
                  if (followUpData.completed || followUpData.completionDate) {
                    const completedIndex = this.completedFollowUps.findIndex((completedFollowUp) => completedFollowUp.key === followUpData.key);
                    if (completedIndex === -1) {
                      this.completedFollowUps.push(followUpData);
                      console.log('Added follow-up to completed list:', followUpData);
                      if (followUpData.key && !this.completedFollowUps.find((followUp) => followUp.key === followUpData.key)) { 
                        if (followUpData.timeLeft === 'Overdue') {
                          const overdueIndex = this.overdueFollowUps.findIndex((overdueFollowUp) => overdueFollowUp.key === followUpData.key);
                          if (overdueIndex === -1) {
                            this.overdueFollowUps.push(followUpData);
                          }
                        }
                      }
                    }
                  } else {
                    // If the follow-up is not completed, add it to the overdue list
                    const overdueIndex = this.overdueFollowUps.findIndex((overdueFollowUp) => overdueFollowUp.key === followUpData.key);
                    if (overdueIndex === -1) {
                      this.overdueFollowUps.push(followUpData);
                      console.log('Added follow-up to overdue list:', followUpData);
                    }
                  }
                }
                if (followUpData.uid === localStorage.getItem('uid')) {
                  followUpData.key = key; // Set the key property of the followUp object
                  const scheduledDate = new Date(followUpData.scheduledDate);
                  const today = new Date();
                  if (scheduledDate >= today) {
                    const days = Math.floor((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60)) / 1000);
                    followUpData.timeLeft = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
                    this.upcomingFollowUps.push(followUpData);
                    console.log('Added follow-up to upcoming list:', followUpData);
                  }
                }
              }
            });
            console.log('Overdue Follow-Ups:', this.overdueFollowUps);
          }
        });
      }
    }
    updateTimeLeft() {
      try {
        const today = new Date();
        const db = getDatabase();
        const followUpsRef = ref(db, `followUps/${localStorage.getItem('uid')}`);
        onValue(followUpsRef, (snapshot) => {
          const followUps = snapshot.val();
          if (followUps !== this.followUps) {
            this.followUps = followUps;
            const upcomingFollowUps: any[] = [];
            const overdueFollowUps: any[] = [];
            snapshot.forEach((childSnapshot) => {
              const followUp = childSnapshot.val();
              if (this.completedFollowUps.find((followUp) => followUp.key === followUp.key)) {
                return;
              }
              if (followUp.leadId) {
                const scheduledDate = new Date(followUp.scheduledDate);
                if (scheduledDate >= today) {
                  const days = Math.floor((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor(((scheduledDate.getTime() - today.getTime()) % (1000 * 60)) / 1000);
                  followUp.timeLeft = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
                  upcomingFollowUps.push(followUp);
                  // Play notification when time is about to expire
                  if (days === 0 && hours === 0 && minutes === 0 && seconds <= 10) {
                    this.playNotification(followUp);
                  }
                } else {
                  if (followUp.timeLeft !== 'Completed') { // Skip updating completed follow-ups
                    followUp.timeLeft = 'Overdue';
                  }
                  overdueFollowUps.push(followUp);
                }
              }
            });
            this.upcomingFollowUps = upcomingFollowUps;
            this.overdueFollowUps = overdueFollowUps;
            // Update the overdueFollowUps array in Firebase Realtime Database
            const overdueFollowUpsRef = ref(db, `overdueFollowUps/${localStorage.getItem('uid')}`);
            set(overdueFollowUpsRef, this.overdueFollowUps);
          }
        });
      } catch (error) {
        console.error('Error updating time left:', error);
      }
    }

    playNotification(followUp: { leadName: any; }) {
      // Play a notification sound or display a notification message
      console.log(`Notification: ${followUp.leadName} is about to expire`);
      
      // Schedule a notification for the new lead
      LocalNotifications.schedule({
        notifications: [
          {
            title: 'New Lead',
            body: `${followUp.leadName} is about to expire`,
            sound: 'assets/swiftly.mp3',
            id: 1,
            schedule: {
              at: new Date(Date.now() + 1000), // show notification after 1 second
            },
          },
        ],
      });
    }
    retrieveCompletedFollowUps(): void {
      const db = getDatabase();
      const completedFollowUpsRef = ref(db, `completedFollowUps/${localStorage.getItem('uid')}`);
      onValue(completedFollowUpsRef, (snapshot) => {
        if (snapshot.exists()) {
          this.completedFollowUps = snapshot.val();
        } else {
          this.completedFollowUps = [];
        }
      });
    }
    completeFollowUp(key: string) {
      const followUpIndex = this.overdueFollowUps.findIndex((followUp) => followUp.key === key);
      if (followUpIndex !== -1) {
        const completedFollowUp = this.overdueFollowUps.splice(followUpIndex, 1)[0];
        completedFollowUp.timeLeft = 'Completed';
        this.completedFollowUps.push(completedFollowUp);
    
        // Remove the completed follow-up from the Firebase Realtime Database
        const db = getDatabase();
        const followUpsRef = ref(db, `followUps/${localStorage.getItem('uid')}/${key}`);
        remove(followUpsRef).then(() => {
          console.log('Completed follow-up removed from database');
        }).catch((error) => {
          console.error('Error removing completed follow-up from database:', error);
        });
    
        console.log('Completed Follow-Ups:', this.completedFollowUps);
        console.log('Overdue Follow-Ups:', this.overdueFollowUps);
    
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    }
    deleteOverdueFollowUp(index: number){
      if (index < 0 || index >= this.overdueFollowUps.length) {
        throw new Error('Invalid index');
      }
    
      const db = getDatabase();
      const overdueFollowUpsRef = ref(db, `overdueFollowUps/${localStorage.getItem('uid')}`);
      const followUp = this.overdueFollowUps[index];
      const key = followUp && followUp.key;
    
      if (!key) {
        console.error('Follow-up key is null or undefined');
        return;
      }
    
      return remove(child(overdueFollowUpsRef, key))
        .then(() => {
          this.overdueFollowUps.splice(index, 1);
        })
        .catch((error) => {
          throw error;
        });
    }



    deleteFollowUp(index: number) {
      if (index < 0 || index >= this.overdueFollowUps.length) {
        console.error('Invalid index:', index);
        return;
      }
    
      const followUp: { leadId: string } = this.overdueFollowUps[index];
      const leadId = followUp.leadId;
    
      console.log(`Deleting follow-up at index ${index} with leadId ${leadId}`);
    
      const db = getDatabase();
      const followUpsRef = ref(db, `followUps/${localStorage.getItem('uid')}/${leadId}`);
      const overdueFollowUpsRef = ref(db, `overdueFollowUps/${localStorage.getItem('uid')}/${leadId}`);
      const completedFollowUpsRef = ref(db, `completedFollowUps/${localStorage.getItem('uid')}/${leadId}`);
    
      remove(followUpsRef)
        .then(() => {
          console.log(`Follow-up with leadId ${leadId} deleted successfully from followUps`);
        })
        .catch((error) => {
          console.error(`Error deleting follow-up from followUps: ${error}`);
        });
    
      remove(overdueFollowUpsRef)
        .then(() => {
          console.log(`Follow-up with leadId ${leadId} deleted successfully from overdueFollowUps`);
        })
        .catch((error) => {
          console.error(`Error deleting follow-up from overdueFollowUps: ${error}`);
        });
    
      remove(completedFollowUpsRef)
        .then(() => {
          console.log(`Follow-up with leadId ${leadId} deleted successfully from completedFollowUps`);
        })
        .catch((error) => {
          console.error(`Error deleting follow-up from completedFollowUps: ${error}`);
        });
    
      this.completedFollowUps = this.completedFollowUps.filter((followUp) => followUp.leadId !== leadId);
    
      if (Array.isArray(this.followUps)) {
        this.followUps = this.followUps.filter((followUp) => followUp.leadId !== leadId);
      }
    
      this.overdueFollowUps = this.overdueFollowUps.filter((followUp) => followUp.leadId !== leadId);
    
      localStorage.setItem('completedFollowUps', JSON.stringify(this.completedFollowUps));
    
      console.log(`Updated overdueFollowUps array: ${JSON.stringify(this.overdueFollowUps)}`);
      console.log(`Updated followUps array: ${JSON.stringify(this.followUps)}`);
    
      // Update the followUps array in Firebase Realtime Database
      const followUpsRef2 = ref(db, `followUps/${localStorage.getItem('uid')}`);
      get(followUpsRef2).then((snapshot) => {
        const followUps = snapshot.val();
        if (followUps) {
          const keys = Object.keys(followUps);
          const keyToDelete = keys[index];
          const updatedFollowUps = { ...followUps };
          delete updatedFollowUps[keyToDelete];
          set(followUpsRef2, updatedFollowUps);
          console.log(`Updated followUps array in Firebase Realtime Database: ${JSON.stringify(updatedFollowUps)}`);
          this.toast.create({
            message: 'Follow-up deleted successfully',
            duration: 2000,
            position: 'bottom',
            color: 'success'
          }).then((toast) => {
            toast.present();
          });
        }
      });
    }
  }
  

   
    
  
  
  
  
  