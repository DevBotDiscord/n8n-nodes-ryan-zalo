import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeOperationError,
	IHookFunctions,
} from 'n8n-workflow';
import { API, GroupEventType, Zalo } from 'zalo-api-final';

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
						value: GroupEventType.JOIN,
						description: 'Khi có thành viên mới vào nhóm',
					},
					{
						name: 'Thành Viên Rời Nhóm',
						value: GroupEventType.LEAVE,
						description: 'Khi có thành viên rời nhóm',
					},
					{
						name: 'Yêu Cầu Vào Nhóm',
						value: GroupEventType.JOIN_REQUEST,
						description: 'Khi có người yêu cầu vào nhóm',
					},
					{
						name: 'Thêm Admin / Phó Nhóm',
						value: GroupEventType.ADD_ADMIN,
						description: 'Khi có thành viên được thêm làm admin/phó nhóm',
					},
					{
						name: 'Xóa Admin / Phó Nhóm',
						value: GroupEventType.REMOVE_ADMIN,
						description: 'Khi admin/phó nhóm bị xóa quyền',
					},
					{
						name: 'Chặn Thành Viên',
						value: GroupEventType.BLOCK_MEMBER,
						description: 'Khi thành viên bị chặn trong nhóm',
					},
					{
						name: 'Xóa Thành Viên (Kick)',
						value: GroupEventType.REMOVE_MEMBER,
						description: 'Khi thành viên bị xóa khỏi nhóm (bị kick)',
					},
					{
						name: 'Cập Nhật Nhóm (Tên/Avatar)',
						value: GroupEventType.UPDATE,
						description: 'Khi thông tin nhóm được cập nhật (tên, avatar)',
					},
					{
						name: 'Đổi Avatar Nhóm',
						value: GroupEventType.UPDATE_AVATAR,
						description: 'Khi avatar nhóm được thay đổi',
					},
					{
						name: 'Tạo Link Mời Nhóm',
						value: GroupEventType.NEW_LINK,
						description: 'Khi link mời nhóm mới được tạo',
					},
					{
						name: 'Cập Nhật Cài Đặt Nhóm',
						value: GroupEventType.UPDATE_SETTING,
						description: 'Khi cài đặt nhóm thay đổi',
					},
					{
						name: 'Pin Chủ Đề Mới',
						value: GroupEventType.NEW_PIN_TOPIC,
						description: 'Khi có chủ đề mới được ghim',
					},
					{
						name: 'Cập Nhật Pin Chủ Đề',
						value: GroupEventType.UPDATE_PIN_TOPIC,
						description: 'Khi chủ đề ghim được cập nhật',
					},
					{
						name: 'Sắp Xếp Lại Pin',
						value: GroupEventType.REORDER_PIN_TOPIC,
						description: 'Khi thứ tự ghim được sắp xếp lại',
					},
					{
						name: 'Bỏ Ghim Chủ Đề',
						value: GroupEventType.UNPIN_TOPIC,
						description: 'Khi chủ đề bị bỏ ghim',
					},
					{
						name: 'Xóa Chủ Đề',
						value: GroupEventType.REMOVE_TOPIC,
						description: 'Khi chủ đề bị xóa',
					},
					{
						name: 'Cập Nhật Bảng Tin',
						value: GroupEventType.UPDATE_BOARD,
						description: 'Khi bảng tin nhóm được cập nhật',
					},
					{
						name: 'Xóa Bảng Tin',
						value: GroupEventType.REMOVE_BOARD,
						description: 'Khi bảng tin nhóm bị xóa',
					},
					{
						name: 'Cập Nhật Chủ Đề',
						value: GroupEventType.UPDATE_TOPIC,
						description: 'Khi chủ đề được cập nhật',
					},
					{
						name: 'Chấp Nhận Nhắc Hẹn',
						value: GroupEventType.ACCEPT_REMIND,
						description: 'Khi nhắc hẹn được chấp nhận',
					},
					{
						name: 'Từ Chối Nhắc Hẹn',
						value: GroupEventType.REJECT_REMIND,
						description: 'Khi nhắc hẹn bị từ chối',
					},
					{
						name: 'Nhắc Hẹn Chủ Đề',
						value: GroupEventType.REMIND_TOPIC,
						description: 'Khi có nhắc hẹn cho chủ đề',
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
					const nodeEventTypes = this.getNodeParameter('eventTypes', 0) as number[];

					// Listen for group events via WebSocket (cmd=601 group control)
					api.listener.on('group_event', async (event) => {
						const eventType = event.type as GroupEventType;

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
									eventTypeName: GroupEventType[eventType],
									eventData: event.data,
									threadId: event.threadId,
									isSelf: event.isSelf,
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
					eventTypeName: body?.eventTypeName,
					eventData: body?.eventData,
					threadId: body?.threadId,
					isSelf: body?.isSelf,
					timestamp: body?.timestamp,
				}),
			],
		};
	}
}
