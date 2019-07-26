import {
	Component,
	OnInit
} from '@angular/core';

import {
	FormkiqapiService
} from "../../components/formkiq/formkiqapi.service";

@Component({
	selector: 'app-console',
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit {

	constructor(private fkservice: FormkiqapiService) {}

	ngOnInit() {}

}