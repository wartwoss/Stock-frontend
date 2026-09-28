import { Printer, X } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function PrintSelectedModal({
  open,
  customer,
  items,
  onRemove,
  onClose,
  onConfirm,
  t,
}) {
  if (!open) return null;

  const name =
    customer?.name ||
    t("print.field.noCustomer", "Walk-in Customer");
  const phone = customer?.phone_number || "-";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="app-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              {t("printsel.modalTitle", "Print Selected Records")}
            </h2>
            <p>
              {t(
                "printsel.modalSubtitle",
                "One combined receipt for every selected record of this customer."
              )}
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="printsel-modal-body">
          <div className="printsel-customer-box">
            <div className="printsel-customer-avatar">
              {getInitials(name)}
            </div>
            <div className="printsel-customer-meta">
              <span>
                {t("print.field.customer", "Customer")}
              </span>
              <strong>{name}</strong>
              <span>{phone}</span>
            </div>
            <div className="printsel-count-chip">
              {items.length}{" "}
              {t(
                items.length === 1 ? "printsel.record" : "printsel.records",
                items.length === 1 ? "record" : "records"
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="printsel-empty">
              {t(
                "printsel.emptyList",
                "No records selected."
              )}
            </div>
          ) : (
            <div className="printsel-list">
              {items.map((item, index) => (
                <div className="printsel-item" key={item.key}>
                  <div className="printsel-item-index">
                    {index + 1}
                  </div>
                  <div className="printsel-item-main">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>
                  {item.amount ? (
                    <div className="printsel-item-amount">
                      {item.amount}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="printsel-remove"
                    title={t("printsel.removeItem", "Remove")}
                    onClick={() => onRemove(item.key)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              className="printsel-selected-button"
              onClick={onConfirm}
              disabled={items.length === 0}
              style={
                items.length === 0
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : undefined
              }
            >
              <Printer size={16} />
              {t(
                "printsel.generate",
                "Generate Combined Receipt"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
