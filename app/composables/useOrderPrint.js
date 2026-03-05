import { getConfigValue, isConfigActive } from "#shared/config";

export const useOrderPrint = () => {
  const $q = useQuasar();
  const printing = ref(false);

  // Definizione colonne con larghezza relativa (totale = 100)
  const ALL_COLUMNS = [
    { field: "commNum", label: "N. Comm.", width: 7 },
    { field: "date", label: "Data", width: 6 },
    { field: "agent", label: "Venditore", width: 8 },
    { field: "clientLastname", label: "Cognome", width: 9 },
    { field: "clientFirstname", label: "Nome", width: 8 },
    { field: "clientCompany", label: "Ditta", width: 10 },
    { field: "clientState", label: "Paese", width: 5 },
    { field: "clientCity", label: "Città", width: 8 },
    { field: "position", label: "Posizione", width: 7 },
    { field: "ca", label: "CA", width: 4 },
    { field: "rd", label: "RD", width: 4 },
    { field: "balance", label: "Saldo", width: 7 },
    { field: "shipDate", label: "Data Sped.", width: 6 },
    { field: "courier", label: "Corriere", width: 8 },
    { field: "firstNote", label: "Prima nota", width: 12 },
  ];

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "");
  const fmtCurrency = (v) =>
    v != null
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(v)
      : "";

  const renderCell = (o, col) => {
    if (col.field === "date" || col.field === "shipDate")
      return fmtDate(o[col.field]);
    if (col.field === "ca" || col.field === "rd")
      return o[col.field] ? "✓" : "";
    if (col.field === "balance") return fmtCurrency(o[col.field]);
    return o[col.field] || "";
  };

  const buildParams = (filters, defaultExpiredDays) => {
    const params = new URLSearchParams();
    if (filters.commNum) params.append("commNum", filters.commNum);
    if (filters.expiredFilter === "expired")
      params.append("expiredDays", defaultExpiredDays);
    else if (filters.expiredFilter === "custom")
      params.append("expiredDays", filters.customDays);
    else if (filters.expiredFilter === "notExpired")
      params.append("notExpired", "true");
    if (filters.clientLastname)
      params.append("clientLastname", filters.clientLastname);
    if (filters.clientFirstname)
      params.append("clientFirstname", filters.clientFirstname);
    if (filters.clientCity) params.append("clientCity", filters.clientCity);
    if (filters.clientCountry)
      params.append("clientCountry", filters.clientCountry);
    if (filters.clientVip !== null && filters.clientVip !== undefined)
      params.append("clientVip", filters.clientVip);
    if (filters.agentId) params.append("agentId", filters.agentId);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    if (filters.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
    if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
    return params;
  };

  const openPrintWindow = (orders, fields) => {
    const visibleCols =
      fields.length > 0
        ? ALL_COLUMNS.filter((c) => fields.includes(c.field))
        : ALL_COLUMNS;

    const totalWidth = visibleCols.reduce((sum, c) => sum + c.width, 0);
    const cols = visibleCols.map((c) => ({
      ...c,
      pct: ((c.width / totalWidth) * 100).toFixed(2),
    }));

    const colgroup = cols
      .map((c) => `<col style="width:${c.pct}%">`)
      .join("\n");
    const thead = cols.map((c) => `<th>${c.label}</th>`).join("");
    const tbody = orders
      .map(
        (o) =>
          `<tr>${cols
            .map((c) => `<td>${renderCell(o, c)}</td>`)
            .join("")}</tr>`,
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 landscape; margin: 10mm 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #111; }
    .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4mm; padding-bottom: 2mm; border-bottom: 1px solid #555; }
    .header h1 { font-size: 11pt; font-weight: bold; }
    .header .meta { font-size: 7pt; color: #555; text-align: right; }
    table { width: 100%; table-layout: fixed; border-collapse: collapse; }
    th, td { border: 0.3mm solid #bbb; padding: 1.2mm 1.5mm; text-align: left; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; hyphens: auto; }
    th { background: #e0e0e0; font-weight: bold; font-size: 7pt; white-space: nowrap; }
    td { font-size: 7.5pt; }
    tr:nth-child(even) td { background: #f5f5f5; }
    .footer { margin-top: 3mm; font-size: 7pt; color: #555; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Lista Commissioni</h1>
    <div class="meta">Stampato il ${new Date().toLocaleString(
      "it-IT",
    )}<br>Totale: <strong>${orders.length}</strong> commissioni</div>
  </div>
  <table>
    <colgroup>${colgroup}</colgroup>
    <thead><tr>${thead}</tr></thead>
    <tbody>${tbody}</tbody>
  </table>
  <div class="footer">Totale commissioni: ${orders.length}</div>
</body>
</html>`;

    // ── Iframe nascosto: niente finestra fantasma ──
    let iframe = document.getElementById("__print_iframe__");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "__print_iframe__";
      iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;";
      document.body.appendChild(iframe);
    }

    iframe.onload = () => {
      // Piccolo delay per assicurarsi che il CSS sia applicato prima di stampare
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 250);
    };

    iframe.srcdoc = html;
  };

  const printOrders = async (filters, defaultExpiredDays) => {
    if (!isConfigActive("ORDERPRINTFIELDS")) {
      $q.notify({
        type: "warning",
        message: "Stampa commissioni non attiva nella configurazione",
      });
      return;
    }

    printing.value = true;
    try {
      const fields = getConfigValue("ORDERPRINTFIELDS") || [];
      const params = buildParams(filters, defaultExpiredDays);
      const data = await $fetch(`/api/orders/print?${params.toString()}`);
      if (!data.success) throw new Error("Errore nel recupero dati");
      openPrintWindow(data.orders, fields);
    } catch (err) {
      $q.notify({ type: "negative", message: "Errore stampa: " + err.message });
    } finally {
      printing.value = false;
    }
  };

  return { printing, printOrders };
};
