# Kế hoạch thiết kế Hệ thống Quản lý KPI Nội bộ

## 1. Phân tích Yêu cầu & Trải nghiệm Người dùng (UX)
Hệ thống quản lý KPI cần sự tin cậy, bảo mật và dễ sử dụng để nhân viên tập trung vào mục tiêu công việc.
- **Mục tiêu:** Giúp nhân viên theo dõi tiến độ, cập nhật chỉ số và quản lý hồ sơ cá nhân hiệu quả.
- **Phong cách thiết kế:** Hiện đại (Modern), Chuyên nghiệp (Professional), Sạch sẽ (Clean), sử dụng màu sắc thương hiệu công ty (thường là Xanh dương hoặc Xanh lá để tạo sự tin cậy).

## 2. Danh sách các màn hình dự kiến
- **Màn hình Đăng nhập (Login):** Tập trung vào tính bảo mật, giao diện tối giản nhưng hiện đại.
- **Màn hình Cài đặt cá nhân (Personal Settings):** Cho phép người dùng cập nhật thông tin, thay đổi mật khẩu và cấu hình thông báo.
- **Màn hình Dashboard (Tổng quan):** Theo dõi nhanh các chỉ số KPI quan trọng (sẽ thiết kế ở bước sau).
- **Màn hình Chi tiết KPI (KPI Details):** Xem biểu đồ tiến độ và lịch sử cập nhật (sẽ thiết kế ở bước sau).

## 3. Các thành phần UI chủ chốt (UI Components)
- **Hệ thống Design Tokens:** Màu sắc (Primary, Secondary, Success, Warning, Danger), Typography (Inter hoặc Roboto).
- **Form Elements:** Input fields, Buttons, Checkboxes, Toggle switches.
- **Navigation:** Sidebar hoặc Top navigation linh hoạt.
- **Layout:** Sử dụng Grid hệ thống 12 cột để đảm bảo hiển thị tốt trên máy tính.

## 4. Quy trình thực hiện
1. **Khởi tạo Design System:** Định nghĩa màu sắc, phông chữ và phong cách chung.
2. **Thiết kế Màn hình Login:** Giao diện tối giản với form đăng nhập và logo công ty.
3. **Thiết kế Màn hình Setting:** Giao diện chia tab hoặc sidebar menu cho các nhóm cài đặt khác nhau.