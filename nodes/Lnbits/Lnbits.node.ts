import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import {
  IDataObject,
} from 'n8n-workflow';

export class Lnbits implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LNbits',
    name: 'lnbits',
    icon: 'file:lnbits.svg',
    group: ['transform'],
    version: 1,
    description: 'Consume LNbits API',
    defaults: {
      name: 'LNbits',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'lnbitsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Endpoint',
        name: 'endpoint',
        type: 'options',
        options: [
          {
            name: 'Get Wallets',
            value: 'getWallets',
            description: 'Retrieve a list of wallets',
          },
          {
            name: 'Create Wallet',
            value: 'createWallet',
            description: 'Create a new wallet',
          },
          {
            name: 'Get Transactions',
            value: 'getTransactions',
            description: 'Retrieve transactions for a wallet',
          },
          {
            name: 'Create Invoice',
            value: 'createInvoice',
            description: 'Create a new invoice',
          },
          {
            name: 'Pay Invoice',
            value: 'payInvoice',
            description: 'Pay an invoice',
          },
          {
            name: 'Manage Payments',
            value: 'managePayments',
            description: 'Manage payments',
          },
          {
            name: 'List Extensions',
            value: 'listExtensions',
            description: 'List all available extensions',
          },
          {
            name: 'List Users',
            value: 'listUsers',
            description: 'List all users',
          },
        ],
        default: 'getWallets',
        required: true,
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          {
            displayName: 'User ID',
            name: 'userId',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Wallet Name',
            name: 'walletName',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Wallet ID',
            name: 'walletId',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Amount',
            name: 'amount',
            type: 'number',
            default: 0,
          },
          {
            displayName: 'Memo',
            name: 'memo',
            type: 'string',
            default: '',
          },
          {
            displayName: 'Invoice',
            name: 'invoice',
            type: 'string',
            default: '',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    const credentials = this.getCredentials('lnbitsApi') as {
      url: string,
      adminApiKey: string,
    };
    const endpoint = this.getNodeParameter('endpoint', 0) as string;
    const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

    let responseData;

    if (endpoint === 'getWallets') {
      responseData = await this.helpers.request({
        method: 'GET',
        url: `${credentials.url}/api/v1/wallet`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
      });
    } else if (endpoint === 'createWallet') {
      const body: IDataObject = {
        user_id: additionalFields.userId,
        wallet_name: additionalFields.walletName,
      };
      responseData = await this.helpers.request({
        method: 'POST',
        url: `${credentials.url}/api/v1/wallet`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
        body,
        json: true,
      });
    } else if (endpoint === 'getTransactions') {
      const walletId = additionalFields.walletId as string;
      responseData = await this.helpers.request({
        method: 'GET',
        url: `${credentials.url}/api/v1/wallet/${walletId}/transactions`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
      });
    } else if (endpoint === 'createInvoice') {
      const body: IDataObject = {
        out: false,
        amount: additionalFields.amount,
        memo: additionalFields.memo,
      };
      responseData = await this.helpers.request({
        method: 'POST',
        url: `${credentials.url}/api/v1/payments`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
        body,
        json: true,
      });
    } else if (endpoint === 'payInvoice') {
      const body: IDataObject = {
        out: true,
        bolt11: additionalFields.invoice,
      };
      responseData = await this.helpers.request({
        method: 'POST',
        url: `${credentials.url}/api/v1/payments`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
        body,
        json: true,
      });
    } else if (endpoint === 'managePayments') {
      responseData = await this.helpers.request({
        method: 'GET',
        url: `${credentials.url}/api/v1/payments`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
      });
    } else if (endpoint === 'listExtensions') {
      responseData = await this.helpers.request({
        method: 'GET',
        url: `${credentials.url}/api/v1/extensions`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
      });
    } else if (endpoint === 'listUsers') {
      responseData = await this.helpers.request({
        method: 'GET',
        url: `${credentials.url}/api/v1/users`,
        headers: {
          'X-Api-Key': credentials.adminApiKey,
        },
      });
    }

    if (Array.isArray(responseData)) {
      returnData.push(...responseData);
    } else {
      returnData.push(responseData);
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
