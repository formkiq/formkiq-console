import {
	Component,
	OnInit
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	ActivatedRoute,
	Router
} from "@angular/router";

import {
	User
} from '../../user';
import {
	AuthService,
	AuthorizedCallback
} from '../../auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AuthorizedCallback {

	loginForm: FormGroup;
	submitted = false;
	hasError = false;

	constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder) {}

	ngOnInit() {
		this.loginForm = this.formBuilder.group({
			email: ['', Validators.required],
			password: ['', Validators.required]
		});

		this.activatedRoute.queryParams.subscribe(params => {
			const error = params['error'];
			if (!error) {
				this.hasError = false;
			} else {
				this.hasError = true;
			}
		});
	}

	login() {
		this.submitted = true;
		if (this.loginForm.invalid) {
			return;
		}

		this.authService.login(this.loginForm.value, this);
	}

	authorized() {
		this.router.navigateByUrl('/');
	}

	notauthorized(message: string, result: any) {}

	get f() {
		return this.loginForm.controls;
	}
}