import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExprienceSection from "../components/ExprienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  //get the authuser
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });

  //get the user profile Data using username query
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => axiosInstance.get(`/users/${username}`),
  });

  //update the profile mutation
  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData) =>
      await axiosInstance.put("/users/profile", updatedData),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries(["userProfile", username]);
    },
  });

  if (isLoading || isUserProfileLoading) return null;

  //if check the owner of the profile
  const isOwnProfile = authUser.username === userProfile.data.username;

  const userData = isOwnProfile ? authUser : userProfile.data;

  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <ExprienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfilePage;
