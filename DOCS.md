# n8n-nodes-ryan-zalo — Full Documentation

Tài liệu đầy đủ cho 9 node Zalo automation trong n8n workflow.

---

## Mục Lục

1. [Cài Đặt & Credentials](#1-cài-đặt--credentials)
2. [Zalo CN Login Via QR Code](#2-zalo-cn-login-via-qr-code)
3. [Zalo CN Send](#3-zalo-cn-send)
4. [Zalo CN User](#4-zalo-cn-user)
5. [Zalo CN Group](#5-zalo-cn-group)
6. [Zalo CN Message Trigger](#6-zalo-cn-message-trigger)
7. [Zalo CN Friend Trigger](#7-zalo-cn-friend-trigger)
8. [Zalo CN Group Event Trigger](#8-zalo-cn-group-event-trigger)
9. [Zalo CN Poll](#9-zalo-cn-poll)
10. [Zalo CN Tag](#10-zalo-cn-tag)
11. [Workflow Ví Dụ](#11-workflow-ví-dụ)

---

## 1. Cài Đặt & Credentials

### Cài đặt

```bash
npm install n8n-nodes-ryan-zalo
```

Hoặc trong n8n: **Settings → Community Nodes →** tìm `n8n-nodes-ryan-zalo` → Install.

### Credentials Cần Thiết

Vào **Credentials → Add Credential → Zalo API**:

| Trường | Mô Tả | Bắt Buộc |
|--------|-------|----------|
| **Cookie** | Cookie từ phiên đăng nhập Zalo (dùng QR Login để lấy tự động) | Có |
| **IMEI** | IMEI identifier từ phiên Zalo | Có |
| **User Agent** | User Agent trình duyệt dùng khi login | Có |
| **Proxy** | HTTP proxy nếu cần (format: `http://user:pass@host:port`) | Không |
| **Support Code** | Support code cho Zalo API | Không |
| **License Key** | License key cho Zalo API | Không |

Ngoài ra có credential **n8n Zalo Account** (dùng để auto-tạo credential qua n8n REST API):

| Trường | Mô Tả |
|--------|-------|
| **API Key** | API key của n8n instance |
| **URL** | URL n8n (default: `http://127.0.0.1:5678`) |

### Lấy Cookie/IMEI/UserAgent

**Cách dễ nhất**: Dùng node **Zalo CN Login Via QR Code** — nó sẽ tự sinh QR, sau khi quét sẽ tự lưu credential.

**Cách thủ công**:
1. Mở Zalo Web (chat.zalo.me) trên Chrome
2. F12 → Application → Cookies → copy toàn bộ cookie
3. Lấy IMEI và User Agent từ browser DevTools

---

## 2. Zalo CN Login Via QR Code

**Mục đích**: Đăng nhập Zalo bằng QR code, tự động lưu credential vào n8n.

**Group**: Organization | **Credential**: `zaloApi` (optional), `n8nZaloApi` (required)

### Parameters

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| Proxy | string | (empty) | HTTP proxy cho Zalo API |

### Cách Sử Dụng

1. Thêm node vào workflow
2. Chạy workflow → node sinh QR code (dạng PNG)
3. Mở Zalo trên điện thoại → Quét QR
4. Sau khi quét thành công, credential được tự động tạo trong n8n
5. Các node khác có thể dùng credential này

### Output

```json
{
  "success": true,
  "message": "QR code generated successfully. Scan with Zalo app to login.",
  "fileName": "zalo-qr-code.png",
  "usingExistingCredential": false,
  "credentialInstructions": "Credentials have been saved to file...",
  "credentialFilePath": "/path/to/output/zalo-credentials.json"
}
```

Kèm theo **binary data** là ảnh PNG của QR code.

### Trạng Thái QR

Node log ra console các trạng thái:
- **QR Code Generated** — QR đã sẵn sàng
- **QR Code Scanned** — Người dùng đã quét QR
- **QR Code Declined** — Người dùng từ chối đăng nhập
- **Got Login Info** — Đăng nhập thành công, credential được lưu
- **QR Code Expired** — QR hết hạn, cần tạo lại

### Lưu Ý

- QR code có hiệu lực ~30 giây
- Nếu có `n8nZaloApi` credential, node sẽ tự gọi n8n REST API để tạo credential
- Timeout 30s cho QR generation

---

## 3. Zalo CN Send

**Mục đích**: Gửi tin nhắn đa dạng: text, sticker, video, voice, contact card, link, bank card, forward.

**Group**: Organization | **Credential**: `zaloApi` (required)

### Parameters Chung

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Message Type** | options | `text` | Loại tin nhắn |
| **Thread ID** | string | (required) | ID của người nhận hoặc nhóm |
| **Thread Type** | options | `User` | `User` hoặc `Group` |

### 3.1 Text Message

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Message** | string | (required) | Nội dung tin nhắn |
| Urgency | options | Default | `Default` / `Important` / `Urgent` |
| Quote Message | collection | (empty) | Trích dẫn tin nhắn: `msgId`, `senderId`, `content` |
| Mentions | collection | (empty) | Mention user: `uid`, `pos`, `len` |
| Attachments | fixedCollection | (empty) | File đính kèm (URL ảnh/file) |

### 3.2 Sticker

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Sticker ID** | number | (required) | ID của sticker |
| Category ID | number | 0 | Category ID của sticker |

### 3.3 Video

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Video URL** | string | (required) | URL công khai của video (mp4) |
| **Thumbnail URL** | string | (required) | URL ảnh thumbnail |
| Duration (ms) | number | 0 | Thời lượng video (milliseconds) |
| Width | number | 0 | Chiều rộng video |
| Height | number | 0 | Chiều cao video |
| Caption | string | (empty) | Tin nhắn kèm video |
| TTL (ms) | number | 0 | Thời gian sống (0 = vĩnh viễn) |

### 3.4 Voice

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Voice URL** | string | (required) | URL công khai của file ghi âm |
| TTL (ms) | number | 0 | Thời gian sống |

### 3.5 Contact Card

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Card User ID** | string | (required) | ID người dùng để gửi card |
| Phone Number | string | (empty) | Số điện thoại (tùy chọn) |
| TTL (ms) | number | 0 | Thời gian sống |

### 3.6 Link

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **URL** | string | (required) | Link cần gửi |
| Caption | string | (empty) | Tin nhắn kèm link |
| TTL (ms) | number | 0 | Thời gian sống |

### 3.7 Bank Card

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Bank** | options | Vietcombank | 30+ ngân hàng Việt Nam |
| **Số Tài Khoản** | string | (required) | Số tài khoản |
| Tên Chủ TK | string | (empty) | Tên chủ tài khoản |

Ngân hàng hỗ trợ: Vietcombank, VietinBank, BIDV, Agribank, ACB, Techcombank, MB Bank, VPBank, Sacombank, TPBank, VIB, SHB, MSB, HDBank, OCB, SeABank, Eximbank, + 15 ngân hàng khác.

### 3.8 Forward Message

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Message Content** | string | (required) | Nội dung tin nhắn forward |
| **Đích (Thread IDs)** | multi | (required) | Danh sách thread ID đích |
| TTL (ms) | number | 0 | Thời gian sống |

### Output

```json
{
  "success": true,
  "response": { "msgId": 123456 },
  "threadId": "123456789",
  "threadType": 0,
  "msgType": "text"
}
```

### Ví Dụ Workflow

**Gửi text với mention**:
```
Thread ID: {{ $json.userId }}
Thread Type: Group
Message: Chào {{ $json.name }}, cảm ơn bạn!
Urgency: Important
Mentions: uid={{ $json.userId }}, pos=6, len={{ $json.name.length }}
```

**Gửi bank card**:
```
Thread ID: {{ $json.userId }}
Message Type: Bank Card
Bank: MB Bank
Số Tài Khoản: 1234567890
Tên Chủ TK: Nguyễn Văn A
```

---

## 4. Zalo CN User

**Mục đích**: Quản lý người dùng Zalo: kết bạn, chặn, lấy thông tin, xóa bạn, đổi tên gợi nhớ, thu hồi tin nhắn...

**Group**: Organization | **Credential**: `zaloApi` (required)

Tổng: **16 operations**.

### Operations

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 1 | Bỏ Chặn Người Dùng | `unblockUser(userId)` | Bỏ chặn 1 user |
| 2 | Chặn Người Dùng | `blockUser(userId)` | Chặn 1 user |
| 3 | Chấp Nhận Lời Mời Kết Bạn | `acceptFriendRequest(userId)` | Accept friend request |
| 4 | Đổi Ảnh Đại Diện | `changeAccountAvatar(url)` | Đổi avatar bằng URL ảnh |
| 5 | Đổi Tên Gợi Nhớ | `changeFriendAlias(name, userId)` | Đặt tên gợi nhớ cho bạn |
| 6 | Gửi Lời Mời Kết Bạn | `sendFriendRequest(msg, userId)` | Gửi friend request kèm tin nhắn |
| 7 | Hủy Lời Mời Kết Bạn | `undoFriendRequest(userId)` | Hủy friend request đã gửi |
| 8 | Lấy Danh Sách Bạn Bè | `getAllFriends()` | Trả về tất cả bạn bè |
| 9 | Lấy Danh Sách Tên Gợi Nhớ | `getAliasList(count)` | Danh sách alias đã đặt |
| 10 | Lấy DS Lời Mời Đã Gửi | `getSentFriendRequest()` | Friend request đã gửi đi |
| 11 | Lấy DS Yêu Cầu Kết Bạn | `getReceivedFriendRequests()` | Friend request nhận được |
| 12 | Lấy Thông Tin Người Dùng | `getUserInfo(userId)` | Thông tin chi tiết 1 user |
| 13 | Thay Đổi Cài Đặt TK | `updateProfile(...)` | Đổi tên, ngày sinh, giới tính |
| 14 | Thu Hồi Tin Nhắn | `undo(...)` | Undo 1 tin nhắn đã gửi |
| 15 | Tìm Kiếm Người Dùng | `findUser(phone)` | Tìm user qua số điện thoại |
| 16 | Xóa Bạn Bè | `removeFriend(userId)` | Xóa bạn khỏi danh sách |

### Parameters Từng Operation

#### 1-6: userId-based operations
```
User ID: (string) ID của người dùng Zalo
```

#### 4: Đổi Ảnh Đại Diện
```
Avatar URL: (string) URL công khai của ảnh mới (jpg/png)
```

#### 5: Đổi Tên Gợi Nhớ
```
User ID: (string)
Alias Name: (string) Tên gợi nhớ mới
```

#### 6: Gửi Lời Mời Kết Bạn
```
User ID: (string)
Message: (string) Tin nhắn kèm lời mời
```

#### 8: Lấy Danh Sách Bạn Bè
```
Limit: (number, default 50) Số lượng tối đa
```

#### 9: Lấy Danh Sách Tên Gợi Nhớ
```
Limit: (number, default 50) Số lượng tối đa
```

#### 13: Thay Đổi Cài Đặt Tài Khoản
```
Name: (string) Tên hiển thị mới
Date of Birth: (string) YYYY-MM-DD
Gender: Male(1) / Female(2) / Other(3)
Language: (string) vi / en (tùy chọn)
```

#### 14: Thu Hồi Tin Nhắn
```
Thread ID: (string) ID thread chứa tin nhắn
Thread Type: User(0) / Group(1)
Message ID: (string) ID tin nhắn cần thu hồi
Client Message ID: (string) cliMsgId
```

#### 15: Tìm Kiếm Người Dùng
```
Phone Number: (string) Số điện thoại cần tìm
```

### Output Mẫu

**getUserInfo**:
```json
{
  "userId": "123456789",
  "displayName": "Nguyễn Văn A",
  "avatar": "https://...",
  "zaloName": "nguyenvana",
  "gender": 0,
  "dob": 946684800000,
  "phoneNumber": "0912345678",
  "isFriend": true,
  "status": 1
}
```

**getAllFriends**:
```json
{
  "friends": [
    { "userId": "...", "displayName": "...", "avatar": "..." },
    ...
  ]
}
```

**getReceivedFriendRequests**:
```json
{
  "expiredDuration": 2592000,
  "collapseMsgListConfig": { ... },
  "recommItems": [
    {
      "dataInfo": {
        "userId": "...",
        "zaloName": "...",
        "displayName": "...",
        "phoneNumber": "...",
        "avatar": "...",
        "gender": 1,
        "recommInfo": { "message": "Xin chào!", "source": 1 }
      }
    }
  ]
}
```

### Ví Dụ Workflow

**Auto-accept friend requests**:
1. `Zalo CN User` → `Lấy DS Yêu Cầu Kết Bạn`
2. `Item Lists` → Split items
3. `Zalo CN User` → `Chấp Nhận Lời Mời Kết Bạn` (userId: `{{ $json.userId }}`)

**Bulk rename aliases**:
1. `Zalo CN User` → `Lấy Danh Sách Bạn Bè`
2. Loop qua từng bạn
3. `Zalo CN User` → `Đổi Tên Gợi Nhớ`

---

## 5. Zalo CN Group

**Mục đích**: Quản lý nhóm Zalo: tạo nhóm, thêm/xóa thành viên, đổi tên/avatar, cài đặt nhóm, link mời, duyệt thành viên, chặn/bỏ chặn, giải tán...

**Group**: Organization | **Credential**: `zaloApi` (required)

Tổng: **25 operations**.

### Operations

#### Quản Lý Nhóm Cơ Bản

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 1 | Tạo Nhóm | `createGroup({name, members})` | Tạo nhóm mới với danh sách thành viên |
| 2 | Lấy Thông Tin Nhóm | `getGroupInfo(groupId)` | Chi tiết 1 nhóm |
| 3 | Lấy Tất Cả Nhóm | `getAllGroups()` | Danh sách tất cả nhóm |
| 4 | Đổi Tên Nhóm | `changeGroupName(groupId, name)` | Đổi tên nhóm |
| 5 | Đổi Avatar Nhóm | `changeGroupAvatar(groupId, url)` | Đổi avatar bằng URL |
| 6 | Rời Nhóm | `leaveGroup(groupId, silent)` | Rời khỏi nhóm |
| 7 | Xóa Nhóm (Giải Tán) | `disperseGroup(groupId)` | Giải tán nhóm (chỉ owner) |
| 8 | Đổi Chủ Nhóm | `changeGroupOwner(userId, groupId)` | Chuyển quyền owner |

#### Quản Lý Thành Viên

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 9 | Lấy Danh Sách Thành Viên | `getGroupInfo(groupId)` | Members + admins + total |
| 10 | Lấy Profile Thành Viên | `getGroupMembersInfo(ids)` | Chi tiết profile thành viên |
| 11 | Thêm Thành Viên | `addUserToGroup(ids, groupId)` | Thêm thành viên vào nhóm |
| 12 | Xóa Thành Viên | `removeUserFromGroup(ids, groupId)` | Kick thành viên |
| 13 | Thêm Phó Nhóm | `addGroupDeputy(groupId, userId)` | Thăng làm phó nhóm |

#### Quản Lý Yêu Cầu Vào Nhóm

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 14 | Lấy DS Yêu Cầu | `getPendingGroupMembers(groupId)` | Danh sách pending |
| 15 | Phê Duyệt/Từ Chối | `reviewPendingMemberRequest(...)` | Duyệt hoặc từ chối |

#### Quản Lý Chặn

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 16 | Chặn Thành Viên | `addGroupBlockedMember(ids, groupId)` | Chặn user trong nhóm |
| 17 | Lấy DS Bị Chặn | `getGroupBlockedMember(...)` | Danh sách bị chặn |
| 18 | Bỏ Chặn | `removeGroupBlockedMember(ids, groupId)` | Bỏ chặn user |

#### Quản Lý Link Mời

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 19 | Tạo Link Mời | `enableGroupLink(groupId)` | Bật/tạo link mời nhóm |
| 20 | Vô Hiệu Link | `disableGroupLink(groupId)` | Tắt link mời |
| 21 | Lấy Thông Tin Link | `getGroupLinkDetail(groupId)` | Xem trạng thái link |
| 22 | Tham Gia Qua Link | `joinGroupLink(link)` | Vào nhóm bằng link |

#### Khác

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 23 | Tạo Ghi Chú | `createNoteGroup(...)` | Tạo note trong nhóm |
| 24 | Thay Đổi Cài Đặt Nhóm | `updateGroupSettings(...)` | 9 tùy chọn cài đặt |
| 25 | Mời Người Dùng Vào Nhóm | `inviteUserToGroups(...)` | Mời user qua API |

### Parameters Đặc Biệt

#### 1: Tạo Nhóm
```
Group Name: (string)
User IDs: (string) "id1, id2, id3" (phân cách dấu phẩy)
```

#### 6: Rời Nhóm
```
Group ID: (string)
Silent: (boolean) True = rời nhóm không thông báo
```

#### 11-13, 16, 18: User IDs hoặc Member IDs
Luôn dùng dấu phẩy để phân cách nhiều ID:
```
User IDs: "123,456,789"
```

#### 15: Phê Duyệt / Từ Chối
```
Group ID: (string)
Member IDs: (string) "id1, id2" (dấu phẩy)
Is Approve: (boolean) ON = chấp nhận, OFF = từ chối
```

#### 22: Tham Gia Qua Link
```
Link: (string) "https://zalo.me/g/abcdef"
```

#### 24: Thay Đổi Cài Đặt Nhóm (9 options)

| Setting | Mô Tả |
|---------|-------|
| Block Name/Avatar | Không cho thành viên đổi tên & avatar nhóm |
| Sign Admin Msg | Highlight tin nhắn admin/owner |
| Set Topic Only | Chỉ admin được ghim |
| Enable Msg History | Thành viên mới đọc được tin cũ |
| Join Approval | Phê duyệt thành viên mới |
| Lock Create Post | Chặn tạo ghi chú & nhắc hẹn |
| Lock Create Poll | Chặn tạo bình chọn |
| Lock Send Msg | Chặn gửi tin nhắn |
| Lock View Member | Ẩn danh sách thành viên |

Mỗi setting là **boolean**. Chỉ những setting được bật (ON) mới được gửi.

#### 17: Lấy DS Bị Chặn
```
Group ID: (string)
Page: (number, default 1) Số trang
Count: (number, default 30) Số lượng / trang
```

### Output Mẫu

**getGroupMembers**:
```json
{
  "members": ["id1", "id2", "id3"],
  "admins": ["id1"],
  "currentMems": 3,
  "updateMems": 1,
  "totalMember": 5
}
```

**enableGroupLink**:
```json
{
  "link": "https://zalo.me/g/abcdef",
  "expiration_date": 1718323200000,
  "enabled": 1
}
```

**getPendingGroupMembers**:
```json
{
  "time": 1718323200000,
  "users": [
    {
      "uid": "123456789",
      "dpn": "Nguyễn Văn A",
      "avatar": "https://..."
    }
  ]
}
```

### Ví Dụ Workflow

**Tạo nhóm hàng loạt và gửi link**:
1. Read CSV (danh sách tên nhóm + thành viên)
2. `Zalo CN Group` → `Tạo Nhóm`
3. `Zalo CN Group` → `Tạo Link Mời`
4. `Zalo CN Send` → gửi link cho từng thành viên

**Tự động kick user không active**:
1. `Zalo CN Group` → `Lấy DS Thành Viên`
2. `Zalo CN User` → `Lấy Thông Tin Người Dùng` (từng user)
3. Filter (lastOnline > 30 days)
4. `Zalo CN Group` → `Xóa Thành Viên`

---

## 6. Zalo CN Message Trigger

**Mục đích**: Trigger node — lắng nghe tin nhắn đến real-time từ Zalo WebSocket.

**Group**: Trigger | **Credential**: `zaloApi` (required)

Trigger node: không có input, tự kích hoạt khi có message mới.

### Parameters

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Event Types** | multiOptions | User + Group | Loại tin nhắn cần nghe |
| Self Listen | boolean | false | Có nghe tin nhắn của chính mình không |

### Cách Hoạt Động

1. Workflow được activate → node mở WebSocket đến Zalo
2. Khi có tin nhắn mới (user hoặc group) → WebSocket nhận event
3. Node forward event qua webhook URL → trigger workflow
4. Workflow chạy với dữ liệu tin nhắn

### Output

```json
{
  "message": {
    "type": 0,
    "data": {
      "msgId": "123456",
      "uidFrom": "123456789",
      "idTo": "987654321",
      "content": "Xin chào!",
      "ts": 1718323200000,
      "msgType": "webchat"
    },
    "threadId": "987654321",
    "isSelf": false
  }
}
```

### Ví Dụ

**Auto-reply chatbot**:
1. Trigger: `Zalo CN Message Trigger` (Event Types: User)
2. `Zalo CN User` → `Lấy Thông Tin Người Dùng` (userId: `{{ $json.message.data.uidFrom }}`)
3. `Zalo CN Send` → reply text (threadId: `{{ $json.message.data.uidFrom }}`)

---

## 7. Zalo CN Friend Trigger

**Mục đích**: Trigger node — lắng nghe sự kiện kết bạn real-time.

**Group**: Trigger | **Credential**: `zaloApi` (required)

### Parameters

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Event Types** | multiOptions | Friend Requests | Loại sự kiện kết bạn |

### Event Types

| Type | Mô Tả |
|------|-------|
| Friend Requests | Khi có người gửi lời mời kết bạn |

### Output

```json
{
  "friendEvent": {
    "type": 0,
    "data": {
      "userId": "123456789",
      "displayName": "Nguyễn Văn A",
      "avatar": "https://...",
      "message": "Xin chào",
      "source": 1,
      "time": 1718323200000
    },
    "threadId": "123456789",
    "isSelf": false
  }
}
```

### Ví Dụ

**Tự động accept friend + gửi welcome**:
1. Trigger: `Zalo CN Friend Trigger`
2. `Zalo CN User` → `Chấp Nhận Lời Mời Kết Bạn` (userId: `{{ $json.friendEvent.data.userId }}`)
3. `Zalo CN Send` → gửi tin nhắn chào mừng

---

## 8. Zalo CN Group Event Trigger

**Mục đích**: Trigger node — lắng nghe **22 loại sự kiện nhóm** real-time.

**Group**: Trigger | **Credential**: `zaloApi` (required)

### Parameters

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Event Types** | multiOptions | (empty = all) | Loại sự kiện nhóm cần nghe |

### 22 Event Types

| # | Event | Enum Value | Mô Tả |
|---|-------|-----------|-------|
| 1 | Thành Viên Vào Nhóm | JOIN (1) | Có thành viên mới vào nhóm |
| 2 | Thành Viên Rời Nhóm | LEAVE (2) | Có thành viên rời nhóm |
| 3 | Yêu Cầu Vào Nhóm | JOIN_REQUEST (0) | Có người yêu cầu vào nhóm |
| 4 | Thêm Admin / Phó Nhóm | ADD_ADMIN (8) | Thành viên được thăng admin |
| 5 | Xóa Admin / Phó Nhóm | REMOVE_ADMIN (9) | Admin bị giáng quyền |
| 6 | Chặn Thành Viên | BLOCK_MEMBER (4) | Thành viên bị chặn |
| 7 | Xóa Thành Viên (Kick) | REMOVE_MEMBER (3) | Thành viên bị kick |
| 8 | Cập Nhật Nhóm (Tên/Avatar) | UPDATE (6) | Tên hoặc avatar nhóm đổi |
| 9 | Đổi Avatar Nhóm | UPDATE_AVATAR (21) | Avatar nhóm được thay |
| 10 | Tạo Link Mời Nhóm | NEW_LINK (7) | Link mời mới được tạo |
| 11 | Cập Nhật Cài Đặt Nhóm | UPDATE_SETTING (5) | Cài đặt nhóm thay đổi |
| 12 | Pin Chủ Đề Mới | NEW_PIN_TOPIC (10) | Chủ đề mới được ghim |
| 13 | Cập Nhật Pin Chủ Đề | UPDATE_PIN_TOPIC (11) | Chủ đề ghim được cập nhật |
| 14 | Sắp Xếp Lại Pin | REORDER_PIN_TOPIC (12) | Thứ tự ghim thay đổi |
| 15 | Bỏ Ghim Chủ Đề | UNPIN_TOPIC (16) | Chủ đề bị bỏ ghim |
| 16 | Xóa Chủ Đề | REMOVE_TOPIC (17) | Chủ đề bị xóa |
| 17 | Cập Nhật Bảng Tin | UPDATE_BOARD (13) | Bảng tin nhóm cập nhật |
| 18 | Xóa Bảng Tin | REMOVE_BOARD (14) | Bảng tin nhóm bị xóa |
| 19 | Cập Nhật Chủ Đề | UPDATE_TOPIC (15) | Chủ đề được update |
| 20 | Chấp Nhận Nhắc Hẹn | ACCEPT_REMIND (18) | Nhắc hẹn được accept |
| 21 | Từ Chối Nhắc Hẹn | REJECT_REMIND (19) | Nhắc hẹn bị reject |
| 22 | Nhắc Hẹn Chủ Đề | REMIND_TOPIC (20) | Có nhắc hẹn mới |

Để trống Event Types = **nhận tất cả 22 loại**.

### Output

```json
{
  "eventType": 1,
  "eventTypeName": "JOIN",
  "eventData": {
    "subType": 0,
    "groupId": "123456789",
    "creatorId": "987654321",
    "groupName": "Nhóm ABC",
    "sourceId": "123",
    "updateMembers": [
      {
        "id": "newmember123",
        "dName": "Người Mới",
        "avatar": "https://..."
      }
    ],
    "time": "1718323200",
    "totalMember": 5
  },
  "threadId": "123456789",
  "isSelf": false,
  "timestamp": 1718323200000
}
```

Cấu trúc `eventData` thay đổi tùy loại event:
- **JOIN / LEAVE / REMOVE_MEMBER**: có `updateMembers[]` — danh sách thành viên liên quan
- **JOIN_REQUEST**: có `uids[]` + `totalPending`
- **UPDATE_SETTING**: có `groupSetting` — cài đặt mới
- **UPDATE / UPDATE_AVATAR**: có `groupName` / `avt` / `fullAvt`
- **NEW_LINK**: có `info.group_link`
- **NEW_PIN_TOPIC / UPDATE_PIN_TOPIC**: có `topic` — thông tin chủ đề

### Ví Dụ Workflow

**Log tất cả hoạt động nhóm**:
1. Trigger: `Zalo CN Group Event Trigger` (Event Types: để trống)
2. Switch node (theo `eventTypeName`) → xử lý từng loại
3. Gửi thông báo qua Telegram/Slack/Discord
4. Lưu log vào Google Sheets / Database

**Welcome message cho thành viên mới**:
1. Trigger: `Zalo CN Group Event Trigger` (Event Types: chỉ JOIN)
2. `Zalo CN Send` → gửi welcome (threadId: `{{ $json.threadId }}`, message: "Chào mừng {{ $json.eventData.updateMembers[0].dName }}!")

**Phát hiện admin bị xóa (cảnh báo bảo mật)**:
1. Trigger: `Zalo CN Group Event Trigger` (Event Types: REMOVE_ADMIN)
2. Check `eventData.sourceId` và `eventData.updateMembers`
3. Gửi cảnh báo khẩn

---

## 9. Zalo CN Poll

**Mục đích**: Tạo và quản lý bình chọn (poll) trong nhóm Zalo.

**Group**: Organization | **Credential**: `zaloApi` (required)

### Operations

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 1 | Tạo Bình Chọn | `createPoll(...)` | Tạo poll mới trong nhóm |
| 2 | Lấy Thông Tin | `getPollDetail(id)` | Xem kết quả poll |
| 3 | Khóa Bình Chọn | `lockPoll(id)` | Khóa poll (không vote được nữa) |

### Parameters — Tạo Bình Chọn

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **ID Nhóm** | string | (required) | Group ID để tạo poll |
| **Chủ Đề** | string | (required) | Câu hỏi bình chọn |
| **Kiểu Nhập** | options | List | `List` (từng option riêng) hoặc `Text` (comma-separated) |
| **Các Lựa Chọn** | fixedCollection | 2 options | Danh sách lựa chọn (nếu List) |
| **Các Lựa Chọn** | string | "Lựa chọn 1, LC 2, LC 3" | Comma-separated (nếu Text) |
| Thời Hạn | dateTime | (empty) | Hết hạn poll (để trống = không hạn) |
| Ghim Đầu Trò Chuyện | boolean | false | Ghim poll lên đầu |
| Chọn Nhiều Phương Án | boolean | true | Cho phép chọn nhiều |
| Có Thể Thêm Phương Án | boolean | true | Thành viên được thêm option |
| Ẩn Kết Quả Khi Chưa BC | boolean | false | Chỉ hiện kết quả sau khi vote |
| Ẩn Người Bình Chọn | boolean | false | Ẩn danh tính người vote |

### Parameters — Lấy/Khóa Bình Chọn

```
Poll ID: (number) ID của poll
```

### Output — Tạo Poll

```json
{
  "success": true,
  "response": { "pollId": 123456 },
  "groupId": "123456789",
  "createPollData": {
    "question": "Bạn thích màu nào?",
    "options": ["Đỏ", "Xanh", "Vàng"],
    "expiredTime": 0,
    "pinAct": true,
    "allowMultiChoices": true,
    "allowAddNewOption": true,
    "hideVotePreview": false,
    "isAnonymous": false
  }
}
```

### Output — Lấy Poll

```json
{
  "success": true,
  "response": {
    "pollId": 123456,
    "question": "Bạn thích màu nào?",
    "options": [
      { "id": 1, "option": "Đỏ", "voteCount": 5 },
      { "id": 2, "option": "Xanh", "voteCount": 3 },
      { "id": 3, "option": "Vàng", "voteCount": 2 }
    ],
    "totalVotes": 10,
    "isLocked": false,
    "isExpired": false
  }
}
```

### Ví Dụ

**Tạo poll khảo sát cuối tuần**:
1. `Zalo CN Poll` → `Tạo Bình Chọn`
   - Chủ đề: "Cuối tuần đi đâu?"
   - Options: "Biển, Núi, Ở nhà"
   - Ghim: ON
   - Thời hạn: Thứ 6

---

## 10. Zalo CN Tag

**Mục đích**: Quản lý nhãn (tag/label) trong Zalo — phân loại hội thoại.

**Group**: Organization | **Credential**: `zaloApi` (required)

### Operations

| # | Operation | API Method | Mô Tả |
|---|-----------|-----------|-------|
| 1 | Danh Sách Thẻ | `getLabels()` | Liệt kê tất cả thẻ hiện có |
| 2 | Cập Nhật Thẻ | `updateLabels(...)` | Tạo mới, sửa, xóa thẻ |

### Parameters — Danh Sách Thẻ

Không cần params.

### Parameters — Cập Nhật Thẻ

| Param | Type | Default | Mô Tả |
|-------|------|---------|-------|
| **Thẻ (JSON)** | json | (sample) | Mảng JSON các thẻ mới |
| Version | number | 0 | Version từ lần list trước |

### Cấu Trúc LabelData

```json
[
  {
    "id": 0,
    "text": "Khách VIP",
    "color": "#FF0000",
    "emoji": "⭐",
    "conversations": ["threadId1", "threadId2"],
    "textKey": "vip"
  },
  {
    "id": 1,
    "text": "Đối Tác",
    "color": "#00FF00",
    "conversations": []
  }
]
```

- **id: 0** = tạo thẻ mới (Zalo tự gán ID)
- **id có sẵn** = cập nhật thẻ
- **Bỏ thẻ khỏi mảng** = xóa thẻ
- **conversations**: mảng thread ID để gán thẻ vào hội thoại

### Output — List

```json
{
  "success": true,
  "labels": [
    {
      "id": 1,
      "text": "Khách VIP",
      "textKey": "vip",
      "color": "#FF0000",
      "emoji": "⭐",
      "conversations": ["123456789"],
      "offset": 0,
      "createTime": 1718323200000
    }
  ]
}
```

### Quy Trình Cập Nhật Thẻ

1. **List** → lấy danh sách thẻ hiện tại + version
2. Sửa mảng JSON (thêm/sửa/xóa)
3. **Update** → gửi toàn bộ mảng mới + version

### Ví Dụ

**Tự động gán tag "Khách Hàng" cho người nhắn tin**:
1. Trigger: `Zalo CN Message Trigger`
2. `Zalo CN Tag` → `Danh Sách Thẻ`
3. Edit Fields (thêm threadId vào `conversations` của tag)
4. `Zalo CN Tag` → `Cập Nhật Thẻ`

---

## 11. Workflow Ví Dụ

### 11.1 Auto-reply Chatbot Cơ Bản

```
[Webhook/Zalo CN Message Trigger]
    ↓
[IF (message contains "giá")] → [Zalo CN Send: "Giá sản phẩm là..."]
[IF (message contains "hỗ trợ")] → [Zalo CN Send: "Vui lòng gọi hotline..."]
[ELSE] → [Zalo CN Send: "Cảm ơn bạn đã nhắn tin!"]
```

### 11.2 Marketing Automation

```
[Schedule Trigger (mỗi ngày 8h sáng)]
    ↓
[Zalo CN User → Lấy Danh Sách Bạn Bè]
    ↓
[Loop qua từng bạn]
    ↓
[Zalo CN Send → Text Message với {{ $json.displayName }}]
    ↓
[Wait 2-5 giây (rate limit)]
```

### 11.3 Quản Lý Nhóm Tự Động

```
[Zalo CN Group Event Trigger (JOIN)]
    ↓
[Zalo CN Send: "Chào mừng thành viên mới!"]
    ↓
[Wait 5 phút]
    ↓
[Zalo CN Group → Tạo Ghi Chú: "Nội quy nhóm"]

---

[Zalo CN Group Event Trigger (JOIN_REQUEST)]
    ↓
[Zalo CN Group → Phê Duyệt (auto-approve)]
    ↓
[Zalo CN Send: "Bạn đã được duyệt vào nhóm!"]
```

### 11.4 CRM Integration

```
[Webhook (từ CRM/Form)]
    ↓
[Zalo CN User → Tìm Kiếm Người Dùng (phone)]
    ↓
[IF tìm thấy]
    ↓
[Zalo CN Send → Text Message]
[Zalo CN Tag → Cập Nhật Thẻ (gán tag "Lead")]
    ↓
[Zalo CN Send → Bank Card (nếu cần thanh toán)]
```

### 11.5 Notification System

```
[Database/Cron Trigger]
    ↓
[Zalo CN Group → Lấy Tất Cả Nhóm]
    ↓
[Loop]
    ↓
[Zalo CN Group Event Trigger (filter: REMOVE_MEMBER)]
    ↓
[Zalo CN Send → cảnh báo admin: "User X đã bị kick khỏi nhóm Y"]
```

---

## Rate Limiting & Best Practices

### Giới Hạn Zalo

- **Tần suất gửi tin nhắn**: ~1-2 tin/giây để tránh bị khóa
- **Số lượng tin nhắn/ngày**: Không spam >1000 tin/ngày
- **Số lượng nhóm có thể tạo**: Giới hạn theo tài khoản

### Best Practices

1. **Dùng tài khoản test**, không dùng tài khoản chính
2. **Thêm delay** giữa các lần gửi (node Wait 1-3s)
3. **Bắt lỗi** với Continue on Fail
4. **Log** tất cả hoạt động để debug
5. **Không spam** — tôn trọng người nhận
6. **Dùng webhook trigger** thay vì polling để real-time

### Error Handling

Tất cả node hỗ trợ **Continue on Fail** — khi bật, node sẽ trả về `{ error: "message" }` thay vì dừng workflow.

```json
{
  "error": "User not found"
}
```

---

## Hỗ Trợ

- **GitHub**: https://github.com/DevBotDiscord/n8n-nodes-ryan-zalo
- **npm**: https://www.npmjs.com/package/n8n-nodes-ryan-zalo
- **Tác giả**: DevBotDiscord (quandev2k7@gmail.com)
- **Dựa trên**: zalo-api-final by Hien Nguyen Juno
