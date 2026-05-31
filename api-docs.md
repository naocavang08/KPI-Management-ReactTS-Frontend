# Tài liệu API - Hệ thống Quản lý KPI (KPI Management System)
*Cập nhật lúc: 21:00 ngày 30/05/2026 (Version 2)*

Tài liệu này tổng hợp toàn bộ các API hiện tại của hệ thống Backend (Spring Boot) bao gồm các module Authentication, Users, Roles & Permissions, Task Management, Task Extensions, Task History, KPI Core, KPI Reviews, KPI Appeals, KPI Weights, và KPI Reports (Excel Export).

---

## ⚙️ Thông tin chung

### Base URL
*   **Môi trường Local**: `http://localhost:8080`
*   **Môi trường Production (Render)**: `https://kpi-be.onrender.com`

### Headers Mặc định
Đối với mọi Request (trừ các API đăng nhập, quên mật khẩu và lấy vai trò công khai), bạn cần gửi kèm:
*   `Content-Type: application/json`
*   `Authorization: Bearer <accessToken>` (Token nhận được sau khi đăng nhập thành công)

---

## 🔒 1. Nhóm API Authentication & Profile (`/auth/**`)

### 1.1 Đăng nhập (Login)
*   **Method**: `POST`
*   **URL**: `/auth/login`
*   **Body (JSON)**:
    ```json
    {
      "username": "admin",
      "password": "123456"
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
        "type": "STAFF", // INTERNSHIP, STAFF, COLLABORATOR
        "status": "ACTIVE", // ACTIVE, LOCKED, INACTIVE
        "lockReason": null,
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
          "resource": "user",
          "action": "create",
          "scope": null
        }
      ]
    }
    ```

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
*   **Body (JSON)**:
    ```json
    {
      "email": "vpsacc21@gmail.com",
      "otp": "123456", // Mã OTP 6 số nhận được qua email
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
*(Các API này yêu cầu Token có quyền **ADMIN**)*

### 2.1 Lấy danh sách Người dùng (Phân trang & Bộ lọc)
*   **Method**: `GET`
*   **URL**: `/users`
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
*   **Body (JSON)**:
    ```json
    {
      "username": "nguyenvanb", // Từ 3-50 ký tự, chỉ gồm chữ, số, gạch dưới và dấu chấm
      "fullName": "Nguyễn Văn B",
      "email": "nguyenvanb@gmail.com",
      "position": "Tester",
      "type": "STAFF", // INTERNSHIP, STAFF, COLLABORATOR
      "avatar": "https://example.com/avatar.jpg" // Tùy chọn
    }
    ```
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
      "roles": []
    }
    ```

### 2.3 Xem chi tiết người dùng
*   **Method**: `GET`
*   **URL**: `/users/{id}`
*   **Response (200 OK)**: Trả về thông tin chi tiết của User có ID tương ứng (giống cấu trúc object user đơn lẻ).

### 2.4 Cập nhật thông tin người dùng
*   **Method**: `PUT`
*   **URL**: `/users/{id}`
*   **Body (JSON)** (Các trường đều là tùy chọn):
    ```json
    {
      "fullName": "Tên Mới",
      "position": "Vị trí mới",
      "type": "STAFF", // INTERNSHIP, STAFF, COLLABORATOR
      "avatar": "https://link.com/new.jpg",
      "status": "ACTIVE", // ACTIVE, LOCKED, INACTIVE
      "lockedUntil": null
    }
    ```
*   **Response (200 OK)**: Trả về thông tin User sau khi cập nhật.

