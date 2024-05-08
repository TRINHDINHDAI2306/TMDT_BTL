const searchParams = (params = {}, resetPage) => {
    const url = new URL(window.location.href);
    const urlSearchParams = url.searchParams;
    for (let paramName in params) {
        let paramValue = params[paramName];
        if (paramValue && paramValue !== "disabled") {
            urlSearchParams.set(paramName, paramValue);
        } else {
            urlSearchParams.delete(paramName);
        }
    }
    resetPage ? urlSearchParams.delete("page") : null;
    window.location = url.href;
};

export default searchParams;