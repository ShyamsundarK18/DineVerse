import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react";
import RestaurantCard from "../components/home/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "../api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CUISINES = [
  "All",
  "Italian",
  "Indian",
  "Chinese",
  "Japanese",
  "Mexican",
  "American",
  "Thai",
  "Mediterranean",
];
const RATINGS = [
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4.0 },
  { label: "3.5+", value: 3.5 },
];
const PRICE_RANGES = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"];
const SORT_OPTIONS = [
  { label: "Relevance Index", value: "relevance" },
  { label: "Highest Rating", value: "rating" },
  { label: "Fulfillment Speed", value: "delivery_time" },
  { label: "Minimum Delivery Cost", value: "delivery_fee" },
];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: "All",
    minRating: 0,
    priceRanges: [],
    sortBy: "relevance",
  });

  useEffect(() => {
    api.restaurants
      .list("-rating", 50)
      .then((data) => {
        if (Array.isArray(data)) {
          setRestaurants(data.filter((r) => r.is_approved !== false));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
        setRestaurants([]);
        setLoading(false);
      });
  }, []);

  const getFiltered = () => {
    let result = [...restaurants];
    if (searchQuery) {
      result = result.filter((r) => {
        const cuisineMatch = Array.isArray(r.cuisine)
          ? r.cuisine.some((c) =>
              c.toLowerCase().includes(searchQuery.toLowerCase()),
            )
          : typeof r.cuisine === "string" &&
            r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        return (
          r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cuisineMatch ||
          r.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    if (filters.cuisine !== "All") {
      result = result.filter((r) => {
        return Array.isArray(r.cuisine)
          ? r.cuisine.some((c) =>
              c.toLowerCase().includes(filters.cuisine.toLowerCase()),
            )
          : typeof r.cuisine === "string" &&
              r.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase());
      });
    }
    if (filters.minRating > 0) {
      result = result.filter((r) => (r.rating || 0) >= filters.minRating);
    }
    if (filters.priceRanges.length > 0) {
      result = result.filter((r) =>
        filters.priceRanges.includes(r.price_range),
      );
    }
    if (filters.sortBy === "rating")
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (filters.sortBy === "delivery_time")
      result.sort((a, b) => (a.delivery_time || 30) - (b.delivery_time || 30));
    else if (filters.sortBy === "delivery_fee")
      result.sort((a, b) => (a.delivery_fee || 0) - (b.delivery_fee || 0));
    return result;
  };

  const filtered = getFiltered();
  const activeFilterCount =
    (filters.cuisine !== "All" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    filters.priceRanges.length;

  const togglePrice = (p) => {
    setFilters((f) => ({
      ...f,
      priceRanges: f.priceRanges.includes(p)
        ? f.priceRanges.filter((x) => x !== p)
        : [...f.priceRanges, p],
    }));
  };

  // Find the text label matching the currently selected value for the layout button view
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ||
    "Relevance Index";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-black text-white mb-6">
            Find Your Favorite Food
          </h1>
          <div className="flex gap-3 bg-white rounded-2xl p-2 shadow-xl max-w-2xl border border-emerald-100 focus-within:ring-2 focus-within:ring-emerald-400 transition">
            <div className="flex items-center gap-2 px-3 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-gray-900 placeholder-gray-400 outline-none text-sm font-medium bg-transparent focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        {/* Filter Controller Layout Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition-all ${
              activeFilterCount > 0
                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                : "border-gray-200 text-gray-600 hover:border-emerald-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Cuisine quick pills */}
          <div className="flex gap-2 flex-wrap">
            {CUISINES.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setFilters((f) => ({ ...f, cuisine: c }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filters.cuisine === c
                    ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-white shadow-md shadow-emerald-200"
                    : "bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Upgraded Sort Component View */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:block">
              Sort by:
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs font-bold pl-3 pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 shadow-sm outline-none cursor-pointer relative transition-all duration-150 hover:bg-gray-100/80 active:scale-95 flex items-center gap-1">
                  {currentSortLabel}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md p-1.5 z-50 animate-in fade-in-50 slide-in-from-top-1"
              >
                {SORT_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() =>
                      setFilters((f) => ({ ...f, sortBy: o.value }))
                    }
                    className={`flex items-center px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all duration-150 mb-0.5 last:mb-0 hover:outline-none ${
                      filters.sortBy === o.value
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          filters.sortBy === o.value
                            ? "bg-white"
                            : "bg-gray-300"
                        }`}
                      />
                      {o.label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                  Min Rating
                </h4>
                <div className="flex gap-2">
                  {RATINGS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          minRating: f.minRating === r.value ? 0 : r.value,
                        }))
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                        filters.minRating === r.value
                          ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      ⭐ {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                  Price Range
                </h4>
                <div className="flex gap-2">
                  {PRICE_RANGES.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePrice(p)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                        filters.priceRanges.includes(p)
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() =>
                    setFilters({
                      cuisine: "All",
                      minRating: 0,
                      priceRanges: [],
                      sortBy: "relevance",
                    })
                  }
                  className="text-sm text-emerald-500 font-semibold hover:text-emerald-600 underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Matrix Block */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-500 text-sm font-medium">
            Showing{" "}
            <span className="text-emerald-600 font-bold">
              {filtered.length}
            </span>{" "}
            restaurants
          </p>
        </div>

        {/* Main Render Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden animate-pulse border border-emerald-50"
              >
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-xl font-bold text-gray-700">
              No results found
            </h3>
            <p className="text-gray-400 mt-2">
              Try different search terms or remove filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16">
            {filtered.map((r) => (
              <RestaurantCard key={r._id || r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
