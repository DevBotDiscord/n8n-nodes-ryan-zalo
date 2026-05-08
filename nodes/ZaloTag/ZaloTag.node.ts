import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { API, Zalo } from 'zalo-api-final';

let api: API | undefined;

export class ZaloTag implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zalo CN Tag',
		name: 'zaloTag',
		group: ['organization'],
		version: 1,
		description: 'Quản lý thẻ (tag/label) trong Zalo: xem danh sách, tạo, sửa, xóa, gán vào hội thoại',
		defaults: { name: 'Zalo CN Tag' },
		icon: 'file:../shared/zalo.svg',
		// @ts-ignore
		inputs: ['main'],
		// @ts-ignore
		outputs: ['main'],
		credentials: [{ name: 'zaloApi', required: true, displayName: 'Zalo Credential to connect with' }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Danh Sách Thẻ',
						value: 'list',
						description: 'Liệt kê tất cả các thẻ hiện có',
					},
					{
						name: 'Cập Nhật Thẻ',
						value: 'update',
						description: 'Tạo mới, sửa hoặc xóa thẻ. Cần gửi toàn bộ danh sách thẻ.',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Thẻ (JSON)',
				name: 'labelData',
				type: 'json',
				default: '[\n  {\n    "id": 1,\n    "text": "Khách VIP",\n    "color": "#FF0000",\n    "conversations": []\n  }\n]',
				required: true,
				displayOptions: { show: { operation: ['update'] } },
				description: 'Mảng JSON các thẻ. Mỗi thẻ có: id (để trống/tạo mới), text, color, conversations (mảng thread ID), emoji (optional). Để xóa thẻ, bỏ nó khỏi mảng. Version tự động lấy từ lần list trước.',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'number',
				default: 0,
				displayOptions: { show: { operation: ['update'] } },
				description: 'Version của labels (lấy từ kết quả list). 0 nếu không biết.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<any> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		const zaloCred = await this.getCredentials('zaloApi');
		const cookieFromCred = JSON.parse(zaloCred.cookie as string);
		const imeiFromCred = zaloCred.imei as string;
		const userAgentFromCred = zaloCred.userAgent as string;

		try {
			const zalo = new Zalo();
			api = await zalo.login({ cookie: cookieFromCred, imei: imeiFromCred, userAgent: userAgentFromCred });
			if (!api) {
				throw new NodeOperationError(this.getNode(), 'Không thể khởi tạo API Zalo. Vui lòng kiểm tra thông tin đăng nhập.');
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Lỗi đăng nhập Zalo: ${(error as Error).message}`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				switch (operation) {
					case 'list': {
						const labels = await api.getLabels();
						returnData.push({ json: { success: true, labels } });
						break;
					}
					case 'update': {
						const labelData = JSON.parse(this.getNodeParameter('labelData', i) as string);
						const version = this.getNodeParameter('version', i, 0) as number;
						const response = await api.updateLabels({ labelData, version });
						returnData.push({ json: { success: true, response } });
						break;
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
