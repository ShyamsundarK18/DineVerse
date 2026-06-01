import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { api } from "@/api/client";

export default function MenuSection({
  category,
  items,
  getItemQty,
  updateCart,
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.auth
      .me()
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => null);
  }, []);

  const canAddToCart = !user || user.role === "customer";

  return (
    <div>
      <h3 className="text-lg font-black text-gray-900 mb-4 pb-2 border-b border-emerald-100">
        {category}
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const itemId = item._id || item.id;
          const qty = getItemQty(itemId);
          const isVegDish = !item.dietType || item.dietType === "veg";

          return (
            <div
              key={itemId}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-lg transition-all duration-300"
            >
              {/* LEFT */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Veg / Non Veg */}
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isVegDish ? "border-emerald-500" : "border-red-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isVegDish ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {item.name}
                  </h4>

                  {item.is_bestseller && (
                    <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      🔥 Best
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-900">
                    ₹{item.price?.toFixed(2)}
                  </span>

                  {item.prep_time && (
                    <span className="text-xs text-gray-400">
                      ~{item.prep_time} min
                    </span>
                  )}
                </div>
              </div>

              {/* IMAGE */}
              {item.image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* CART CONTROLS */}
              <div className="flex-shrink-0">
                {canAddToCart ? (
                  qty === 0 ? (
                    <button
                      onClick={() => updateCart(item, 1)}
                      className="flex items-center gap-1.5 bg-white border-2 border-emerald-500 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> ADD
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-500 rounded-xl px-2 py-1.5 shadow-md">
                      <button
                        onClick={() => updateCart(item, -1)}
                        className="text-white p-0.5"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="text-white font-black w-5 text-center text-sm">
                        {qty}
                      </span>

                      <button
                        onClick={() => updateCart(item, 1)}
                        className="text-white p-0.5"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )
                ) : (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-2 rounded-xl select-none">
                    View Only
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
