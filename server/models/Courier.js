// server/models/Courier.js
import mongoose from 'mongoose'

const courierSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  selectable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index per ricerche
courierSchema.index({ code: 1 })
courierSchema.index({ selectable: 1 })

export default mongoose.models.Courier || mongoose.model('Courier', courierSchema)