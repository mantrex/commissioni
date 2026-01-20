// server/models/Invoice.js
import mongoose from 'mongoose'

const clientSnapshotSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
    // null se fattura standalone
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
  piva: String
}, { _id: false })

const receiptSchema = new mongoose.Schema({
  number: String,
  date: Date
}, { _id: false })

const invoiceItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
    // null se item standalone
  },
  orderItemId: {
    type: mongoose.Schema.Types.ObjectId
    // null se non viene da un ordine
  },
  code: {
    type: String,
    default:'',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  quantity: {
    type: Number,
    default:0
  },
  unitPrice: {
    type: Number,
    default:0,
  }
}, { _id: true })

const packingSchema = new mongoose.Schema({
  made: String,
  whoMakes: String,
  numPackages: Number,
  packageSize: String,
  grossWeight: Number,
  netWeight: Number,
  conai: String
}, { _id: false })

const packageSchema = new mongoose.Schema({
  size1: Number,
  size2: Number,
  size3: Number,
  grossWeight: Number,
  netWeight: Number
}, { _id: true })

const shippingLabelSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  line3: String,
  line4: String,
  tel: String,
  content: String,
  netWeight: String,
  grossWeight: String
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  invoiceDate: {
    type: Date,

  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
    // null se fattura standalone
  },
  commNum: {
    type: String,
    trim: true
    // null se fattura standalone
  },
  client: {
    type: clientSnapshotSchema,
    required: true
  },
  receipts: [receiptSchema],
  items: [invoiceItemSchema],

  // Importi
  taxable: Number,
  hasVat: Boolean,
  vatRate: Number,
  vatAmount: Number,
  total: Number,
  deposit: Number,
  cod: Number,

  // Altri dati
  payment: String,
  shipping: String,
  insurance: String,
  notes: String,
  issued: {
    type: Boolean,
    default: false
  },

  packing: packingSchema,
  packages: [packageSchema],
  shippingLabel: shippingLabelSchema
}, {
  timestamps: true
})

// Index per ricerche
invoiceSchema.index({ orderId: 1 })
invoiceSchema.index({ commNum: 1 })
invoiceSchema.index({ 'client.clientId': 1 })
invoiceSchema.index({ invoiceDate: -1 })
invoiceSchema.index({ issued: 1 })

export default mongoose.model('Invoice', invoiceSchema)