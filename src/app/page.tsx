"use client";
import Header from "@/components/header";
import Banner from "@/components/banner";
import PostList from "@/components/post-list";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Banner />
      <PostList />
    </div>
  );
}
