import React from "react";
import { useSelector } from "react-redux";
import Tabs from "./Tabs";
import MetaData from "../screens/MetaData/MetaData";

const AccNavigators = () => {
    const { data } = useSelector((state) => state.user);

    return data?.verified || data?.verified === undefined ? <Tabs /> : <MetaData />;
};

export default AccNavigators;
