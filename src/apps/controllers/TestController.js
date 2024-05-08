

const test1 =  (req, res) => {
    req.session.email = "akita141188"
    res.send("test1")
}

const test2 = (req,res)=>{
    req.session.email = "akita141188"
    res.send("test2")

}

module.exports = {
    test1,
    test2,
}