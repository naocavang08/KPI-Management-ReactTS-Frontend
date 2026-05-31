# Tài liệu API - Hệ thống Quản lý KPI (KPI Management System)
*Cập nhật lúc: 15:15 ngày 31/05/2026 (Version 4)*

Tài liệu này tổng hợp toàn bộ các API hiện tại của hệ thống Backend (Spring Boot) bao gồm các module Authentication, Users, Roles & Permissions, Task Management, Task Extensions, Task History, KPI Core, KPI Reviews, KPI Appeals, KPI Weights, KPI Reports (Excel Export), và Team Management.

---

## ⚙️ Thông tin chung

### Base URL
*   **Môi trường Local**: `http://localhost:8080`
*   **Môi trường Production (Render)**: `https://kpi-be.onrender.com`

### Headers Mặc định
Đối với mọi Request (trừ các API đăng nhập, quên mật khẩu), bạn cần gửi kèm:
*   `Content-Type: application/json`
*   `Authorization: Bearer <accessToken>` (Token nhận được sau khi đăng nhập thành công)

### Tài khoản mặc định (Seed Data)

| Username | Password | Role    | Email             | Department | Team         |
|----------|----------|---------|-------------------|------------|--------------|
| admin    | 1234567  | ADMIN   | admin@gmail.com   | HR         | HR Department |
| manager  | 1234567  | MANAGER | manager@gmail.com | IT         | IT Department |
| staff    | 1234567  | STAFF   | staff@gmail.com   | IT         | IT Department |

---

## 🔒 1. Nhóm API Authentication & Profile (`/auth/**`)

### 1.1 Đăng nhập (Login)
*   **Method**: `POST`
*   **URL**: `/auth/login`
*   **Lưu ý bảo mật**:
    *   Sau **5 lần đăng nhập sai** liên tiếp, tài khoản sẽ bị khóa tạm thời **15 phút**.
    *   Tài khoản bị Admin khóa thủ công (`isActive = false`) sẽ không thể đăng nhập và nhận thông báo lỗi cụ thể.
*   **Body (JSON)**:
    ```json
    {
      "username": "admin",
      "password": "1234567"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...",
      "type": "Bearer"
    }
    ```

### 1.2 Lấy thông tin cá nhân (Get Me)
*   **Method**: `GET`
*   **URL**: `/auth/me`
*   **Headers**: Cần Authorization Token.
*   **Response (200 OK)**:
    ```json
    {
      "user": {
        "id": 1,
        "email": "admin@gmail.com",
        "username": "admin",
        "displayName": "Admin System",
        "avatarUrl": "https://example.com/avatar.jpg",
        "isActive": true,
        "position": "System Admin",
        "type": "STAFF",
        "status": "ACTIVE",
        "lockReason": null,
        "department": "HR",
        "managerId": null,
        "teamId": 2,
        "lastLoginAt": "2026-05-27T15:00:00",
        "createdAt": "2026-05-27T14:00:00",
        "updatedAt": "2026-05-27T15:00:00",
        "lockedUntil": null,
        "isDeleted": false,
        "deletedAt": null,
        "roles": [
          {
            "id": 1,
            "name": "ADMIN",
            "displayName": "Administrator",
            "description": "System Administrator",
            "isSystem": true
          }
        ]
      },
      "permissions": [
        {
          "resource": "SYSTEM",
          "action": "ACCESS",
          "scope": "ALL"
        }
      ]
    }
    ```
    > **Ghi chú `permissions`**: Scope = `"ALL"` (ADMIN) | `"TEAM"` (MANAGER) | `"SELF"` (STAFF).

### 1.3 Cập nhật Họ & Tên của bản thân (Update Fullname)
*   **Method**: `PATCH`
*   **URL**: `/auth/me/fullname`
*   **Body (JSON)**:
    ```json
    {
      "fullname": "Nguyễn Văn A"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Fullname updated successfully"
    }
    ```

### 1.4 Cập nhật ảnh đại diện của bản thân (Update Avatar)
*   **Method**: `PATCH`
*   **URL**: `/auth/me/avatar`
*   **Body (JSON)**:
    ```json
    {
      "avatarUrl": "https://new-avatar-link.com/avatar.png"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Avatar updated successfully"
    }
    ```

### 1.5 Đổi mật khẩu của bản thân (Change Password)
*   **Method**: `PATCH`
*   **URL**: `/auth/me/password`
*   **Body (JSON)**:
    ```json
    {
      "oldPassword": "oldsecurepassword",
      "newPassword": "newsecurepassword123",
      "confirmPassword": "newsecurepassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Password updated successfully"
    }
    ```

### 1.6 Yêu cầu gửi mã OTP khôi phục mật khẩu (Forgot Password)
*   **Method**: `POST`
*   **URL**: `/auth/forgot-password`
*   **Body (JSON)**:
    ```json
    {
      "email": "vpsacc21@gmail.com"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "OTP has been sent to your email."
    }
    ```

### 1.7 Khôi phục mật khẩu bằng OTP (Reset Password)
*   **Method**: `POST`
*   **URL**: `/auth/reset-password`
*   **Lưu ý**: OTP có hiệu lực **5 phút**. Tối đa **3 lần nhập sai** sẽ hủy OTP yêu cầu gửi lại.
*   **Body (JSON)**:
    ```json
    {
      "email": "vpsacc21@gmail.com",
      "otp": "123456",
      "newPassword": "newpassword123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Password has been reset successfully."
    }
    ```

---

## 👥 2. Nhóm API Quản lý Người dùng (`/users/**`)

