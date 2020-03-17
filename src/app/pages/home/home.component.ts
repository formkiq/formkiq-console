import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private configurationService: ConfigurationService,
    private router: Router
  ) { }


  ngOnInit() {
    if (this.configurationService.authentication.requireAuthenticationForRead) {
      if (this.authenticationService.loggedInUser == null) {
        this.router.navigate(['/authenticate']);
      }
    }
  }

}


