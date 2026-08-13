  import { z } from 'zod'                                                                                                                  
   
  export const createProductSchema = z.object({                                                                                            
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),                                                               
    price: z.number().int('Price must be an integer').positive('Price must be positive'),                                                
    description: z.string().max(255, 'Description too long').optional(),                                                                 
  })