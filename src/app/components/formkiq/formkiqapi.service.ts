import {
	Injectable
} from '@angular/core';
import {
	environment
} from "../../../environments/environment";
import {
	HttpClient,
	HttpHeaders,
	HttpParams,
	HttpErrorResponse,
	HttpBackend
} from '@angular/common/http';
import {
	AuthService
} from '../../auth.service';
import {
	Observable,
	ObservableInput
} from 'rxjs'
import {
	catchError
} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class FormkiqapiService {

	private noAuthhttpClient: HttpClient;

	constructor(private httpClient: HttpClient, private authService: AuthService, private handler: HttpBackend) {
		this.noAuthhttpClient = new HttpClient(handler);
	}

	getDocument(documentId: string, error: ErrorResponseCallback): Observable < FkDocument > {
		let url = this.getUrl() + "/documents/" + documentId;
		return this.httpClient.get < FkDocument > (url);
	}

	getDocuments(error: ErrorResponseCallback): Observable < FkDocument[] > {
		let url = this.getUrl() + "/documents";
		return this.httpClient.get < FkDocument[] > (url);
	}

	search(searchTag: SearchTag, error: ErrorResponseCallback): Observable < any > {

		const httpOptions = {};
		let url = this.getUrl() + "/search";

		let sq = new SearchQuery(searchTag);
		let search = new Search(sq);

		return this.httpClient.post < FkDocument[] > (url, search, httpOptions);
	}

	upload(file: File) {

		this.getUploadUrl(file.name).subscribe((data: FkUploadDocument) => {

			let httpHeaders = new HttpHeaders({
				'Content-Type': 'multipart/form-data',
				'Accept': 'application/json'
			});

			let options = {
				headers: httpHeaders
			};

			let formData: FormData = new FormData();
			formData.append('uploadFile', file, file.name);
			this.noAuthhttpClient.put(data.url, formData, options).subscribe(
				data => console.log('success'),
				error => console.log(error)
			);
		});
	}

	getUploadUrl(filename): Observable < FkUploadDocument > {
		let url = this.getUrl() + "/documents/" + filename + "/upload";
		return this.httpClient.get < FkUploadDocument > (url);
	}

	private getUrl(): string {
		return environment.url;
	}
}

export interface ErrorResponseCallback {
	handleError(errorResponse: HttpErrorResponse): ObservableInput < any > ;
}

export class SearchTag {

	constructor(
		public key: string,
		public eq: string,
		public beginsWith: string
	) {}
}

export class SearchQuery {

	constructor(
		public tag: SearchTag
	) {}
}

export class Search {

	constructor(
		public query: SearchQuery
	) {}
}

export interface FkDocument {
	documentId: string;
	path: string;
	inserteddate: string;
	userId: string;
	contentType: string;
}
export interface FkUploadDocument {
	documentId: string;
	url: string;
}