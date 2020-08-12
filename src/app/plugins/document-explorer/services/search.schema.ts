export enum SearchType {
  Date = 'date',
  Tag = 'tag',
  Id = 'id'
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
  documentId: string;
}
