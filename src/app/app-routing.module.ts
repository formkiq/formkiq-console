import {
	NgModule
} from '@angular/core';
import {
	Routes,
	RouterModule
} from '@angular/router';

import {
	ConsoleComponent
} from './pages/console/console.component';
import {
	LoginComponent
} from './pages/login/login.component';
import {
	LogoutComponent
} from './pages/logout/logout.component';
import {
	AuthGuard
} from './auth.guard';

const routes: Routes = [{
	path: '',
	component: ConsoleComponent,
	canActivate: [AuthGuard]
}, {
	path: 'login',
	component: LoginComponent
}, {
	path: 'logout',
	component: LogoutComponent
}];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}