### 2.5 Xóa người dùng (Soft Delete)
*   **Method**: `DELETE`
*   **URL**: `/users/{id}`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "User deleted successfully"
    }
    ```

### 2.6 Khóa tài khoản người dùng (Lock User)
*   **Method**: `PUT`
*   **URL**: `/users/{id}/lock`
*   **Body (JSON)** (Tùy chọn lý do khóa):
    ```json
    {
      "reason": "Vi phạm quy định của hệ thống"
    }
    ```
*   **Response (200 OK)**: Trả về thông tin User đã bị khóa (thuộc tính `isActive` thành `false`, `status` thành `LOCKED`).

### 2.7 Mở khóa tài khoản người dùng (Unlock User)
*   **Method**: `PUT`
*   **URL**: `/users/{id}/unlock`
*   **Response (200 OK)**: Trả về thông tin User sau khi mở khóa (`isActive` thành `true`, `status` thành `ACTIVE`).

### 2.8 Gán Role cho người dùng
*   **Method**: `POST`
*   **URL**: `/users/{id}/roles`
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
        "resource": "task",
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
*   **Body (JSON)**:
    ```json
    {
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "assigneeId": 3,
      "deadline": "2026-06-15T18:00:00",
      "priority": "HIGH" // LOW, MEDIUM, HIGH
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": 10,
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "managerId": 2,
      "managerName": "Manager User",
      "assigneeId": 3,
      "assigneeName": "Nguyễn Văn B",
      "deadline": "2026-06-15T18:00:00",
      "status": "ASSIGNED", // ASSIGNED, IN_PROGRESS, PENDING_REVIEW, COMPLETED, OVERDUE
      "priority": "HIGH",
      "progress": 0,
      "tags": null,
      "evidence": null,
      "createdAt": "2026-05-30T10:00:00",
      "updatedAt": "2026-05-30T10:00:00"
    }
    ```

### 4.2 Xem chi tiết một Task (Get Task by ID)
*   **Method**: `GET`
*   **URL**: `/tasks/{id}`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW` hoặc role `ADMIN`
*   **Response (200 OK)**:
    ```json
    {
      "id": 10,
      "title": "Hoàn thiện thiết kế Database module KPI",
      "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
      "managerId": 2,
      "managerName": "Manager User",
      "assigneeId": 3,
      "assigneeName": "Nguyễn Văn B",
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
*   **Query Parameters (Tùy chọn)**:
    *   `page`: Số trang, mặc định là `1`
    *   `limit`: Số bản ghi mỗi trang, mặc định là `20`
    *   `search`: Tìm kiếm theo tiêu đề hoặc mô tả Task
    *   `status`: Lọc theo trạng thái (`ASSIGNED`, `IN_PROGRESS`, `PENDING_REVIEW`, `COMPLETED`, `OVERDUE`)
    *   `priority`: Lọc theo độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`)
    *   `assigneeId`: Lọc theo ID nhân viên được giao việc
    *   `teamId`: Lọc theo mã phòng ban/team
*   **Response (200 OK)**:
    ```json
    {
      "data": [
        {
          "id": 10,
          "title": "Hoàn thiện thiết kế Database module KPI",
          "description": "Xây dựng các bảng KpiScore, KpiWeight, KpiReview, KpiAppeal.",
          "managerId": 2,
          "managerName": "Manager User",
          "assigneeId": 3,
          "assigneeName": "Nguyễn Văn B",
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
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task completed successfully"
    }
    ```

### 4.5 Từ chối hoàn thành Task (Reject Task)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/reject`
*   **Quyền hạn**: Authority `KPI/TASK:REJECT` hoặc role `ADMIN`
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
      "message": "Task rejected successfully"
    }
    ```

### 4.6 Cập nhật thông tin Task (Update Task)
*   **Method**: `PUT`
*   **URL**: `/tasks/{id}`
*   **Quyền hạn**: Authority `KPI/TASK:UPDATE` hoặc role `ADMIN`
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
      "managerName": "Manager User",
      "assigneeId": 3,
      "assigneeName": "Nguyễn Văn B",
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
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task deleted successfully"
    }
    ```

### 4.8 Lấy thống kê/tổng hợp trạng thái Task (Task Summary)
*   **Method**: `GET`
*   **URL**: `/tasks/summary`
*   **Quyền hạn**: Authority `KPI/TASK:VIEW_SUMMARY` hoặc role `ADMIN`
*   **Mô tả**: Trả về thống kê số lượng các Task của người dùng hiện tại theo các trạng thái khác nhau.
*   **Response (200 OK)**:
    ```json
    {
      "ASSIGNED": 3,
      "IN_PROGRESS": 5,
      "PENDING_REVIEW": 2,
      "COMPLETED": 12,
      "OVERDUE": 1
    }
    ```

