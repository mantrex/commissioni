import mongoose from 'mongoose'
export default defineNitroPlugin(async nitroApp =>{
    const config = useRuntimeConfig();

    if (!config.mongodbUri) {
      console.error("❌ MONGODB_URI non configurato in runtimeConfig!");
      return;
    }

    try {
      await mongoose.connect(config.mongodbUri,{
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      
    } catch (error) {
      console.error("❌ Errore connessione MongoDB:", error.message);
    }
  

})