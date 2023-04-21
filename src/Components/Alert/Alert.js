import React, { useState, useEffect } from "react";
import { Image, Keyboard, Text } from "react-native";
import { HStack, Center } from "native-base";
import RootColor from "../../RootColor";

const ALert = (props) => {
    const { status, msg } = props;
    const [toast, setToast] = useState({ icon: "", iconColor: "", status: "", msg: "" });
    const Root = RootColor();

    const Icons = {
        error: require("../../../assets/warning.png"),
        success: require("../../../assets/success.png"),
    };

    useEffect(() => {
        Keyboard.dismiss();
        switch (status) {
            case "success":
                setToast({ icon: Icons.success, status: Root.GREEN, msg });
                break;
            case "error":
                setToast({ icon: Icons.error, status: Root.ERR_TXT, msg });
                break;
            default:
                setToast({ icon: Icons.error, status: "", msg: "" });
                break;
        }
    }, [props]);
    return (
        <Center
            style={{ backgroundColor: Root.VIEW, borderLeftWidth: 4, borderColor: toast.status }}
            width="320"
            px="3"
            py="3"
            rounded="sm"
            mb={-10}
        >
            <HStack
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
                space={2}
            >
                <Image style={{ width: 20, height: 20 }} source={toast.icon} />
                <Text style={{ flex: 1, color: Root.VIEW_TXT }} fontSize="md">
                    {toast.msg}
                </Text>
            </HStack>
        </Center>
    );
};

export default ALert;
