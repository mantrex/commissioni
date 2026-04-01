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
  tels: {
    type: [String],
    default: []
  },
  faxes: {
    type: [String],
    default: []
  },
  emails: {
    type: [String],
    default: []
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
clientSchema.index({ lastname: 1, firstname: 1 }); // già presente
clientSchema.index({ company: 1 });                // già presente
clientSchema.index({ vip: 1 });                    // già presente
clientSchema.index({ city: 1 });                   // filtro clientCity negli ordini
clientSchema.index({ state: 1 });                  // filtro clientCountry negli ordini

export default mongoose.models.Client || mongoose.model('Client', clientSchema)