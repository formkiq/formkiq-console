import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TagQuery } from './search.schema';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() {}

  buildDocumentDate(year, month, day): string {
    return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);
  }

  buildTagSearchQuery(tagQuery: TagQuery) {
    const apiTagQuery = {
      key: tagQuery.key,
      eq: null,
      beginsWith: null
    };
    if (tagQuery.value && tagQuery.value.length > 0) {
      if (tagQuery.operator === 'eq') {
        apiTagQuery.eq = tagQuery.value;
      } else {
        apiTagQuery.beginsWith = tagQuery.value;
      }
    }
    return {
      query: {
        tag: apiTagQuery
      }
    };
  }

  splitDocumentDate(documentDate: string) {
    const documentDateArray = documentDate.split('-');
    return {year: parseInt(documentDateArray[0], 10), month: parseInt(documentDateArray[1], 10), day: parseInt(documentDateArray[2], 10)};
  }

}
