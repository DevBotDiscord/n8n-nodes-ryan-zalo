import { INodeProperties } from 'n8n-workflow';

export const zaloGroupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['zaloGroup'] } },
		options: [
			{
				name: 'Chặn Thành Viên Trong Nhóm',
				value: 'addGroupBlockedMember',
				action: 'Chặn thành viên trong nhóm',
			},
			{
				name: 'ĐổI Avatar Nhóm',
				value: 'changeGroupAvatar',
				description: 'Đổi avatar của nhóm',
				action: 'Đổi avatar nhóm',
			},
			{
				name: 'ĐổI Chủ Nhóm (Owner)',
				value: 'changeGroupOwner',
				action: 'Đổi chủ nhóm',
			},
			{
				name: 'ĐổI Tên Nhóm',
				value: 'changeGroupName',
				description: 'Đổi tên của nhóm',
				action: 'Đổi tên nhóm',
			},
			{
				name: 'Lấy Danh Sách Thành Viên',
				value: 'getGroupMembers',
				description: 'Lấy danh sách thành viên của nhóm',
				action: 'Lấy danh sách thành viên',
			},
			{
				name: 'Lấy Danh Sách Thành Viên Bị Chặn',
				value: 'getGroupBlockedMember',
				action: 'Lấy danh sách thành viên bị chặn',
			},
			{
				name: 'Lấy Danh Sách Yêu Cầu Vào Nhóm',
				value: 'getPendingGroupMembers',
				action: 'Lấy danh sách yêu cầu vào nhóm',
			},
			{
				name: 'Lấy Tất Cả Nhóm',
				value: 'getAllGroups',
				description: 'Lấy danh sách tất cả các nhóm',
				action: 'Lấy tất cả nhóm',
			},
			{
				name: 'Lấy Thông Tin Link Nhóm',
				value: 'getGroupLinkDetail',
				action: 'Lấy thông tin link mời nhóm',
			},
			{
				name: 'Lấy Thông Tin Nhóm',
				value: 'getGroupInfo',
				description: 'Lấy thông tin của một nhóm',
				action: 'Lấy thông tin nhóm',
			},
			{
				name: 'Lấy Thông Tin Profile Thành Viên',
				value: 'getGroupMembersInfo',
				action: 'Lấy thông tin profile thành viên',
			},
			{
				name: 'Mời Người Dùng Vào Nhóm',
				value: 'inviteUserToGroups',
				action: 'Mời người dùng vào nhóm qua link',
			},
			{
				name: 'Phê Duyệt / Từ Chối Yêu Cầu Vào Nhóm',
				value: 'reviewPendingMemberRequest',
				action: 'Phê duyệt hoặc từ chối yêu cầu vào nhóm',
			},
			{
				name: 'Rời Nhóm',
				value: 'leaveGroup',
				action: 'Rời khỏi nhóm',
			},
			{
				name: 'Tạo Ghi Chú',
				value: 'createNote',
				description: 'Tạo ghi chú trong nhóm',
				action: 'Tạo ghi chú',
			},
			{
				name: 'Tạo Link Mời Nhóm',
				value: 'enableGroupLink',
				action: 'Tạo/bật link mời nhóm',
			},
			{
				name: 'Tạo Nhóm',
				value: 'createGroup',
				description: 'Tạo một nhóm mới',
				action: 'Tạo nhóm',
			},
			{
				name: 'Tham Gia Nhóm Qua Link',
				value: 'joinGroupLink',
				action: 'Tham gia nhóm qua link mời',
			},
			{
				name: 'Thêm Phó Nhóm',
				value: 'addGroupDeputy',
				description: 'Thêm phó nhóm cho một nhóm',
				action: 'Thêm phó nhóm',
			},
			{
				name: 'Thêm Thành Viên Vào Nhóm',
				value: 'addUserToGroup',
				action: 'Thêm thành viên vào nhóm',
			},
			{
				name: 'Thay ĐổI Cài Đặt Nhóm',
				value: 'updateGroupSettings',
				action: 'Thay đổi cài đặt nhóm',
			},
			{
				name: 'Vô Hiệu Link Mời Nhóm',
				value: 'disableGroupLink',
				action: 'Vô hiệu link mời nhóm',
			},
			{
				name: 'Xóa Bỏ Chặn Thành Viên',
				value: 'removeGroupBlockedMember',
				action: 'Xóa bỏ chặn thành viên',
			},
			{
				name: 'Xóa Nhóm (Giải Tán)',
				value: 'disperseGroup',
				action: 'Xóa nhóm (giải tán)',
			},
			{
				name: 'Xóa Thành Viên Khỏi Nhóm',
				value: 'removeUserFromGroup',
				description: 'Xóa thành viên khỏi nhóm',
				action: 'Xóa thành viên khỏi nhóm',
			},
		],
		default: 'createGroup',
	},
];

