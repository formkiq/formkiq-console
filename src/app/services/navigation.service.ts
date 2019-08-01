import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NavItemClickData } from './navigation.schema';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  public navItemClickedSource = new Subject<NavItemClickData>();
  public navItemClicked$ = this.navItemClickedSource.asObservable();

  constructor() { }

  collapseSubmenuItem(source: string, collapseItem: boolean) {
    const clickData = new NavItemClickData();
    console.log(collapseItem);
    clickData.source = source;
    clickData.collapseItem = collapseItem;
    console.log(clickData);
    this.navItemClickedSource.next(clickData);
  }

}

