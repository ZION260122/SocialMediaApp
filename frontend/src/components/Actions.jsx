import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postAtom from "../atoms/postsAtom";

const Actions = ({ post }) => {
  const user = useRecoilValue(userAtom);
  const setPosts = useSetRecoilState(postAtom);
  const posts = useRecoilValue(postAtom);
  const [liked, setLiked] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLiking, setIsLiking] = useState(false);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (post.likes && user) {
      setLiked(post.likes.includes(user._id));
    }
  }, [post.likes, user]);

  const handleLikedAndUnliked = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );

    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
      } else {
        let updatedPosts = [];
        if (Array.isArray(posts)) {
          if (!liked) {
            // Add the ID of the current user to post.likes array
            updatedPosts = posts.map((p) => {
              if (p._id === post._id) {
                return { ...p, likes: [...p.likes, user._id] };
              }
              return p;
            });
          } else {
            // Remove the ID of the current user from post.likes array
            updatedPosts = posts.map((p) => {
              if (p._id === post._id) {
                return { ...p, likes: p.likes.filter((id) => id !== user._id) };
              }
              return p;
            });
          }
          setPosts(updatedPosts);
          setLiked(!liked);
        }
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!user)
      return showToast("Error", "You must be logged in to reply to a post", "error");
    if (isReplying) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/posts/reply/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });

      const data = await res.json();

      if (data.error) return showToast("Error", data.error, "error");

      if (Array.isArray(posts)) {
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, replies: [...p.replies, data] };
          }
          return p;
        });
        setPosts(updatedPosts);
        showToast("Success", "Reply posted successfully", "success");
        onClose();
        setReply('');
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <Flex flexDirection="column">
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikedAndUnliked}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>

        <svg
          aria-label="Comment"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          onClick={onOpen}
        >
          <title>Comment</title>
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>
        <RepostSVG />
        <ShareSVG />
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize="sm">
          {post.replies?.length || 0} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.likes?.length || 0} likes
        </Text>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Post a Reply</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply goes here.."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              size={"sm"}
              mr={3}
              onClick={handleReply}
              isLoading={isReplying}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;

const RepostSVG = () => {
  return (
    <svg
      aria-label="Repost"
      color="currentColor"
      fill="currentColor"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Repost</title>
      <path
        fill=""
        d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-6.923a1.004 1.004 0 0 0-1.413 0l-3.502 3.502a.998.998 0 0 0-.293.706v.001a1.02 1.02 0 0 0 .013.065.923.923 0 0 0 .281.643l3.504 3.504a1 1 0 0 0 1.414-1.414L10.288 8.2h5.313a3.274 3.274 0 0 1 3.27 3.27v4.228a1 1 0 1 0 2 0v-4.228a5.276 5.276 0 0 0-5.27-5.27h-5.318l1.798-1.798a1 1 0 0 0-.003-1.415Z"
      ></path>
    </svg>
  );
};

const ShareSVG = () => {
  return (
    <svg
      aria-label="Share"
      color="currentColor"
      fill="currentColor"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Share</title>
      <line
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        x1="22"
        x2="9.218"
        y1="3"
        y2="10.083"
      ></line>
      <polygon
        fill="none"
        points="11.698 20.334 16.424 20.334 22 21 22 3 2 12.334 11.698 20.334"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polygon>
    </svg>
  );
};
