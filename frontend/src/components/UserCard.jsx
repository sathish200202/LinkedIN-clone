import { Link } from "react-router-dom";
import RecommendedUser from "./RecommendedUser";

function UserCard({ user, isConnection, recommendedUsers }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md">
      <Link
        to={`/profile/${user.username}`}
        className="flex flex-col items-center"
      >
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
        <h3 className="font-semibold text-lg text-center">{user.name}</h3>
      </Link>
      <p className="text-gray-600 text-center">{user.headline}</p>
      <p className="text-sm text-blue-600 mt-2">
        {user.connections?.length} connections
      </p>
      <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full">
        {isConnection ? "Connected" : "Connect"}
      </button>
      {recommendedUsers?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4 text-primary">
              People you may know
            </h2>
            {recommendedUsers?.map((user) => (
              <RecommendedUser key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCard;
