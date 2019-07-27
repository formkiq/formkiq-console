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
			tagKey: ['', Validators.required],
			searchType: [],
			tagValue: []
		});
	}

	search() {
		this.submitted = true;
		if (this.tagsearchForm.invalid) {
			return;
		}

		let key = this.tagsearchForm.controls.tagKey.value;
		let value = this.tagsearchForm.controls.tagValue.value;
		var search = new SearchTag(key, null, null);

		if (value != null && value.trim().length > 0) {
			let searchType = this.tagsearchForm.controls.searchType.value;
			if (searchType == "beginsWith") {
				search = new SearchTag(key, null, value.trim());
			} else {
				search = new SearchTag(key, value.trim(), null);
			}
		}

		this.results$ = this.formkiqService.search(search, this);
	}

	get f() {
		return this.tagsearchForm.controls;
	}

	handleError(errorResponse: HttpErrorResponse): any {
		console.log("YUP GOT ERROR!!!");
	}
}