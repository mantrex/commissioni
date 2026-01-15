// server/models/Status.js
import mongoose from 'mongoose'

const statusSchema = new mongoose.Schema({
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

statusSchema.index({ selectable: 1 })

export default mongoose.models.Status || mongoose.model('Status', statusSchema)