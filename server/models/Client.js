// server/models/Client.js
import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  firstname: {
    type: String,
    trim: true
  },
  lastname: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  cap: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  tel: {
    type: String,
    trim: true
  },
  fax: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  piva: {
    type: String,
    trim: true
  },
  vip: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index per ricerche
clientSchema.index({ lastname: 1, firstname: 1 })
clientSchema.index({ company: 1 })
clientSchema.index({ vip: 1 })

export default mongoose.model('Client', clientSchema)