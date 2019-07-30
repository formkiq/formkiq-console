import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticationResponse } from '../plugins/authentication/services/authentication.schema';
import { NotificationInfo, NotificationInfoType } from './notification.schema';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  private notificationSource = new Subject<any>();
  public notification$ = this.notificationSource.asObservable();

  createNotification(
      notificationType: NotificationInfoType,
      message: string,
      millisecondsUntilClose: number = 0,
      isDismissible: boolean = true
    ) {
    const notificationInfo = new NotificationInfo();
    notificationInfo.type = notificationType;
    notificationInfo.message = message;
    notificationInfo.millisecondsUntilClose = millisecondsUntilClose;
    notificationInfo.isDismissible = isDismissible;
    this.createNotificationUsingNotificationInfo(notificationInfo);
  }

  createNotificationUsingNotificationInfo(notificationInfo: NotificationInfo) {
    this.notificationSource.next(notificationInfo);
  }

  createNotificationFromAuthenticationResponse(
      response: AuthenticationResponse,
      millisecondsUntilClose: number = 2000,
      isDismissible: boolean = false
    ) {
      const notificationInfo = new NotificationInfo();
      if (response.success) {
        notificationInfo.type = NotificationInfoType.Success;
      } else {
        notificationInfo.type = NotificationInfoType.Danger;
      }
      notificationInfo.message = response.message;
      notificationInfo.millisecondsUntilClose = millisecondsUntilClose;
      notificationInfo.isDismissible = isDismissible;
      this.createNotificationUsingNotificationInfo(notificationInfo);
  }

}
