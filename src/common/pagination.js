module.exports = (page,limit,totalRows)=>{
    const totalPages = Math.ceil(totalRows/limit);
    const pages = [];
    const delta = 1;
    const right = page + delta;
    const left = page - delta;

    for(let i = 1; i <=totalPages; i++){
        if(
            i=== 1 || 
            i=== totalPages || 
            i === page||
            (i>=left)&& (i<= right)
            ){
            pages.push(i)
        }
        else if (
            i== left -1 ||
            i == right + 1
        ){
            pages.push("...")
        }
    }
    return pages;
}

