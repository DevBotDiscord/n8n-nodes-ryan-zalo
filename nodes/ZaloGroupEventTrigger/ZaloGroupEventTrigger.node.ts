import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeOperationError,
	IHookFunctions,
} from 'n8n-workflow';
import { API, Zalo } from 'zalo-api-final';

// GroupEventType mirroring zlapi GroupEventType values
// If zalo-api-final exports GroupEventType, use that instead
const GroupEventTypeMap: Record<string, string> = {
	JOIN: 'join',
	LEAVE: 'leave',
	UPDATE: 'update',
	UNKNOWN: 'unknown',
	NEW_LINK: 'new_link',
	ADD_ADMIN: 'add_admin',
	REMOVE_ADMIN: 'remove_admin',
	JOIN_REQUEST: 'join_request',
	BLOCK_MEMBER: 'block_member',
	REMOVE_MEMBER: 'remove_member',
	UPDATE_SETTING: 'update_setting',
};

let api: API | undefined;

export class ZaloGroupEventTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN Group Event Trigger',
		name: 'zaloGroupEventTrigger',
		icon: 'file:../shared/zalo.svg',
		group: ['trigger'],
		version: 1,
		description: 'Lắng nghe sự kiện nhóm Zalo: thành viên vào/rời, thêm/xóa admin, yêu cầu vào nhóm, chặn/xóa thành viên, đổi tên/avatar nhóm, cập nhật cài đặt',
		defaults: {
			name: 'Zalo CN Group Event Trigger',
		},
		// @ts-ignore
		inputs: [],
		// @ts-ignore
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		credentials: [
			{
				name: 'zaloApi',
				required: true,
				displayName: 'Zalo Credential to connect with',
			},
		],
		properties: [
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: [
					{
						name: 'Thành Viên Vào Nhóm',
						value: GroupEventTypeMap.JOIN,
						description: 'Khi có thành viên mới vào nhóm',
					},
					{
						name: 'Thành Viên Rời Nhóm',
						value: GroupEventTypeMap.LEAVE,
						description: 'Khi có thành viên rời nhóm',
					},
					{
						name: 'Yêu Cầu Vào Nhóm',
						value: GroupEventTypeMap.JOIN_REQUEST,
						description: 'Khi có người yêu cầu vào nhóm',
					},
					{
						name: 'Thêm Admin',
						value: GroupEventTypeMap.ADD_ADMIN,
						description: 'Khi có thành viên được thêm làm admin/phó nhóm',
					},
					{
						name: 'Xóa Admin',
						value: GroupEventTypeMap.REMOVE_ADMIN,
						description: 'Khi admin/phó nhóm bị xóa quyền',
					},
					{
						name: 'Chặn Thành Viên',
						value: GroupEventTypeMap.BLOCK_MEMBER,
						description: 'Khi thành viên bị chặn trong nhóm',
					},
					{
						name: 'Xóa Thành Viên',
						value: GroupEventTypeMap.REMOVE_MEMBER,
						description: 'Khi thành viên bị xóa khỏi nhóm (bị kick)',
					},
					{
						name: 'Cập Nhật Nhóm',
						value: GroupEventTypeMap.UPDATE,
						description: 'Khi thông tin nhóm được cập nhật (tên, avatar)',
					},
					{
						name: 'Tạo Link Mới',
						value: GroupEventTypeMap.NEW_LINK,
						description: 'Khi link mời nhóm mới được tạo',
					},
					{
						name: 'Cập Nhật Cài Đặt',
						value: GroupEventTypeMap.UPDATE_SETTING,
						description: 'Khi cài đặt nhóm thay đổi',
					},
				],
				default: [],
				required: true,
				description: 'Loại sự kiện nhóm cần lắng nghe. Để trống để nhận tất cả.',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return !!webhookData.isConnected;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('zaloApi');

				if (!credentials) {
					throw new NodeOperationError(this.getNode(), 'No credentials found');
				}

				try {
					const cookieFromCred = JSON.parse(credentials.cookie as string);
					const imeiFromCred = credentials.imei as string;
					const userAgentFromCred = credentials.userAgent as string;

					const zalo = new Zalo();
					api = await zalo.login({
						cookie: cookieFromCred,
						imei: imeiFromCred,
						userAgent: userAgentFromCred,
					});

					if (!api) {
						throw new NodeOperationError(
							this.getNode(),
							'No API instance found. Please make sure to provide valid credentials.',
						);
					}

					const webhookUrl = this.getNodeWebhookUrl('default') as string;
					const nodeEventTypes = this.getNodeParameter('eventTypes', 0) as string[];

					// Listen for group events (cmd=601 in zlapi websocket)
					api.listener.on('event', async (event: any) => {
						const eventType = event?.type as string;
						const eventData = event?.data;

						// If eventTypes is empty array, forward all events
						// Otherwise filter by selected types
						if (
							nodeEventTypes.length === 0 ||
							nodeEventTypes.includes(eventType)
						) {
							await this.helpers.httpRequest({
								method: 'POST',
								url: webhookUrl,
								body: {
									eventType,
									eventData,
									timestamp: Date.now(),
								},
								headers: {
									'Content-Type': 'application/json',
								},
							});
						}
					});

					// Start listening
					api.listener.start();

					const webhookData = this.getWorkflowStaticData('node');
					webhookData.isConnected = true;
					webhookData.eventTypes = nodeEventTypes;

					return true;
				} catch (error) {
					throw new NodeOperationError(this.getNode(), `Zalo group event listener failed: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (api) {
					api.listener.stop();
					api = undefined;
				}

				delete webhookData.isConnected;
				delete webhookData.eventTypes;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = req.body;

		return {
			workflowData: [
				this.helpers.returnJsonArray({
					eventType: body?.eventType,
					eventData: body?.eventData,
					timestamp: body?.timestamp,
				}),
			],
		};
	}
}
