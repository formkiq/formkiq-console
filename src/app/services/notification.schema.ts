export enum NotificationInfoType {
  Info = 'info',
  Success = 'success',
  Danger = 'danger',
  Warning = 'warning'
}

export class NotificationInfo {
  type: NotificationInfoType;
  message: string;
  isDismissible: boolean;
  millisecondsUntilClose: number;

  constructor() {

  }

}
