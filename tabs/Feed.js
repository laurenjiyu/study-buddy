import { useState } from "react";
import { StyleSheet, FlatList, RefreshControl } from "react-native";

import Theme from "@/assets/theme";
import Post from "@/tabs/Post";
import Loading from "@/tabs/Loading";

import timeAgo from "@/utils/timeAgo";

export default function Feed({
  shouldNavigateToComments = false,
  fetchUsersPostsOnly = false,
}) {
  const [posts, setPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    // TODO
    setIsLoading(false);
    setIsRefreshing(false);
  };

  if (isLoading && !isRefreshing) {
    return <Loading />;
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <Post
          shouldNavigateOnPress={shouldNavigateToComments}
          id={item.id}
          username={item.username}
          timestamp={timeAgo(item.timestamp)}
          text={item.text}
          score={item.like_count}
          vote={item.vote}
          commentCount={item.comment_count}
        />
      )}
      contentContainerStyle={styles.posts}
      style={styles.postsContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            fetchPosts();
          }}
          tintColor={Theme.colors.textPrimary} // only applies to iOS
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  postsContainer: {
    width: "100%",
  },
  posts: {
    gap: 8,
  },
});
