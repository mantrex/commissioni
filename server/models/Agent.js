// server/models/Agent.js
import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
      default: "",
    },
    lastname: {
      type: String,
      trim: true,
      default: "",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index per ricerche
agentSchema.index({ lastname: 1, firstname: 1 })

export default mongoose.models.Agent || mongoose.model('Agent', agentSchema)