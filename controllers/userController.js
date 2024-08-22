const User = require('../models/UserModel');
const Chat = require('../models/ChatModels');
const bcrypt = require('bcrypt');



// REGRISTATION KE LIYE YE SARA SETUP KARA THA
// Render registration form
const registerForm = (req, res) => {
    res.render('register');
};

// Process form submission
const registerSubmit = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new Error("Name, email, and password are required fields.");
        }

        let image = ''; // Default value for image
        if (req.file) {
            image = 'images/' + req.file.filename;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            image,
            password: passwordHash
        });

        await user.save();
        res.render('register', { message: 'Successfully registered' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error registering user");
    }
};


// for login
const loadLogin=async(req,res)=>{
    try{
        res.render('login');
    }
    catch(error)
    {
        console.log(error.message)
    }
}

   

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email: email });
        
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            console.log(passwordMatch);
            
            if (passwordMatch) {
                console.log(password, userData.password);
                req.session.user = userData;
                res.redirect('/dashboard');
            } else {
                res.render('login', { message: "Email and password are incorrect!!" });
            }
        } else {
            res.render('login', { message: "Email and password are incorrect!!" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const loadDashboard=async(req,res)=>{
    try{
        var users=await User.find({_id: { $nin: [req.session.user._id]}})
        res.render('dashboard',{user: req.session.user,users:users})
    }
    catch(error)
    {
        console.log(error.message)
    }
}

const existsChat = async (req, res) => {
    try {
        var chats = await Chat.find({
            $or: [
                { sender_id: req.body.sender_id, receiver_id: req.body.receiver_id },
                { sender_id: req.body.receiver_id, receiver_id: req.body.sender_id }
            ]
        });

        res.emit('loadChats', { chats: chats });
    } catch (error) {
        console.log(error.message);
    }
};

const saveChat= async(req,res)=>{
    try {
        
        var chat=new Chat({
            sender_id:req.body.sender_id,
            receiver_id:req.body.receiver_id,
            message:req.body.message
        });
        var newChat=await chat.save();
        res.status(200).send({success:true,msg:'Chat inserted',data:newChat});
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

module.exports = {
    registerForm,
    registerSubmit,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat,
    existsChat
};
