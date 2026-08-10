import { describe, it, expect, vi, beforeEach } from 'vitest'
                                                                                                                                          
  // Mock the db module before importing anything that uses it                                                                            
  vi.mock('../../index.ts', () => ({                                                                                                      
    db: {                                                                                                                                 
      insert: vi.fn().mockReturnValue({                                                                                                   
        values: vi.fn().mockResolvedValue([{ id: 1 }]),                                                                                 
      }),                                                                                                                                 
    },                                                                                                                                  
  }))                                                                                                                                   
                                                                                                                                          
  import { db } from '../../index.ts'
  import { productsTable } from '../../db/schema.ts'                                                                                      
                                                                                                                                        
  describe('Products - DB insert', () => {                                                                                              
    beforeEach(() => {
      vi.clearAllMocks()                                                                                                                  
    })
                                                                                                                                          
    it('should call db.insert with correct table', async () => {                                                                        
      const insertMock = vi.mocked(db.insert)                                                                                           
                                              
      await db.insert(productsTable).values({
        name: 'Milk',
        price: 100,                                                                                                                       
        description: 'Fresh milk',
      })                                                                                                                                  
                                                                                                                                        
      expect(insertMock).toHaveBeenCalledWith(productsTable)                                                                            
    })                                                                                                                                    
   
    it('should call values with correct product data', async () => {                                                                      
      const valuesMock = vi.fn().mockResolvedValue([{ id: 1 }])                                                                         
      vi.mocked(db.insert).mockReturnValue({ values: valuesMock } as any)                                                               
                                          
      await db.insert(productsTable).values({
        name: 'Milk',                                                                                                                     
        price: 100,
        description: 'Fresh milk',                                                                                                        
      })                                                                                                                                
                                                                                                                                        
      expect(valuesMock).toHaveBeenCalledWith({
        name: 'Milk',
        price: 100,                                                                                                                       
        description: 'Fresh milk',
      })                                                                                                                                  
    })                                                                                                                                  
                                                                                                                                        
    it('should reject negative price', () => {
      // This test will FAIL right now — no validation exists yet
      // It documents what SHOULD be enforced 
      const price = -50                       
      expect(price).toBeGreaterThan(0)    
    })                                                                                                                                    
  })  