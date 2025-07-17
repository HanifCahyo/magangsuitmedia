"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPostsWithRetry,
  transformApiPost,
  testApiConnection,
} from "@/lib/api";
import type { Post, ApiResponse } from "@/types/api";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load state from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = Number.parseInt(params.get("page") || "1");
    const perPage = Number.parseInt(params.get("per_page") || "10");
    const sort = params.get("sort") || "newest";

    setCurrentPage(page);
    setItemsPerPage(perPage);
    setSortBy(sort);
  }, []);

  // Fetch posts from API
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Test API connection first
        const isConnected = await testApiConnection();
        if (!isConnected) {
          throw new Error(
            "Unable to connect to the API. Please check your internet connection."
          );
        }

        const sortParam =
          sortBy === "newest" ? "-published_at" : "published_at";
        // Pastikan fetchPostsWithRetry menggunakan route proxy Next.js
        const response: ApiResponse = await fetchPostsWithRetry({
          page: currentPage,
          size: itemsPerPage,
          sort: sortParam,
        });

        const transformedPosts = response.data.map(transformApiPost);
        setPosts(transformedPosts);
        setTotalPages(response.meta.last_page);
        setTotalItems(response.meta.total);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load posts. Please try again later.";
        setError(errorMessage);
        console.error("Error loading posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, itemsPerPage, sortBy]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("per_page", itemsPerPage.toString());
    params.set("sort", sortBy);

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  }, [currentPage, itemsPerPage, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Posts
            </h3>
            <p className="text-red-600 mb-4 max-w-md mx-auto">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <p className="text-gray-600">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${startIndex} - ${endIndex} of ${totalItems}`
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={handleSortChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-opacity duration-300 ${
            isLoading ? "opacity-50" : "opacity-100"
          }`}
        >
          {isLoading
            ? // Loading skeleton
              Array.from({ length: itemsPerPage }, (_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/2] bg-gray-200" />
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                    <div className="h-4 bg-gray-200 rounded mb-1" />
                    <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            : posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[3/2] relative overflow-hidden">
                    <Image
                      src={`/api/image-proxy?url=${encodeURIComponent(
                        post.image
                      )}`}
                      alt={post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      {formatDate(post.publishedAt)}
                    </p>

                    <h3 className="font-semibold text-gray-900 leading-tight mb-2 line-clamp-3">
                      {post.title}
                    </h3>
                  </div>
                </article>
              ))}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 p-0 ${
                    currentPage === pageNum
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
