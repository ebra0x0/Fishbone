import axios from "axios";

const SendNotification = async (Data) => {
    const { topic, token, title, msg, image, action } = Data;

    const fcmUrl = "https://fcm.googleapis.com/fcm/send";
    const fcmApiKey =
        "AAAACc36aYM:APA91bH5rPnw0kFv0Cfzmf9O6fwGMHfwpCSF6L9KzhjoeHHexHEb_7P5ZqJYUMll6JLvj7bYwmBeD98pKHDUWOj9nUT0oGua4YXIqNYLxQOTNgpTQ39hnu7odMjdThNXn1Sf7ptCVcro";
    const notification = {
        title: title,
        body: msg,
        image: image,
        android: {
            priority: "high",
            notification: {
                color: "#FFCC00",
                clickAction: action,
            },
        },
    };
    const data = {
        notification,
        to: `${topic ? `/topics/${topic}` : token}`,
    };
    const headers = {
        "Content-Type": "application/json",
        Authorization: `key=${fcmApiKey}`,
    };

    try {
        const response = await axios.post(fcmUrl, data, { headers });

        console.log("Notification sent:", response.data);
    } catch (error) {
        console.error("Error sending notification:", error.message);
    }
};
export default SendNotification;
