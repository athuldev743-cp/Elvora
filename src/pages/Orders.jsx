import { useState } from "react";
import "./Orders.css";

function money(n) {
  return Number(n || 0).toFixed(2);
}

// ✅ added selectedIds + onToggleSelect (optional props)
function Orders({
  orders = [],
  onApprove,
  mode = "pending",
  selectedIds,
  onToggleSelect,
}) {
  const [openId, setOpenId] = useState(null);
  const isApprovedMode = mode === "approved";

  if (!orders.length) {
    return (
      <div className="ordersEmptyState">
        <div className="ordersEmptyIcon">📝</div>
        <h3>{isApprovedMode ? "No Approved Orders" : "No Pending Orders"}</h3>
        <p>
          {isApprovedMode
            ? "Approved orders will appear here."
            : "Orders will appear here when customers place orders."}
        </p>
      </div>
    );
  }

  return (
    <div className="ordersList">
      {orders.map((o) => {
        const isOpen = openId === o.id;
        const status = String(o.status || "").toLowerCase();
        const isPending = status === "pending";

        const isSelected = isApprovedMode ? !!selectedIds?.has(o.id) : false;

        return (
          <div key={o.id} className={`orderCard ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="orderTop"
              onClick={() => setOpenId(isOpen ? null : o.id)}
            >
              <div className="orderTopLeft">
                <div className="orderId">Order #{o.id}</div>
                <div className="orderSub">
                  {o.customer_email || "-"} • ₹{money(o.total_amount)}
                </div>
              </div>

              <div className="orderTopRight">
                {/* ✅ checkbox only for approved tab */}
                {isApprovedMode && (
                  <label
                    className="orderSelect"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect?.(o.id)}
                    />
                    <span>Select</span>
                  </label>
                )}

                <span
                  className={`statusBadge ${
                    isPending ? "statusPending" : "statusCompleted"
                  }`}
                >
                  {o.status}
                </span>
                <span className={`chev ${isOpen ? "up" : ""}`}>⌄</span>
              </div>
            </button>

            {isOpen && (
              <div className="orderExpand">
                <div className="grid2">
                  <div className="kv">
                    <div className="k">Customer</div>
                    <div className="v">{o.customer_name || "-"}</div>
                  </div>
                  <div className="kv">
                    <div className="k">Phone</div>
                    <div className="v">{o.customer_phone || "-"}</div>
                  </div>
                  <div className="kv">
                    <div className="k">Product</div>
                    <div className="v">{o.product_name || "-"}</div>
                  </div>
                  <div className="kv">
                    <div className="k">Qty</div>
                    <div className="v">{o.quantity ?? "-"}</div>
                  </div>
                  <div className="kv">
                    <div className="k">Unit Price</div>
                    <div className="v">₹{money(o.unit_price)}</div>
                  </div>
                  <div className="kv">
                    <div className="k">Total</div>
                    <div className="v strong">₹{money(o.total_amount)}</div>
                  </div>
                </div>

                <div className="addrBox">
                  <div className="addrTitle">Shipping Address</div>
                  <div className="addrText">
                    {o.shipping_address || "❌ Shipping address missing from order"}
                  </div>
                </div>

                {o.notes ? (
                  <div className="notesBox">
                    <div className="addrTitle">Notes</div>
                    <div className="addrText">{o.notes}</div>
                  </div>
                ) : null}

                <div className="orderActions">
                  {isPending ? (
                    <button
                      className="approveBtn"
                      type="button"
                      onClick={() => onApprove?.(o.id)}
                    >
                      Approve & Send Email
                    </button>
                  ) : (
                    <div className="approvedHint">This order is approved.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Orders;
