const cartMw = {

    cart : async (req,res,next)=>{
        if(!req.session.cart){
            req.session.cart = []
        }
        next();
    },
}

module.exports = cartMw;