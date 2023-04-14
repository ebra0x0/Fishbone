import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import mapStyle from "./mapStyle";
import styles from "./styles";
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Alert, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ALert from "../Alert/Alert";
import { Toast } from "native-base";
import Translations from "../../Languages";

const Map = (props) => {
    const { deviceLocation, theme } = useSelector((state) => state.user);
    const Styles = styles();
    const [marker, setMarker] = useState(props.Marker);
    const [region, setRegion] = useState(deviceLocation);

    const dispatch = useDispatch();
    const screenY = Dimensions.get("window").height - 220;

    const FOURSQUARE_CLIENT_ID = "1UY5KSLOBVWUMHU3YGC0GFQS2RWUABT3BF53TOLRVGV52DUD";
    const FOURSQUARE_CLIENT_SECRET = "XTLVZKPAPNV0E2KHUZKMVXVN4PSGPA35CX2MYXJBIHQQ211R";
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: "fsq3HBuWNUPTrY4xfomzu3xGxz2TU3mH4L1l3MKqBhnJk1A=",
        },
    };

    useEffect(() => {
        Get_Location();
        if (!region) {
            fetch(`https://api.ipdata.co?api-key=8811b744420d8bd9652bd0febc88b328bb938d1a59d29abc2f1b0e95`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((geo) => {
                    setRegion({
                        latitude: geo.latitude,
                        longitude: geo.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.02,
                    });
                });
        }
    }, []);
    useEffect(() => {
        if (marker) {
            setRegion(marker);
        }
    }, [marker]);

    const Get_Location = async () => {
        if (!deviceLocation) {
            const { status } = await Location.requestForegroundPermissionsAsync();

            try {
                if (status !== "granted") {
                    Toast.show({
                        render: () => {
                            return (
                                <ALert
                                    status="error"
                                    msg="Make sure you enabled location permission for accurate information"
                                />
                            );
                        },
                        duration: 2000,
                    });

                    return;
                }
                const { latitude, longitude } = (await Location.getCurrentPositionAsync({})).coords;

                setRegion({ latitude, longitude, latitudeDelta: 0.002, longitudeDelta: 0.003 });

                dispatch({
                    type: "userData/Set_Device_Location",
                    payload: {
                        latitude,
                        longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.003,
                    },
                });
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <View style={Styles.overlay}>
            <TouchableOpacity
                style={Styles.XBtn}
                onPress={() => {
                    props.updateMapState();
                }}
            >
                <Ionicons name="close-outline" size={35} color="#c1c1c1" />
            </TouchableOpacity>

            <MapView
                style={Styles.map}
                region={region || marker}
                provider={PROVIDER_GOOGLE}
                zoomControlEnabled={true}
                mapPadding={{ top: screenY }}
                loadingIndicatorColor="#1785f5"
                followsUserLocation={true}
                showsUserLocation={true}
                loadingEnabled={true}
                loadingBackgroundColor={theme ? "#001023" : "#efefef"}
                customMapStyle={theme ? mapStyle : false}
                onPress={(e) => {
                    setMarker({
                        ...e.nativeEvent.coordinate,
                        latitudeDelta: 0.0004,
                        longitudeDelta: 0.0006,
                    });
                }}
                onPoiClick={(e) => {
                    setMarker({
                        ...e.nativeEvent.coordinate,
                        latitudeDelta: 0.0004,
                        longitudeDelta: 0.0006,
                    });
                }}
            >
                {marker && (
                    <Marker coordinate={marker}>
                        <Ionicons name="location" size={50} color="#18ad79" />
                    </Marker>
                )}
            </MapView>

            <TouchableOpacity
                disabled={!marker ? true : false}
                style={[Styles.confBtn, marker && Styles.activeBtn]}
                onPress={() => {
                    props.updateMapState(marker);
                }}
            >
                <Text style={{ fontSize: 16, color: "#fff" }}>{Translations().t("mapBtn")}</Text>
            </TouchableOpacity>
        </View>
    );
};
export default Map;