export const zaloGroupFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:createGroup                                      */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Tên Nhóm',
		name: 'groupName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['createGroup'] } },
		description: 'Tên của nhóm mới',
	},
	{
		displayName: 'Danh Sách ID Thành Viên (Phân Cách Bằng Dấu Phẩy)',
		name: 'userIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['createGroup'] } },
		description: 'Danh sách ID thành viên, phân cách bằng dấu phẩy',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:getGroupInfo / getGroupMembers / getGroupLinkDetail / ... */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'ID Nhóm',
		name: 'groupId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['zaloGroup'],
				operation: [
					'getGroupInfo', 'addGroupDeputy', 'addUserToGroup',
					'changeGroupAvatar', 'changeGroupName', 'getGroupMembers',
					'removeUserFromGroup', 'createNote', 'leaveGroup',
					'changeGroupOwner', 'updateGroupSettings',
					'enableGroupLink', 'disableGroupLink', 'getGroupLinkDetail',
					'disperseGroup', 'getPendingGroupMembers', 'reviewPendingMemberRequest',
					'getGroupBlockedMember', 'addGroupBlockedMember', 'removeGroupBlockedMember',
				],
			},
		},
		description: 'ID của nhóm',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:addGroupDeputy / addGroupBlockedMember etc       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'ID Người Dùng',
		name: 'userId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['addGroupDeputy', 'changeGroupOwner'] } },
		description: 'ID của người dùng',
	},
	{
		displayName: 'Danh Sách ID Người Dùng (Phân Cách Bằng Dấu Phẩy)',
		name: 'userIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['addUserToGroup', 'removeUserFromGroup', 'addGroupBlockedMember', 'removeGroupBlockedMember'] } },
		description: 'Danh sách ID, phân cách bằng dấu phẩy',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:changeGroupAvatar                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'URL Ảnh',
		name: 'imageUrl',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['changeGroupAvatar'] } },
		description: 'URL của ảnh đại diện mới',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:changeGroupName                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Tên Mới',
		name: 'newName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['changeGroupName'] } },
		description: 'Tên mới của nhóm',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:getGroupMembers / getGroupBlockedMember          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Giới Hạn',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		required: true,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['getGroupMembers', 'getAllGroups'] } },
		description: 'Số lượng kết quả tối đa',
	},
	{
		displayName: 'Số Trang',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['getGroupBlockedMember'] } },
		description: 'Số trang',
	},
	{
		displayName: 'Số Lượng / Trang',
		name: 'count',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 30,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['getGroupBlockedMember'] } },
		description: 'Số lượng thành viên mỗi trang',
	},

	/* -------------------------------------------------------------------------- */
	/*                  zaloGroup:createNote                                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Nội Dung Ghi Chú',
		name: 'content',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['createNote'] } },
		description: 'Nội dung của ghi chú',
	},
	{
		displayName: 'Ghim Ghi Chú',
		name: 'pinAct',
		type: 'boolean',
		required: true,
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['createNote'] } },
		description: 'Ghim ghi chú lên đầu nhóm',
	},

	/* -------------------------------------------------------------------------- */
	/*               zaloGroup:leaveGroup                                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Rời Nhóm Im Lặng',
		name: 'silent',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['leaveGroup'] } },
		description: 'Rời nhóm mà không thông báo',
	},

	/* -------------------------------------------------------------------------- */
	/*               zaloGroup:updateGroupSettings                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Chặn Đổi Tên/Avatar',
		name: 'blockName',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Không cho thành viên đổi tên và avatar nhóm',
	},
	{
		displayName: 'Đánh Dấu Tin Admin',
		name: 'signAdminMsg',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Làm nổi bật tin nhắn của chủ nhóm/admin',
	},
	{
		displayName: 'Chỉ Admin Ghim',
		name: 'setTopicOnly',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Không cho thành viên ghim tin nhắn/ghi chú/poll',
	},
	{
		displayName: 'Xem Lịch Sử Tin Nhắn',
		name: 'enableMsgHistory',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Cho phép thành viên mới đọc tin nhắn cũ',
	},
	{
		displayName: 'Phê Duyệt Thành Viên',
		name: 'joinAppr',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Yêu cầu phê duyệt khi có người muốn vào nhóm',
	},
	{
		displayName: 'Chặn Tạo Ghi Chú/Nhắc Hẹn',
		name: 'lockCreatePost',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Không cho thành viên tạo ghi chú & nhắc hẹn',
	},
	{
		displayName: 'Chặn Tạo Bình Chọn',
		name: 'lockCreatePoll',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Không cho thành viên tạo bình chọn',
	},
	{
		displayName: 'Chặn Gửi Tin Nhắn',
		name: 'lockSendMsg',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Chặn thành viên gửi tin nhắn',
	},
	{
		displayName: 'Ẩn Danh Sách Thành Viên',
		name: 'lockViewMember',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['updateGroupSettings'] } },
		description: 'Ẩn danh sách thành viên với người ngoài',
	},

	/* -------------------------------------------------------------------------- */
	/*               zaloGroup:joinGroupLink                                      */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Link Mời',
		name: 'link',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['joinGroupLink'] } },
		description: 'Link mời nhóm (https://zalo.me/g/...)',
	},

	/* -------------------------------------------------------------------------- */
	/*               zaloGroup:getGroupMembersInfo / inviteUserToGroups           */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'ID Thành Viên (Phân Cách Bằng Dấu Phẩy Nếu Nhiều)',
		name: 'memberIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['getGroupMembersInfo', 'inviteUserToGroups'] } },
		description: 'ID của thành viên, phân cách bằng dấu phẩy',
	},

	/* -------------------------------------------------------------------------- */
	/*               zaloGroup:reviewPendingMemberRequest                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'ID Người Dùng (Phân Cách Bằng Dấu Phẩy Nếu Nhiều)',
		name: 'memberIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['reviewPendingMemberRequest'] } },
		description: 'ID của người dùng cần duyệt/từ chối',
	},
	{
		displayName: 'Chấp Nhận',
		name: 'isApprove',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: { show: { resource: ['zaloGroup'], operation: ['reviewPendingMemberRequest'] } },
		description: 'ON = Chấp nhận, OFF = Từ chối',
	},
];
