const form = document.querySelector('form')
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const captchaReponse = grecaptcha.getResponse();
    if(!captchaReponse.length >0){
        throw new Error("captcha not complete")
    }
    const fd = new FormData(e.target);
    const params = new URLSearchParams(fd)
    fetch("/product-:slug.:id",{
        method : "POST",
        body : params
    })
    .then(res=> res.json())
    .then(console.log(data))
    .catch(err => console.log(err))

})