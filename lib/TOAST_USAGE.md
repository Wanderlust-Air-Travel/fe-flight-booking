# Toast Notification Usage Guide

## Tổng quan

Dự án sử dụng **React-Toastify** để hiển thị các thông báo (success, error, warning, info) một cách nhất quán trên toàn bộ ứng dụng.

## Cài đặt

React-Toastify đã được cài đặt và cấu hình sẵn trong dự án.

## Import

```typescript
import { showSuccess, showError, showWarning, showInfo, showLoading, updateToast, getErrorMessage } from '@/lib/toast';
```

## Các hàm có sẵn

### 1. `showSuccess(message: string, options?: ToastOptions)`
Hiển thị thông báo thành công (màu xanh lá).

```typescript
showSuccess('Đăng nhập thành công!');
```

### 2. `showError(message: string, options?: ToastOptions)`
Hiển thị thông báo lỗi (màu đỏ). Tự động đóng sau 5 giây.

```typescript
showError('Đăng nhập thất bại!');
```

### 3. `showWarning(message: string, options?: ToastOptions)`
Hiển thị cảnh báo (màu vàng). Tự động đóng sau 4 giây.

```typescript
showWarning('Vui lòng kiểm tra lại thông tin!');
```

### 4. `showInfo(message: string, options?: ToastOptions)`
Hiển thị thông tin (màu xanh dương). Tự động đóng sau 3 giây.

```typescript
showInfo('Đang xử lý yêu cầu của bạn...');
```

### 5. `showLoading(message: string, options?: ToastOptions)`
Hiển thị loading toast (không tự đóng). Trả về `toastId` để có thể update sau.

```typescript
const toastId = showLoading('Đang tải dữ liệu...');
// Sau khi hoàn thành
updateToast(toastId, 'Tải dữ liệu thành công!', 'success');
```

### 6. `updateToast(toastId, message, type, options?)`
Cập nhật toast đã tồn tại (thường dùng với loading toast).

```typescript
const toastId = showLoading('Đang xử lý...');
try {
  await someAsyncOperation();
  updateToast(toastId, 'Xử lý thành công!', 'success');
} catch (error) {
  updateToast(toastId, 'Xử lý thất bại!', 'error');
}
```

### 7. `getErrorMessage(error: any, defaultMessage?: string)`
Trích xuất message từ error object (hỗ trợ axios error).

```typescript
try {
  await axios.post('/api/endpoint');
} catch (error) {
  const errorMessage = getErrorMessage(error, 'Đã xảy ra lỗi');
  showError(errorMessage);
}
```

## Tích hợp với Axios

Axios interceptors đã được cấu hình để tự động hiển thị error toast cho tất cả các API calls thất bại (trừ 401 - sẽ được xử lý bởi token refresh logic).

**Lưu ý:** Nếu bạn muốn tắt toast tự động cho một request cụ thể, bạn có thể thêm custom header:

```typescript
axios.get('/api/endpoint', {
  headers: {
    'X-Skip-Toast': 'true'
  }
});
```

## Ví dụ sử dụng

### Ví dụ 1: Form submission với success/error

```typescript
const handleSubmit = async (values: FormValues) => {
  try {
    const response = await axios.post('/api/endpoint', values);
    showSuccess('Gửi form thành công!');
    // Navigate or update state
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Gửi form thất bại');
    showError(errorMessage);
  }
};
```

### Ví dụ 2: Loading với update

```typescript
const handleSave = async () => {
  const toastId = showLoading('Đang lưu dữ liệu...');
  
  try {
    await axios.post('/api/save', data);
    updateToast(toastId, 'Lưu thành công!', 'success');
  } catch (error) {
    updateToast(toastId, getErrorMessage(error), 'error');
  }
};
```

### Ví dụ 3: Warning cho validation

```typescript
const handleDelete = () => {
  if (!confirmDelete) {
    showWarning('Vui lòng xác nhận trước khi xóa!');
    return;
  }
  // Proceed with delete
};
```

## Tùy chỉnh Options

Bạn có thể tùy chỉnh toast bằng cách truyền options:

```typescript
showSuccess('Thành công!', {
  autoClose: 5000, // Đóng sau 5 giây
  position: 'top-center', // Vị trí
  hideProgressBar: true, // Ẩn progress bar
});
```

Các options có sẵn: https://fkhadra.github.io/react-toastify/api/toast

## Best Practices

1. **Sử dụng `getErrorMessage()`** để trích xuất message từ error một cách nhất quán
2. **Tích hợp với axios interceptors** - lỗi sẽ tự động hiển thị, chỉ cần thêm success toast
3. **Sử dụng loading toast** cho các operations dài
4. **Thông báo rõ ràng** - message phải dễ hiểu cho người dùng
5. **Tránh spam toast** - không hiển thị quá nhiều toast cùng lúc

## Vị trí Toast

Toast mặc định hiển thị ở `top-right`. Có thể thay đổi trong `ToastProvider.tsx`.

