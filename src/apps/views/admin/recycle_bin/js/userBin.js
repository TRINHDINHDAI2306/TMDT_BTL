// Hiển thị thông báo xóa thành công
const showDeleteSuccessMessage = () => {
  const deleteSuccessMessage = document.getElementById("deleteSuccessMessage");
  deleteSuccessMessage.style.display = "block";
  setTimeout(() => {
    location.reload(); // sau khi xóa reload trang
    deleteSuccessMessage.style.display = "none";
  }, 1000); // Hiden after 1 seconds
};
// bắt sự kiện Thay đổi trạng thái checkbox
document.querySelectorAll(".myCheckbox").forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    updateCheckedIds();
    updateChecks();
  });
});

// Update trạng thái checkbox
const updateCheckedIds = () => {
  const checkedIds = [];
  document.querySelectorAll(".myCheckbox:checked").forEach(checkbox => {
    checkedIds.push(checkbox.getAttribute("data-id"));
  });
  sendCheckedIds(checkedIds);
}
// Gửi yêu cầu về server (AJAX) sự kiện xóa
const sendCheckedIds = (checkedIds) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/recycle_bin/users/deleteAll", true); // open() nhận vào 3 tham số (phương thức, url xử lý, async). true: bất đồng bộ
  xhr.setRequestHeader("Content-Type", "application/json"); // dữ liệu gửi về dạng JSON
  xhr.send(JSON.stringify({
    checkedIds: checkedIds
  }));
}

// Thêm hàm hiển thị hộp thoại xác nhận
const confirmDelete = () => {
  return confirm("Tài khoản sau khi xóa sẽ không thể khôi phục. Bạn có chắc chắn muốn xóa các Tài khoản đã chọn?");
}

// Bắt sự kiện click nút Xóa đã chọn
document.getElementById("deleteSelected").addEventListener("click", () => {
  if (confirmDelete()) { // Nếu người dùng xác nhận muốn xóa
    updateCheckedIds();
    showDeleteSuccessMessage(); // hiển thị thông báo
  }
});

// Update trạng thái checkbox cho button di chuyển
const updateChecks = () => {
  const checkUserIds = [];
  document.querySelectorAll(".myCheckbox:checked").forEach(checkbox => {
    checkUserIds.push(checkbox.getAttribute("data-id"))
  });
  moveBinToUsers(checkUserIds);
}

//Gửi yêu cầu về server(AJAX) về tính năng di chuyển
const moveBinToUsers = (userIds) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/admin/recycle_bin/users/move", true);
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(JSON.stringify({
    userIds
  }))
}
// Thêm hàm hiển thị hộp thoại xác nhận
const confirmMove = () => {
  return confirm("Bạn có chắc chắn muốn phục hồi các tài khoản đã chọn?");
}

//Bắt thuộc tính click Di chuyển
document.getElementById("moveUsers").addEventListener("click", () => {
  if (confirmMove()) {
    updateChecks();
    location.reload();
  }
})