### 2.1 Lấy danh sách Người dùng (Phân trang & Bộ lọc)
*   **Method**: `GET`
*   **URL**: `/users`
*   **Quyền hạn**: Role `ADMIN`
*   **Query Parameters (Tùy chọn)**:
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
    *   `name`: Lọc theo họ tên người dùng
    *   `email`: Lọc theo email
    *   `status`: Lọc theo trạng thái (`active`, `inactive`, `locked`)
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 2,
          "email": "staff@gmail.com",
          "username": "staff",
          "displayName": "Staff Member",
          "avatarUrl": null,
          "isActive": true,
          "position": "Developer",
          "type": "STAFF",
          "status": "ACTIVE",
          "lockReason": null,
          "department": "IT",
          "managerId": 3,
          "teamId": 1,
          "lastLoginAt": null,
          "createdAt": "2026-05-27T14:00:00",
          "updatedAt": "2026-05-27T14:00:00",
          "lockedUntil": null,
          "isDeleted": false,
          "deletedAt": null,
          "roles": []
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalElements": 1,
        "totalPages": 1
      }
    }
    ```

### 2.2 Admin tạo người dùng mới (Create User)
*   **Method**: `POST`
*   **URL**: `/users`
*   **Quyền hạn**: Role `ADMIN`
*   **Lưu ý**: Hệ thống tự động sinh mật khẩu ngẫu nhiên 10 ký tự khi tạo tài khoản mới.
*   **Body (JSON)**:
    ```json
    {
      "username": "nguyenvanb",
      "fullName": "Nguyễn Văn B",
      "email": "nguyenvanb@gmail.com",
      "position": "Tester",
      "type": "STAFF",
      "avatar": "https://example.com/avatar.jpg",
      "teamId": 1
    }
    ```
    > **Ghi chú trường `username`**: Bắt buộc. 3–50 ký tự, chỉ gồm chữ cái, số, dấu gạch dưới (`_`) và dấu chấm (`.`).
    > **Ghi chú trường `type`**: `INTERNSHIP` | `STAFF` | `COLLABORATOR`.
    > **Ghi chú trường `teamId`**: Tùy chọn. ID số của Team cần gán cho user.

*   **Response (201 Created)**:
    ```json
    {
      "id": 3,
      "email": "nguyenvanb@gmail.com",
      "username": "nguyenvanb",
      "displayName": "Nguyễn Văn B",
      "avatarUrl": "https://example.com/avatar.jpg",
      "isActive": true,
      "position": "Tester",
      "type": "STAFF",
      "status": "ACTIVE",
      "lockReason": null,
      "department": null,
      "managerId": null,
      "teamId": 1,
      "lastLoginAt": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T10:00:00",
      "lockedUntil": null,
      "isDeleted": false,
      "deletedAt": null,
      "roles": []
    }
    ```

### 2.3 Xem chi tiết người dùng
*   **Method**: `GET`
*   **URL**: `/users/{id}`
*   **Quyền hạn**: Role `ADMIN` **hoặc** chính User đó (tự xem thông tin của mình).
*   **Response (200 OK)**: Trả về thông tin chi tiết của User có ID tương ứng (cấu trúc giống object user ở 2.2).

### 2.4 Cập nhật thông tin người dùng
*   **Method**: `PUT`
*   **URL**: `/users/{id}`
*   **Quyền hạn**: Role `ADMIN` **hoặc** chính User đó (tự cập nhật thông tin của mình).
*   **Body (JSON)** (Các trường đều là tùy chọn):
    ```json
    {
      "fullName": "Tên Mới",
      "position": "Vị trí mới",
      "type": "STAFF",
      "avatar": "https://link.com/new.jpg",
      "status": "ACTIVE",
      "lockedUntil": null,
      "teamId": 2
    }
    ```
    > **Ghi chú trường `status`**: `ACTIVE` | `LOCKED` | `INACTIVE`.
    > **Ghi chú trường `teamId`**: Tùy chọn. ID số của Team mới cần gán.

*   **Response (200 OK)**: Trả về thông tin User sau khi cập nhật.

### 2.5 Xóa người dùng (Soft Delete)
*   **Method**: `DELETE`
*   **URL**: `/users/{id}`
*   **Quyền hạn**: Role `ADMIN`
*   **Lưu ý**: Admin không thể tự xóa tài khoản của chính mình.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User successfully marked as deleted."
    }
    ```

### 2.6 Khóa tài khoản người dùng (Lock User)
*   **Method**: `PUT`
*   **URL**: `/users/{id}/lock`
*   **Quyền hạn**: Role `ADMIN`
*   **Lưu ý**: Admin không thể tự khóa tài khoản của chính mình.
*   **Body (JSON)** (Tùy chọn lý do khóa):
    ```json
    {
      "reason": "Vi phạm quy định của hệ thống"
    }
    ```
*   **Response (200 OK)**: Trả về thông tin User đã bị khóa (`isActive` thành `false`, `status` thành `LOCKED`).

### 2.7 Mở khóa tài khoản người dùng (Unlock User)
*   **Method**: `PUT`
*   **URL**: `/users/{id}/unlock`
*   **Quyền hạn**: Role `ADMIN`
*   **Response (200 OK)**: Trả về thông tin User sau khi mở khóa (`isActive` thành `true`, `status` thành `ACTIVE`, `failedAttempt` reset về `0`).

### 2.8 Gán Role cho người dùng
*   **Method**: `POST`
*   **URL**: `/users/{id}/roles`
*   **Quyền hạn**: Role `ADMIN`
*   **Body (JSON)**:
    ```json
    {
      "roleId": 1
    }
    ```
*   **Response (201 Created)**: Không có dữ liệu trả về (Body rỗng).

