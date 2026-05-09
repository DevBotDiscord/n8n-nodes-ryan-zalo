import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
} from 'n8n-workflow';
import { zaloGroupOperations, zaloGroupFields } from './ZaloGroupDescription';
import { API, Zalo } from 'zalo-api-final';

let api: API | undefined;

export class ZaloGroup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN Group',
		name: 'zaloGroup',
		icon: 'file:../shared/zalo.svg',
		group: ['organization'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Quản lý nhóm Zalo cá nhân',
		defaults: { name: 'Zalo CN Group' },
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
				options: [{ name: 'Group', value: 'zaloGroup' }],
				default: 'zaloGroup',
			},
			...zaloGroupOperations,
			...zaloGroupFields,
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
				if (resource === 'zaloGroup') {
					let response: any;
					let output: INodeExecutionData;

					switch (operation) {
						case 'createGroup': {
							const groupName = this.getNodeParameter('groupName', i) as string;
							const userIds = this.getNodeParameter('userIds', i) as string;
							const userList = userIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.createGroup({ name: groupName, members: userList });
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getGroupInfo': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.getGroupInfo(groupId);
							const groupInfo = (response as any).gridInfoMap?.[groupId];
							output = { json: { response, groupInfo }, pairedItem: { item: i } };
							break;
						}
						case 'addGroupDeputy': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.addGroupDeputy(groupId, userId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'addUserToGroup': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userIds = this.getNodeParameter('userIds', i) as string;
							const userList = userIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.addUserToGroup(userList, groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'changeGroupAvatar': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;
							response = await api.changeGroupAvatar(groupId, imageUrl);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'changeGroupName': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const newName = this.getNodeParameter('newName', i) as string;
							response = await api.changeGroupName(groupId, newName);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getGroupMembers': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const limit = this.getNodeParameter('limit', i) as number;

							// Step 1: get group basic info for memVerList
							const info = await api.getGroupInfo(groupId);
							const groupInfo = (info as any).gridInfoMap?.[groupId];
							const memVerList: string[] = groupInfo?.memVerList || [];

							// Step 2: fetch full member profiles via getGroupMembersInfo
							let members: any[] = [];
							if (memVerList.length > 0) {
								const memberInfo = await api.getGroupMembersInfo(memVerList);
								const profiles = (memberInfo as any)?.profiles || {};
								members = Object.values(profiles).slice(0, limit);
							}

							const admins = groupInfo?.adminIds || [];
							const totalMember = groupInfo?.totalMember || 0;
							output = {
								json: {
									members,
									memberCount: members.length,
									admins,
									totalMember,
								} as IDataObject,
								pairedItem: { item: i },
							};
							break;
						}
						case 'getAllGroups': {
							response = await api.getAllGroups();
							output = { json: { response } as IDataObject, pairedItem: { item: i } };
							break;
						}
						case 'removeUserFromGroup': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userIds = this.getNodeParameter('userIds', i) as string;
							const userList = userIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.removeUserFromGroup(userList, groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'createNote': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const content = this.getNodeParameter('content', i) as string;
							const pinAct = this.getNodeParameter('pinAct', i) as boolean;
							response = await api.createNoteGroup({ title: content, pinAct }, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'leaveGroup': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const silent = this.getNodeParameter('silent', i, false) as boolean;
							response = await api.leaveGroup(groupId, silent);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'changeGroupOwner': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userId = this.getNodeParameter('userId', i) as string;
							response = await api.changeGroupOwner(userId, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'updateGroupSettings': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const options: any = {};
							const keys = ['blockName', 'signAdminMsg', 'setTopicOnly', 'enableMsgHistory', 'joinAppr', 'lockCreatePost', 'lockCreatePoll', 'lockSendMsg', 'lockViewMember'];
							for (const key of keys) {
								const val = this.getNodeParameter(key, i, false);
								if (val !== undefined && val !== false) options[key] = val;
							}
							response = await api.updateGroupSettings(options, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'enableGroupLink': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.enableGroupLink(groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'disableGroupLink': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.disableGroupLink(groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'joinGroupLink': {
							const link = this.getNodeParameter('link', i) as string;
							response = await api.joinGroupLink(link);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'disperseGroup': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.disperseGroup(groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'getGroupLinkDetail': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.getGroupLinkDetail(groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getGroupMembersInfo': {
							const memberIds = this.getNodeParameter('memberIds', i) as string;
							const memberList = memberIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.getGroupMembersInfo(memberList.length === 1 ? memberList[0] : memberList);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'inviteUserToGroups': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const memberIds = this.getNodeParameter('memberIds', i) as string;
							response = await api.inviteUserToGroups(memberIds.split(',')[0].trim(), groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'getPendingGroupMembers': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							response = await api.getPendingGroupMembers(groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'reviewPendingMemberRequest': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const memberIds = this.getNodeParameter('memberIds', i) as string;
							const isApprove = this.getNodeParameter('isApprove', i) as boolean;
							response = await api.reviewPendingMemberRequest({ members: memberIds.split(',').map(s => s.trim()).filter(s => s), isApprove }, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'getGroupBlockedMember': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const page = this.getNodeParameter('page', i, 1) as number;
							const count = this.getNodeParameter('count', i, 30) as number;
							response = await api.getGroupBlockedMember({ page, count }, groupId);
							output = { json: response, pairedItem: { item: i } };
							break;
						}
						case 'addGroupBlockedMember': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userIds = this.getNodeParameter('userIds', i) as string;
							const userList = userIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.addGroupBlockedMember(userList, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						case 'removeGroupBlockedMember': {
							const groupId = this.getNodeParameter('groupId', i) as string;
							const userIds = this.getNodeParameter('userIds', i) as string;
							const userList = userIds.split(',').map(s => s.trim()).filter(s => s);
							response = await api.removeGroupBlockedMember(userList, groupId);
							output = { json: { status: 'Thành công', response }, pairedItem: { item: i } };
							break;
						}
						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
					returnData.push(output);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
