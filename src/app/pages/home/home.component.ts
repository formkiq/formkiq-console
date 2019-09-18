import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import { AuthenticationService } from '../../plugins/authentication/services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
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

  ngOnInit() {
    if (this.configurationService.authentication.requireAuthenticationForRead) {
      if (this.authenticationService.loggedInUser == null) {
        this.router.navigate(['/authenticate']);
      }
    }
    this.loadChart('documentscount', '2019-08-01T00:00:00', '2019-08-31T00:00:00');
    // this.loadChart('documentscount');
  }

  buildMetricsDate(year, month, day, hours: number = 0, minutes: number = 0, seconds: number = 0) {
    return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2) +
      'T' + ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' +
      ('0' + seconds).slice(-2);
  }

  loadChart(type: string = 'documentscount', since: string = null, until: string = null, timeseries: string = null, tz: string = null) {
    const now = new Date();
    if (since == null) {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      since = this.buildMetricsDate(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate());
    }
    if (until == null) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      until = this.buildMetricsDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
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
    const sinceDate = new Date(since);
    const untilDate = new Date(until);
    const dateDiff = untilDate.valueOf() - sinceDate.valueOf();
    if (timeseries == null) {
      if (dateDiff < 1800000) {
        timeseries = '1m';
      } else if (dateDiff < 3600000) {
        timeseries = '5m';
      } else if (dateDiff < 10800000) {
        timeseries = '15m';
      } else if (dateDiff < 21600000) {
        timeseries = '30m';
      } else if (dateDiff < 86400000) {
        timeseries = '60m';
      } else if (dateDiff < 259200000) {
        timeseries = '3H';
      } else if (dateDiff < 432000000) {
        timeseries = '6H';
      } else if (dateDiff < 604800000) {
        timeseries = '12H';
      } else {
        timeseries = '24H';
      }
      timeseries = '3D';
      // TODO: more timeseries and/or better formula
    }
    /*
    console.log(dateDiff);
    console.log(since);
    console.log(sinceDate);
    console.log(until);
    console.log(untilDate);
    console.log(tz);
    console.log(timeseries);
    */
    const query = {
      type,
      since,
      until,
      timeseries,
      tz
    };
    this.results$ = this.apiService.postMetrics(JSON.stringify(query), this);
    this.results$.subscribe((results) => {
      const counts = [];
      const dates = [];
      for (const metric of results.metrics) {
        counts.push(metric.count);
        dates.push(metric.date);
      }
      this.chartData = [
        {data: counts, label: 'Count'}
      ];
      this.chartLabels = dates;
    });
  }

  handleApiError(errorResponse: HttpErrorResponse) {
    return Observable.create((observer) => {
      observer.next(errorResponse);
    });
  }

}


