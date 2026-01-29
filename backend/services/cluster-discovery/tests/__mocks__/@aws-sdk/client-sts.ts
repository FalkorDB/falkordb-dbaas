/**
 * Mock for @aws-sdk/client-sts
 */
export class STSClient {
  send = jest.fn();
}

export class AssumeRoleWithWebIdentityCommand {
  constructor(input: any) {}
}

export class GetCallerIdentityCommand {
  constructor() {}
}
