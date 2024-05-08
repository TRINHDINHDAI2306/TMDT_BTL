   // bắt sự kiện Thay đổi trạng thái checkbox
   document.querySelectorAll(".myCheckbox").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateCheckedIds();
    });
  });

   const updateCheckedIds = () => {
    const checkedIds = [];
    document.querySelectorAll(".myCheckbox:checked").forEach(checkbox => {
      checkedIds.push(checkbox.getAttribute("data-id"));
    });
    sendCheckedIds(checkedIds);
  }
  // Gửi yêu cầu về server (AJAX)
  const sendCheckedIds = (checkedIds) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/products/deleteAll", true); // open() nhận vào 3 tham số (phương thức, url xử lý, async). true: bất đồng bộ
    xhr.setRequestHeader("Content-Type", "application/json"); // dữ liệu gửi về dạng JSON
    xhr.send(JSON.stringify({
      checkedIds: checkedIds
    }));
  }
  // Thêm hàm hiển thị hộp thoại xác nhận
  const confirmDelete = () => {
    return confirm("Bạn có chắc chắn muốn xóa các sản phẩm đã chọn? Sản phẩm sẽ được chuyển đến thùng rác.");
  }
  // Bắt thuộc tính click Xóa
  document.getElementById("deleteSelected").addEventListener("click", () => {
    if (confirmDelete()) { // Nếu người dùng xác nhận muốn xóa
      updateCheckedIds();
      location.reload(); // sau khi xóa reload trang
    }
  });

  // hàm cảnh báo xóa   
  const confirmDeleteOne = (ProductId) => {
    const confirmMsg = "Bạn có chắc muốn xóa sản phẩm này?";
    if (confirm(confirmMsg)) {
      window.location.href = "/admin/Products/delete/" + ProductId;
      location.reload();
    }
  }