import { useRecoilValue } from "recoil"
import LoginCard from "../components/LoginCard"
import SignupCard from "../components/SignupCard"
import authScreenAtom from "../atoms/authAtom"
import { useState } from "react"

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom)
    console.log(authScreenState)
  return (
    <div>
      {authScreenState === "login" ? <LoginCard/> : <SignupCard/> }
    </div>
  )
}

export default AuthPage
