# Tài liệu API - Hệ thống Quản lý KPI (KPI Management System)
*Cập nhật lúc: 23:59 ngày 27/05/2026*

Tài liệu này tổng hợp toàn bộ các API hiện tại của hệ thống Backend (Spring Boot) để phục vụ cho việc lập trình Frontend.

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
      "username": "nguyenvanb", // Username tự động tạo từ email prefix
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

### 3.2 Tạo mới một Role
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

### 3.3 Cập nhật thông tin Role
*   **Method**: `PUT`
*   **URL**: `/roles/{id}`
*   **Body (JSON)**: Giống cấu trúc Request Body tạo mới.
*   **Response (200 OK)**: Trả về thông tin Role sau cập nhật.

### 3.4 Xóa một Role
*   **Method**: `DELETE`
*   **URL**: `/roles/{id}`
*   **Response (204 No Content)**: Trả về thành công, không có body.

### 3.5 Xem danh sách các Permission (quyền) của một Role
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

### 3.6 Gán Permission cho Role
*   **Method**: `POST`
*   **URL**: `/roles/{id}/permissions`
*   **Body (JSON)**:
    ```json
    {
      "permissionId": 1
    }
    ```
*   **Response (201 Created)**: Trả về thành công, không có body.

### 3.7 Gỡ bỏ Permission khỏi Role
*   **Method**: `DELETE`
*   **URL**: `/roles/{id}/permissions/{permissionId}`
*   **Response (204 No Content)**: Trả về thành công, không có body.
