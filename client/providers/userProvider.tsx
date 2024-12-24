"use client";

import { UserContextProvider } from "../context/userContext";

interface Props {
  children: React.ReactNode
}

export const UserProvider = ({ children }: Props) => {
  return (
    <UserContextProvider>
      {children}
    </UserContextProvider>
  )
}
