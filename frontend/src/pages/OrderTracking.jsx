import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import {
  Package,
  ChefHat,
  Bike,
  CheckCircle2,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Leaflet Map Components
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🛵 PREMIUM REALISTIC RIDER MARKER (Restored to Emerald/Lime Theme)
const deliveryBoyIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
      <!-- Pulsing Radial Radar Wave (Signals live tracking activity) -->
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(16, 185, 129, 0.2);
        animation: mapPulse 2s infinite ease-in-out;
        z-index: 1;
      "></div>

      <!-- Premium Circular Card Border Wrapper -->
      <div style="
        position: absolute;
        width: 46px;
        height: 46px;
        background: #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2.5px solid #10b981;
        overflow: hidden;
        z-index: 2;
      ">
        <!-- High-Resolution Delivery Boy Riding Vector Asset -->
        <img
          src="/public/fast-shipping.png"
          alt="Delivery Boy Riding"
          style="
            width: 85%;
            height: 85%;
            object-fit: contain;
            transform: scaleX(-1); /* Flips the graphic to ride forward right */
          "
        />
      </div>

      <!-- Bottom Triangle Location Pin indicator point -->
      <div style="
        position: absolute;
        bottom: 2px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 7px solid #10b981;
        z-index: 3;
      "></div>
    </div>

    <!-- Inject CSS Keyframe Animations safely into the document body context -->
    <style>
      @keyframes mapPulse {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    </style>
  `,
  className: "", // Clear standard leaflet bounding boxes
  iconSize: [60, 60],
  iconAnchor: [30, 55], // Anchors the very bottom point of the pin to the map coordinates
  popupAnchor: [0, -50],
});

// Component helper to automatically pan/center the map smoothly when the delivery boy moves
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], map.getZoom(), { animate: true });
    }
  }, [coords, map]);
  return null;
}

const ORDER_STEPS = [
  {
    status: "PENDING",
    label: "Order Placed",
    icon: Package,
    desc: "Your order has been placed",
  },
  {
    status: "ACCEPTED",
    label: "Confirmed",
    icon: CheckCircle2,
    desc: "Restaurant confirmed your order",
  },
  {
    status: "PREPARING",
    label: "Preparing",
    icon: ChefHat,
    desc: "Chef is preparing your food",
  },
  {
    status: "COURIER_ASSIGNED",
    label: "Courier Assigned",
    icon: Bike,
    desc: "Delivery partner assigned",
  },
  {
    status: "DELIVERING",
    label: "On the Way",
    icon: Bike,
    desc: "Your order is almost there!",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle2,
    desc: "Enjoy your meal! 🎉",
  },
];

const STATUS_INDEX = {
  PENDING: 0,
  PLACED: 0,
  placed: 0,
  pending: 0,
  ACCEPTED: 1,
  confirmed: 1,
  CONFIRMED: 1,
  accepted: 1,
  PREPARING: 2,
  preparing: 2,
  COURIER_ASSIGNED: 3,
  picked_up: 3,
  PICKED_UP: 3,
  courier_assigned: 3,
  DELIVERING: 4,
  out_for_delivery: 4,
  OUT_FOR_DELIVERY: 4,
  delivering: 4,
  DELIVERED: 5,
  delivered: 5,
};

export default function OrderTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courierCoords, setCourierCoords] = useState(null);

  useEffect(() => {
    if (!orderId || orderId === "undefined" || orderId === "null") {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let unsub = null;

    const loadOrder = async () => {
      try {
        const orders = await api.orders.filter({ id: orderId });
        if (isMounted && orders && orders[0]) {
          setOrder(orders[0]);
          if (orders[0].courier_lat && orders[0].courier_lng) {
            setCourierCoords({
              lat: orders[0].courier_lat,
              lng: orders[0].courier_lng,
            });
          }
        }
      } catch (err) {
        console.error("Error loading order context:", err);
        if (isMounted) setOrder(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrder();

    try {
      unsub = api.orders.subscribeOrder(orderId, (event) => {
        if (!isMounted) return;

        if (event.orderId === orderId || event.id === orderId) {
          if (event.data) {
            setOrder(event.data);
            if (event.data.courier_lat && event.data.courier_lng) {
              setCourierCoords({
                lat: event.data.courier_lat,
                lng: event.data.courier_lng,
              });
            }
          } else {
            const updatedStatus =
              event.status || event.orderStatus || event.order_status;
            if (updatedStatus) {
              setOrder((prev) =>
                prev ? { ...prev, status: updatedStatus } : null,
              );
            }

            const lat = event.lat || event.courier_lat || event.latitude;
            const lng = event.lng || event.courier_lng || event.longitude;
            if (lat && lng) {
              setCourierCoords({ lat, lng });
            }
          }
        }
      });
    } catch (subError) {
      console.error("Real-time subscription connection failure:", subError);
    }

    return () => {
      isMounted = false;
      if (unsub && typeof unsub === "function") unsub();
    };
  }, [orderId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
        <p>Order not found or invalid Tracking Session Link.</p>
        <Link to={createPageUrl("Profile")}>
          <Button variant="outline" className="rounded-2xl font-bold">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );

  const currentStatus =
    order.status || order.orderStatus || order.order_status || "PENDING";
  const currentStep = STATUS_INDEX[currentStatus] ?? 0;
  const isDelivered = currentStatus.toUpperCase() === "DELIVERED";
  const isCancelled = currentStatus.toUpperCase() === "CANCELLED";

  const showMap =
    currentStatus === "DELIVERING" ||
    currentStatus === "COURIER_ASSIGNED" ||
    currentStep === 3 ||
    currentStep === 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {isCancelled ? (
            <>
              <div className="text-6xl mb-3">❌</div>
              <h1 className="text-2xl font-black text-gray-900">
                Order Cancelled
              </h1>
            </>
          ) : isDelivered ? (
            <>
              <div className="text-6xl mb-3">🎉</div>
              <h1 className="text-2xl font-black text-gray-900">Delivered!</h1>
            </>
          ) : (
            <>
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 flex items-center justify-center">
                  <span className="text-3xl animate-bounce">🛵</span>
                </div>
              </div>
              <h1 className="text-2xl font-black text-gray-900">
                Order #
                {order.id?.slice(-6).toUpperCase() ||
                  order._id?.slice(-6).toUpperCase()}
              </h1>
              <p className="text-gray-500 mt-1">
                Estimated delivery: {order.estimated_time || 35} min
              </p>
            </>
          )}
        </div>

        {/* 🗺️ PREMIUM LIVE MAP */}
        {showMap && !isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 h-80 relative z-10">
            {courierCoords ? (
              <MapContainer
                center={[courierCoords.lat, courierCoords.lng]}
                zoom={16}
                className="w-full h-full"
                zoomControl={true}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Google Road Map">
                    <TileLayer
                      attribution="&copy; Google Maps"
                      url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Satellite View">
                    <TileLayer
                      attribution="&copy; Google Maps Satellite"
                      url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                <Marker
                  position={[courierCoords.lat, courierCoords.lng]}
                  icon={deliveryBoyIcon}
                >
                  <Popup>
                    <div className="font-bold text-xs text-emerald-600">
                      Your order is on its way! 🛵
                    </div>
                  </Popup>
                </Marker>

                <MapRecenter coords={courierCoords} />
              </MapContainer>
            ) : (
              <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                <Bike className="w-8 h-8 text-emerald-500 animate-pulse mb-2" />
                <p className="text-sm font-semibold text-gray-600">
                  Connecting to live driver coordinates...
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Map will render as soon as GPS signal is received.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Timeline */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="space-y-0">
              {ORDER_STEPS.map((step, i) => {
                const isActive = i === currentStep;
                const isDone = i < currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isDone
                            ? "bg-emerald-500"
                            : isActive
                              ? "bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400 ring-4 ring-emerald-100"
                              : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isDone || isActive ? "text-white" : "text-gray-400"}`}
                        />
                      </div>
                      {i < ORDER_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 mt-1 ${isDone ? "bg-emerald-500" : "bg-gray-100"}`}
                        />
                      )}
                    </div>
                    <div
                      className={`pb-6 ${i === ORDER_STEPS.length - 1 ? "pb-0" : ""}`}
                    >
                      <p
                        className={`font-bold text-sm ${isActive ? "text-lime-500" : isDone ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        {step.label}
                        {isActive && (
                          <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full animate-pulse">
                            Live
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${isActive || isDone ? "text-gray-500" : "text-gray-300"}`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-black text-gray-900 mb-4">Order Details</h3>
          <div className="space-y-2 mb-4">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name || item.menuItemName || "Menu Item"} ×{" "}
                  {item.quantity}
                </span>
                <span className="font-semibold">
                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>
                ₹{(order.deliveryFee || order.delivery_fee || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-base pt-1">
              <span>Total</span>
              <span className="text-emerald-600">
                ₹{(order.totalAmount || order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-gray-900 text-sm">Delivering to</h4>
          </div>
          <p className="text-gray-600 text-sm">
            {order.deliveryAddress || order.delivery_address}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3">
          {isDelivered && (
            <Link
              to={`${createPageUrl("RestaurantDetail")}?id=${order.restaurant?._id || order.restaurant}`}
              className="flex-1"
            >
              <Button className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 hover:from-emerald-600 hover:via-green-600 hover:to-lime-500 text-white rounded-2xl h-12 font-bold shadow-lg shadow-emerald-200">
                <Star className="w-4 h-4 mr-2" /> Rate & Review
              </Button>
            </Link>
          )}
          <Link to={createPageUrl("Profile")} className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-2xl h-12 font-bold border-gray-200"
            >
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