### 2.9 Xem danh sách các Role của một người dùng
*   **Method**: `GET`
*   **URL**: `/users/{id}/roles`
*   **Quyền hạn**: Role `ADMIN` **hoặc** chính User đó.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 2,
        "name": "STAFF",
        "displayName": "Staff User",
        "description": "Regular staff member"
      }
    ]
    ```

### 2.10 Gỡ bỏ Role khỏi người dùng
*   **Method**: `DELETE`
*   **URL**: `/users/{id}/roles/{roleId}`
*   **Quyền hạn**: Role `ADMIN`
*   **Response (204 No Content)**: Trả về thành công và không có body.

---

## 🛡️ 3. Nhóm API Quản lý Role & Permission (`/roles/**`)
*(Các API này yêu cầu Token có quyền **ADMIN**)*

### 3.1 Lấy toàn bộ danh sách Role trong hệ thống
*   **Method**: `GET`
*   **URL**: `/roles`
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "name": "ADMIN",
        "displayName": "Administrator",
        "description": "System Administrator",
        "isSystem": true,
        "createdAt": "2026-05-27T14:00:00",
        "createdBy": null,
        "updatedAt": "2026-05-27T14:00:00",
        "updatedBy": null
      }
    ]
    ```

### 3.2 Xem chi tiết một Role (Get Role by ID)
*   **Method**: `GET`
*   **URL**: `/roles/{id}`
*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "ADMIN",
      "displayName": "Administrator",
      "description": "System Administrator",
      "isSystem": true,
      "createdAt": "2026-05-27T14:00:00",
      "createdBy": null,
      "updatedAt": "2026-05-27T14:00:00",
      "updatedBy": null
    }
    ```

### 3.3 Tạo mới một Role
*   **Method**: `POST`
*   **URL**: `/roles`
*   **Body (JSON)**:
    ```json
    {
      "name": "LEADER",
      "displayName": "Team Leader",
      "description": "Leader of team",
      "isSystem": false
    }
    ```
*   **Response (201 Created)**: Trả về thông tin Role vừa tạo.

### 3.4 Cập nhật thông tin Role
*   **Method**: `PUT`
*   **URL**: `/roles/{id}`
*   **Body (JSON)**: Giống cấu trúc Request Body tạo mới.
*   **Response (200 OK)**: Trả về thông tin Role sau cập nhật.

### 3.5 Xóa một Role
*   **Method**: `DELETE`
*   **URL**: `/roles/{id}`
*   **Response (204 No Content)**: Trả về thành công, không có body.

### 3.6 Xem danh sách các Permission (quyền) của một Role
*   **Method**: `GET`
*   **URL**: `/roles/{id}/permissions`
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "resource": "user",
        "action": "create",
        "description": "Create user"
      }
    ]
    ```

### 3.7 Gán Permission cho Role
*   **Method**: `POST`
*   **URL**: `/roles/{id}/permissions`
*   **Body (JSON)**:
    ```json
    {
      "permissionId": 1
    }
    ```
*   **Response (201 Created)**: Trả về thành công, không có body.

### 3.8 Gỡ bỏ Permission khỏi Role
*   **Method**: `DELETE`
*   **URL**: `/roles/{id}/permissions/{permissionId}`
*   **Response (204 No Content)**: Trả về thành công, không có body.

### 3.9 Lấy toàn bộ danh sách Permission trong hệ thống (Get All Permissions)
*   **Method**: `GET`
*   **URL**: `/permissions`
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "resource": "user",
        "action": "create",
        "description": "Create user"
      },
      {
        "id": 2,
        "resource": "kpi/task",
        "action": "update",
        "description": "Update task"
      }
    ]
    ```

---

## 📋 4. Nhóm API Quản lý Task (`/tasks/**`)
*(Yêu cầu người dùng đã đăng nhập. Các quyền chi tiết được chỉ định dưới từng API)*

### 4.1 Tạo mới Task (Create Task)
*   **Method**: `POST`
*   **URL**: `/tasks`
*   **Quyền hạn**: Authority `KPI/TASK:CREATE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Người tạo Task (Manager) và người được giao (Assignee) phải thuộc **cùng một Team** (`team.id` phải giống nhau). Vi phạm sẽ trả về lỗi `400`.
    *   `deadline` phải là thời gian **trong tương lai**.
*   **Body (JSON)**:
    ```json
    {
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "assigneeId": 3,
      "deadline": "2026-06-15T18:00:00",
      "priority": "HIGH"
    }
    ```
    > **Ghi chú trường `priority`**: `LOW` | `MEDIUM` | `HIGH`. Mặc định là `null` nếu không truyền.

*   **Response (201 Created)**:
    ```json
    {
      "id": 10,
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "managerId": 2,
      "managerName": "IT Manager",
      "assigneeId": 3,
      "assigneeName": "IT Staff",
      "deadline": "2026-06-15T18:00:00",
      "status": "ASSIGNED",
      "priority": "HIGH",
      "progress": 0,
      "tags": null,
      "evidence": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T10:00:00"
    }
    ```
    > **Ghi chú trường `status`**: `ASSIGNED` | `IN_PROGRESS` | `PENDING_REVIEW` | `COMPLETED` | `OVERDUE`.

### 4.2 Xem chi tiết một Task (Get Task by ID)
*   **Method**: `GET`
*   **URL**: `/tasks/{id}`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW` hoặc role `ADMIN`
*   **Ràng buộc phân quyền**:
    *   **ADMIN**: xem mọi task.
    *   **MANAGER**: chỉ xem task do mình tạo, hoặc task của nhân viên cùng phòng ban / được quản lý trực tiếp.
    *   **STAFF**: chỉ xem task mà họ là assignee.
*   **Response (200 OK)**:
    ```json
    {
      "id": 10,
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "managerId": 2,
      "managerName": "IT Manager",
      "assigneeId": 3,
      "assigneeName": "IT Staff",
      "deadline": "2026-06-15T18:00:00",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 30,
      "tags": ["Database", "KPI"],
      "evidence": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T11:30:00"
    }
    ```

### 4.3 Lấy danh sách Task (Phân trang & Bộ lọc)
*   **Method**: `GET`
*   **URL**: `/tasks`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW` hoặc role `ADMIN`
*   **Ràng buộc phân quyền**: Giống API 4.2 (ADMIN thấy tất, MANAGER thấy trong phòng ban, STAFF chỉ thấy task của mình).
*   **Query Parameters (Tùy chọn)**:
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
    *   `search`: Tìm kiếm theo tiêu đề hoặc mô tả Task
    *   `status`: Lọc theo trạng thái (`ASSIGNED`, `IN_PROGRESS`, `PENDING_REVIEW`, `COMPLETED`, `OVERDUE`)
    *   `priority`: Lọc theo độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`)
    *   `assigneeId`: Lọc theo ID nhân viên được giao việc
    *   `teamId`: Lọc theo department code của team
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 10,
          "title": "Hoàn thiện thiết kế Database module KPI",
          "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
          "managerId": 2,
          "managerName": "IT Manager",
          "assigneeId": 3,
          "assigneeName": "IT Staff",
          "deadline": "2026-06-15T18:00:00",
          "status": "IN_PROGRESS",
          "priority": "HIGH",
          "progress": 30,
          "tags": ["Database", "KPI"],
          "evidence": null,
          "createdAt": "2026-05-30T10:00:00",
          "updatedAt": "2026-05-30T11:30:00"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalElements": 1,
        "totalPages": 1
      }
    }
    ```

### 4.4 Chấp nhận hoàn thành Task (Complete Task)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/complete`
*   **Quyền hạn**: Authority `KPI/TASK:APPROVE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Chỉ **người tạo Task** (`managerId`) mới có quyền phê duyệt.
    *   Task phải ở trạng thái **`PENDING_REVIEW`** mới có thể phê duyệt.
    *   Khi phê duyệt thành công: `status` → `COMPLETED`, `progress` → `100`.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task successfully approved and completed"
    }
    ```

### 4.5 Từ chối hoàn thành Task (Reject Task)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/reject`
*   **Quyền hạn**: Authority `KPI/TASK:REJECT` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Chỉ **người tạo Task** (`managerId`) mới có quyền từ chối.
    *   Task phải ở trạng thái **`PENDING_REVIEW`** mới có thể từ chối.
    *   Khi từ chối: `status` → `IN_PROGRESS` (tiến độ giữ nguyên).
*   **Body (JSON)**:
    ```json
    {
      "note": "Kết quả chạy thử vẫn bị lỗi trùng lặp dữ liệu, vui lòng kiểm tra lại."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task successfully rejected"
    }
    ```

### 4.6 Cập nhật thông tin Task (Update Task)
*   **Method**: `PUT`
*   **URL**: `/tasks/{id}`
*   **Quyền hạn**: Authority `KPI/TASK:UPDATE` hoặc role `ADMIN`
*   **Ràng buộc**: Chỉ **người tạo Task** (`managerId`) hoặc **ADMIN** mới có thể sửa.
*   **Body (JSON)** (Các trường đều là tùy chọn):
    ```json
    {
      "title": "Thiết kế Database module KPI nâng cao",
      "description": "Bổ sung trường rating và tính toán điểm tổng hợp.",
      "assigneeId": 3,
      "deadline": "2026-06-20T18:00:00",
      "priority": "HIGH",
      "tags": ["Database", "KPI", "Optimization"]
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 10,
      "title": "Thiết kế Database module KPI nâng cao",
      "description": "Bổ sung trường rating và tính toán điểm tổng hợp.",
      "managerId": 2,
      "managerName": "IT Manager",
      "assigneeId": 3,
      "assigneeName": "IT Staff",
      "deadline": "2026-06-20T18:00:00",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 30,
      "tags": ["Database", "KPI", "Optimization"],
      "evidence": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T12:00:00"
    }
    ```

### 4.7 Xóa Task (Delete Task)
*   **Method**: `DELETE`
*   **URL**: `/tasks/{id}`
*   **Quyền hạn**: Authority `KPI/TASK:DELETE` hoặc role `ADMIN`
*   **Ràng buộc**: Chỉ **người tạo Task** (`managerId`) hoặc **ADMIN** mới có thể xóa.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task successfully marked as deleted."
    }
    ```

### 4.8 Lấy thống kê/tổng hợp trạng thái Task (Task Summary)
*   **Method**: `GET`
*   **URL**: `/tasks/summary`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW_SUMMARY` hoặc role `ADMIN`
*   **Ràng buộc phân quyền**: ADMIN thấy toàn bộ hệ thống, MANAGER thấy trong phòng ban, STAFF chỉ thấy task của mình.
*   **Response (200 OK)**:
    ```json
    {
      "assigned": 3,
      "inProgress": 5,
      "pendingReview": 2,
      "completed": 12,
      "overdue": 1
    }
    ```

### 4.9 Cập nhật tiến độ & trạng thái Task (Update Task Progress)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/progress`
*   **Quyền hạn**: Authority `KPI/TASK:UPDATE_PROGRESS` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Chỉ **người được giao Task** (`assigneeId`) mới có thể cập nhật tiến độ.
    *   Trường `status` trong body **bắt buộc phải là `"IN_PROGRESS"`**.
    *   Trường `progress` phải nằm trong khoảng **0 đến 99** (không thể đặt 100 qua API này — dùng Submit để hoàn thành).
*   **Body (JSON)**:
    ```json
    {
      "status": "IN_PROGRESS",
      "progress": 75
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 10,
      "title": "Thiết kế Database module KPI nâng cao",
      "description": "Bổ sung trường rating và tính toán điểm tổng hợp.",
      "managerId": 2,
      "managerName": "IT Manager",
      "assigneeId": 3,
      "assigneeName": "IT Staff",
      "deadline": "2026-06-20T18:00:00",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "progress": 75,
      "tags": ["Database", "KPI", "Optimization"],
      "evidence": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T13:00:00"
    }
    ```

### 4.10 Nộp báo cáo hoàn thành Task (Submit Task)
*   **Method**: `POST`
*   **URL**: `/tasks/{id}/submit`
*   **Quyền hạn**: Authority `KPI/TASK:SUBMIT` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Chỉ **người được giao Task** (`assigneeId`) mới có thể nộp.
    *   Khi nộp thành công: `progress` → `100`, `status` → `PENDING_REVIEW`.
*   **Body (JSON)** (Tùy chọn):
    ```json
    {
      "evidence": "https://github.com/hvduong/kpi-repo/pull/12"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task submitted successfully."
    }
    ```

### 4.11 Lấy danh sách Task nội bộ Team (Get Team Tasks)
*   **Method**: `GET`
*   **URL**: `/tasks/team/{teamId}`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW` hoặc role `ADMIN`
*   **Ràng buộc phân quyền**: Chỉ ADMIN, Trưởng phòng (Leader) của team đó, hoặc các nhân viên thuộc team đó mới được quyền truy cập. Các trường hợp truy cập chéo phòng ban khác sẽ bị từ chối với lỗi `403 Forbidden`.
*   **Query Parameters (Tùy chọn)**:
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
    *   `status`: Lọc theo trạng thái của Task (`ASSIGNED`, `IN_PROGRESS`, `PENDING_REVIEW`, `COMPLETED`, `OVERDUE`)
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 10,
          "title": "Hoàn thiện thiết kế Database module KPI",
          "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
          "managerId": 2,
          "managerName": "IT Manager",
          "assigneeId": 3,
          "assigneeName": "IT Staff",
          "deadline": "2026-06-15T18:00:00",
          "status": "IN_PROGRESS",
          "priority": "HIGH",
          "progress": 30,
          "tags": ["Database", "KPI"],
          "evidence": null,
          "createdAt": "2026-05-30T10:00:00",
          "updatedAt": "2026-05-30T11:30:00"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalElements": 1,
        "totalPages": 1
      }
    }
    ```

### 4.12 Xóa nhanh toàn bộ Task của Team (Bulk Soft Delete Team Tasks)
*   **Method**: `DELETE`
*   **URL**: `/tasks/team/{teamId}`
*   **Quyền hạn**: Authority `KPI/TASK:DELETE` hoặc role `ADMIN`
*   **Ràng buộc**: Chỉ ADMIN hoặc LEADER của team đó mới được quyền xóa. Thực hiện chuyển toàn bộ task đang hoạt động (`isDeleted = false`) của team này sang trạng thái xóa mềm (`isDeleted = true`).
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "All team tasks successfully marked as deleted."
    }
    ```

### 4.13 Khôi phục Task đã xóa mềm (Restore Task)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/restore`
*   **Quyền hạn**: Authority `KPI/TASK:UPDATE` hoặc role `ADMIN`
*   **Ràng buộc**: Chỉ cho phép khôi phục Task đang có `isDeleted = true`. Người thực hiện phải là ADMIN, Team Leader, Task Creator, hoặc Task Assignee.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task successfully restored."
    }
    ```

### 4.14 Xóa cứng Task (Permanent Delete Task)
*   **Method**: `DELETE`
*   **URL**: `/tasks/{id}/permanent`
*   **Quyền hạn**: Authority `KPI/TASK:DELETE` hoặc role `ADMIN`
*   **Ràng buộc**: Chỉ ADMIN hoặc Team Leader của task đó mới có quyền thực hiện. Task bắt buộc phải đang có trạng thái xóa mềm (`isDeleted = true`) trước. Hệ thống sẽ tự động dọn dẹp sạch sẽ lịch sử thay đổi (`TaskHistory`) và thông tin gia hạn (`TaskExtension`) trước khi xóa vĩnh viễn Task khỏi CSDL.
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task permanently deleted."
    }
    ```

### 4.15 Lấy danh sách Task trong thùng rác (Get Trash Tasks)
*   **Method**: `GET`
*   **URL**: `/tasks/trash`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW` hoặc role `ADMIN`
*   **Ràng buộc phân quyền**: Chỉ ADMIN hoặc LEADER mới được gọi. LEADER chỉ được xem các task đã xóa của team do mình quản lý.
*   **Query Parameters (Tùy chọn)**:
    *   `teamId`: Lọc theo ID của team (Bắt buộc đối với LEADER; đối với ADMIN có thể để trống để xem toàn bộ hệ thống).
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 10,
          "title": "Hoàn thiện thiết kế Database module KPI",
          "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
          "managerId": 2,
          "managerName": "IT Manager",
          "assigneeId": 3,
          "assigneeName": "IT Staff",
          "deadline": "2026-06-15T18:00:00",
          "status": "IN_PROGRESS",
          "priority": "HIGH",
          "progress": 30,
          "tags": ["Database", "KPI"],
          "evidence": null,
          "createdAt": "2026-05-30T10:00:00",
          "updatedAt": "2026-05-30T11:30:00"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalElements": 1,
        "totalPages": 1
      }
    }
    ```

---

## ⏳ 5. Nhóm API Gia hạn Task (`/tasks/{id}/extension/**`)

### 5.1 Gửi yêu cầu gia hạn Task (Request Task Extension)
*   **Method**: `POST`
*   **URL**: `/tasks/{id}/extension`
*   **Quyền hạn**: Authority `KPI/TASK:EXTEND` hoặc role `ADMIN`
*   **Body (JSON)**:
    ```json
    {
      "requestedDeadline": "2026-06-25T18:00:00",
      "reason": "Phát sinh thêm yêu cầu bảo mật nên cần thời gian tối ưu hóa code."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task extension requested successfully"
    }
    ```

### 5.2 Phê duyệt/Bác bỏ yêu cầu gia hạn (Approve/Reject Task Extension)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/extension/approve`
*   **Quyền hạn**: Authority `KPI/TASK:APPROVE_EXTENSION` hoặc role `ADMIN`
*   **Body (JSON)**:
    ```json
    {
      "approved": true,
      "managerNote": "Đồng ý gia hạn thêm 5 ngày để hoàn thiện kiểm thử."
    }
    ```
    > **Ghi chú**: `approved = true` để chấp nhận đổi deadline, `approved = false` để bác bỏ.

*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task extension processed successfully"
    }
    ```

---

## 📜 6. Nhóm API Lịch sử Thay đổi Task (`/tasks/{id}/history`)

### 6.1 Xem lịch sử thay đổi của Task (Get Task History)
*   **Method**: `GET`
*   **URL**: `/tasks/{id}/history`
*   **Quyền hạn**: Chỉ cần đã đăng nhập (không yêu cầu quyền đặc biệt).
*   **Mô tả**: Trả về toàn bộ nhật ký thay đổi trạng thái, tiến độ và ghi chú tương ứng của một Task.
*   **Response (200 OK)**:
    ```json
    [
      {
        "status": "IN_PROGRESS",
        "progress": 75,
        "changedByName": "IT Staff",
        "note": "Task progress updated to 75%",
        "createdAt": "2026-05-30T13:00:00"
      },
      {
        "status": "PENDING_REVIEW",
        "progress": 100,
        "changedByName": "IT Staff",
        "note": "Task submitted for review",
        "createdAt": "2026-05-30T14:30:00"
      }
    ]
    ```

---

## 📊 7. Nhóm API Điểm số KPI (`/kpi/**`)
*(Yêu cầu người dùng đã đăng nhập thành công. Các API của phân hệ KPI được bảo vệ bằng JWT)*

### 7.1 Lấy thông tin điểm KPI cá nhân (Get User KPI)
*   **Method**: `GET`
*   **URL**: `/kpi/user/{userId}`
*   **Quyền hạn**: Authority `KPI:VIEW_SELF` (xem của bản thân), `KPI:VIEW_TEAM` (MANAGER xem nhân viên trong team), hoặc role `ADMIN`
*   **Ràng buộc phân quyền**:
    *   **STAFF**: chỉ xem KPI của chính mình.
    *   **MANAGER**: xem KPI của bản thân, nhân viên cùng phòng ban, hoặc nhân viên được quản lý trực tiếp (`managerId`).
    *   **ADMIN**: xem bất kỳ.
*   **Query Parameters (Tùy chọn)**:
    *   `year`: Năm cần lấy điểm số. Mặc định là năm hiện tại.
*   **Response (200 OK)**:
    ```json
    {
      "userId": 3,
      "username": "staff",
      "displayName": "IT Staff",
      "department": "IT",
      "year": 2026,
      "monthlyScores": [
        {
          "id": 1,
          "userId": 3,
          "month": 5,
          "year": 2026,
          "taskCompletionRate": 85.0,
          "reviewScore": 8.5,
          "finalScore": 8.5,
          "rating": "EXCELLENT",
          "createdAt": "2026-05-30T01:00:00",
          "updatedAt": "2026-05-30T21:00:00"
        }
      ]
    }
    ```
    > **Ghi chú `taskCompletionRate`**: Giá trị là **phần trăm (0.0 – 100.0%)**, không phải tỷ lệ (0–1).
    > **Ghi chú `finalScore`**: Điểm tổng hợp = `(taskCompletionRate / 10) × taskWeight + reviewScore × reviewWeight`.
    > **Ghi chú `rating`**: `POOR` | `AVERAGE` | `GOOD` | `EXCELLENT`.

### 7.2 Lấy thông tin điểm KPI của phòng ban (Get Team KPI)
*   **Method**: `GET`
*   **URL**: `/kpi/team/{teamId}`
*   **Quyền hạn**: Authority `KPI:VIEW_TEAM` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   `{teamId}` là **ID số (Long)** của Team trong bảng `teams`. Không phải tên hay code.
    *   Chỉ **ADMIN** hoặc **Trưởng phòng chính xác của team đó** mới có thể truy cập. Vi phạm trả về `403`.
*   **Query Parameters (Tùy chọn)**:
    *   `month`: Tháng cần lấy điểm (1 - 12). Mặc định là tháng hiện tại.
    *   `year`: Năm cần lấy điểm. Mặc định là năm hiện tại.
*   **Response (200 OK)**:
    ```json
    {
      "teamId": "1",
      "averageScore": 7.95,
      "members": [
        {
          "userId": 3,
          "username": "staff",
          "displayName": "IT Staff",
          "taskCompletionRate": 85.0,
          "reviewScore": 8.5,
          "finalScore": 8.5,
          "rating": "EXCELLENT"
        },
        {
          "userId": 4,
          "username": "tranvanc",
          "displayName": "Trần Văn C",
          "taskCompletionRate": 70.0,
          "reviewScore": 7.0,
          "finalScore": 7.0,
          "rating": "GOOD"
        }
      ]
    }
    ```

---

## ✍️ 8. Nhóm API Đánh giá KPI Review (`/kpi/reviews/**`)

### 8.1 Tạo mới đánh giá KPI hàng tháng (Create KPI Review)
*   **Method**: `POST`
*   **URL**: `/kpi/reviews`
*   **Quyền hạn**: Authority `KPI/REVIEW:CREATE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   `reviewScore` bắt buộc nằm trong khoảng từ `1.0` đến `10.0` (số nguyên hoặc thập phân).
    *   `feedback` là **bắt buộc**, tối đa 1000 ký tự.
    *   Tự động tính toán lại điểm KPI tổng hợp của nhân viên ngay lập tức sau khi chấm điểm.
*   **Body (JSON)**:
    ```json
    {
      "userId": 3,
      "month": 5,
      "year": 2026,
      "reviewScore": 8.5,
      "feedback": "Làm việc có tinh thần trách nhiệm cao, hoàn thành tốt các task Database."
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": 5,
      "userId": 3,
      "reviewerId": 2,
      "month": 5,
      "year": 2026,
      "reviewScore": 8.5,
      "feedback": "Làm việc có tinh thần trách nhiệm cao, hoàn thành tốt các task Database.",
      "isLocked": false,
      "createdAt": "2026-05-30T21:00:00",
      "updatedAt": "2026-05-30T21:00:00"
    }
    ```

### 8.2 Cập nhật đánh giá KPI (Update KPI Review)
*   **Method**: `PUT`
*   **URL**: `/kpi/reviews/{id}`
*   **Quyền hạn**: Authority `KPI/REVIEW:UPDATE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Không cho phép cập nhật nếu bản ghi đánh giá đã bị khóa (`isLocked = true`).
    *   `reviewScore` bắt buộc, khoảng `1.0` đến `10.0`.
    *   `feedback` là **bắt buộc**, tối đa 1000 ký tự.
    *   Tự động tính toán lại điểm KPI tổng hợp ngay lập tức.
*   **Body (JSON)**:
    ```json
    {
      "reviewScore": 9.0,
      "feedback": "Đã xem xét thêm nỗ lực hỗ trợ các thành viên khác, nâng điểm lên 9.0."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 5,
      "userId": 3,
      "reviewerId": 2,
      "month": 5,
      "year": 2026,
      "reviewScore": 9.0,
      "feedback": "Đã xem xét thêm nỗ lực hỗ trợ các thành viên khác, nâng điểm lên 9.0.",
      "isLocked": false,
      "createdAt": "2026-05-30T21:00:00",
      "updatedAt": "2026-05-30T21:05:00"
    }
    ```

### 8.3 Xóa đánh giá KPI (Delete KPI Review)
*   **Method**: `DELETE`
*   **URL**: `/kpi/reviews/{id}`
*   **Quyền hạn**: Authority `KPI/REVIEW:DELETE` hoặc role `ADMIN`
*   **Ràng buộc**: Tự động recalculate lại điểm tổng hợp của nhân viên về trạng thái không có điểm review (`reviewScore = 0.0`) ngay lập tức.
*   **Response (204 No Content)**: Trả về thành công và không có body.

### 8.4 Lấy lịch sử đánh giá 12 tháng gần nhất (Get KPI Review History)
*   **Method**: `GET`
*   **URL**: `/kpi/reviews/history/{userId}`
*   **Quyền hạn**: Chỉ cần đã đăng nhập.
*   **Mô tả**: Xem lịch sử nhận xét đánh giá 12 tháng gần nhất của một nhân viên.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 5,
        "userId": 3,
        "reviewerId": 2,
        "month": 5,
        "year": 2026,
        "reviewScore": 9.0,
        "feedback": "Đã xem xét thêm nỗ lực hỗ trợ các thành viên khác, nâng điểm lên 9.0.",
        "isLocked": false,
        "createdAt": "2026-05-30T21:00:00",
        "updatedAt": "2026-05-30T21:05:00"
      }
    ]
    ```

---

## ⚖️ 9. Nhóm API Khiếu nại KPI Appeal (`/kpi/appeals/**`)

### 9.1 Gửi đơn khiếu nại (Create KPI Appeal)
*   **Method**: `POST`
*   **URL**: `/kpi/appeals`
*   **Quyền hạn**: Authority `KPI/APPEAL:CREATE` hoặc role `ADMIN`
*   **Ràng buộc**: Cả `reason` và `evidenceLink` đều **bắt buộc** (không thể bỏ trống).
*   **Body (JSON)**:
    ```json
    {
      "kpiReviewId": 5,
      "reason": "Tôi đã hoàn thành vượt tiến độ 2 task quan trọng nhưng điểm review chỉ được 6.",
      "evidenceLink": "https://drive.google.com/file/d/evidence-link"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": 1,
      "userId": 3,
      "complainantUsername": "staff",
      "complainantDisplayName": "IT Staff",
      "kpiReviewId": 5,
      "reason": "Tôi đã hoàn thành vượt tiến độ 2 task quan trọng nhưng điểm review chỉ được 6.",
      "evidenceLink": "https://drive.google.com/file/d/evidence-link",
      "status": "PENDING",
      "resolvedBy": null,
      "resolutionComment": null,
      "createdAt": "2026-05-30T21:10:00",
      "updatedAt": "2026-05-30T21:10:00"
    }
    ```
    > **Ghi chú `status`**: `PENDING` | `APPROVED` | `REJECTED`.

### 9.2 Xem danh sách các đơn khiếu nại đang chờ xử lý (Get Pending KPI Appeals)
*   **Method**: `GET`
*   **URL**: `/kpi/appeals/team`
*   **Quyền hạn**: Authority `KPI/APPEAL:RESOLVE` hoặc role `ADMIN`
*   **Mô tả**: MANAGER chỉ xem danh sách đơn đang chờ duyệt của team mình quản lý, ADMIN xem toàn bộ các đơn `PENDING` trong hệ thống.
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "userId": 3,
        "complainantUsername": "staff",
        "complainantDisplayName": "IT Staff",
        "kpiReviewId": 5,
        "reason": "Tôi đã hoàn thành vượt tiến độ 2 task quan trọng nhưng điểm review chỉ được 6.",
        "evidenceLink": "https://drive.google.com/file/d/evidence-link",
        "status": "PENDING",
        "resolvedBy": null,
        "resolutionComment": null,
        "createdAt": "2026-05-30T21:10:00",
        "updatedAt": "2026-05-30T21:10:00"
      }
    ]
    ```

### 9.3 Xử lý đơn khiếu nại (Resolve KPI Appeal)
*   **Method**: `PATCH`
*   **URL**: `/kpi/appeals/{id}/resolve`
*   **Quyền hạn**: Authority `KPI/APPEAL:RESOLVE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   `resolutionComment` là **bắt buộc**, tối đa 1000 ký tự.
    *   Nếu `status = APPROVED`: hệ thống cập nhật trạng thái đơn và tự động tính toán lại điểm KPI tổng hợp của nhân viên.
    *   Nếu `status = REJECTED`: đơn khiếu nại bị bác bỏ, không thay đổi điểm.
*   **Body (JSON)**:
    ```json
    {
      "status": "APPROVED",
      "resolutionComment": "Đồng ý hỗ trợ cập nhật lại điểm sau khi đối chiếu minh chứng."
    }
    ```
    > **Ghi chú `status`**: `APPROVED` | `REJECTED`.

*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "userId": 3,
      "complainantUsername": "staff",
      "complainantDisplayName": "IT Staff",
      "kpiReviewId": 5,
      "reason": "Tôi đã hoàn thành vượt tiến độ 2 task quan trọng nhưng điểm review chỉ được 6.",
      "evidenceLink": "https://drive.google.com/file/d/evidence-link",
      "status": "APPROVED",
      "resolvedBy": 2,
      "resolutionComment": "Đồng ý hỗ trợ cập nhật lại điểm sau khi đối chiếu minh chứng.",
      "createdAt": "2026-05-30T21:10:00",
      "updatedAt": "2026-05-30T21:20:00"
    }
    ```

---

## ⚙️ 10. Nhóm API Cấu hình Trọng số KPI (`/kpi/weights/**`)

### 10.1 Lấy thông tin cấu hình trọng số hiện tại (Get KPI Weights)
*   **Method**: `GET`
*   **URL**: `/kpi/weights`
*   **Quyền hạn**: Chỉ cần đã đăng nhập.
*   **Mô tả**: Trả về trọng số tính điểm KPI hiện tại. Mặc định ban đầu: `taskWeight = 0.6`, `reviewWeight = 0.4`.
*   **Response (200 OK)**:
    ```json
    {
      "taskWeight": 0.6,
      "reviewWeight": 0.4
    }
    ```

### 10.2 Cập nhật giá trị trọng số mới (Update KPI Weights)
*   **Method**: `PUT`
*   **URL**: `/kpi/weights`
*   **Quyền hạn**: Authority `KPI/WEIGHT:UPDATE` hoặc role `ADMIN`
*   **Ràng buộc**:
    *   Cả hai trường bắt buộc nằm trong khoảng từ `0.0` đến `1.0`.
    *   Tổng `taskWeight + reviewWeight` phải bằng đúng `1.0`.
*   **Body (JSON)**:
    ```json
    {
      "taskWeight": 0.5,
      "reviewWeight": 0.5
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "KPI weights updated successfully"
    }
    ```

---

## 📥 11. Nhóm API Xuất báo cáo KPI ra Excel (`/kpi/export`)

### 11.1 Xuất dữ liệu bảng điểm KPI tổng hợp ra file Excel (Export KPI Report)
*   **Method**: `GET`
*   **URL**: `/kpi/export`
*   **Quyền hạn**: Authority `KPI/REPORT:EXPORT` hoặc role `ADMIN`
*   **Query Parameters**:
    *   `month`: Tháng xuất báo cáo (1 - 12) — **Bắt buộc**
    *   `year`: Năm xuất báo cáo — **Bắt buộc**
    *   `department` (Tùy chọn): Lọc xuất báo cáo riêng cho một phòng ban. Nếu không truyền sẽ xuất toàn bộ công ty.
*   **Response (200 OK)**: File Excel binary.
    *   `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    *   `Content-Disposition: attachment; filename=Bao_cao_KPI_Thang_<month>_Nam_<year>.xlsx`
*   **Định dạng file Excel**:
    *   Header màu nền xanh, chữ trắng đậm.
    *   Tự động căn chỉnh độ rộng cột.
    *   Các cột: STT | Mã NV (ID) | Họ và Tên | Phòng ban | Tỷ lệ hoàn thành Task (%) | Điểm Review | Điểm KPI | Xếp loại.

---

## 🏢 12. Nhóm API Quản lý Phòng ban / Đội ngũ (`/teams/**`)
*(Các API yêu cầu quyền **TEAM:CREATE**, **TEAM:VIEW**, **TEAM:UPDATE**, **TEAM:DELETE** tương ứng)*

### 12.1 Tạo phòng ban mới (Create Team)
*   **Method**: `POST`
*   **URL**: `/teams`
*   **Quyền hạn**: Authority `TEAM:CREATE`
*   **Body (JSON)**:
    ```json
    {
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "managerId": 2
    }
    ```
    > **Ghi chú trường `code`**: Unique, không được trùng lặp trong toàn hệ thống.
    > **Ghi chú trường `managerId`**: Tùy chọn. ID User được gán làm Trưởng phòng.

*   **Response (201 Created)**:
    ```json
    {
      "id": 1,
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "managerId": 2,
      "managerName": "IT Manager",
      "isDeleted": false,
      "createdAt": "2026-05-31T09:00:00",
      "updatedAt": "2026-05-31T09:00:00"
    }
    ```

### 12.2 Lấy danh sách phòng ban (Phân trang & Tìm kiếm)
*   **Method**: `GET`
*   **URL**: `/teams`
*   **Quyền hạn**: Authority `TEAM:VIEW` hoặc vai trò `ADMIN`
*   **Query Parameters (Tùy chọn)**:
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
    *   `search`: Tìm kiếm theo tên hoặc mã phòng ban
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 1,
          "name": "IT Department",
          "code": "IT",
          "description": "Information Technology Department",
          "managerId": 2,
          "managerName": "IT Manager",
          "isDeleted": false,
          "createdAt": "2026-05-31T09:00:00",
          "updatedAt": "2026-05-31T09:00:00"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "totalElements": 1,
        "totalPages": 1
      }
    }
    ```

### 12.3 Xem chi tiết một phòng ban
*   **Method**: `GET`
*   **URL**: `/teams/{id}`
*   **Quyền hạn**: Authority `TEAM:VIEW` hoặc vai trò `ADMIN`
*   **Response (200 OK)** (Trả về chi tiết phòng ban cùng danh sách thành viên):
    ```json
    {
      "id": 1,
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "managerId": 2,
      "managerName": "IT Manager",
      "isDeleted": false,
      "createdAt": "2026-05-31T09:00:00",
      "updatedAt": "2026-05-31T09:00:00",
      "members": [
        {
          "id": 2,
          "email": "manager@gmail.com",
          "username": "manager",
          "displayName": "IT Manager",
          "avatarUrl": null,
          "isActive": true,
          "position": "Manager",
          "type": "STAFF",
          "status": "ACTIVE",
          "lockReason": null,
          "department": "IT",
          "managerId": null,
          "teamId": 1,
          "lastLoginAt": null,
          "createdAt": "2026-05-27T14:00:00",
          "updatedAt": "2026-05-27T14:00:00",
          "lockedUntil": null,
          "isDeleted": false,
          "deletedAt": null,
          "roles": []
        }
      ]
    }
    ```

### 12.4 Cập nhật phòng ban hoặc chỉ định/thay đổi Trưởng phòng
*   **Method**: `PUT`
*   **URL**: `/teams/{id}`
*   **Quyền hạn**: Authority `TEAM:UPDATE` hoặc vai trò `ADMIN`
*   **Body (JSON)**:
    ```json
    {
      "name": "IT Department Updated",
      "code": "IT_NEW",
      "description": "Updated IT Department",
      "managerId": 2
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "name": "IT Department Updated",
      "code": "IT_NEW",
      "description": "Updated IT Department",
      "managerId": 2,
      "managerName": "IT Manager",
      "isDeleted": false,
      "createdAt": "2026-05-31T09:00:00",
      "updatedAt": "2026-05-31T09:10:00"
    }
    ```

### 12.5 Xóa mềm phòng ban (Soft Delete)
*   **Method**: `DELETE`
*   **URL**: `/teams/{id}`
*   **Quyền hạn**: Authority `TEAM:DELETE` hoặc vai trò `ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Team deleted successfully"
    }
    ```

### 12.6 Thêm thành viên vào Team (Add Member to Team)
*   **Method**: `POST`
*   **URL**: `/teams/{id}/members` (Với `{id}` là ID của Team)
*   **Quyền hạn**: Authority `TEAM:UPDATE` hoặc vai trò `ADMIN`
*   **Body (JSON)**:
    ```json
    {
      "userId": 5
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User successfully added to the team."
    }
    ```

### 12.7 Xóa thành viên khỏi Team (Remove Member from Team)
*   **Method**: `DELETE`
*   **URL**: `/teams/{id}/members/{userId}`
*   **Quyền hạn**: Authority `TEAM:UPDATE` hoặc vai trò `ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User successfully removed from the team."
    }
    ```

---

## 🕒 13. Tiến trình tự động hóa chạy ngầm (Background Worker Scheduler)
*Hệ thống tích hợp tác vụ chạy tự động định kỳ bằng Spring Scheduler:*
*   **Thời gian kích hoạt**: Chạy ngầm vào lúc **01:00 AM ngày mùng 1 hàng tháng** (Cron Expression: `0 0 1 1 * ?`).
*   **Logic nghiệp vụ tự động hóa**:
    1. Quét danh sách toàn bộ người dùng đang ở trạng thái hoạt động (`isActive = true`, `isDeleted = false`).
    2. Đếm số task được giao và tỷ lệ hoàn thành (% task `COMPLETED` so với tổng task có deadline thuộc tháng cũ) của từng nhân viên.
    3. Tự động tính toán và lưu điểm KPI tháng cũ, sau đó khởi tạo bản ghi KPI cho tháng mới với giá trị mặc định.

---

## 📋 Phụ lục: Bảng quyền hạn (Permission Matrix)

| Permission Authority       | ADMIN | MANAGER | STAFF |
|----------------------------|:-----:|:-------:|:-----:|
| KPI:VIEW_SELF              | ✅    | —       | ✅    |
| KPI:VIEW_TEAM              | ✅    | ✅      | —     |
| KPI/TASK:CREATE            | ✅    | ✅*     | —     |
| KPI/TASK:VIEW              | ✅    | ✅*     | ✅*   |
| KPI/TASK:UPDATE            | ✅    | ✅*     | —     |
| KPI/TASK:DELETE            | ✅    | ✅*     | —     |
| KPI/TASK:APPROVE           | ✅    | ✅*     | —     |
| KPI/TASK:REJECT            | ✅    | ✅*     | —     |
| KPI/TASK:SUBMIT            | ✅    | —       | ✅    |
| KPI/TASK:UPDATE_PROGRESS   | ✅    | —       | ✅    |
| KPI/TASK:EXTEND            | ✅    | —       | ✅    |
| KPI/TASK:APPROVE_EXTENSION | ✅    | ✅      | —     |
| KPI/TASK:VIEW_SUMMARY      | ✅    | ✅      | ✅    |
| KPI/REVIEW:CREATE          | ✅    | ✅      | —     |
| KPI/REVIEW:UPDATE          | ✅    | ✅      | —     |
| KPI/REVIEW:DELETE          | ✅    | ✅      | —     |
| KPI/APPEAL:CREATE          | ✅    | —       | ✅    |
| KPI/APPEAL:RESOLVE         | ✅    | ✅      | —     |
| KPI/WEIGHT:UPDATE          | ✅    | —       | —     |
| KPI/REPORT:EXPORT          | ✅    | ✅      | —     |
| TEAM:CREATE                | ✅    | —       | —     |
| TEAM:VIEW                  | ✅    | ✅      | ✅    |
| TEAM:UPDATE                | ✅    | —       | —     |
| TEAM:DELETE                | ✅    | —       | —     |

> **Ghi chú `*`**: Có thêm ràng buộc dữ liệu (data isolation) — chỉ được thao tác với task/user trong phạm vi team/phòng ban của mình.
