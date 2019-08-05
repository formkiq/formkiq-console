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
    clickData.source = source;
    clickData.collapseItem = collapseItem;
    this.navItemClickedSource.next(clickData);
  }

  emitInlineNavItemClick(source: string) {
    const clickData = new NavItemClickData();
    clickData.source = source;
    clickData.collapseItem = false;
    this.navItemClickedSource.next(clickData);
  }

}

