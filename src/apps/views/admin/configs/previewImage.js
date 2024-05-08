const previewImage = (input,previewContainer) => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("preview-img");
        // Xóa ảnh cũ trước khi thêm ảnh mới
        previewContainer.innerHTML = "";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  }

