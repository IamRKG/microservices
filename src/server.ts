  import app from './app.ts'
  import { pool } from './index.ts' 
  
  const PORT = process.env.PORT || 6000;  
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  
  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down server...');
    server.close(async () => {
      console.log('Server closed');
      await pool.end(); // Close the database connection pool
      process.exit(0);
    });
  }
   ;
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
