import jsonwebtoken from "jsonwebtoken";
const generationToken = (user) => jsonwebtoken.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '10h' });

export default generationToken;