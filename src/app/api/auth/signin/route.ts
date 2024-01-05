import { NextResponse } from "next/server";
import { hash, genSalt } from "bcrypt";

import User from "@/models/user";
import { connectToDatabase } from "@/utils/database";
export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    const salt = await genSalt(10);
    await connectToDatabase();
    const hashedPassword = await hash(password, salt);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    console.log({ user });
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "failure" }, { status: 500 });
  }
}
