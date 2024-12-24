"use client";

import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import { useState } from "react";

function LoginForm() {
    const { loginUser, userState, handleUserInput } = useUserContext();
    const { email, password } = userState;
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <form
            className="m-[2rem] px-10 py-14 rounded-lg bg-white w-full max-w-[520px]"
            autoComplete="off"
        >
            <div className="relative z-10">
                <h1 className="mb-2 text-center text-[1.35rem] font-medium">
                    Log into your account
                </h1>
                <div className="mt-[1rem] flex flex-col">
                    <label htmlFor="email" className="mb-1 text-[#999]">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        placeholder="jdoe@example.com"
                        className="px-4 py-3 border-[2px] rounded.md outline-[#2ECC71] text-gray-800"
                        onChange={(e) => handleUserInput("email")(e)}
                    />
                </div>
                <div className="relative mt-[1rem] flex flex-col">
                    <label htmlFor="email" className="mb-1 text-[#999]">
                        Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        placeholder="**********"
                        className="px-4 py-3 border-[2px] rounded.md outline-[#2ECC71] text-gray-800"
                        onChange={(e) => handleUserInput("password")(e)}
                    />
                    <button type="button" className="absolute p-1 right-4 top-[43%] text-[22px] opacity-45">
                        {showPassword ? (
                            <i className="fas fa-eye-slash" onClick={togglePassword}></i>
                        ) : (
                            <i className="fas fa-eye" onClick={togglePassword}></i>
                        )}
                    </button>
                </div>
                <div className="mt-4 flex justify-between">
                    <p className="text-[#999] text-[14px]">
                        <Link
                            href="/register"
                            className="justify-end font-bold text-[#2ECC71] hover:text-[#7263F3] transition-all duration-300"
                        >
                            Don&apos;t have an account?
                        </Link>
                    </p>
                    <Link
                        href="/forgot-password"
                        className="font-bold text-[#2ECC71] hover:text-[#7263F3] transition-all duration-300"
                    >
                        Forgot password?
                    </Link>
                </div>

                <div className="flex">
                    <button
                        type="submit"
                        className="mt-[1.5rem] flex-1 px-4 py-3 font-bold bg-[#2ECC71] text-white rounded-md hover:bg-[#1abc9c] transition-colors"
                        disabled={!email || !password}
                        onClick={loginUser}
                    >
                        Login Now
                    </button>
                </div>
            </div>
        </form>
    );
}

export default LoginForm;
