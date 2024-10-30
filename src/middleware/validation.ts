import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};


export const validateMyUserRequest = [
    body('name').isString().notEmpty().withMessage('Name must be a string'),
    body('addressLine1').isString().notEmpty().withMessage('Address Line 1 must be a string'),  
    body('country').isString().notEmpty().withMessage('Country must be a string'),  
    body('city').isString().notEmpty().withMessage('City must be a string'),  
    handleValidationErrors,  

]