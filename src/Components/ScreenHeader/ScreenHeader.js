import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
const ScreenHeader = (props) => {
    const { theme } = useSelector((state) => state.user);
    const { arrow, title, btns } = props;
    const [Buttons, setButtons] = useState([]);

    useEffect(() => {
        if (btns) {
            const rndrBtns = btns.map((btn) => {
                if (btn) {
                    return btn;
                }
            });
            setButtons(rndrBtns);
        }
    }, [btns]);

    return (
        <View
            style={{
                paddingHorizontal: 20,
                height: 100,
                paddingTop: 30,
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            {arrow && (
                <TouchableOpacity onPress={() => arrow()}>
                    <Ionicons name="arrow-back" size={30} color={theme ? "#fff" : "#252525"} />
                </TouchableOpacity>
            )}

            {title}

            {Buttons && <View style={{ flexDirection: "row" }}>{Buttons}</View>}
        </View>
    );
};

export default ScreenHeader;
