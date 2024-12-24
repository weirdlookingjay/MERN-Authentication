"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const serverUrl = "http://localhost:8000";
  const router = useRouter();
  const [user, setUser] = useState({});
  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  // register user
  const registerUser = async (e) => {
    e.preventDefault();
    if (!userState.name || !userState.email || !userState.password) {
      toast.error("All fields are required");
      return;
    }

    if (userState.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (userState.email.includes("@") === false) {
      toast.error("Invalid email address format");
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);

      toast.success("Registered successfully");

      // clear form
      setUserState({
        name: "",
        email: "",
        password: "",
      });

      router.push("/login");
    } catch (error) {
      console.log("Error registering user", error);
      toast.error("Error registering new account");
    }
  };

  // login user
  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true, // send cookies to the server
        }
      );
      toast.success("Logged in successfully");

      // clear the form
      setUserState({
        email: "",
        password: "",
      });

      // redriect user to home page
      router.push("/");
    } catch (error) {
      console.log("Error logging in", error);
      toast.error("Error logging in");
    }
  };

  //get user logged in status
  const userLoginStatus = async () => {
    let loggedIn = false;

    try {
      const res = await axios.get(`${serverUrl}/api/v1/login-status`, {
        withCredentials: true,
      });

      // coerce the string to boolean
      loggedIn = !!res.data;
      setLoading(false);

      if (!loggedIn) {
        router.push("/login");
      }
    } catch (error) {
      console.log("Error getting login status", error);
    }

    return loggedIn;
  };

  // dynamic form handler
  const handleUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const logoutUser = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.log("Error logging out", error);
      toast.error("Error logging out");
    }
  };

  // get user details
  const getUser = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${serverUrl}/api/v1/user`, {
        withCredentials: true,
      });

      setUser((prevState) => ({
        ...prevState,
        ...res.data,
      }));
      setLoading(false);
    } catch (error) {
      console.log("Error getting user details", error);
      setLoading(false);
      toast.error("Error getting user details");
    }
  };

  // Update user details
  const updateUser = async (e, data) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.patch(`${serverUrl}/api/v1/user`, data, {
        withCredentials: true,
      });

      // update user state
      setUser((prevState) => ({
        ...prevState,
        ...res.data,
      }));

      toast.success("Profile updated successfully");

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error updating profile");
    }
  };

  useEffect(() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus();

      if (isLoggedIn) {
        await getUser();
      }
    };
    loginStatusGetUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        registerUser,
        loginUser,
        logoutUser,
        userState,
        handleUserInput,
        userLoginStatus,
        user,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
