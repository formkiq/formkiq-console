import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';
import { ApiService } from '../../services/api.service';
import { isDate } from 'util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    private configurationService: ConfigurationService,
    private router: Router
    ) {}

  results$: Observable<any>;
  chartData = [
    {data: [], label: 'Count'},
  ];
  chartLabels: Label[] = [];
  chartOptions: (ChartOptions) = {
    responsive: true
  };
  chartLegend = false;
  chartType = 'line';

  since = null;
  until = null;
  rangePickerVisible = false;
  rangeForm: FormGroup;

  ngOnInit() {
    if (this.configurationService.authentication.requireAuthenticationForRead) {
      if (this.authenticationService.loggedInUser == null) {
        this.router.navigate(['/authenticate']);
      }
    }
    this.rangeForm = this.formBuilder.group({
      range: ['', [
        Validators.required,
        Validators.
          pattern('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2} ([AaPp][Mm]) - \\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2} ([AaPp][Mm])')
      ]]
    });
    // this.loadChart('documentscount', '2019-08-20T00:00:00', '2019-08-23T00:00:00');
    // this.loadChart('documentscount', '2019-08-01T00:00:00', '2019-08-31T00:00:00');
    this.loadChart('documentscount');
  }

  get f() {
    return this.rangeForm.controls;
  }

  chartHasDate() {
    if (this.since != null && this.until != null) {
      return true;
    }
    return false;
  }

  getFormattedDate(metricDate) {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(metricDate).toLocaleDateString('en-US', options);
  }

  getRangeFormattedDate(metricDate) {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(metricDate).toISOString().split('T')[0] + ' ' + new Date(metricDate).toLocaleTimeString('en-US', options);
  }

  getDateTimezone(metricDate) {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'short', year: 'numeric',
      timeZoneName: 'short'
    };
    const formattedDate = new Date(metricDate).toLocaleDateString('en-US', options);
    return formattedDate.substr(formattedDate.lastIndexOf(',') + 2);
  }

  runRange() {
    if (this.f.range.pristine) {
      this.loadChart();
      return;
    } else {
      if (this.f.range.value.length > 12) {
        const sinceDate = new Date(this.f.range.value.substr(0, this.f.range.value.indexOf(' - ')).trim());
        const untilDate = new Date(this.f.range.value.substr(this.f.range.value.indexOf(' - ') + 1).trim());
        if (!isDate(sinceDate) || !isDate(untilDate)) {
          return;
        }
        const since = this.buildMetricsDate(
          sinceDate.getFullYear(),
          sinceDate.getMonth() + 1,
          sinceDate.getDate(),
          sinceDate.getHours(),
          sinceDate.getMinutes(),
          sinceDate.getSeconds()
        );
        const until = this.buildMetricsDate(
          untilDate.getFullYear(),
          untilDate.getMonth() + 1,
          untilDate.getDate(),
          untilDate.getHours(),
          untilDate.getMinutes(),
          untilDate.getSeconds()
        );
        this.rangePickerVisible = false;
        this.loadChart('documentscount', since, until);
      }
    }
  }

  buildMetricsDate(year, month, day, hours: number = 0, minutes: number = 0, seconds: number = 0) {
    return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2) +
      'T' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' +
      ('0' + seconds).slice(-2);
  }

  loadChart(type: string = 'documentscount', since: string = null, until: string = null, timeseries: string = null, tz: string = null) {
    const now = new Date();
    this.since = since;
    this.until = until;
    if (this.since == null) {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      this.since = this.buildMetricsDate(lastWeek.getFullYear(), lastWeek.getMonth() + 1, lastWeek.getDate());
    }
    if (this.until == null) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      this.until = this.buildMetricsDate(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate());
    }
    let clientTZ = now.getTimezoneOffset() / 60 * -1;
    if (tz == null) {
      let isNegative = false;
      if (clientTZ < 0) {
        isNegative = true;
        clientTZ *= -1;
      }
      tz = ('0' + clientTZ + '00').slice(-4);
      if (isNegative) {
        tz = '-' + tz;
      }
    }
    const sinceDate = new Date(this.since);
    const untilDate = new Date(this.until);
    const dateDiff = (untilDate.valueOf() - sinceDate.valueOf()) / 3600000;
    if (timeseries == null) {
      if (dateDiff <= 1) {
        timeseries = '1m';
      } else if (dateDiff <= 3) {
        timeseries = '5m';
      } else if (dateDiff <= 6) {
        timeseries = '15m';
      } else if (dateDiff <= 12) {
        timeseries = '30m';
      } else if (dateDiff <= 24) {
        timeseries = '60m';
      } else if (dateDiff <= 48) {
        timeseries = '3H';
      } else if (dateDiff <= 72) {
        timeseries = '6H';
      } else if (dateDiff <= 168) {
        timeseries = '12H';
      } else if (dateDiff <= 336) {
        timeseries = '1D';
      } else if (dateDiff <= 744) {
        timeseries = '3D';
      } else if (dateDiff <= 2200) {
        timeseries = '7D';
      } else if (dateDiff <= 9000) {
        timeseries = '1M';
      } else {
        timeseries = '3M';
      }
    }
    const query = {
      type,
      since: this.since,
      until: this.until,
      timeseries,
      tz
    };
    this.results$ = this.apiService.postMetrics(JSON.stringify(query), this);
    this.results$.subscribe((results) => {
      const counts = [];
      const dates = [];
      for (const metric of results.metrics) {
        counts.push(metric.count);
        const metricDate = new Date(metric.date);
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric', month: 'numeric', year: 'numeric'
        };
        if (dateDiff <= 168) {
          options.hour = '2-digit';
          options.minute = '2-digit';
        }
        const metricDateLabel: string = metricDate.toLocaleDateString('en-US', options);
        dates.push(metricDateLabel);
      }
      this.chartData = [
        {data: counts, label: 'Count'}
      ];
      this.chartLabels = dates;
    });
  }

  showRangePicker() {
    this.rangePickerVisible = true;
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}


