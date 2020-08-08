export enum SearchType {
  Date = 'date',
  Tag = 'tag'
}

export class TagQuery {
  constructor(
    public key: string,
    public operator: string,
    public value: string
  ) {}
}

export interface SearchParameters {
  searchType: SearchType;
  documentDate: string;
  tagQuery: TagQuery;
}
