import { INodeProperties } from 'n8n-workflow';

export const zaloUserOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['zaloUser'],
			},
		},
		options: [
			{
				name: 'Bỏ Chặn Người Dùng',
				value: 'unblockUser',
				action: 'Bỏ chặn người dùng',
			},
			{
				name: 'Chặn Người Dùng',
				value: 'blockUser',
				action: 'Chặn người dùng',
			},
			{
				name: 'Chấp Nhận Lời Mời Kết Bạn',
				value: 'acceptFriendRequest',
				action: 'Chấp nhận lời mời kết bạn',
			},
			{
				name: 'Đổi Ảnh Đại Diện',
				value: 'changeAccountAvatar',
				action: 'Đổi ảnh đại diện tài khoản',
			},
			{
				name: 'ĐổI Tên Gợi Nhớ',
				value: 'changeAliasName',
				description: 'Đổi tên gợi nhớ của bạn bè',
				action: 'Đổi tên gợi nhớ',
			},
			{
				name: 'Gửi Lời Mời Kết Bạn',
				value: 'sendFriendRequest',
				action: 'Gửi lời mời kết bạn',
			},
			{
				name: 'Hủy Lời Mời Kết Bạn',
				value: 'undoFriendRequest',
				action: 'Hủy lời mời kết bạn đã gửi',
			},
			{
				name: 'Lấy Danh Sách Bạn Bè',
				value: 'getAllFriends',
				action: 'Lấy danh sách bạn bè',
			},
			{
				name: 'Lấy Danh Sách Tên Gợi Nhớ',
				value: 'getAliasList',
				action: 'Lấy danh sách tên gợi nhớ',
			},
			{
				name: 'Lấy Danh Sách Lời Mời Đã Gửi',
				value: 'getSentFriendRequest',
				action: 'Lấy danh sách lời mời kết bạn đã gửi',
			},
			{
				name: 'Lấy Danh Sách Yêu Cầu Kết Bạn',
				value: 'getReceivedFriendRequests',
				action: 'Lấy danh sách yêu cầu kết bạn nhận được',
			},
			{
				name: 'Lấy Thông Tin Người Dùng',
				value: 'getUserInfo',
				action: 'Lấy thông tin người dùng',
			},
			{
				name: 'Thay đổI Cài đặT Tài Khoản',
				value: 'changeAccountSetting',
				action: 'Thay đổi cài đặt tài khoản',
			},
			{
				name: 'Thu Hồi Tin Nhắn',
				value: 'undoMessage',
				action: 'Thu hồi tin nhắn',
			},
			{
				name: 'Tìm Kiếm Người Dùng',
				value: 'findUser',
				action: 'Tìm kiếm người dùng',
			},
			{
				name: 'Xóa Bạn Bè',
				value: 'removeFriend',
				action: 'Xóa bạn bè khỏi danh sách',
			},
		],
		default: 'getUserInfo',
	},
];

export const zaloUserFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                            zaloUser:undoMessage                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Thread ID',
		name: 'threadId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['undoMessage'] } },
		default: '',
		description: 'ID của thread cần thu hồi tin nhắn',
	},
	{
		displayName: 'Thread Type',
		name: 'threadType',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['undoMessage'] } },
		options: [
			{ name: 'User', value: 0 },
			{ name: 'Group', value: 1 },
		],
		default: 0,
		description: 'Loại thread',
	},
	{
		displayName: 'Message ID',
		name: 'msgId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['undoMessage'] } },
		default: '',
		description: 'ID của tin nhắn cần thu hồi',
	},
	{
		displayName: 'Client Message ID',
		name: 'cliMsgId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['undoMessage'] } },
		default: '',
		description: 'Client message ID',
	},

	/* -------------------------------------------------------------------------- */
	/*                     zaloUser:changeAliasName                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAliasName'] } },
		default: '',
		description: 'ID của người dùng cần đổi tên gợi nhớ',
	},
	{
		displayName: 'Alias Name',
		name: 'aliasName',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAliasName'] } },
		default: '',
		description: 'Tên gợi nhớ mới',
	},

	/* -------------------------------------------------------------------------- */
	/*                     zaloUser:acceptFriendRequest                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['acceptFriendRequest', 'removeFriend', 'removeFriendAlias', 'undoFriendRequest'] } },
		default: '',
		description: 'ID của người dùng',
	},

	/* -------------------------------------------------------------------------- */
	/*                     zaloUser:sendFriendRequest                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['sendFriendRequest'] } },
		default: '',
		description: 'ID của người dùng cần gửi lời mời kết bạn',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['sendFriendRequest'] } },
		default: '',
		description: 'Tin nhắn kèm theo lời mời kết bạn',
	},

	/* -------------------------------------------------------------------------- */
	/*                     zaloUser:blockUser / unblockUser                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['blockUser', 'unblockUser'] } },
		default: '',
		description: 'ID của người dùng',
	},

	/* -------------------------------------------------------------------------- */
	/*                     zaloUser:changeAccountAvatar                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Avatar URL',
		name: 'avatarUrl',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAccountAvatar'] } },
		default: '',
		description: 'URL công khai của ảnh đại diện mới (jpg/png)',
	},

	/* -------------------------------------------------------------------------- */
	/*                   zaloUser:changeAccountSetting                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAccountSetting'] } },
		default: '',
		description: 'Tên hiển thị',
	},
	{
		displayName: 'Date of Birth',
		name: 'dob',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAccountSetting'] } },
		default: '',
		description: 'Ngày sinh (YYYY-MM-DD)',
	},
	{
		displayName: 'Gender',
		name: 'gender',
		type: 'options',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAccountSetting'] } },
		options: [
			{ name: 'Male', value: 1 },
			{ name: 'Female', value: 2 },
			{ name: 'Other', value: 3 },
		],
		default: 1,
		description: 'Giới tính',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		displayOptions: { show: { resource: ['zaloUser'], operation: ['changeAccountSetting'] } },
		default: '',
		description: 'Ngôn ngữ (vi, en)',
	},

	/* -------------------------------------------------------------------------- */
	/*                   zaloUser:getUserInfo                                     */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['getUserInfo'] } },
		default: '',
		description: 'ID của người dùng cần lấy thông tin',
	},

	/* -------------------------------------------------------------------------- */
	/*                   zaloUser:getAllFriends                                   */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['getAllFriends', 'getAliasList'] } },
		default: 50,
		description: 'Số lượng kết quả tối đa',
	},

	/* -------------------------------------------------------------------------- */
	/*                   zaloUser:findUser                                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		displayOptions: { show: { resource: ['zaloUser'], operation: ['findUser'] } },
		default: '',
		description: 'Số điện thoại cần tìm kiếm',
	},

];
