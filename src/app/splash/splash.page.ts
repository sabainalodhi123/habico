import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {
  constructor(public router:Router) { }

  ngOnInit() {
    setTimeout(() => {
    this.router.navigateByUrl('/login');

    }, 3000);
  }
  next(){
  }

}
