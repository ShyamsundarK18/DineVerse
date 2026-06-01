import { format } from "date-fns";

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full 
                        bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400
                        flex items-center justify-center 
                        text-white font-bold text-sm flex-shrink-0 shadow-md"
          >
            {(review.user?.name ||
              review.user_name ||
              review.user_email ||
              "U")[0].toUpperCase()}
          </div>

          <div>
            <p className="font-bold text-gray-900 text-sm">
              {review.user?.name || review.user_name || "Anonymous"}
            </p>

            <p className="text-xs text-gray-400">
              {review.createdAt
                ? format(new Date(review.createdAt), "MMM d, yyyy")
                : ""}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`text-sm ${
                  s <= review.rating ? "text-emerald-500" : "text-gray-200"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Reward Badge */}
          {review.rewardPoints > 0 && (
            <span
              className="text-xs font-bold 
                            text-emerald-700 
                            bg-emerald-50 
                            px-2 py-0.5 
                            rounded-md 
                            border border-emerald-100"
            >
              +{review.rewardPoints} Pts
            </span>
          )}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {review.reviewText || review.comment}
      </p>
    </div>
  );
}
