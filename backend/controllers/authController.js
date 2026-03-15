import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, address } = req.body;

    if (!name || !email || !password || !phoneNumber || !address) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    console.log("resister",email,password,role);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      phoneNumber,
      address,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req,res)=>{
    try{
        const {email,password}=req.body;

        //console.log("login", email,password)

        if(!email || !password){
            return res.status(400).json({message:"Please provide email and password"});
        }

        const user= await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const isMatch= await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const token= jwt.sign({id:user._id},process.env.jWT_SECRET,{
            expiresIn:"7d"
        })

        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            token
        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


