export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;

    const message = `FirestoreError: Missing or insufficient permissions: 
The following request was denied by Firestore Security Rules:
${JSON.stringify(
  {
    path,
    operation,
    request: {
      resource: {
        data: requestResourceData ?? {},
      },
    },
  },
  null,
  2
)}`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is to make the error message more readable in the console.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
