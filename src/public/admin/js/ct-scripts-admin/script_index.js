// import filterForm from "../../../../common/filterForm";
import filterForm from "../../../shared/js/filterForm";


document.addEventListener("DOMContentLoaded",start);
const start = ()=>{
    
    const nodeFormQuery = document.querySelector('form[form-params="filter"]')
    const paramsArr = ["is_stock","cat_id","keyword","sort_key"];
    filterForm(nodeFormQuery,paramsArr);
    const nodesChangeStatus = document.querySelectorAll(
        "[data-is_stock][data-prd_id]"
      );
      changeStatus(nodesChangeStatus);
}