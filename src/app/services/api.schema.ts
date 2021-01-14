export class Document {
  data: any;
  constructor() {}
}

export class Preset {
  id: string;
  insertedDate: Date;
  name: string;
  siteId: string;
  type: string;
  tags: [];
  constructor() {
    this.tags = [];
  }
}

export class Site {
  data: any;
  constructor() {}
}

export class Tag {
  key: string;
  value: string;
  constructor() {}
}

export class Webhook {
  id: string;
  insertedDate: Date;
  name: string;
  siteId: string;
  userId: string;
  url: string;
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
  hasNoParams: boolean;
  requiresAuthentication: boolean;
  requiresDocumentID: boolean;
  requiresPresetID: boolean;
  requiresWebhookID: boolean;
  requiresTagKey: boolean;
  requiresPostJson: boolean;
  requiresFileUpload: boolean;
  allowsVersionID: boolean;
  allowsDate: boolean;
  allowsLimit: boolean;
  hasPagingTokens: boolean;
  allowsPath: boolean;
}
