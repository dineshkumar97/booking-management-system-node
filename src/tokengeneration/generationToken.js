import jsonwebtoken from "jsonwebtoken";
const generationToken = (user) => jsonwebtoken.sign(
    {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    },
    process.env.SECRET_KEY, {
    expiresIn: '10h'
});

export default generationToken;