const jwt = require("jsonwebtoken");
const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        // console.log(req.headers.authorization)
        const decodedToken = jwt.verify(
            token,
            "platescanada"
        );
        console.log({ decodedToken })
        decodedToken.token = token;
        req.userData = decodedToken;
        next();
    } catch (error) {
        // console.log(error)
        res.json({ status: "0", message: "Auth failed!", details: { error } });
    }
};

module.exports = checkAuth
