// server/models/Product.js
import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    trim: true
    // NON unique - stesso codice può avere descrizioni diverse
  },
  name: {
    type: String,
    trim: true
  },
  details: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index per ricerche
productSchema.index({ code: 1 })
productSchema.index({ name: 1 })

export default mongoose.model('Product', productSchema)