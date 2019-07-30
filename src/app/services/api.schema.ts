export class Document {
  data: any;
  constructor() {}
}

export class Tag {
  key: string;
  value: string;
  constructor() {}
}

export class ApiItem {
  apiServiceMethodName: string;
  clickedSubscriptionName: string;
  method: string;
  path: string;
  username: string;
  token: string;
  host: string;
  requiresAuthentication: boolean;
  requiresDocumentID: boolean;
  requiresTagKey: boolean;
  requiresPostJson: boolean;
  requiresFileUpload: boolean;
  allowsDate: boolean;
  allowsLimit: boolean;
  hasPagingTokens: boolean;
}
