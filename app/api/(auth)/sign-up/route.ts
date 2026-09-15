import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
 

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, fullName } = await req.json();

        if (!email || !fullName) {
            return NextResponse.json({ error: "Email and full name are required" }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const newUser = await new User({ email, fullName });
       
     newUser.save();


        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
        
    } catch (error ) {
        console.log(error)
        return NextResponse.json({ error: "Failed to connect to the database" }, { status: 500 });
        
    }
}

