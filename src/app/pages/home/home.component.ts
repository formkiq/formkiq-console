import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    private router: Router
    ) {}

  ngOnInit() {
    if (this.authenticationService.loggedInUser == null) {
      this.router.navigate(['/authenticate']);
    }
  }

}


