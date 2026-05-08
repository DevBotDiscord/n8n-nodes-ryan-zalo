import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { zaloUserOperations, zaloUserFields } from './ZaloUserDescription';
import { API, ThreadType, Zalo } from 'zalo-api-final';

let api: API | undefined;

export class ZaloUser implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN User',
		name: 'zaloUser',
		icon: 'file:../shared/zalo.svg',
		group: ['organization'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Quản lý người dùng Zalo',
		defaults: { name: 'Zalo CN User' },
		// @ts-ignore
		inputs: ['main'],
		// @ts-ignore
		outputs: ['main'],
		credentials: [{ name: 'zaloApi', required: true, displayName: 'Zalo Credential to connect with' }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Zalo User', value: 'zaloUser' }],
				default: 'zaloUser',
			},
			...zaloUserOperations,
			...zaloUserFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const zaloCred = await this.getCredentials('zaloApi');

		const cookieFromCred = JSON.parse(zaloCred.cookie as string);
		const imeiFromCred = zaloCred.imei as string;
		const userAgentFromCred = zaloCred.userAgent as string;

		const cookie = cookieFromCred ?? items.find((x) => x.json.cookie)?.json.cookie as any;
		const imei = imeiFromCred ?? items.find((x) => x.json.imei)?.json.imei as string;
		const userAgent = userAgentFromCred ?? items.find((x) => x.json.userAgent)?.json.userAgent as string;

		const zalo = new Zalo();
		const _api = await zalo.login({ cookie, imei, userAgent });
		api = _api;

		if (!api) {
			throw new NodeOperationError(this.getNode(), 'No API instance found. Please make sure to provide valid credentials.');
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'zaloUser') {
					let response: any;
					let output: INodeExecutionData;

					switch (operation) {
						case 'acceptFriendRequest': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.acceptFriendRequest(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'sendFriendRequest': {
							const userId = this.getNodeParameter('userId', i) as string;
							const message = this.getNodeParameter('message', i) as string;
							response = await api.sendFriendRequest(message, userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'blockUser': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.blockUser(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'unblockUser': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.unblockUser(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'changeAccountSetting': {
							const name = this.getNodeParameter('name', i) as string;
							const dob = this.getNodeParameter('dob', i) as string;
							const gender = this.getNodeParameter('gender', i) as number;
							const language = this.getNodeParameter('language', i, '') as string;
							const payload: any = { name, dob, gender };
							if (language) payload.language = language;
							response = await api.updateProfile(payload);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'getUserInfo': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.getUserInfo(userId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getAllFriends': {
							const limit = this.getNodeParameter('limit', i) as number;
							response = await api.getAllFriends();
							const friends = response.slice(0, limit) || [];
							output = { json: { friends }, pairedItem: { item: i } };
							break;
						}
						case 'findUser': {
							const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
							response = await api.findUser(phoneNumber);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'changeAliasName': {
							const userId = this.getNodeParameter('userId', i) as string;
							const aliasName = this.getNodeParameter('aliasName', i) as string;
							response = await api.changeFriendAlias(aliasName, userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'undoMessage': {
							const threadId = this.getNodeParameter('threadId', i) as string;
							const type = this.getNodeParameter('threadType', i) as ThreadType;
							const msgId = this.getNodeParameter('msgId', i) as string;
							const cliMsgId = this.getNodeParameter('cliMsgId', i) as string;
							response = await api.undo({ msgId, cliMsgId }, threadId, type);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'changeAccountAvatar': {
							const avatarUrl = this.getNodeParameter('avatarUrl', i) as string;
							response = await api.changeAccountAvatar(avatarUrl);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'removeFriend': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.removeFriend(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'undoFriendRequest': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.undoFriendRequest(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'getAliasList': {
							const limit = this.getNodeParameter('limit', i, 50) as number;
							response = await api.getAliasList(limit);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'removeFriendAlias': {
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.removeFriendAlias(userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'getReceivedFriendRequests': {
							response = await api.getReceivedFriendRequests();
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getSentFriendRequest': {
							response = await api.getSentFriendRequest();
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
					returnData.push(output);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
