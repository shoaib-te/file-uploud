import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
 

export async function POST(req: Request) {
    try {
        const { email, fullName } = await req.json();

        if (!email || !fullName) {
            return NextResponse.json({ error: "Email and full name are required" }, { status: 400 });
        }

        await dbConnect();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const newUser = new User({ email, fullName });
        await newUser.save();


        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
        
    } catch (error) {
        console.error("Sign-up failed:", error);
        return NextResponse.json({ error: "Failed to connect to the database" }, { status: 500 });
        
    }
}
