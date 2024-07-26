import { Flex, Image, Link, useColorMode } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { Link as RouterLink } from "react-router-dom"

const Header = () => {
    const {colorMode, toggleColorMode} =  useColorMode()
    const user = useRecoilValue(userAtom)

  return (
    <Flex justifyContent={"center"} mt={6} mb="12">
        {user && (
          <Link as={RouterLink}>
            <AiFillHome />
          </Link>
        )}
        <Image
            cursor={"pointer"}
            alt="logo"
            w={6}
            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
            onClick={toggleColorMode}
        />
    </Flex>
  )
}

export default Header
