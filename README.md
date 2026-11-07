# Hệ Thống Quản Lý Vận Hành Cơ Sở MindX Thuận An (MindX Thuan An Ops Management Web)

Hệ thống web quản lý vận hành cơ sở theo giao diện bảng dữ liệu (Sheet-like interface), giúp giáo vụ (CS) và quản lý thao tác trực tiếp, quen thuộc như Google Sheets / Excel nhưng có tự động hóa và ràng buộc dữ liệu.

## ✨ 4 Phân hệ chính (4 Worksheets)

1. **Tab 1: Quản lý học viên (Students Sheet)**
   - Dãy Cards thống kê số lượng tự động: **Tổng số học viên | Tổng Active | Sắp hết phí | Handle | Bảo lưu | Chuyển cơ sở | Chuyển nhượng | Nghỉ ngang**.
   - Trường dữ liệu: Họ và tên học viên, SĐT, Họ tên phụ huynh, Email, Lộ trình đăng ký, Học phần, Mã khối (Coding, Robotics), Mã lớp, Hình thức học (Offline, Hybrid, Online), Trạng thái.
   - Thao tác nhanh: Chỉnh sửa trực tiếp tên học viên, đổi trạng thái qua dropdown, tìm kiếm & lọc đa tiêu chí.

2. **Tab 2: Quản lý danh sách lớp học (Classes Sheet)**
   - Dãy Cards: **Tổng số lớp | Running | Chờ lớp | Finished | Đủ sĩ số | Thiếu sĩ số**.
   - Tự động tính sĩ số lớp dựa trên số học viên Active thuộc mã lớp và gắn nhãn **Đủ sĩ số** (≥6 học viên) hoặc **Thiếu sĩ số** (<6 học viên).
   - Trường dữ liệu: Mã khối, Mã lớp, Mô hình học, Lịch học (Thứ, Ca), Ngày khai giảng, Mốc sự kiện (Ngày CP1, Ngày CP2, Ngày Demo), Giáo viên phụ trách, Trợ giảng, CS phụ trách, Tình trạng lớp.

3. **Tab 3: Điểm danh (Attendance Sheet)**
   - Chọn mã lớp để load danh sách học viên tương ứng.
   - 14 cột tương ứng 14 buổi học (có mốc CP1 ở B7, CP2 ở B13, Demo ở B14).
   - Quy ước mã màu:
     - 🟢 **Xanh lá (P):** Có mặt / Học đầy đủ
     - 🟡 **Vàng (L):** Đi trễ
     - 🔴 **Đỏ (A):** Vắng không phép
     - 🔵 **Xanh dương (E):** Vắng có phép
   - **Tự động hóa:** Khi tick 🔴 hoặc 🔵, hệ thống tự động ghi nhận một bản ghi vắng sang Tab Học bù.

4. **Tab 4: Quản lý học bù & gửi tài liệu (Make-up Classes)**
   - Tự động đồng bộ các buổi vắng từ Tab Điểm danh.
   - Theo dõi: Ngày vắng lần 1, Checkbox "Đã gửi tài liệu", Lịch xếp bù 1, Trạng thái bù 1.
   - Theo dõi: Ngày vắng lần 2, Checkbox "Đã gửi tài liệu", Lịch xếp bù 2, Trạng thái bù 2.
   - Ghi chú CS/Giáo viên.

5. **Xuất & Nhập dữ liệu (Excel Integration)**
   - Nút **Xuất Excel (.xlsx)**: Xuất toàn bộ dữ liệu 3 bảng (Học viên, Lớp học, Học bù) vào 1 file Excel đa sheet chuẩn đẹp chỉ với 1 cú click.
   - Nạp dữ liệu mẫu ban đầu (Demo) & Tự động lưu LocalStorage.

---

## 🚀 Hướng dẫn chạy và Deploy

### 1. Xem trước trên máy cục bộ (Local preview)
Chạy bằng Python có sẵn trong máy:
```bash
python -m http.server 3000
```
Sau đó truy cập: `http://localhost:3000`

### 2. Triển khai lên Vercel
Dự án đã có sẵn cấu hình `vercel.json` cho static web:
1. Đẩy code lên GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: init mindx thuan an ops management system"
   git branch -M main
   git remote add origin <URL-GITHUB-REPO-CUA-BAN>
   git push -u origin main
   ```
2. Vào [vercel.com](https://vercel.com) -> Chọn **Add New Project** -> Chọn GitHub Repository vừa tạo -> Bấm **Deploy**.