### 4.9 Cập nhật tiến độ & trạng thái Task (Update Task Progress)
*   **Method**: `PATCH`
*   **URL**: `/tasks/{id}/progress`
*   **Quyền hạn**: Authority `KPI/TASK:UPDATE_PROGRESS` hoặc role `ADMIN` (Thường dành cho nhân viên tự cập nhật tiến độ công việc của mình)
*   **Body (JSON)**:
    ```json
    {
      "status": "IN_PROGRESS", // ASSIGNED, IN_PROGRESS, PENDING_REVIEW, COMPLETED, OVERDUE
      "progress": 75 // Điểm phần trăm từ 0 đến 100
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 10,
      "title": "Thiết kế Database module KPI nâng cao",
      "description": "Bổ sung trường rating và tính toán điểm tổng hợp.",
      "managerId": 2,
      "managerName": "Manager User",
      "assigneeId": 3,
      "assigneeName": "Nguyễn Văn B",
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
*   **Quyền hạn**: Authority `KPI/TASK:SUBMIT` hoặc role `ADMIN` (Dành cho nhân viên báo cáo đã xong việc và gửi minh chứng)
*   **Body (JSON)** (Tùy chọn):
    ```json
    {
      "evidence": "https://github.com/hvduong/kpi-repo/pull/12" // Link báo cáo hoặc link PR, Drive
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Task submitted successfully"
    }
    ```

---

## ⏳ 5. Nhóm API Gia hạn Task (`/tasks/{id}/extension/**`)

### 5.1 Gửi yêu cầu gia hạn Task (Request Task Extension)
*   **Method**: `POST`
*   **URL**: `/tasks/{id}/extension`
*   **Quyền hạn**: Authority `KPI/TASK:EXTEND` hoặc role `ADMIN` (Nhân viên xin gia hạn deadline của Task)
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
*   **Quyền hạn**: Authority `KPI/TASK:APPROVE_EXTENSION` hoặc role `ADMIN` (Quản lý duyệt/bác bỏ yêu cầu xin gia hạn của nhân viên)
*   **Body (JSON)**:
    ```json
    {
      "approved": true, // true để chấp nhận đổi deadline, false để bác bỏ
      "managerNote": "Đồng ý gia hạn thêm 5 ngày để hoàn thiện kiểm thử."
    }
    ```
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
*   **Mô tả**: Trả về toàn bộ nhật ký thay đổi trạng thái, tiến độ và ghi chú tương ứng của một Task.
*   **Response (200 OK)**:
    ```json
    [
      {
        "status": "IN_PROGRESS",
        "progress": 75,
        "changedByName": "Nguyễn Văn B",
        "note": "Cập nhật tiến độ lên 75%",
        "createdAt": "2026-05-30T13:00:00"
      },
      {
        "status": "PENDING_REVIEW",
        "progress": 100,
        "changedByName": "Nguyễn Văn B",
        "note": "Nộp báo cáo hoàn thành công việc. Minh chứng: https://github.com/hvduong/kpi-repo/pull/12",
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
*   **Quyền hạn**: Authority `KPI:VIEW_SELF` (đối với cá nhân), `KPI:VIEW_TEAM` (đối với MANAGER xem phòng ban), hoặc role `ADMIN`
*   **Query Parameters (Tùy chọn)**:
    *   `year`: Năm cần lấy điểm số, mặc định là năm hiện tại.
*   **Response (200 OK)**:
    ```json
    {
      "userId": 3,
      "username": "nguyenvanb",
      "displayName": "Nguyễn Văn B",
      "department": "Tech",
      "year": 2026,
      "monthlyScores": [
        {
          "id": 1,
          "userId": 3,
          "month": 5,
          "year": 2026,
          "taskCompletionRate": 0.85, // Tỷ lệ hoàn thành công việc (85%)
          "reviewScore": 8.0, // Điểm đánh giá từ Manager
          "finalScore": 8.3, // Điểm tổng hợp (Công thức: taskRate * 10 * W1 + reviewScore * W2)
          "rating": "EXCELLENT", // Phân loại xếp hạng
          "createdAt": "2026-05-30T01:00:00",
          "updatedAt": "2026-05-30T21:00:00"
        }
      ]
    }
    ```

### 7.2 Lấy thông tin điểm KPI của phòng ban (Get Team KPI)
*   **Method**: `GET`
*   **URL**: `/kpi/team/{teamId}`
*   **Quyền hạn**: Authority `KPI:VIEW_TEAM` hoặc role `ADMIN`
*   **Query Parameters (Tùy chọn)**:
    *   `month`: Tháng cần lấy điểm (1 - 12)
    *   `year`: Năm cần lấy điểm
*   **Response (200 OK)**:
    ```json
    {
      "teamId": "Tech",
      "averageScore": 7.95, // Điểm KPI trung bình của toàn bộ thành viên trong Team
      "members": [
        {
          "userId": 3,
          "username": "nguyenvanb",
          "displayName": "Nguyễn Văn B",
          "taskCompletionRate": 0.85,
          "reviewScore": 8.0,
          "finalScore": 8.3,
          "rating": "EXCELLENT"
        },
        {
          "userId": 4,
          "username": "tranvanc",
          "displayName": "Trần Văn C",
          "taskCompletionRate": 0.70,
          "reviewScore": 8.0,
          "finalScore": 7.6,
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
    *   `reviewScore` bắt buộc nằm trong khoảng từ `1.0` đến `10.0`.
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
    *   Không cho phép cập nhật nếu bản ghi đánh giá đã bị khóa (ví dụ: đã quá thời gian phúc khảo hoặc đã chốt).
    *   Tự động tính toán lại điểm KPI tổng hợp của nhân viên ngay lập tức sau khi cập nhật.
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
*   **Ràng buộc**:
    *   Tự động recalculate lại điểm tổng hợp của nhân viên về trạng thái không có điểm review (reviewScore = 0.0) ngay lập tức.
*   **Response (204 No Content)**: Trả về thành công và không có body.

### 8.4 Lấy lịch sử đánh giá 12 tháng gần nhất (Get KPI Review History)
*   **Method**: `GET`
*   **URL**: `/kpi/reviews/history/{userId}`
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
      "complainantUsername": "nguyenvanb",
      "complainantDisplayName": "Nguyễn Văn B",
      "kpiReviewId": 5,
      "reason": "Tôi đã hoàn thành vượt tiến độ 2 task quan trọng nhưng điểm review chỉ được 6.",
      "evidenceLink": "https://drive.google.com/file/d/evidence-link",
      "status": "PENDING", // PENDING, APPROVED, REJECTED
      "resolvedBy": null,
      "resolutionComment": null,
      "createdAt": "2026-05-30T21:10:00",
      "updatedAt": "2026-05-30T21:10:00"
    }
    ```

### 9.2 Xem danh sách các đơn khiếu nại đang chờ xử lý (Get Pending KPI Appeals)
*   **Method**: `GET`
*   **URL**: `/kpi/appeals/team`
*   **Quyền hạn**: Authority `KPI/APPEAL:RESOLVE` hoặc role `ADMIN` (MANAGER chỉ xem danh sách đơn đang chờ duyệt của team mình quản lý, ADMIN xem toàn bộ các đơn pending trong hệ thống)
*   **Response (200 OK)**:
    ```json
    [
      {
        "id": 1,
        "userId": 3,
        "complainantUsername": "nguyenvanb",
        "complainantDisplayName": "Nguyễn Văn B",
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
*   **Lưu ý**:
    *   Nếu chọn trạng thái là `APPROVED` (chấp nhận phúc khảo), hệ thống sẽ cập nhật trạng thái đơn và đồng thời cập nhật lại điểm tại module Review (kèm theo việc tự động tính toán lại điểm tổng hợp của nhân viên).
    *   Nếu chọn trạng thái là `REJECTED`, đơn khiếu nại sẽ bị bác bỏ.
*   **Body (JSON)**:
    ```json
    {
      "status": "APPROVED", // APPROVED hoặc REJECTED
      "resolutionComment": "Đồng ý hỗ trợ cập nhật lại điểm sau khi đối chiếu minh chứng."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "id": 1,
      "userId": 3,
      "complainantUsername": "nguyenvanb",
      "complainantDisplayName": "Nguyễn Văn B",
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
*   **Mô tả**: Trả về trọng số tính điểm KPI hiện tại của hệ thống cho tỷ trọng hoàn thành công việc (`taskWeight` - $W_1$) và điểm đánh giá hiệu suất của quản lý (`reviewWeight` - $W_2$). Mặc định ban đầu là `0.6` và `0.4`.
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
    *   Cả hai trường trọng số bắt buộc nằm trong khoảng từ `0.0` đến `1.0`.
    *   Tổng giá trị của `taskWeight` + `reviewWeight` truyền lên phải luôn bằng đúng `1.0`.
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
*   **Quyền hạn**: Authority `KPI/REPORT:EXPORT` hoặc role `ADMIN` (Lưu ý: MANAGER cần thuộc phòng ban nhân sự (ví dụ: `department = 'HR'`) mới được xuất).
*   **Query Parameters (Bắt buộc)**:
    *   `month`: Tháng xuất báo cáo (1 - 12)
    *   `year`: Năm xuất báo cáo (2020 - 2100)
    *   `department` (Tùy chọn): Lọc xuất báo cáo riêng cho một phòng ban cụ thể. Nếu không truyền sẽ xuất báo cáo của toàn bộ công ty.
*   **Response (200 OK)**: File Excel binary (Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`). Tên tệp tin tải về có định dạng động: `Bao_cao_KPI_Thang_<month>_Nam_<year>.xlsx`.
*   **Định dạng file Excel xuất ra**:
    *   Header nổi bật với màu nền xanh (Blue Fill), chữ đậm màu trắng.
    *   Tự động căn chỉnh độ rộng cột phù hợp với dữ liệu.
    *   Các cột thông tin bao gồm: STT, Mã nhân viên (ID), Họ và Tên, Phòng ban, Tỷ lệ hoàn thành Task (%), Điểm đánh giá Review, Điểm KPI tổng hợp, Xếp loại KPI.

---

## 🏢 12. Nhóm API Quản lý Phòng ban / Đội ngũ (`/teams/**`)
*(Các API này yêu cầu Token có quyền **TEAM:CREATE**, **TEAM:VIEW**, **TEAM:UPDATE**, **TEAM:DELETE** tương ứng hoặc vai trò **ADMIN**)*

### 12.1 Tạo phòng ban mới (Create Team)
*   **Method**: `POST`
*   **URL**: `/teams`
*   **Quyền hạn**: Authority `TEAM:CREATE`
*   **Body (JSON)**:
    ```json
    {
      "name": "IT Department",
      "code": "IT", // Unique, không được trùng lặp
      "description": "Information Technology Department", // Tùy chọn
      "managerId": 2 // ID User được gán làm Trưởng phòng (Tùy chọn)
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "id": 1,
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "managerId": 2,
      "managerName": "Manager User",
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
          "managerName": "Manager User",
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
*   **Response (200 OK)** (Trả về chi tiết phòng ban cùng danh sách thành viên thuộc phòng đó):
    ```json
    {
      "id": 1,
      "name": "IT Department",
      "code": "IT",
      "description": "Information Technology Department",
      "managerId": 2,
      "managerName": "Manager User",
      "isDeleted": false,
      "createdAt": "2026-05-31T09:00:00",
      "updatedAt": "2026-05-31T09:00:00",
      "members": [
        {
          "id": 2,
          "email": "manager@gmail.com",
          "username": "manager",
          "displayName": "Manager User",
          "avatarUrl": null,
          "isActive": true,
          "position": "Manager",
          "type": "STAFF",
          "status": "ACTIVE",
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
      "managerName": "Manager User",
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

---

## 🕒 13. Tiến trình tự động hóa chạy ngầm (Background Worker Scheduler)
*Hệ thống tích hợp tác vụ chạy tự động định kỳ bằng Spring Scheduler:*
*   **Thời gian kích hoạt**: Chạy ngầm vào lúc **01:00 AM ngày mùng 1 hàng tháng** (Cron Expression: `0 0 1 1 * ?`).
*   **Logic nghiệp vụ tự động hóa**:
    1. Quét danh sách toàn bộ người dùng đang ở trạng thái hoạt động trong hệ thống.
    2. Đếm số lượng task được giao và tỷ lệ hoàn thành (tỷ lệ phần trăm task COMPLETED so với tổng số task giao có deadline thuộc tháng cũ) của từng nhân viên.
    3. Tự động tính toán điểm số KPI tổng hợp tháng cũ và khởi tạo bản ghi điểm số KPI mới cho tháng hiện tại với các giá trị mặc định ban đầu.

