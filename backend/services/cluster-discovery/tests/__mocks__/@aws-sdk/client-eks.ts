/**
 * Mock for @aws-sdk/client-eks
 */
export class EKSClient {
  send = jest.fn();
}

export class ListClustersCommand {
  constructor(input?: any) {}
}

export class DescribeClusterCommand {
  constructor(input: any) {}
}

export class CreateNodegroupCommand {
  constructor(input: any) {}
}

export class ListNodegroupsCommand {
  constructor(input: any) {}
}
