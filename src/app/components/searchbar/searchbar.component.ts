import {
	Component,
	OnInit
} from '@angular/core';
import {
	Observable
} from 'rxjs'
import {
	FormBuilder,
	FormGroup,
	Validators
} from '@angular/forms';
import {
	HttpErrorResponse
} from '@angular/common/http';
import {
	FormkiqapiService,
	ErrorResponseCallback,
	SearchTag,
	FkDocument
} from '../formkiq/formkiqapi.service';

@Component({
	selector: 'app-searchbar',
	templateUrl: './searchbar.component.html',
	styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements OnInit, ErrorResponseCallback {

	results$: Observable < FkDocument[] > ;
	tagsearchForm: FormGroup;
	submitted = false;

	constructor(private formBuilder: FormBuilder, private formkiqService: FormkiqapiService) {}

	ngOnInit() {
		this.tagsearchForm = this.formBuilder.group({
			tagKey: ['', Validators.required]
		});
	}

	search() {
		this.submitted = true;
		if (this.tagsearchForm.invalid) {
			return;
		}

		let search = new SearchTag(this.tagsearchForm.controls.tagKey.value, "", "");
		this.results$ = this.formkiqService.search(search, this);
	}

	get f() {
		return this.tagsearchForm.controls;
	}

	handleError(errorResponse: HttpErrorResponse): any {
		console.log("YUP GOT ERROR!!!");
	}
}