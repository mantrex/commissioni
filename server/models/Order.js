// server/models/Order.js
import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  date: Date,
  courier: String
}, { _id: false })

const noteSchema = new mongoose.Schema({
  text: String
}, { _id: false })

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  ready: {
    type: Boolean,
    default: false
  },
  invoiced: {
    type: Number,
    default: 0,
  },
  ordered: {
    type: Boolean,
    default: false
  }
}, { _id: true }) // Manteniamo _id per referenziarlo nelle fatture

const orderSchema = new mongoose.Schema({
  commNum: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  status: {
    type: String,
    trim: true
  },
  shipments: [shipmentSchema],
  notes: [noteSchema],
  items: [orderItemSchema],

  // Importi
  ca: {
    type: Number,
    default: 0
  },
  rd: {
    type: Number,
    default: 0
  },
  ric: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  pay: {
    type: Number,
    default: 0
  },

  // Flag
  print: {
    type: Boolean,
    default: false
  },
  blacklist: {
    type: Boolean,
    default: false
  },
  shipped: {
    type: Boolean,
    default: false
  },
  photoLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index per ricerche comuni

orderSchema.index({ clientId: 1 })
orderSchema.index({ agentId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ date: -1 })
orderSchema.index({ dueDate: 1 })
orderSchema.index({ dueDate: 1, status: 1 }) // Per scaduti

export default mongoose.model('Order', orderSchema)