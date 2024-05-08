const mongoose = require("./database")();
module.exports = (query) => {
    let filterFormData = {
        status: {
            allStock: {
                id: 1,
                title: "Tất cả",
                is_stock: "all"
            },
            inStock: {
                id: 2,
                title: "Còn hàng",
                is_stock: "true",
            },
            outOfStock: {
                id: 3,
                title: "Hết hàng",
                is_stock: "false",
            },
        },
        find: {},
        sort: {},
    };

    const { allStock, inStock, outOfStock } = filterFormData.status;
    switch (query.is_stock) {
        case allStock.is_stock:
            allStock.active = "true";
            break;
        case inStock.is_stock:
            inStock.active = "true";
            filterFormData.find.is_stock = inStock.is_stock
            break;
        case outOfStock.is_stock:
            outOfStock.active = "true";
            filterFormData.find.is_stock = outOfStock.is_stock
            break;

        default:
            break;
    }
    //Tìm kiếm cat_id truyền vào có đúng định dạng của mongoose ko
    if (query.cat_id && mongoose.isValidObjectId(query.cat_id)) {
        filterFormData.find.cat_id = query.cat_id;
    }

    // so sánh keyword truyền vào để loại bỏ kí tự đặc biết, tham số i để keyword ko phân biệt chữ hoa, thường
    if (query.keyword) {
        const keyword = encodeURIComponent(query.keyword);
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedKeyword, "i");
        filterFormData.find.name = regex;
    }


    // sắp xếp tăng giảm
    if (query.sortKey) {
        switch (query.sortKey) {
            case "increment":
                filterFormData.sort.price= -1
                break;
            case "decrement":
                filterFormData.sort.price= -1
                break;

            default:
                break;
        }
    }

    return filterFormData;
}