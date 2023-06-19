import React from "react";
import { View } from "react-native";
import ScreenHeader from "../../../Components/ScreenHeader/ScreenHeader";
import ActivePost from "./ActivePost";
import Statistics from "./Statistics";
import styles from "./styles";
import Translations from "../../../Languages";

const Board = () => {
    const Styles = styles();
    const CONTENT = {
        dashboardTitle: Translations().t("dashboardTitle"),
    };
    return (
        <View style={Styles.container}>
            <ScreenHeader title={CONTENT.dashboardTitle} />
            <ActivePost />
            <Statistics />
        </View>
    );
};

export default Board;
