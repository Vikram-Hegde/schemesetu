import { connectToDatabase } from "@/utils/database";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import User from "@/models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const { email, password } = credentials || { email: "", password: "" };
        await connectToDatabase();

        const user = await User.findOne({
          email,
        }).select("+password");
        if (!user) {
          return null;
        }
        const result = await compare(password, user.password);

        console.log({ result, user });
        if (result) {
          return { ...user, name: user.username };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await User.findOne({ email: session?.user?.email });
      const userId = sessionUser?._id?.toString();
      return {
        ...session,
        user: {
          ...session.user,
          id: userId,
        },
      };
    },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDatabase();

        const userExists = await User.findOne({ email: user.email });

        console.log({ user });
        if (!userExists) {
          await User.create({
            email: user?.email,
            username: user?.name?.replace(" ", "").toLowerCase(),
            image: user?.image,
          });
        }
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
