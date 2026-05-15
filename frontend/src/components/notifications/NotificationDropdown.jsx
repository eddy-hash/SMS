import React from "react";

const NotificationDropdown = ({ notifications, markNotificationAsRead }) => {

  if (!notifications || notifications.length === 0) {

    return (
      <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow p-6 text-center text-gray-500">
        No notifications
      </div>
    );

  }

  return (

    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow max-h-96 overflow-y-auto">

      {notifications.map((notif) => (

        <div
          key={notif.id}
          onClick={() => markNotificationAsRead(notif.id)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            !notif.read ? "bg-blue-50" : ""
          }`}
        >

          <p className="text-sm font-semibold">{notif.title}</p>

          <p className="text-xs text-gray-500">
            {notif.message}
          </p>

        </div>

      ))}

    </div>

  );

};

export default NotificationDropdown;
