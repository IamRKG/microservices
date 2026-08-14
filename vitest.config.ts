  import { defineConfig } from 'vitest/config'

  export default defineConfig({                                                                                                           
    test: {
      globals: true,                                                                                                                      
      environment: 'node',                                                                                                              
      include: ['src/tests/unit/**/*.test.ts', 'src/tests/integration/**/*.test.ts'],
      setupFiles: ['src/tests/setup.ts'],                                                                                         
      coverage: {                             
        provider: 'v8',                   
        reporter: ['text', 'json', 'json-summary', 'html'],
        exclude: ['node_modules/', 'dist/', 'drizzle/', 'src/tests/', 'src/db/'],                                                                    
        thresholds: {                         
          lines: 70,                                                                                                                      
          functions: 70,                                                                                                                
          branches: 70,                                                                                                                   
          statements: 70,
        },                                                                                                                                
      },                                                                                                                                
    },                                                                                                                                  
  })