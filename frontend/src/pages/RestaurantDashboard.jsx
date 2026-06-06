
import { api } from "@/api/client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  TrendingUp,
  RefreshCw,
  Save,
  Star,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  placed: "bg-blue-50 text-blue-600",
  confirmed: "bg-indigo-50 text-indigo-600",
  preparing: "bg-amber-50 text-amber-600",
  picked_up: "bg-emerald-50 text-emerald-600",
  out_for_delivery: "bg-teal-50 text-teal-600",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

// Add or verify these arrays at the top of RestaurantDashboard.jsx
const RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const RESERVATION_COLORS = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
};

export default function RestaurantDashboard() {
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);

  // States for adding menu items
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    is_veg: false,
    is_available: true,
    is_bestseller: false,
  });

  // 🛠️ ADDED: State for New Restaurant Registration Form onboarding
  const [regForm, setRegForm] = useState({
    name: "",
    cuisine: "",
    address: "",
    image: "",
    longitude: "77.401989",
    latitude: "23.258486",
  });
  const [regLoading, setRegLoading] = useState(false);

  const loadDashboardData = async (r) => {
    try {
      const [items, ords, res, revs] = await Promise.all([
        api.menuItems.filter({ restaurant_id: r._id }),
        api.orders.filter({ restaurant_id: r._id }, "-created_date", 50),
        api.reservations.filter({ restaurant_id: r._id }, "-created_date", 50),
        api.reviews
          .filter({ restaurant_id: r._id }, "-createdAt", 50)
          .catch(() => []),
      ]);
      setMenuItems(items);
      setOrders(ords);
      setReservations(res);
      setReviews(revs);
    } catch (err) {
      console.error("Error loading secure dataset streams:", err);
    }
  };

  useEffect(() => {
    api.auth
      .me()
      .then(async (u) => {
        if (!u) {
          api.auth.redirectToLogin();
          return;
        }
        setUser(u);

        // Fixed lookup parameter schema mapping to owner identity profile node
        const rests = await api.restaurants
          .filter({ owner: u._id })
          .catch(() => []);
        const myRest = rests[0];

        if (myRest) {
          setRestaurant(myRest);
          await loadDashboardData(myRest);
        }
        setLoading(false);
      })
      .catch(() => api.auth.redirectToLogin());
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    const unsub = api.orders.subscribeRestaurant(
      restaurant._id,
      (newOrderData) => {
        api.orders
          .filter({ restaurant_id: restaurant._id }, "-created_date", 50)
          .then(setOrders);
      },
      (updateData) => {
        setOrders((os) =>
          os.map((o) =>
            o._id === updateData.orderId
              ? { ...o, status: updateData.status }
              : o,
          ),
        );
      },
    );
    return unsub;
  }, [restaurant]);

  // 🛠️ ADDED: Handle Multi-Tenant Registration Submission
  const handleRegisterRestaurant = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.address) return;
    setRegLoading(true);
    try {
      const payload = {
        ...regForm,
        cuisine: regForm.cuisine
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };
      const res = await api.restaurants.create(payload);
      if (res.success && res.data) {
        setRestaurant(res.data);
        await loadDashboardData(res.data);
      }
    } catch (err) {
      console.error("Failed registration validation pipelines:", err);
    } finally {
      setRegLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    await api.orders.update(orderId, { status });
    setOrders((os) =>
      os.map((o) => (o._id === orderId ? { ...o, status } : o)),
    );
  };

  const updateReservationStatus = async (resId, status) => {
    try {
      await api.reservations.update(resId, { status });
      setReservations((prevRes) =>
        prevRes.map((r) => (r._id === resId ? { ...r, status } : r)),
      );
    } catch (error) {
      console.error("Failed handling live booking transition rules:", error);
    }
  };

  const toggleRestaurantStatus = async () => {
    if (!restaurant) return;
    const newStatus = !restaurant.isOpen;
    try {
      await api.restaurants.update(restaurant._id, { isOpen: newStatus });
      setRestaurant({ ...restaurant, isOpen: newStatus });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) return;
    const item = await api.menuItems.create({
      ...newItem,
      price: parseFloat(newItem.price),
      restaurant_id: restaurant._id,
      restaurant_name: restaurant.name,
    });
    setMenuItems((items) => [...items, item]);
    setNewItem({
      name: "",
      price: "",
      category: "",
      description: "",
      is_veg: false,
      is_available: true,
      is_bestseller: false,
    });
    setShowAddItem(false);
  };

  const deleteItem = async (id) => {
    await api.menuItems.delete(id);
    setMenuItems((items) => items.filter((i) => i._id !== id));
  };

  const saveEdit = async () => {
    await api.menuItems.update(editItem._id, editItem);
    setMenuItems((items) =>
      items.map((i) => (i._id === editItem._id ? editItem : i)),
    );
    setEditItem(null);
  };

  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (o.totalAmount || o.total || 0), 0);
  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "menu", label: "Menu", icon: UtensilsCrossed },
    { id: "orders", label: "Orders", icon: Package },
    { id: "reservations", label: "Reservations", icon: Calendar },
    { id: "reviews", label: "Reviews", icon: Star },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  /* 🛠️ ONBOARDING REGISTRATION LAYOUT FORM CANVAS VIEW PANEL */
  if (!restaurant)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">
              🍽️
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Setup Your Storefront
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Register your outlet parameters to manage incoming orders
            </p>
          </div>
          <form onSubmit={handleRegisterRestaurant} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Restaurant Name *
              </label>
              <Input
                required
                value={regForm.name}
                onChange={(e) =>
                  setRegForm({ ...regForm, name: e.target.value })
                }
                className="rounded-xl mt-1"
                placeholder="e.g. Empire Restaurant"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Cuisines (Comma Separated)
              </label>
              <Input
                value={regForm.cuisine}
                onChange={(e) =>
                  setRegForm({ ...regForm, cuisine: e.target.value })
                }
                className="rounded-xl mt-1"
                placeholder="Biryani, North Indian, Mughlai"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Physical Address *
              </label>
              <Input
                required
                value={regForm.address}
                onChange={(e) =>
                  setRegForm({ ...regForm, address: e.target.value })
                }
                className="rounded-xl mt-1"
                placeholder="MP Nagar Zone 2, Bhopal"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Store Image URL
              </label>
              <Input
                value={regForm.image}
                onChange={(e) =>
                  setRegForm({ ...regForm, image: e.target.value })
                }
                className="rounded-xl mt-1"
                placeholder="https://images.unsplash.com/...png"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Longitude
                </label>
                <Input
                  value={regForm.longitude}
                  onChange={(e) =>
                    setRegForm({ ...regForm, longitude: e.target.value })
                  }
                  className="rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Latitude
                </label>
                <Input
                  value={regForm.latitude}
                  onChange={(e) =>
                    setRegForm({ ...regForm, latitude: e.target.value })
                  }
                  className="rounded-xl mt-1"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={regLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-bold shadow-md shadow-emerald-100 transition-all mt-2"
            >
              {regLoading
                ? "Saving Identity Parameters..."
                : "Register Outlet Profile"}
            </Button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Layout UI */}
      <div className="hidden md:flex flex-col w-60 bg-gray-950 text-white min-h-screen p-4 flex-shrink-0 fixed top-16 bottom-0 left-0 z-20 overflow-y-auto">
        <div className="mb-6 px-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Restaurant
          </p>
          <p className="font-black text-white text-sm truncate">
            {restaurant.name}
          </p>
          <button
            onClick={toggleRestaurantStatus}
            className="flex items-center gap-1.5 mt-2 hover:bg-gray-800 p-1.5 -ml-1.5 rounded-lg transition-colors cursor-pointer w-full text-left"
          >
            <div
              className={`w-2 h-2 rounded-full ${restaurant.isOpen ? "bg-emerald-500" : "bg-gray-500"}`}
            />
            <p className="text-xs font-bold text-gray-300 flex-1">
              {restaurant.isOpen
                ? "Accepting Orders (Open)"
                : "Currently Closed"}
            </p>
          </button>
        </div>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${tab === t.id ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-white shadow-lg shadow-emerald-300" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.id === "orders" && activeOrders.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Framework Content Context Tabs Routing Injection */}
      <div className="flex-1 md:ml-60 p-6 pb-24 md:pb-6">
        {tab === "overview" && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-6">
              Restaurant Dashboard
            </h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Revenue",
                  value: `₹${totalRevenue.toFixed(0)}`,
                  icon: TrendingUp,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  label: "Total Orders",
                  value: orders.length,
                  icon: Package,
                  color: "bg-green-50 text-green-600",
                },
                {
                  label: "Active Orders",
                  value: activeOrders.length,
                  icon: Package,
                  color: "bg-lime-50 text-lime-600",
                },
                {
                  label: "Menu Items",
                  value: menuItems.length,
                  icon: UtensilsCrossed,
                  color: "bg-teal-50 text-teal-600",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {activeOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
                  Live Orders ({activeOrders.length})
                </h3>
                <div className="space-y-3">
                  {activeOrders.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-center gap-4 border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">
                          {o.customer?.name || o.user_name || "Guest Account"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {o.items
                            ?.map((i) => `${i.name} ×${i.quantity}`)
                            .join(", ")}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status]}`}
                      >
                        {o.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "menu" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-900">
                Menu ({menuItems.length})
              </h1>
              <Button
                onClick={() => setShowAddItem(true)}
                className="bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-200 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            {showAddItem && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Add New Item</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                  <Input
                    placeholder="Item name *"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((i) => ({ ...i, name: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Price *"
                    type="number"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem((i) => ({ ...i, price: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Category (e.g. Starters)"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((i) => ({ ...i, category: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((i) => ({ ...i, description: e.target.value }))
                    }
                    className="rounded-xl col-span-2 md:col-span-3"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addMenuItem}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Add Item
                  </Button>
                  <Button
                    onClick={() => setShowAddItem(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-bold text-emerald-600">
                        ₹{item.price?.toFixed(2)}
                      </span>
                      {item.category && <span>{item.category}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-6">
              Orders ({orders.length})
            </h1>
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">
                        {o.customer?.name || o.user_name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {o.createdAt
                          ? format(new Date(o.createdAt), "MMM d, h:mm a")
                          : ""}
                      </p>
                    </div>
                    <span className="font-black text-gray-900">
                      ₹{o.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {o.items?.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border relative capitalize ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {o.status.replace(/_/g, " ").toUpperCase()}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="bg-white border p-1.5 rounded-2xl shadow-xl z-50"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => updateOrderStatus(o._id, s)}
                          className="px-3 py-1.5 text-xs rounded-xl cursor-pointer hover:bg-gray-50"
                        >
                          {s.toUpperCase()}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reservations" && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-6">
              Reservations ({reservations.length})
            </h1>
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">
                  No tables booked yet.
                </p>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-base text-gray-900">
                          {res.user_name || "Guest Patron"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Requested on{" "}
                          {res.createdAt
                            ? format(new Date(res.createdAt), "MMM d, h:mm a")
                            : "Live Sync"}
                        </p>
                      </div>

                      {/* 🛠️ ELITE DROPDOWN INTERFACE FOR LIVE RE-SCHEDULING ACTIONS */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold tracking-wide uppercase">
                          Action:
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border relative transition-all duration-200 hover:opacity-90 ${
                                RESERVATION_COLORS[res.status] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {res.status}
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border p-1.5 rounded-2xl shadow-xl z-50 animate-in fade-in-50 duration-100"
                          >
                            {RESERVATION_STATUSES.map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption}
                                onClick={() =>
                                  updateReservationStatus(res._id, statusOption)
                                }
                                className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors mb-0.5 last:mb-0 ${
                                  res.status === statusOption
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {statusOption}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Event Time Slots Details Bar */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        {res.date
                          ? format(new Date(res.date), "EEEE, MMM d, yyyy")
                          : "Date Pending"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        Slot: {res.time || "Not Specifed"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        Capacity: {res.guests || 2} Seats
                      </div>
                    </div>

                    {/* Special Instructions block */}
                    {res.specialRequests && (
                      <p className="text-xs text-gray-400 mt-2.5 bg-amber-50/40 border border-dashed border-amber-200/50 px-3 py-2 rounded-xl">
                        📝{" "}
                        <span className="font-bold text-gray-600">
                          Special Note:
                        </span>{" "}
                        {res.specialRequests}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-6">
              Customer Reviews ({reviews.length})
            </h1>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <p className="font-bold text-sm text-gray-900">
                    {review.user_name || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

