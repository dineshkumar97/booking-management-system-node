import StaffDetails from "./src/models/staffModel.js";
import UserDetails from "./src/models/userDetailsModel.js";

export const initializeSocket = (io) => {

    io.on("connection", (socket) => {

        console.log(
            "🟢 Socket connected:",
            socket.id
        );

        // =========================================
        // STAFF ONLINE
        // =========================================

        socket.on(
            "staff-online",
            async (staffId) => {

                try {

                    console.log(
                        "🟢 Staff online:",
                        staffId
                    );

                    if (!staffId) {
                        return;
                    }

                    // IMPORTANT
                    // Store staff ID inside this socket

                    socket.staffId = staffId;

                    const user =
                        await UserDetails.findOne({
                            uniqueUserId: staffId
                        });

                    if (!user) {

                        console.warn(
                            "User not found:",
                            staffId
                        );

                        return;
                    }

                    user.onlineStatus = "online";
                    user.lastSeen = new Date();

                    await user.save();

                    let staff =
                        await StaffDetails.findOne({
                            uniqueUserId: staffId
                        });

                    if (!staff) {

                        staff = new StaffDetails({

                            uniqueUserId:
                                user.uniqueUserId,

                            name:
                                user.name,

                            email:
                                user.email,

                            availabilityStatus:
                                user.availabilityStatus,

                            onlineStatus:
                                "online",

                            lastSeen:
                                new Date()
                        });

                    } else {

                        staff.onlineStatus =
                            "online";

                        staff.lastSeen =
                            new Date();
                    }

                    await staff.save();

                    io.emit(
                        "staff-status-changed",
                        {
                            staffId:
                                staff.uniqueUserId,

                            onlineStatus:
                                "online",

                            availabilityStatus:
                                staff.availabilityStatus,

                            lastSeen:
                                staff.lastSeen
                        }
                    );

                    console.log(
                        "🟢 Staff marked ONLINE:",
                        staff.uniqueUserId
                    );

                } catch (error) {

                    console.error(
                        "❌ Staff online error:",
                        error
                    );

                }

            }
        );

        // =========================================
        // STAFF STATUS CHANGE
        // =========================================

        socket.on(
            "staff-status-change",
            async ({ staffId, status }) => {

                try {

                    console.log(
                        "🔄 Status change received:",
                        {
                            staffId,
                            status
                        }
                    );

                    if (!staffId) {
                        return;
                    }

                    // =========================================
                    // VERY IMPORTANT
                    // STORE STAFF ID ON SOCKET
                    // =========================================

                    socket.staffId = staffId;

                    const allowedStatuses = [
                        "available",
                        "busy",
                        "away",
                        "dnd",
                        "out_of_office"
                    ];

                    if (!allowedStatuses.includes(status)) {

                        console.warn(
                            "Invalid status:",
                            status
                        );

                        return;
                    }

                    // =========================================
                    // FIND USER
                    // =========================================

                    const user =
                        await UserDetails.findOne({
                            uniqueUserId: staffId
                        });

                    if (!user) {

                        console.warn(
                            "User not found:",
                            staffId
                        );

                        return;
                    }

                    // =========================================
                    // UPDATE USER
                    // =========================================

                    user.availabilityStatus =
                        status;

                    user.onlineStatus =
                        "online";

                    user.lastSeen =
                        new Date();

                    await user.save();

                    // =========================================
                    // FIND STAFF
                    // =========================================

                    let staff =
                        await StaffDetails.findOne({
                            uniqueUserId: staffId
                        });

                    // =========================================
                    // CREATE STAFF
                    // =========================================

                    if (!staff) {

                        staff =
                            new StaffDetails({

                                uniqueUserId:
                                    user.uniqueUserId,

                                name:
                                    user.name,

                                email:
                                    user.email,

                                availabilityStatus:
                                    status,

                                onlineStatus:
                                    "online",

                                lastSeen:
                                    new Date()
                            });

                    } else {

                        staff.availabilityStatus =
                            status;

                        staff.onlineStatus =
                            "online";

                        staff.lastSeen =
                            new Date();
                    }

                    await staff.save();

                    console.log(
                        "✅ Staff status saved:",
                        {
                            staffId:
                                staff.uniqueUserId,

                            availabilityStatus:
                                staff.availabilityStatus,

                            onlineStatus:
                                staff.onlineStatus,

                            lastSeen:
                                staff.lastSeen
                        }
                    );

                    // =========================================
                    // BROADCAST
                    // =========================================

                    io.emit(
                        "staff-status-changed",
                        {
                            staffId:
                                staff.uniqueUserId,

                            onlineStatus:
                                staff.onlineStatus,

                            availabilityStatus:
                                staff.availabilityStatus,

                            lastSeen:
                                staff.lastSeen
                        }
                    );

                } catch (error) {

                    console.error(
                        "❌ Status change error:",
                        error
                    );

                }

            }
        );

        // =========================================
        // SOCKET DISCONNECT
        // =========================================

        socket.on(
            "disconnect",
            async (reason) => {

                try {

                    console.log(
                        "🔴 Socket disconnected:",
                        socket.id
                    );

                    console.log(
                        "Disconnect reason:",
                        reason
                    );

                    console.log(
                        "Staff ID:",
                        socket.staffId
                    );

                    const staffId =
                        socket.staffId;

                    if (!staffId) {

                        console.log(
                            "⚠️ No staff ID attached to socket"
                        );

                        return;
                    }

                    // =========================================
                    // FIND STAFF
                    // =========================================

                    const staff =
                        await StaffDetails.findOne({
                            uniqueUserId: staffId
                        });

                    if (!staff) {

                        console.log(
                            "⚠️ Staff not found:",
                            staffId
                        );

                        return;
                    }

                    // =========================================
                    // MARK STAFF OFFLINE
                    // =========================================

                    staff.onlineStatus =
                        "offline";

                    staff.lastSeen =
                        new Date();

                    await staff.save();

                    // =========================================
                    // ALSO UPDATE USER
                    // =========================================

                    await UserDetails.findOneAndUpdate(
                        {
                            uniqueUserId: staffId
                        },
                        {
                            onlineStatus:
                                "offline",
                            availabilityStatus:'offline',
                            lastSeen:
                                staff.lastSeen
                        }
                    );

                    // =========================================
                    // BROADCAST OFFLINE
                    // =========================================

                    io.emit(
                        "staff-status-changed",
                        {
                            staffId:
                                staff.uniqueUserId,

                            onlineStatus:
                                "offline",

                            availabilityStatus:
                               "offline",

                            lastSeen:
                                staff.lastSeen
                        }
                    );

                    console.log(
                        "🔴 Staff marked OFFLINE:",
                        {
                            staffId:
                                staff.uniqueUserId,
                            availabilityStatus:
                               "offline",
                            onlineStatus:
                                staff.onlineStatus,

                            lastSeen:
                                staff.lastSeen
                        }
                    );

                } catch (error) {

                    console.error(
                        "❌ Disconnect error:",
                        error
                    );

                }

            }
        );

    });

    console.log(
        "✅ Socket.IO initialized"
    );
};