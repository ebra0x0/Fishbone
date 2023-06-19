import React, { useRef, useState } from "react";
import { Text, TouchableHighlight } from "react-native";
import { HStack, Toast } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";
import { useEffect } from "react";
import Translations from "../../Languages";
import styles from "./styles";
import TOAST from "../TOAST/TOAST";

const PickTime = (props) => {
    const Styles = styles();
    const [closingTime, setClosingTime] = useState({
        value: firestore.Timestamp.now().toDate(),
        valid: false,
    });

    const intervalRef = useRef();
    const CONTENT = {
        ClosingTime: Translations().t("ClosingTime"),
        postExpiresAt: Translations().t("postExpiresAt"),
    };

    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, []);
    useEffect(() => {
        closingTime.valid && Time_Syncing(closingTime.value);
        props.time(closingTime);
        return () => clearInterval(intervalRef.current);
    }, [closingTime]);

    const Time_Syncing = () => {
        intervalRef.current = setInterval(() => {
            Handle_Closing_Time(closingTime.value);
        }, 1000);
    };
    const Handle_Closing_Time = (value) => {
        const selectedDate = value;
        const now = firestore.Timestamp.now().toDate();

        if (props.closing) {
            selectedDate && setClosingTime({ value: selectedDate, valid: true });
        } else {
            if (value > now) {
                setClosingTime({ value: selectedDate, valid: true });
            } else {
                setClosingTime({ value: selectedDate, valid: false });
                Toast.show({
                    render: () => {
                        return <TOAST status="error" msg="This time is already over !" />;
                    },
                    duration: 3000,
                });
            }
        }
    };
    const onChange = (selectedDate) => {
        const currentDate = selectedDate;

        if (currentDate.type !== "dismissed") {
            const date = new Date(currentDate.nativeEvent.timestamp);

            Handle_Closing_Time(date);
        }
    };
    const showMode = () => {
        DateTimePickerAndroid.open({
            value: closingTime.value,
            onChange,
            mode: "time",
            is24Hour: false,
        });
    };
    return (
        <TouchableHighlight
            style={[
                Styles.Btn,
                closingTime.valid && {
                    backgroundColor: "#0a9861",
                },
            ]}
            onPress={showMode}
            disabled={props.loading}
            underlayColor={closingTime.valid ? "#098d5a" : "#001c40"}
        >
            <HStack alignItems={"center"}>
                <Ionicons name="time-outline" size={25} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 16, marginLeft: 4 }}>
                    {!closingTime.valid
                        ? props.closing
                            ? CONTENT.ClosingTime
                            : CONTENT.postExpiresAt
                        : closingTime.value.toLocaleTimeString()}
                </Text>
            </HStack>
        </TouchableHighlight>
    );
};

export default PickTime;
