
const USERS = [
    { email: "admin@email.com", name: "admin", password: 'hashedPassword', isAdmin: true }
]
const bcrypt = require('bcrypt');
bcrypt.hash("Rc123456!", 10).then(response => {
    const admin = USERS.find(user => {
        return user.name === "admin"
    });
    admin.password = response;
}).catch(e => console.log(e));

module.exports = USERS;