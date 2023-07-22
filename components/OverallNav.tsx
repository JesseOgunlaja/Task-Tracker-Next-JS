"use client"

import React from 'react'
import SignedInNavbar from './SignedInNavbar'
import Navbar from './Navbar'
import { usePathname } from 'next/navigation'

const notSignedInPaths: String[] = ["/","/why-taskmaster","/features","/signUp","/logIn"]

const OverallNav = () => {
    console.log(usePathname())
  return (
    <div>{notSignedInPaths.every(val => val != usePathname()) ? (
        <SignedInNavbar/>
    ) : (
        <Navbar/>
    )}</div>
  )
}

export default OverallNav