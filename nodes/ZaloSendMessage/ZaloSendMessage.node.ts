import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { API, ThreadType, Zalo } from 'zalo-api-final';
import { saveFile, removeFile } from '../utils/helper';

let api: API | undefined;

export class ZaloSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN Send',
		name: 'zaloSendMessage',
		icon: 'file:../shared/zalo.svg',
		group: ['organization'],
		version: 4,
		description: 'Gửi tin nhắn, ảnh/file (URL hoặc binary), sticker, video, voice, card, link, bank card, forward qua Zalo',
		defaults: { name: 'Zalo CN Send' },
		// @ts-ignore
		inputs: ['main'],
		// @ts-ignore
		outputs: ['main'],
		credentials: [{ name: 'zaloApi', required: true }],
		properties: [
			{
				displayName: 'Message Type',
				name: 'msgType',
				type: 'options',
				options: [
					{ name: 'Text Message', value: 'text' },
					{ name: 'Image / File', value: 'image' },
					{ name: 'Sticker', value: 'sticker' },
					{ name: 'Video', value: 'video' },
					{ name: 'Voice', value: 'voice' },
					{ name: 'Contact Card', value: 'card' },
					{ name: 'Link', value: 'link' },
					{ name: 'Bank Card', value: 'bankCard' },
					{ name: 'Forward Message', value: 'forward' },
				],
				default: 'text',
				description: 'Loại tin nhắn cần gửi',
			},
			{
				displayName: 'Thread ID',
				name: 'threadId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID của thread để gửi (user ID hoặc group ID)',
			},
			{
				displayName: 'Thread Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'User', value: 0 },
					{ name: 'Group', value: 1 },
				],
				default: 0,
				description: 'Loại thread (user hoặc group)',
			},
			// ---- Image / File Fields ----
			{
				displayName: 'Input Method',
				name: 'imageInputMethod',
				type: 'options',
				options: [
					{ name: 'URL', value: 'url', description: 'Gửi ảnh/file từ URL công khai' },
					{ name: 'Binary Data', value: 'binary', description: 'Gửi ảnh/file từ binary data (từ node Read Binary Files, HTTP Request...) (tối đa 1 file/lần)' },
				],
				default: 'url',
				displayOptions: { show: { msgType: ['image'] } },
				description: 'Nguồn ảnh/file',
			},
			{
				displayName: 'Image / File URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['image'], imageInputMethod: ['url'] } },
				description: 'URL công khai của ảnh hoặc file (png, jpg, pdf, zip...)',
				placeholder: 'https://example.com/image.jpg',
			},
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: { show: { msgType: ['image'], imageInputMethod: ['binary'] } },
				description: 'Tên của input binary field chứa file (từ node trước đó như Read Binary Files)',
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['image'], imageInputMethod: ['binary'] } },
				description: 'Tên file (để trống sẽ dùng tên từ binary data). VD: image.jpg',
			},
			{
				displayName: 'Caption',
				name: 'imageCaption',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['image'] } },
				description: 'Caption (chú thích) kèm theo ảnh/file',
			},
			{
				displayName: 'TTL (ms)',
				name: 'imageTtl',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['image'] } },
				description: 'Thời gian sống (milliseconds), 0 = vĩnh viễn',
			},
			// ---- Text Message Fields ----
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['text'] } },
				description: 'Nội dung tin nhắn cần gửi',
			},
			{
				displayName: 'Urgency',
				name: 'urgency',
				type: 'options',
				options: [
					{ name: 'Default', value: 0 },
					{ name: 'Important', value: 1 },
					{ name: 'Urgent', value: 2 },
				],
				default: 0,
				displayOptions: { show: { msgType: ['text'] } },
				description: 'Mức độ khẩn cấp của tin nhắn',
			},
			{
				displayName: 'Quote Message',
				name: 'quote',
				type: 'collection',
				placeholder: 'Add Quote',
				default: {},
				displayOptions: { show: { msgType: ['text'] } },
				options: [
					{ displayName: 'Message ID', name: 'msgId', type: 'string', default: '' },
					{ displayName: 'Sender ID', name: 'senderId', type: 'string', default: '' },
					{ displayName: 'Content', name: 'content', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Mentions',
				name: 'mentions',
				type: 'collection',
				placeholder: 'Add Mention',
				default: {},
				displayOptions: { show: { msgType: ['text'] } },
				options: [
					{ displayName: 'User ID', name: 'uid', type: 'string', default: '' },
					{ displayName: 'Position', name: 'pos', type: 'number', default: 0 },
					{ displayName: 'Length', name: 'len', type: 'number', default: 0 },
				],
			},
			{
				displayName: 'Attachments',
				name: 'attachments',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				placeholder: 'Add Attachment',
				default: {},
				displayOptions: { show: { msgType: ['text'] } },
				options: [
					{
						name: 'attachment',
						displayName: 'Attachment',
						values: [
							{ displayName: 'Image URL / File URL', name: 'imageUrl', type: 'string', default: '', description: 'URL công khai của ảnh hoặc file' },
						],
					},
				],
				description: 'File đính kèm',
			},
			// ---- Sticker Fields ----
			{
				displayName: 'Sticker ID',
				name: 'stickerId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: { show: { msgType: ['sticker'] } },
				description: 'ID của sticker cần gửi',
			},
			{
				displayName: 'Category ID',
				name: 'catId',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['sticker'] } },
				description: 'Category ID của sticker',
			},
			// ---- Video Fields ----
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['video'] } },
				description: 'URL công khai của video (mp4)',
			},
			{
				displayName: 'Thumbnail URL',
				name: 'thumbnailUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['video'] } },
				description: 'URL công khai của ảnh thumbnail',
			},
			{
				displayName: 'Duration (ms)',
				name: 'duration',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['video'] } },
				description: 'Thời lượng video tính bằng milliseconds',
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['video'] } },
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['video'] } },
			},
			{
				displayName: 'Caption',
				name: 'msg',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['video'] } },
				description: 'Tin nhắn kèm theo video',
			},
			// ---- Voice Fields ----
			{
				displayName: 'Voice URL',
				name: 'voiceUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['voice'] } },
				description: 'URL công khai của file ghi âm',
			},
			// ---- Contact Card Fields ----
			{
				displayName: 'Card User ID',
				name: 'cardUserId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['card'] } },
				description: 'ID của người dùng để gửi card',
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['card'] } },
				description: 'Số điện thoại (tùy chọn)',
			},
			// ---- Link Fields ----
			{
				displayName: 'URL',
				name: 'link',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['link'] } },
				description: 'URL link cần gửi',
			},
			{
				displayName: 'Caption',
				name: 'msg',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['link'] } },
				description: 'Tin nhắn kèm theo link',
			},
			// ---- Bank Card Fields ----
			{
				displayName: 'Bank',
				name: 'binBank',
				type: 'options',
				options: [
					{ name: 'Vietcombank', value: 970436 },
					{ name: 'VietinBank', value: 970415 },
					{ name: 'BIDV', value: 970418 },
					{ name: 'Agribank', value: 970405 },
					{ name: 'ACB', value: 970416 },
					{ name: 'Techcombank', value: 970407 },
					{ name: 'MB Bank', value: 970422 },
					{ name: 'VPBank', value: 970432 },
					{ name: 'Sacombank', value: 970403 },
					{ name: 'TPBank', value: 970423 },
					{ name: 'VIB', value: 970441 },
					{ name: 'SHB', value: 970443 },
					{ name: 'MSB', value: 970426 },
					{ name: 'HDBank', value: 970437 },
					{ name: 'OCB', value: 970448 },
					{ name: 'SeABank', value: 970440 },
					{ name: 'Eximbank', value: 970431 },
					{ name: 'NCB', value: 970419 },
					{ name: 'SCB', value: 970429 },
					{ name: 'LPBank', value: 970449 },
					{ name: 'KienlongBank', value: 970452 },
					{ name: 'BacA Bank', value: 970409 },
					{ name: 'Nam A Bank', value: 970428 },
					{ name: 'VietABank', value: 970427 },
					{ name: 'VietBank', value: 970433 },
					{ name: 'DongA Bank', value: 970406 },
					{ name: 'SaigonBank', value: 970400 },
					{ name: 'PVcomBank', value: 970412 },
					{ name: 'GPBank', value: 970408 },
					{ name: 'Ocean Bank', value: 970414 },
					{ name: 'CB Bank', value: 970444 },
					{ name: 'BVBank', value: 970454 },
					{ name: 'ABBank', value: 970425 },
					{ name: 'Shinhan Bank', value: 970424 },
					{ name: 'HSBC', value: 458761 },
				],
				default: 970436,
				required: true,
				displayOptions: { show: { msgType: ['bankCard'] } },
				description: 'Ngân hàng',
			},
			{
				displayName: 'Số Tài Khoản',
				name: 'numAccBank',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['bankCard'] } },
				description: 'Số tài khoản ngân hàng',
			},
			{
				displayName: 'Tên Chủ Tài Khoản',
				name: 'nameAccBank',
				type: 'string',
				default: '',
				displayOptions: { show: { msgType: ['bankCard'] } },
				description: 'Tên chủ tài khoản (tùy chọn)',
			},
			// ---- Forward Fields ----
			{
				displayName: 'Message Content',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { msgType: ['forward'] } },
				description: 'Nội dung tin nhắn cần forward',
			},
			{
				displayName: 'Đích (Thread IDs)',
				name: 'threadIds',
				type: 'string',
				typeOptions: { multipleValues: true },
				default: [],
				required: true,
				displayOptions: { show: { msgType: ['forward'] } },
				description: 'Danh sách thread ID đích để forward đến',
				placeholder: 'Add Thread ID',
			},
			// ---- TTL (common) ----
			{
				displayName: 'TTL (ms)',
				name: 'ttl',
				type: 'number',
				default: 0,
				displayOptions: { show: { msgType: ['video', 'voice', 'card', 'link', 'forward'] } },
				description: 'Thời gian sống của tin nhắn (milliseconds), 0 = vĩnh viễn',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const items = this.getInputData();
		const zaloCred = await this.getCredentials('zaloApi');

		const cookieFromCred = JSON.parse(zaloCred.cookie as string);
		const imeiFromCred = zaloCred.imei as string;
		const userAgentFromCred = zaloCred.userAgent as string;

		try {
			const zalo = new Zalo();
			api = await zalo.login({ cookie: cookieFromCred, imei: imeiFromCred, userAgent: userAgentFromCred });
			if (!api) {
				throw new NodeOperationError(this.getNode(), 'Failed to initialize Zalo API. Check your credentials.');
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Zalo login error: ${(error as Error).message}`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const threadId = this.getNodeParameter('threadId', i) as string;
				const typeNumber = this.getNodeParameter('type', i) as number;
				const type = typeNumber === 0 ? ThreadType.User : ThreadType.Group;
				const msgType = this.getNodeParameter('msgType', i) as string;

				const cliMsgId = Date.now();
				let response: any;
				let attachmentsList: string[] = [];

				switch (msgType) {
					case 'image': {
						const imageInputMethod = this.getNodeParameter('imageInputMethod', i) as string;
						const caption = this.getNodeParameter('imageCaption', i, '') as string;

						if (imageInputMethod === 'url') {
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;
							const filePath = await saveFile(imageUrl);
							if (!filePath) {
								throw new NodeOperationError(this.getNode(), `Failed to download file from ${imageUrl}`);
							}
							attachmentsList.push(filePath);
							// sendMessage with file path attachment (zalo-api-final handles upload)
							const messageContent: any = { msg: caption, attachments: [filePath] };
							response = await api!.sendMessage(messageContent, threadId, type);
						} else {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const customFileName = this.getNodeParameter('fileName', i, '') as string;
							const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							if (!binaryData) {
								throw new NodeOperationError(this.getNode(), `No binary data found at "${binaryPropertyName}"`);
							}
							const fileName = customFileName || items[i].binary?.[binaryPropertyName]?.fileName || 'file.bin';
							const fileSize = binaryData.length;
							// Upload via uploadAttachment (like Python _uploadImage)
							const uploadResult = await api!.uploadAttachment(
								{
									data: Buffer.from(binaryData),
									filename: fileName as `${string}.${string}`,
									metadata: { totalSize: fileSize },
								} as any,
								threadId,
								type,
							);
							const uploaded = (uploadResult as any)?.[0];
							this.logger.info(`File uploaded via binary: ${JSON.stringify({ fileName, fileSize, uploaded })}`);
							const messageContent: any = { msg: caption, attachments: uploaded?.normalUrl ? [uploaded.normalUrl] : [] };
							response = await api!.sendMessage(messageContent, threadId, type);
						}
						break;
					}
					case 'text': {
						const message = this.getNodeParameter('message', i) as string;
						const urgency = this.getNodeParameter('urgency', i, 0) as number;
						const quote = this.getNodeParameter('quote', i, {}) as any;
						const mentions = this.getNodeParameter('mentions', i, {}) as any;
						const attachments = this.getNodeParameter('attachments', i, {}) as any;

						const messageContent: any = { msg: message };
						if (urgency !== 0) messageContent.urgency = urgency;
						if (quote && Object.keys(quote).length > 0) {
							messageContent.quote = { msgId: quote.msgId, senderId: quote.senderId, content: quote.content };
						}
						if (mentions && Object.keys(mentions).length > 0) {
							messageContent.mentions = [{ pos: mentions.pos || 0, uid: mentions.uid, len: mentions.len || 0 }];
						}
						if (attachments?.attachment?.length > 0) {
							messageContent.attachments = [];
							for (const att of attachments.attachment) {
								const fileData = await saveFile(att.imageUrl);
								if (fileData) {
									messageContent.attachments.push(fileData);
									attachmentsList.push(fileData);
								}
							}
						}
						try {
							await api!.sendTypingEvent(threadId, type);
						} catch (e) { this.logger.warn('Cannot send typing event'); }

						this.logger.info(`Sending text message: ${JSON.stringify({ threadId, type })}`);
						response = await api!.sendMessage(messageContent, threadId, type);
						break;
					}
					case 'sticker': {
						const stickerId = this.getNodeParameter('stickerId', i) as number;
						const catId = this.getNodeParameter('catId', i, 0) as number;
						const sticker = { id: stickerId, catId } as any;
						response = await api!.sendSticker(sticker, threadId, type);
						break;
					}
					case 'video': {
						const videoUrl = this.getNodeParameter('videoUrl', i) as string;
						const thumbnailUrl = this.getNodeParameter('thumbnailUrl', i) as string;
						const duration = this.getNodeParameter('duration', i, 0) as number;
						const width = this.getNodeParameter('width', i, 0) as number;
						const height = this.getNodeParameter('height', i, 0) as number;
						const msg = this.getNodeParameter('msg', i, '') as string;
						const ttl = this.getNodeParameter('ttl', i, 0) as number;
						const options: any = { videoUrl, thumbnailUrl };
						if (msg) options.msg = msg;
						if (duration) options.duration = duration;
						if (width) options.width = width;
						if (height) options.height = height;
						if (ttl) options.ttl = ttl;
						response = await api!.sendVideo(options, threadId, type);
						break;
					}
					case 'voice': {
						const voiceUrl = this.getNodeParameter('voiceUrl', i) as string;
						const ttl = this.getNodeParameter('ttl', i, 0) as number;
						response = await api!.sendVoice({ voiceUrl, ...(ttl ? { ttl } : {}) }, threadId, type);
						break;
					}
					case 'card': {
						const userId = this.getNodeParameter('cardUserId', i) as string;
						const phoneNumber = this.getNodeParameter('phoneNumber', i, '') as string;
						const ttl = this.getNodeParameter('ttl', i, 0) as number;
						const options: any = { userId };
						if (phoneNumber) options.phoneNumber = phoneNumber;
						if (ttl) options.ttl = ttl;
						response = await api!.sendCard(options, threadId, type);
						break;
					}
					case 'link': {
						const link = this.getNodeParameter('link', i) as string;
						const msg = this.getNodeParameter('msg', i, '') as string;
						const ttl = this.getNodeParameter('ttl', i, 0) as number;
						const options: any = { link };
						if (msg) options.msg = msg;
						if (ttl) options.ttl = ttl;
						response = await api!.sendLink(options, threadId, type);
						break;
					}
					case 'bankCard': {
						const binBank = this.getNodeParameter('binBank', i) as number;
						const numAccBank = this.getNodeParameter('numAccBank', i) as string;
						const nameAccBank = this.getNodeParameter('nameAccBank', i, '') as string;
						const payload: any = { binBank, numAccBank };
						if (nameAccBank) payload.nameAccBank = nameAccBank;
						response = await api!.sendBankCard(payload, threadId, type);
						break;
					}
					case 'forward': {
						const message = this.getNodeParameter('message', i) as string;
						const threadIds = this.getNodeParameter('threadIds', i) as string[];
						const ttl = this.getNodeParameter('ttl', i, 0) as number;
						response = await api!.forwardMessage({ message, threadIds, ...(ttl ? { ttl } : {}) }, type);
						break;
					}
				}

				for (const file of attachmentsList) {
					removeFile(file);
				}

				returnData.push({
					json: { success: true, cliMsgId, response, threadId, threadType: type, msgType },
				});
			} catch (error) {
				this.logger.error('Error sending Zalo message:', error);
				if (this.continueOnFail()) {
					returnData.push({ json: { success: false, error: (error as Error).message } });
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}
