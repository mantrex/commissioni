// app/composables/useGlobalAutosave.js
// Due slot separati (orders / invoices) ma mutuamente esclusivi:
// avviare uno ferma automaticamente l'altro.

const _timers = {
  orders: null,
  invoices: null,
};

const stopSlot = (slot) => {
  if (_timers[slot]) {
    clearInterval(_timers[slot]);
    _timers[slot] = null;
  }
};

const stopAll = () => {
  stopSlot("orders");
  stopSlot("invoices");
};

const startSlot = (slot, callback, seconds) => {
  stopAll();
  _timers[slot] = setInterval(callback, seconds * 1000);
};

export const useGlobalAutosave = (slot) => {
  return {
    startAutosave: (callback, seconds) => startSlot(slot, callback, seconds),
    stopAutosave: () => stopSlot(slot),
    stopAll,
  };
};
