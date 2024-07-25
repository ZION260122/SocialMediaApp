import { useEffect, useState } from "react"
import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";

const UserPage = () =>{
  const [user, setUser] = useState();
  const showToast = useShowToast();

  const { username } = useParams();

  useEffect(() => {
    const getUser = async() => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if(data.error){
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      }
    };
    getUser();

  }, [username, showToast])

  if(!user)  return null;

  return (
    <div>
      <UserHeader user= {user}/>
      <UserPost likes={1200} replies={481} postImg="/post1.png" postTitle="Let's talk about threads."/>
      <UserPost likes={451} replies={12} postImg="/post2.png" postTitle="Nice tutorial"/>
      <UserPost likes={321} replies={989} postImg="/post3.png" postTitle="I love this guy."/>
      <UserPost likes={212} replies={56}  postTitle="This is my first threads."/>
    </div>
  )
}

export default UserPage
