import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'datetimeFormat'
})
export class DatetimeFormat extends DatePipe implements PipeTransform {
transform(
  value: string,
  format: string = 'mediumDate',
  timezone: string = 'America/Winnipeg'
): string {
    const timezoneOffset = moment(value).tz(timezone).format('Z');
    return super.transform(value, format, timezoneOffset);
  }
}
