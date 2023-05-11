import React, { useEffect, useState, memo } from "react";
import { View, Text, FlatList, Image } from "react-native";
import styles from "./styles";
import ScreenHeader from "../../Components/ScreenHeader/ScreenHeader";

const PostsHistory = ({ route }) => {
    const [posts, setPosts] = useState(route.params.posts);
    const Styles = styles();

    useEffect(() => {
        if (posts?.length) {
            const sortedPosts = posts;
            sortedPosts.sort((a, b) => new Date(b.date.toDate()) - new Date(a.date.toDate()));
            setPosts(sortedPosts);
        }
    }, []);

    const renderItems = ({ item }) => {
        return (
            <View style={Styles.post}>
                <View style={{ flex: 1 }}>
                    <Image style={{ flex: 1.5 }} source={{ uri: item.postImage }} />
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Text style={Styles.postHeader}>{item.foodType}</Text>
                        <Text style={{ color: "#a0a0a0" }}>{item.postDesc}</Text>
                    </View>
                    <Text style={Styles.postDate}>{item.date.toDate().toDateString()}</Text>
                    {item.active && <View style={Styles.actvBuble} />}
                </View>
            </View>
        );
    };
    const HeaderTitle = route.params.title;

    return (
        <View style={Styles.container}>
            <ScreenHeader arrow={true} title={HeaderTitle} />
            <FlatList
                style={{ paddingHorizontal: 10, paddingTop: 10 }}
                data={posts}
                renderItem={renderItems}
                keyExtractor={(item) => item.key}
            />
        </View>
    );
};

export default memo(PostsHistory);
