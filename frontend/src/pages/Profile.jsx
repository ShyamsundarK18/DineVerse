import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "@/api/client";
import { createPageUrl } from "@/utils";
import {
  User,
  Package,
  Heart,
  Calendar,
  MessageSquare,
  Settings,
  ChevronRight,
  Clock,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const STATUS_COLORS = {
  placed: "bg-emerald-100 text-emerald-600",
  confirmed: "bg-emerald-100 text-emerald-600",
  preparing: "bg-lime-100 text-lime-700",
  picked_up: "bg-green-100 text-green-600",
  out_for_delivery: "bg-green-100 text-green-600",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600", // keep red for cancel
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();

  // Set initial tab from URL query param if present
  const queryTab = new URLSearchParams(location.search).get("tab");
  const [activeTab, setActiveTab] = useState(queryTab || "orders");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(true);

  // Update activeTab when URL changes
  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

  useEffect(() => {
    const storedFavorites = JSON.parse(
      localStorage.getItem("foodhub_favorites") || "[]",
    );
    setFavorites(storedFavorites);

    api.auth
      .me()
      .then((u) => {
        if (!u) {
          api.auth.redirectToLogin();
          return;
        }
        setUser(u);
        setEditName(u.name || u.full_name || "");
        return Promise.all([
          api.orders.filter({ userId: u._id }, "-created_date", 20),
          api.reservations.filter({ user: u._id }, "-created_date", 20),
        ]);
      })
      .then(([ords, res]) => {
        if (ords) setOrders(ords);
        if (res) setReservations(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    await api.auth.updateMe({ full_name: editName });
    setUser((u) => ({ ...u, full_name: editName }));
    setEditMode(false);
  };

  const normalizeStatus = (status = "") =>
    status.toLowerCase().replace(/\s+/g, "_");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  if (!user) return null;

  const TABS = [
    { id: "orders", label: "Orders", icon: Package, count: orders.length },
    {
      id: "reservations",
      label: "Reservations",
      icon: Calendar,
      count: reservations.length,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: Heart,
      count: favorites.length,
    },
    { id: "profile", label: "Profile", icon: Settings, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 pt-8 pb-16 px-4 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-3xl font-black border-4 border-white/40 shadow-xl">
          {(user.name || user.email || "U")[0].toUpperCase()}
        </div>
        <h1 className="text-2xl font-black">
          {user.name || user.full_name || "Foodie"}
        </h1>
        <p className="text-white/70 text-sm">{user.email}</p>
        <div className="flex justify-center gap-8 mt-5 text-center">
          <div>
            <div className="text-2xl font-black">{orders.length}</div>
            <div className="text-xs text-white/70">Orders</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-2xl font-black">{reservations.length}</div>
            <div className="text-xs text-white/70">Bookings</div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <div className="text-2xl font-black">
              {orders.filter((o) => o.status === "delivered").length}
            </div>
            <div className="text-xs text-white/70">Delivered</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-1.5 flex gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${activeTab === tab.id ? "bg-white/25" : "bg-gray-200"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <div className="space-y-4 pb-10">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-semibold">No orders yet</p>
                <Link to={createPageUrl("Restaurants")}>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl">
                    Order Now
                  </Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order._id || order.id}
                  to={`${createPageUrl("OrderTracking")}?id=${order._id || order.id}`}
                >
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {order.restaurantName}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.createdAt
                            ? format(
                                new Date(order.createdAt),
                                "MMM d, yyyy 'at' h:mm a",
                              )
                            : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[normalizeStatus(order.status)] || "bg-gray-100 text-gray-600"}`}
                      >
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {order.items?.map((i) => i.name).join(", ")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-900">
                        ₹{order.totalAmount || order.total?.toFixed(2)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4 pb-10">
            {favorites.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">❤️</div>
                <p className="font-semibold">No favorites yet</p>
                <Link to={createPageUrl("Restaurants")}>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl">
                    Find Restaurants
                  </Button>
                </Link>
              </div>
            ) : (
              favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <Link
                    to={`${createPageUrl("RestaurantDetail")}?id=${fav.id}`}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-4">
                      {fav.image && (
                        <img
                          src={fav.image}
                          className="w-14 h-14 rounded-xl object-cover"
                          alt=""
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">{fav.name}</h4>
                        <p className="text-xs text-gray-400">
                          {fav.cuisine || "Various Cuisines"}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      const newFavs = favorites.filter((f) => f.id !== fav.id);
                      setFavorites(newFavs);
                      localStorage.setItem(
                        "foodhub_favorites",
                        JSON.stringify(newFavs),
                      );
                    }}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="space-y-4 pb-10">
            {reservations.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">📅</div>
                <p className="font-semibold">No reservations yet</p>
                <Link to={createPageUrl("TableBooking")}>
                  <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl">
                    Book a Table
                  </Button>
                </Link>
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res._id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-gray-900">
                      {typeof res.restaurant === "object"
                        ? res.restaurant?.name
                        : res.restaurant || "Premium Dining Venue"}
                    </h4>

                    {/* 🛠️ FIXED: normalizeStatus use kiya taaki dynamic theme matching color block mile */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                        STATUS_COLORS[normalizeStatus(res.status)] ||
                        "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {res.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      {res.date
                        ? format(new Date(res.date), "MMM d, yyyy")
                        : ""}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {res.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" />
                      {res.guests} guests
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10">
            <h3 className="font-black text-gray-900 text-lg mb-5">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Full Name
                </label>
                {editMode ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border-gray-200 h-11"
                  />
                ) : (
                  <p className="font-semibold text-gray-800 py-2">
                    {user.name || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Email
                </label>
                <p className="font-semibold text-gray-800 py-2">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {editMode ? (
                <>
                  <Button
                    onClick={saveProfile}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="rounded-xl border-gray-200"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
