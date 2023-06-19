import { useSelector } from "react-redux";

const RootColor = () => {
    const { theme } = useSelector((state) => state.user);
    return {
        CONTAINER: theme ? "#001023" : "#efefef",
        VIEW: theme ? "#001837" : "#ffffff",
        VIEW_TXT: theme ? "#ffffff" : "#474747",
        TOGGLEVIEW: theme ? "#ffffff" : "#001b3c",
        TOGGLE_TXT: theme ? "#474747" : "#ffffff",
        VIEW_SHADOW: theme ? "#001631" : "#c5c5c5",
        AVATAR: theme ? "#02234e" : "#b7b7b7",
        BORDER: theme ? "#001c3e" : "#cfcfcf",
        BUTTON: "#0065ff",
        INPUT_TXT: theme ? "#3398ff" : "#343434",
        SECONDARY_TXT: theme ? "#6e6e6e" : "#343434",
        ERR_TXT: "#ff4a4a",
        FOTTER_TXT: theme ? "#8f8f8f" : "#222222",

        ACTIVE: "#1785f5",
        GREEN: "#0dbc79",
        RED: "#FF2763",
    };
};
export default RootColor;
