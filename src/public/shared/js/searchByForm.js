import searchParams from "./searchParams";
const searchByForm = (
    nodeFormQuery,
    paramsName = [],
    preventDefault = true,
    resetPage = false
)=> {
    const nodeButtonDel = document.querySelector(".ct-form-button-del");
    if (nodeButtonDel) {
      nodeButtonDel.addEventListener("click", (e) => {
        e.preventDefault();
        const url = window.location.replace(window.location.pathname);
      });
    };
    if(nodeFormQuery){
        nodeFormQuery.addEventListener("submit",(e)=>{
            preventDefault? e.preventDefault() : null;
            let params = {};
            for(let paramName of paramsName){
                const valueParam = e.target[paramName].value;
            
            }
            searchParams(params,resetPage)
        })
    }
}

export default searchByForm;