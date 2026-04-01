// server/models/Invoice.js
import mongoose from "mongoose";

const clientSnapshotSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    firstname: String,
    lastname: String,
    title: String,
    company: String,
    address: String,
    cap: String,
    city: String,
    region: String,
    state: String,
    tel: String,
    fax: String,
    email: String,
    tels: { type: [String], default: [] },
    faxes: { type: [String], default: [] },
    emails: { type: [String], default: [] },
    piva: String,
  },
  { _id: false },
);

const receiptSchema = new mongoose.Schema(
  { number: String, date: Date },
  { _id: false },
);

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderItemId: { type: mongoose.Schema.Types.ObjectId },
    code: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: true },
);

const packingSchema = new mongoose.Schema(
  {
    made: String,
    whoMakes: String,
    numPackages: Number,
    packageSize: String,
    grossWeight: Number,
    netWeight: Number,
    conai: String,
  },
  { _id: false },
);

const packageSchema = new mongoose.Schema(
  {
    size1: Number,
    size2: Number,
    size3: Number,
    grossWeight: Number,
    netWeight: Number,
  },
  { _id: true },
);

const shippingLabelSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    line3: String,
    line4: String,
    tel: String,
    content: String,
    netWeight: String,
    grossWeight: String,
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true, trim: true },
    invoiceType: { type: String, enum: ["E", "N"], default: "E" },
    invoiceNumber: { type: Number },
    invoiceYear: { type: Number },
    invoiceDate: { type: Date },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    commNum: { type: String, trim: true },
    client: { type: clientSnapshotSchema, required: true },
    receipts: [receiptSchema],
    items: [invoiceItemSchema],
    taxable: Number,
    hasVat: Boolean,
    vatRate: Number,
    vatAmount: Number,
    total: Number,
    deposit: Number,
    cod: Number,
    payment: String,
    shipping: String,
    insurance: String,
    notes: String,
    issued: { type: Boolean, default: false },
    packing: packingSchema,
    packages: [packageSchema],
    shippingLabel: shippingLabelSchema,
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Index per ricerche
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ commNum: 1 });
invoiceSchema.index({ "client.clientId": 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ issued: 1 });
invoiceSchema.index({ deletedAt: 1 });
invoiceSchema.index({ invoiceType: 1, invoiceYear: 1, invoiceNumber: 1 });
invoiceSchema.index({ deletedAt: 1, invoiceDate: -1 });
invoiceSchema.index({ deletedAt: 1, issued: 1 });
invoiceSchema.index({ invoiceYear: 1, invoiceType: 1 });

export default mongoose.model("Invoice", invoiceSchema);