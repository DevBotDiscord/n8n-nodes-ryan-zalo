import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	NodeOperationError,
	IHookFunctions,
} from 'n8n-workflow';
import { API, Zalo } from 'zalo-api-final';

let api: API | undefined;

export class ZaloUnifiedTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN Unified Trigger',
		name: 'zaloUnifiedTrigger',
		icon: 'file:../shared/zalo.svg',
		group: ['trigger'],
		version: 1,
		description:
			'Bộ trigger hợp nhất cho Zalo: lắng nghe tin nhắn + sự kiện kết bạn + sự kiện nhóm trên cùng 1 WebSocket. Dùng Switch node để phân loại event.',
		defaults: { name: 'Zalo CN Unified Trigger' },
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
				displayName: 'Listen Message',
				name: 'listenMessage',
				type: 'boolean',
				default: true,
				description: 'Lắng nghe tin nhắn đến (cá nhân + nhóm)',
			},
			{
				displayName: 'Listen Friend Events',
				name: 'listenFriendEvent',
				type: 'boolean',
				default: true,
				description: 'Lắng nghe sự kiện kết bạn',
			},
			{
				displayName: 'Listen Group Events',
				name: 'listenGroupEvent',
				type: 'boolean',
				default: true,
				description: 'Lắng nghe sự kiện nhóm (JOIN, LEAVE, KICK...)',
			},
			{
				displayName: 'Self Listen',
				name: 'selfListen',
				type: 'boolean',
				default: false,
				description: 'Lắng nghe tin nhắn/event của chính mình',
			},
			{
				displayName: 'Route To Workflows (Optional)',
				name: 'routeWorkflows',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Route',
				default: {},
				description:
					'Tùy chọn: Forward event đến webhook URL của workflow khác. Để trống nếu chỉ dùng trong 1 workflow.',
				options: [
					{
						name: 'routes',
						displayName: 'Route',
						values: [
							{
								displayName: 'Event Type',
								name: 'eventType',
								type: 'options',
								options: [
									{ name: 'Message (User)', value: 'message_user' },
									{ name: 'Message (Group)', value: 'message_group' },
									{ name: 'Friend Event', value: 'friend_event' },
									{ name: 'Group Event', value: 'group_event' },
								],
								default: 'message_user',
							},
							{
								displayName: 'Webhook URL',
								name: 'webhookUrl',
								type: 'string',
								default: '',
								description: 'Webhook URL của workflow đích (dùng Webhook node)',
							},
						],
					},
				],
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

					const selfListen = this.getNodeParameter('selfListen', 0) as boolean;
					const listenMessage = this.getNodeParameter('listenMessage', 0) as boolean;
					const listenFriendEvent = this.getNodeParameter('listenFriendEvent', 0) as boolean;
					const listenGroupEvent = this.getNodeParameter('listenGroupEvent', 0) as boolean;
					const routeWorkflows = this.getNodeParameter('routeWorkflows', 0, {}) as any;
					const routes: Array<{ eventType: string; webhookUrl: string }> =
						routeWorkflows?.routes || [];

					const zalo = new Zalo({ selfListen });
					api = await zalo.login({
						cookie: cookieFromCred,
						imei: imeiFromCred,
						userAgent: userAgentFromCred,
					});

					if (!api) {
						throw new NodeOperationError(this.getNode(), 'Failed to init Zalo API');
					}

					const webhookUrl = this.getNodeWebhookUrl('default') as string;

					const forwardToRoutes = async (eventType: string, data: any) => {
						// Forward to matching routes
						for (const route of routes) {
							if (route.eventType === eventType && route.webhookUrl) {
								try {
									await this.helpers.httpRequest({
										method: 'POST',
										url: route.webhookUrl,
										body: data,
										headers: { 'Content-Type': 'application/json' },
									});
								} catch (e) {
									// Route down, ignore
								}
							}
						}
						// Always forward to own webhook
						try {
							await this.helpers.httpRequest({
								method: 'POST',
								url: webhookUrl,
								body: data,
								headers: { 'Content-Type': 'application/json' },
							});
						} catch (e) {
							// Self webhook might fail during startup, ignore
						}
					};

					if (listenMessage) {
						api.listener.on('message', async (message: any) => {
							const eventType =
								message?.type === 1 ? 'message_group' : 'message_user';
							await forwardToRoutes(eventType, {
								event: 'message',
								message,
								timestamp: Date.now(),
							});
						});
					}

					if (listenFriendEvent) {
						api.listener.on('friend_event', async (event: any) => {
							await forwardToRoutes('friend_event', {
								event: 'friend_event',
								data: event,
								timestamp: Date.now(),
							});
						});
					}

					if (listenGroupEvent) {
						api.listener.on('group_event', async (event: any) => {
							await forwardToRoutes('group_event', {
								event: 'group_event',
								type: event?.type,
								typeName: typeof event?.type === 'number' ? event?.type : 'UNKNOWN',
								data: event?.data,
								threadId: event?.threadId,
								isSelf: event?.isSelf,
								timestamp: Date.now(),
							});
						});
					}

					api.listener.start();

					const webhookData = this.getWorkflowStaticData('node');
					webhookData.isConnected = true;
					webhookData.wsStartedAt = Date.now();

					return true;
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Zalo unified trigger failed: ${(error as Error).message}`,
					);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				if (api) {
					api.listener.stop();
					api = undefined;
				}
				const webhookData = this.getWorkflowStaticData('node');
				delete webhookData.isConnected;
				delete webhookData.wsStartedAt;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getRequestObject().body;
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
