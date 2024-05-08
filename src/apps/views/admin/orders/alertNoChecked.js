
     const showDeleteAlert = () => {
    const deleteAlert = document.getElementById("deleteAlert");
    deleteAlert.style.display = "block";

    // Ẩn thông báo sau một khoảng thời gian
    setTimeout(() => {
        deleteAlert.style.display = "none";
    }, 1000); // 3 giây
};
